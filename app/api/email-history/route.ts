import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../lib/db';

// GET /api/email-history - Obtener historial y estadísticas
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-uid');
  if (!userId) {
    return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseClient();
    
    // Obtener los últimos 100 emails para el listado
    const { data: emails, error: emailsError } = await (supabase as any)
      .from('email_history')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(100);

    if (emailsError) {
      console.error('Error getting emails:', emailsError);
      return NextResponse.json({ error: 'Error al obtener emails' }, { status: 500 });
    }

    // Calcular estadísticas básicas desde los datos obtenidos
    const totalSent = emails?.length || 0;
    const delivered = emails?.filter((e: any) => ['delivered', 'opened', 'clicked'].includes(e.status)).length || 0;
    const opened = emails?.filter((e: any) => ['opened', 'clicked'].includes(e.status)).length || 0;
    const clicked = emails?.filter((e: any) => e.status === 'clicked').length || 0;
    const bounced = emails?.filter((e: any) => e.status === 'bounced').length || 0;
    const complained = emails?.filter((e: any) => e.status === 'complained').length || 0;
    
    const stats = {
        totalSent,
        delivered,
        opened,
        clicked,
        bounced,
        complained,
        deliveryRate: totalSent > 0 ? (delivered / totalSent) * 100 : 0,
        openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
        clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
    };

    return NextResponse.json({ emails: emails || [], stats });

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

    const supabase = getSupabaseClient();
    const { data: newRecord, error } = await (supabase as any)
      .from('email_history')
      .insert({
        contact_id,
        template_id,
        recipient_email,
        subject,
        status,
        error_message,
        metadata,
        clicked_links
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating email record:', error);
      return NextResponse.json({ error: 'Error al crear registro de email' }, { status: 500 });
    }

    return NextResponse.json({ email: newRecord }, { status: 201 });
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

    const supabase = getSupabaseClient();

    // Construir el objeto de actualización dinámicamente
    const updateData: any = { status };
    
    if (opened_at) updateData.opened_at = opened_at;
    if (clicked_at) updateData.clicked_at = clicked_at;
    if (clicked_links) updateData.clicked_links = clicked_links;
    if (error_message) updateData.error_message = error_message;

    const { data: updatedRecord, error } = await (supabase as any)
      .from('email_history')
      .update(updateData)
      .eq('id', history_id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Registro de email no encontrado' }, { status: 404 });
      }
      console.error('Error updating email record:', error);
      return NextResponse.json({ error: 'Error al actualizar registro de email' }, { status: 500 });
    }

    return NextResponse.json({ email: updatedRecord });
  } catch (error) {
    console.error('Error updating email history:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
