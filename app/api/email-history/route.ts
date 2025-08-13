import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '../../lib/db';

// GET /api/email-history - Obtener historial y estadísticas
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-uid');
  if (!userId) {
    return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 401 });
  }

  try {
    const db = await getDbConnection(userId);
    
    // Obtener los últimos 100 emails para el listado
    const historyQuery = 'SELECT * FROM email_history ORDER BY sent_at DESC LIMIT 100';
    const { rows: emails } = await db.query(historyQuery);

    // Calcular estadísticas de forma eficiente con una sola consulta SQL
    const statsQuery = `
      SELECT
        COUNT(*) AS total_sent,
        COUNT(CASE WHEN status IN ('delivered', 'opened', 'clicked') THEN 1 END) AS delivered,
        COUNT(CASE WHEN status IN ('opened', 'clicked') THEN 1 END) AS opened,
        COUNT(CASE WHEN status = 'clicked' THEN 1 END) AS clicked,
        COUNT(CASE WHEN status = 'bounced' THEN 1 END) AS bounced,
        COUNT(CASE WHEN status = 'complained' THEN 1 END) AS complained
      FROM email_history;
    `;
    const { rows: [statsData] } = await db.query(statsQuery);

    // Convertir los conteos a números y calcular tasas
    const totalSent = Number(statsData.total_sent);
    const delivered = Number(statsData.delivered);
    const opened = Number(statsData.opened);
    const clicked = Number(statsData.clicked);
    
    const stats = {
        totalSent,
        delivered,
        opened,
        clicked,
        bounced: Number(statsData.bounced),
        complained: Number(statsData.complained),
        deliveryRate: totalSent > 0 ? (delivered / totalSent) * 100 : 0,
        openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
        clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
    };

    return NextResponse.json({ emails, stats });

  } catch (error) {
    console.error('Error getting email history:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/email-history - Registrar un nuevo envío
export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-uid');
  if (!userId) {
    return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { contact_id, template_id, recipient_email, subject, status, error_message, metadata, clicked_links } = body;

    if (!recipient_email || !status || !subject) {
      return NextResponse.json({ error: 'Destinatario, estado y asunto son requeridos' }, { status: 400 });
    }

    const db = await getDbConnection(userId);
    const { rows: newRecord } = await db.query(
      `INSERT INTO email_history 
        (contact_id, template_id, recipient_email, subject, status, error_message, metadata, clicked_links) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [contact_id, template_id, recipient_email, subject, status, error_message, metadata, clicked_links]
    );

    return NextResponse.json({ email: newRecord[0] }, { status: 201 });
  } catch (error) {
    console.error('Error recording email history:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT /api/email-history - Actualizar el estado de un email (ej. para webhooks)
export async function PUT(request: NextRequest) {
  const userId = request.headers.get('x-user-uid');
  if (!userId) {
    // Este endpoint podría ser llamado por un servicio externo (webhook)
    // La autenticación debería ser manejada de forma diferente (ej. con una clave secreta)
    // Por ahora, mantenemos la autenticación de usuario.
    return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 401 });
  }

  try {
    const body = await request.json();
    // El webhook debería proveer el ID del registro a actualizar
    const { history_id, status, opened_at, clicked_at, clicked_links, error_message } = body;

    if (!history_id || !status) {
      return NextResponse.json({ error: 'ID del historial y estado son requeridos' }, { status: 400 });
    }

    const db = await getDbConnection(userId);

    // Construir la consulta dinámicamente
    const updates: string[] = ['status = $1'];
    const values: any[] = [status];
    let queryIndex = 2;

    if (opened_at) {
        updates.push(`opened_at = ${queryIndex++}`);
        values.push(opened_at);
    }
    if (clicked_at) {
        updates.push(`clicked_at = ${queryIndex++}`);
        values.push(clicked_at);
    }
    if (clicked_links) {
        updates.push(`clicked_links = ${queryIndex++}`);
        values.push(clicked_links);
    }
     if (error_message) {
        updates.push(`error_message = ${queryIndex++}`);
        values.push(error_message);
    }

    values.push(history_id);

    const { rows: updatedRecord, rowCount } = await db.query(
      `UPDATE email_history SET ${updates.join(', ')} WHERE id = ${queryIndex} RETURNING *`,
      values
    );

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Registro de email no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ email: updatedRecord[0] });
  } catch (error) {
    console.error('Error updating email history:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
