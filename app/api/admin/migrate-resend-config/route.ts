import { NextRequest, NextResponse } from 'next/server';
import { getUsersAsync, saveUsersAsync } from '../../../lib/database';
import fs from 'fs';
import path from 'path';

// API administrativa para migrar configuración de Resend desde users.json
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

    const usersFromFile = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    
    // Obtener usuarios del KV storage
    const usersFromKV = await getUsersAsync();
    
    console.log(`🔄 Migrando configuración de Resend para ${usersFromFile.length} usuarios...`);
    
    let migratedCount = 0;
    
    // Migrar configuración de Resend
    for (const fileUser of usersFromFile) {
      // Buscar el usuario en KV storage
      const kvUserIndex = usersFromKV.findIndex(u => u.email === fileUser.email);
      
      if (kvUserIndex === -1) {
        console.log(`⚠️ Usuario ${fileUser.email} no encontrado en KV storage`);
        continue;
      }
      
      // Verificar si tiene configuración de email provider en el archivo JSON
      if (fileUser.emailProvider && fileUser.emailProviderConfig) {
        console.log(`📧 Migrando configuración de ${fileUser.emailProvider} para ${fileUser.email}`);
        
        // Actualizar el usuario en KV storage con la configuración de email provider
        (usersFromKV[kvUserIndex] as any).emailProvider = fileUser.emailProvider;
        (usersFromKV[kvUserIndex] as any).emailProviderConfig = fileUser.emailProviderConfig;
        
        usersFromKV[kvUserIndex].lastActiveAt = new Date().toISOString();
        
        migratedCount++;
        
        console.log(`✅ Configuración migrada para ${fileUser.email}:`, {
          provider: fileUser.emailProvider,
          config: fileUser.emailProviderConfig
        });
      } else {
        console.log(`ℹ️ Usuario ${fileUser.email} no tiene configuración de email provider`);
      }
    }
    
    // Guardar usuarios actualizados
    await saveUsersAsync(usersFromKV);
    
    console.log(`✅ Migración completada: ${migratedCount} usuarios actualizados`);
    
    return NextResponse.json({
      message: 'Configuración de Resend migrada exitosamente',
      totalUsers: usersFromFile.length,
      migratedUsers: migratedCount,
      details: usersFromFile.map((u: any) => ({
        email: u.email,
        hasEmailProviderConfig: !!(u.emailProvider && u.emailProviderConfig),
        provider: u.emailProvider,
        migrated: !!(u.emailProvider && u.emailProviderConfig)
      }))
    });

  } catch (error) {
    console.error('Error migrando configuración de Resend:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET para verificar el estado de migración
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
    const usersFromKV = await getUsersAsync();
    
    const migrationStatus = usersFromFile.map((fileUser: any) => {
      const kvUser = usersFromKV.find(u => u.email === fileUser.email);
      
      return {
        email: fileUser.email,
        inFile: true,
        inKV: !!kvUser,
        hasEmailProviderInFile: !!(fileUser.emailProvider && fileUser.emailProviderConfig),
        hasEmailProviderInKV: !!((kvUser as any)?.emailProvider),
        emailProviderInKV: (kvUser as any)?.emailProvider,
        needsMigration: !!(fileUser.emailProvider && fileUser.emailProviderConfig) && !(kvUser as any)?.emailProvider
      };
    });
    
    return NextResponse.json({
      totalUsers: usersFromFile.length,
      migrationStatus,
      summary: {
        usersWithEmailProviderInFile: migrationStatus.filter((u: any) => u.hasEmailProviderInFile).length,
        usersWithProviderInKV: migrationStatus.filter((u: any) => u.hasEmailProviderInKV).length,
        usersNeedingMigration: migrationStatus.filter((u: any) => u.needsMigration).length
      }
    });

  } catch (error) {
    console.error('Error verificando estado de migración:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}