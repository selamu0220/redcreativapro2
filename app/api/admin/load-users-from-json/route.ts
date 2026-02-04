import { NextRequest, NextResponse } from 'next/server';
import { saveUsersAsync } from '../../../lib/database';
import fs from 'fs';
import path from 'path';

// API administrativa para cargar usuarios desde users.json al KV storage
export async function POST(request: NextRequest) {
  try {
    // Verificar que sea un administrador
    const adminEmail = request.headers.get('x-user-email');
    const adminEmails = ['selamu.garcia@gmail.com', 'programar@gmail.com', 'admin@redcreativa.pro'];
    
    if (!adminEmail || !adminEmails.includes(adminEmail)) {
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 403 }
      );
    }

    // Leer usuarios desde el archivo JSON
    const usersPath = path.join(process.cwd(), 'data', 'users.json');
    
    if (!fs.existsSync(usersPath)) {
      return NextResponse.json(
        { error: 'Archivo users.json no encontrado' },
        { status: 404 }
      );
    }

    const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    
    console.log(`📥 Cargando ${usersData.length} usuarios desde users.json al KV storage...`);
    
    // Guardar usuarios en KV storage
    await saveUsersAsync(usersData);
    
    console.log(`✅ ${usersData.length} usuarios cargados exitosamente al KV storage`);
    
    return NextResponse.json({
      message: 'Usuarios cargados exitosamente desde users.json al KV storage',
      totalUsers: usersData.length,
      users: usersData.map((u: any) => ({ email: u.email, subscriptionStatus: u.subscriptionStatus }))
    });

  } catch (error) {
    console.error('Error cargando usuarios desde JSON:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET para verificar el estado actual
export async function GET(request: NextRequest) {
  try {
    // Verificar que sea un administrador
    const adminEmail = request.headers.get('x-user-email');
    const adminEmails = ['selamu.garcia@gmail.com', 'programar@gmail.com', 'admin@redcreativa.pro'];
    
    if (!adminEmail || !adminEmails.includes(adminEmail)) {
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 403 }
      );
    }

    // Leer usuarios desde el archivo JSON
    const usersPath = path.join(process.cwd(), 'data', 'users.json');
    
    if (!fs.existsSync(usersPath)) {
      return NextResponse.json(
        { error: 'Archivo users.json no encontrado' },
        { status: 404 }
      );
    }

    const usersFromFile = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    
    // Obtener usuarios del KV storage
    const { getUsersAsync } = await import('../../../lib/database');
    const usersFromKV = await getUsersAsync();
    
    return NextResponse.json({
      usersInFile: usersFromFile.length,
      usersInKV: usersFromKV.length,
      fileUsers: usersFromFile.map((u: any) => ({ email: u.email, subscriptionStatus: u.subscriptionStatus })),
      kvUsers: usersFromKV.map(u => ({ email: u.email, subscriptionStatus: u.subscriptionStatus })),
      needsSync: usersFromFile.length !== usersFromKV.length
    });

  } catch (error) {
    console.error('Error verificando estado de usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
