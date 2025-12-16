import { NextRequest, NextResponse } from 'next/server';
import {
  getUserCollectedEmailsAsync
} from '../../../../lib/database';
import {
  getSupabaseUserByEmail,
  createOrUpdateSupabaseUser
} from '../../../../lib/supabase-users';

// Rate limiting for exports (prevent abuse)
const exportRateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkExportRateLimit(userEmail: string): { allowed: boolean; resetTime?: number; remaining?: number } {
  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000; // 24 hours
  const maxExports = 50; // Increased to 50 exports per day per user (more reasonable)
  
  const current = exportRateLimitStore.get(userEmail);
  
  if (!current || now > current.resetTime) {
    // Reset or initialize
    exportRateLimitStore.set(userEmail, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxExports - 1 };
  }
  
  if (current.count >= maxExports) {
    return { allowed: false, resetTime: current.resetTime, remaining: 0 };
  }
  
  current.count++;
  exportRateLimitStore.set(userEmail, current);
  return { allowed: true, remaining: maxExports - current.count };
}

// Function to reset rate limit for a user (useful for development/testing)
function resetExportRateLimit(userEmail: string): void {
  exportRateLimitStore.delete(userEmail);
}

function generateCSV(emails: any[]): string {
  if (emails.length === 0) {
    return 'Email,Fecha de Recopilación,Fuente,IP\n';
  }
  
  const headers = 'Email,Fecha de Recopilación,Fuente,IP\n';
  const rows = emails.map(email => {
    const date = new Date(email.collectedAt).toLocaleString('es-ES');
    const ip = email.ipAddress || 'N/A';
    return `"${email.email}","${date}","${email.source}","${ip}"`;
  }).join('\n');
  
  return headers + rows;
}

function generateJSON(emails: any[]): string {
  const exportData = {
    exportDate: new Date().toISOString(),
    totalEmails: emails.length,
    emails: emails.map(email => ({
      email: email.email,
      collectedAt: email.collectedAt,
      source: email.source,
      ipAddress: email.ipAddress || null
    }))
  };
  
  return JSON.stringify(exportData, null, 2);
}

// HEAD endpoint to check rate limit status without exporting
export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ userEmail: string }> }
) {
  try {
    const { userEmail: rawUserEmail } = await params;
    const userEmail = decodeURIComponent(rawUserEmail);
    
    // Authentication check
    const authenticatedUserEmail = request.headers.get('x-user-email');
    if (authenticatedUserEmail && authenticatedUserEmail !== userEmail) {
      return new NextResponse(null, { status: 403 });
    }
    
    // Check rate limit without incrementing
    const now = Date.now();
    const windowMs = 24 * 60 * 60 * 1000;
    const maxExports = 50;
    
    const current = exportRateLimitStore.get(userEmail);
    let remaining = maxExports;
    let resetTime = now + windowMs;
    
    if (current && now <= current.resetTime) {
      remaining = Math.max(0, maxExports - current.count);
      resetTime = current.resetTime;
    }
    
    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-RateLimit-Limit': maxExports.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(resetTime).toISOString()
      }
    });
    
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userEmail: string }> }
) {
  try {
    console.log('📥 GET /api/email-collection/[userEmail]/export - Request received');
    const { userEmail: rawUserEmail } = await params;
    console.log('📧 Raw userEmail param:', rawUserEmail);
    const userEmail = decodeURIComponent(rawUserEmail);
    console.log('📧 Decoded userEmail:', userEmail);
    
    // Authentication is now handled by middleware
    // Get user email from headers (set by middleware after token validation)
    const authenticatedUserEmail = request.headers.get('x-user-email');
    console.log('🔐 Authenticated user email from headers:', authenticatedUserEmail);
    
    // Verify the authenticated user matches the requested user
    if (authenticatedUserEmail && authenticatedUserEmail !== userEmail) {
      return NextResponse.json(
        { error: 'No autorizado para acceder a estos datos' },
        { status: 403 }
      );
    }
    
    // Verify user exists, create if not found
    let user = await getSupabaseUserByEmail(userEmail);
    if (!user) {
      console.log(`🔧 Usuario no encontrado, creando automáticamente: ${userEmail}`);
      try {
        user = await createOrUpdateSupabaseUser(userEmail, {});
        console.log(`✅ Usuario creado exitosamente: ${userEmail}`);
      } catch (createError) {
        console.error('Error creando usuario:', createError);
        return NextResponse.json(
          { error: 'Error creando usuario' },
          { status: 500 }
        );
      }
    }
    
    // Check export rate limiting
    const rateLimitResult = checkExportRateLimit(userEmail);
    if (!rateLimitResult.allowed) {
      const resetTime = rateLimitResult.resetTime;
      const resetDate = resetTime ? new Date(resetTime) : new Date();
      const hoursUntilReset = resetTime ? Math.ceil((resetTime - Date.now()) / (1000 * 60 * 60)) : 24;
      
      return NextResponse.json(
        { 
          error: `Has alcanzado el límite de 50 exportaciones por día. Podrás exportar nuevamente en ${hoursUntilReset} horas.`,
          retryAfter: resetDate.toISOString(),
          resetIn: hoursUntilReset,
          maxExports: 50,
          remaining: 0
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((resetDate.getTime() - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '50',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetDate.toISOString()
          }
        }
      );
    }
    
    // Get collected emails for this user
    const collectedEmails = await getUserCollectedEmailsAsync(userEmail);
    
    // Get format parameter
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'csv';
    
    if (format === 'json') {
      const jsonData = generateJSON(collectedEmails);
      
      return new NextResponse(jsonData, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="emails-${userEmail}-${new Date().toISOString().split('T')[0]}.json"`,
          'Cache-Control': 'no-cache'
        }
      });
    } else {
      // Default to CSV
      const csvData = generateCSV(collectedEmails);
      
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="emails-${userEmail}-${new Date().toISOString().split('T')[0]}.csv"`,
          'Cache-Control': 'no-cache'
        }
      });
    }
    
  } catch (error) {
    console.error('Error exporting collected emails:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to reset rate limit (for development/testing)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userEmail: string }> }
) {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Esta función solo está disponible en modo desarrollo' },
        { status: 403 }
      );
    }

    const { userEmail: rawUserEmail } = await params;
    const userEmail = decodeURIComponent(rawUserEmail);
    
    // Authentication check
    const authenticatedUserEmail = request.headers.get('x-user-email');
    if (authenticatedUserEmail && authenticatedUserEmail !== userEmail) {
      return NextResponse.json(
        { error: 'No autorizado para realizar esta acción' },
        { status: 403 }
      );
    }
    
    // Reset rate limit for this user
    resetExportRateLimit(userEmail);
    
    return NextResponse.json({
      message: `Límite de exportaciones restablecido para ${userEmail}`,
      resetAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error resetting export rate limit:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}