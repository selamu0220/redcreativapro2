import { NextRequest, NextResponse } from 'next/server';
import { 

  getUserCampaigns, 
  getUserContacts,
  CampaignData 
} from '../../../lib/database';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const body = await request.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json({ error: 'ID de campaña requerido' }, { status: 400 });
    }

    // Obtener la campaña
    const campaigns = getUserCampaigns(userEmail);
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (!campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
    }

    if (campaign.userEmail !== userEmail) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Obtener contactos del usuario
    const contacts = getUserContacts(userEmail);
    
    if (contacts.length === 0) {
      return NextResponse.json({ error: 'No hay contactos para enviar' }, { status: 400 });
    }

    // Verificar configuración de Gmail
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;
    
    if (!gmailUser || !gmailPassword || gmailPassword === 'xxxx-xxxx-xxxx-xxxx') {
      return NextResponse.json({ 
        error: 'Configuración de Gmail incompleta. Por favor configura GMAIL_USER y GMAIL_APP_PASSWORD en .env.local' 
      }, { status: 500 });
    }

    // Configurar nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword
      }
    });

    let sentCount = 0;
    const errors: string[] = [];

    // Enviar emails a todos los contactos
    for (const contact of contacts) {
      try {
        const mailOptions = {
          from: userEmail,
          to: contact.email,
          subject: campaign.subject || 'Campaña de Email Marketing',
          html: campaign.content || 'Contenido de la campaña'
        };

        await transporter.sendMail(mailOptions);
        
        // TODO: Implement email history tracking if needed
        
        sentCount++;
      } catch (error) {
        console.error(`Error sending to ${contact.email}:`, error);
        errors.push(`Error enviando a ${contact.email}`);
      }
    }

    return NextResponse.json({ 
      sentCount,
      totalContacts: contacts.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Campaña enviada a ${sentCount} de ${contacts.length} contactos`
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}