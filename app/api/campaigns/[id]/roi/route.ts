import { NextRequest, NextResponse } from 'next/server';
import { getCampaignById, updateCampaign } from '../../../../lib/database';


// PUT - Actualizar ROI manual de una campaña
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const { manualROI } = await request.json();
    
    if (typeof manualROI !== 'number' || manualROI < 0) {
      return NextResponse.json({ error: 'ROI debe ser un número positivo' }, { status: 400 });
    }

    const { id } = await params;
    const campaignId = id;
    const campaign = getCampaignById(campaignId);
    
    if (!campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
    }
    
    if (campaign.userEmail !== userEmail) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Actualizar el ROI manual en las métricas
    const updatedCampaign = updateCampaign(campaignId, {
      metrics: {
        ...campaign.metrics,
        manualROI: manualROI,
        lastCalculated: new Date().toISOString()
      }
    });

    if (!updatedCampaign) {
      return NextResponse.json({ error: 'Error al actualizar la campaña' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
      message: 'ROI actualizado correctamente'
    });

  } catch (error) {
    console.error('Error updating campaign ROI:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar ROI manual (volver al cálculo automático)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const { id } = await params;
    const campaignId = id;
    const campaign = getCampaignById(campaignId);
    
    if (!campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
    }
    
    if (campaign.userEmail !== userEmail) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Eliminar el ROI manual para volver al cálculo automático
    const updatedMetrics = { ...campaign.metrics };
    delete updatedMetrics.manualROI;
    
    const updatedCampaign = updateCampaign(campaignId, {
      metrics: {
        ...updatedMetrics,
        lastCalculated: new Date().toISOString()
      }
    });

    if (!updatedCampaign) {
      return NextResponse.json({ error: 'Error al actualizar la campaña' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
      message: 'ROI manual eliminado, volviendo al cálculo automático'
    });

  } catch (error) {
    console.error('Error removing manual ROI:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}