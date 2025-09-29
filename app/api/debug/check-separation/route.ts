import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Importar KV de forma segura
let kv: any = null;
try {
  kv = require('@vercel/kv').kv;
} catch (error) {
  console.log('⚠️ @vercel/kv no disponible, usando fallback local');
}

export async function GET(request: NextRequest) {
  try {
    // Leer usuarios del archivo JSON
    const fs = require('fs');
    const path = require('path');
    const usersPath = path.join(process.cwd(), 'data', 'users.json');
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    
    const results = [];
    
    // Check if KV is available
    const hasKV = (!!process.env.KV_URL || !!process.env.KV_REST_API_URL) && !!kv;
    
    for (const user of users) {
      const userId = user.email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      
      if (!hasKV) {
        // KV not configured - using local file system
        results.push({
          email: user.email,
          userId: userId,
          hasDbConfig: false,
          status: 'local_filesystem',
          note: 'Using local file system (KV not configured)'
        });
        continue;
      }
      
      try {
        // Verificar si tiene configuración en KV
        const dbConfig = await kv.get(`db:user:${userId}`);
        
        if (dbConfig) {
          results.push({
            email: user.email,
            userId: userId,
            hasDbConfig: true,
            status: 'configured'
          });
        } else {
          results.push({
            email: user.email,
            userId: userId,
            hasDbConfig: false,
            status: 'needs_provisioning'
          });
        }
      } catch (error: any) {
        results.push({
          email: user.email,
          userId: userId,
          hasDbConfig: false,
          status: 'error',
          error: error.message
        });
      }
    }
    
    // Verificar también la base de datos principal
    let mainDbStatus: any = 'unknown';
    
    if (!process.env.DATABASE_URL) {
      mainDbStatus = 'Database not configured (using local files)';
    } else {
      try {
        const mainDb = new Pool({
          connectionString: process.env.DATABASE_URL,
          max: 1,
        });
        
        const contactsResult = await mainDb.query('SELECT COUNT(*) as count FROM contacts');
        const contactsWithUser = await mainDb.query(
          'SELECT COUNT(*) as count FROM contacts WHERE user_email IS NOT NULL AND user_email != \'\''
        );
        
        await mainDb.end();
        
        mainDbStatus = {
          totalContacts: contactsResult.rows[0].count,
          contactsWithUser: contactsWithUser.rows[0].count,
          hasSharedData: contactsResult.rows[0].count !== contactsWithUser.rows[0].count
        };
      } catch (error: any) {
        mainDbStatus = `Error: ${error.message}`;
      }
    }
    
    return NextResponse.json({
      users: results,
      mainDatabase: mainDbStatus,
      summary: {
        totalUsers: users.length,
        configured: results.filter(r => r.hasDbConfig).length,
        needsProvisioning: results.filter(r => !r.hasDbConfig).length
      }
    });
    
  } catch (error: any) {
    console.error('Error checking separation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}