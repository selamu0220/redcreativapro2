import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserByEmailAsync, 
  getUserCollectedEmailsAsync 
} from '../../../../lib/database';

// Rate limiting for exports (prevent abuse)
const exportRateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkExportRateLimit(userEmail: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000; // 24 hours
  const maxExports = 10; // 10 exports per day per user
  
  const current = exportRateLimitStore.get(userEmail);
  
  if (!current || now > current.resetTime) {
    // Reset or initialize
    exportRateLimitStore.set(userEmail, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }
  
  if (current.count >= maxExports) {
    return { allowed: false, resetTime: current.resetTime };
  }
  
  current.count++;
  exportRateLimitStore.set(userEmail, current);
  return { allowed: true };
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userEmail: string }> }
) {
  try {
    const { userEmail: rawUserEmail } = await params;
    const userEmail = decodeURIComponent(rawUserEmail);
    
    // Authentication is now handled by middleware
    // Get user email from headers (set by middleware after token validation)
    const authenticatedUserEmail = request.headers.get('x-user-email');
    
    // Verify the authenticated user matches the requested user
    if (authenticatedUserEmail && authenticatedUserEmail !== userEmail) {
      return NextResponse.json(
        { error: 'No autorizado para acceder a estos datos' },
        { status: 403 }
      );
    }
    
    // Verify user exists
    const user = await getUserByEmailAsync(userEmail);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // Check export rate limiting
    const rateLimitResult = checkExportRateLimit(userEmail);
    if (!rateLimitResult.allowed) {
      const resetTime = rateLimitResult.resetTime;
      const resetDate = resetTime ? new Date(resetTime) : new Date();
      
      return NextResponse.json(
        { 
          error: 'Límite de exportaciones alcanzado. Intenta de nuevo mañana.',
          retryAfter: resetDate.toISOString()
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((resetDate.getTime() - Date.now()) / 1000).toString()
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