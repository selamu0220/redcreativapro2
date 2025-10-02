import { NextRequest, NextResponse } from 'next/server';
import { getUsersAsync } from '../../../lib/database';
import { kv } from '@vercel/kv';

// API administrativa para provisionar bases de datos para todos los usuarios existentes
export async function POST(request: NextRequest) {
  try {
    // Verificar que sea un administrador (puedes agregar más validación aquí)
    const adminEmail = request.headers.get('x-user-email');
    const adminEmails = ['selamu.garcia@gmail.com']; // Lista de administradores
    
    if (!adminEmail || !adminEmails.includes(adminEmail)) {
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 403 }
      );
    }

    // Obtener todos los usuarios
    const users = await getUsersAsync();
    const results = [];

    for (const user of users) {
      try {
        if (!user?.email) {
          results.push({
            email: 'unknown',
            status: 'error',
            message: 'User email is missing'
          });
          continue;
        }
        
        // Generar un userId basado en el email (ya que no tenemos UID de Firebase para usuarios existentes)
        const userId = user.email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        
        // Verificar si ya tiene base de datos
        const existingConfig = await kv.get(`db:user:${userId}`);
        
        if (existingConfig) {
          results.push({
            email: user.email,
            status: 'already_exists',
            message: 'Base de datos ya existe'
          });
          continue;
        }

        // Provisionar base de datos
        const provisionResponse = await fetch(`${request.nextUrl.origin}/api/users/provision-database`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            userEmail: user.email
          })
        });

        const provisionResult = await provisionResponse.json();

        if (provisionResponse.ok) {
          results.push({
            email: user.email,
            status: 'success',
            message: 'Base de datos provisionada exitosamente'
          });
        } else {
          results.push({
            email: user.email,
            status: 'error',
            message: provisionResult.error || 'Error desconocido'
          });
        }

      } catch (error) {
        results.push({
          email: user?.email || 'unknown',
          status: 'error',
          message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
        });
      }
    }

    return NextResponse.json({
      message: 'Provisionamiento completado',
      totalUsers: users.length,
      results: results,
      summary: {
        success: results.filter(r => r.status === 'success').length,
        already_exists: results.filter(r => r.status === 'already_exists').length,
        errors: results.filter(r => r.status === 'error').length
      }
    });

  } catch (error) {
    console.error('Error en provision-all-users:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}