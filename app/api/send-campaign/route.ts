import { NextRequest, NextResponse } from 'next/server';
import { 
  getCampaignById,
  updateCampaign,
  getUserContacts,
  getUserByEmail
} from '../../lib/database';
import nodemailer from 'nodemailer';

// POST - Enviar campaña de email
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const body = await request.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json({ error: 'ID de campaña es requerido' }, { status: 400 });
    }

    // Obtener la campaña
    const campaign = getCampaignById(campaignId);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
    }

    // Verificar que la campaña pertenece al usuario
    if (campaign.userEmail !== userEmail) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Verificar que la campaña no ha sido enviada
    if (campaign.status === 'sent') {
      return NextResponse.json({ error: 'La campaña ya ha sido enviada' }, { status: 400 });
    }

    // Obtener credenciales de Gmail del usuario
    const user = getUserByEmail(userEmail);
    if (!user || !user.gmailUser || !user.gmailPassword) {
      return NextResponse.json({ error: 'Credenciales de Gmail no configuradas' }, { status: 400 });
    }

    // Obtener contactos suscritos
    const contacts = getUserContacts(userEmail);
    const subscribedContacts = contacts.filter(contact => contact.isSubscribed);

    if (subscribedContacts.length === 0) {
      return NextResponse.json({ error: 'No hay contactos suscritos para enviar' }, { status: 400 });
    }

    // Configurar transporter de nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user.gmailUser,
        pass: user.gmailPassword,
      },
    });

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Enviar emails a todos los contactos suscritos
    for (const contact of subscribedContacts) {
      try {
        // Crear enlace de unsubscribe
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/unsubscribe?token=${contact.unsubscribeToken}`;
        
        // Agregar enlace de unsubscribe al contenido
        const emailContent = `${campaign.content}\n\n---\n\nSi no deseas recibir más emails, puedes darte de baja aquí: ${unsubscribeUrl}`;

        const mailOptions = {
          from: user.gmailUser,
          to: contact.email,
          subject: campaign.subject,
          text: emailContent,
          html: emailContent.replace(/\n/g, '<br>'),
        };

        await transporter.sendMail(mailOptions);
        successCount++;
      } catch (error) {
        console.error(`Error sending email to ${contact.email}:`, error);
        errorCount++;
        errors.push(`Error enviando a ${contact.email}: ${error}`);
      }
    }

    // Actualizar estado de la campaña
    const now = new Date().toISOString();
    updateCampaign(campaignId, {
      status: 'sent',
      sentAt: now,
      recipientCount: subscribedContacts.length
    });

    return NextResponse.json({
      message: 'Campaña enviada',
      successCount,
      errorCount,
      totalContacts: subscribedContacts.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error sending campaign:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}