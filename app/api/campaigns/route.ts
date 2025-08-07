import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserCampaigns, 
  createCampaign, 
  updateCampaign, 
  deleteCampaign,
  getUserContacts,
  CampaignData 
} from '../../lib/database';

// GET - Obtener campañas del usuario
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const campaigns = getUserCampaigns(userEmail);
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST - Crear nueva campaña
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const body = await request.json();
    const { name, subject, content, status = 'draft' } = body;

    if (!name || !subject || !content) {
      return NextResponse.json({ error: 'Nombre, asunto y contenido son requeridos' }, { status: 400 });
    }

    // Contar contactos suscritos para esta campaña
    const contacts = getUserContacts(userEmail);
    const subscribedContacts = contacts.filter(contact => contact.isSubscribed);

    const campaignData: Omit<CampaignData, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      subject,
      content,
      userEmail,
      status,
      recipientCount: subscribedContacts.length,
      openCount: 0,
      clickCount: 0,
      unsubscribeCount: 0,
      // Forzar IA en todas las campañas
      aiSettings: {
        generateContent: true,
        optimizeSubject: true,
        personalizeContent: true,
        targetAudience: 'clientes potenciales',
        contentTheme: 'marketing general',
        tone: 'professional',
        contentLength: 'medium'
      }
    };

    const newCampaign = createCampaign(campaignData);
    return NextResponse.json({ campaign: newCampaign }, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT - Actualizar campaña
export async function PUT(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const body = await request.json();
    const { id, name, subject, content, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de la campaña es requerido' }, { status: 400 });
    }

    const updatedCampaign = updateCampaign(id, {
      name,
      subject,
      content,
      status
    });

    if (!updatedCampaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
    }

    // Verificar que la campaña pertenece al usuario
    if (updatedCampaign.userEmail !== userEmail) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    return NextResponse.json({ campaign: updatedCampaign });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar campaña
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    const url = new URL(request.url);
    const campaignId = url.searchParams.get('id');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    if (!campaignId) {
      return NextResponse.json({ error: 'ID de la campaña es requerido' }, { status: 400 });
    }

    // Verificar que la campaña pertenece al usuario antes de eliminar
    const campaigns = getUserCampaigns(userEmail);
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (!campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
    }

    const deleted = deleteCampaign(campaignId);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Error al eliminar campaña' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Campaña eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}