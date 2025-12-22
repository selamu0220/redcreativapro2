import { NextRequest, NextResponse } from 'next/server';
import { 
  getEmailTopicsAsync,
  saveEmailTopicsAsync
} from '../../lib/database';

// GET - Get email topics for a user
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const topics = await getEmailTopicsAsync(userEmail);
    
    return NextResponse.json({
      success: true,
      topics
    });
    
  } catch (error) {
    console.error('Error fetching email topics:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Save email topics for a user
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const { topics } = await request.json();
    
    if (!Array.isArray(topics)) {
      return NextResponse.json(
        { error: 'Topics debe ser un array' },
        { status: 400 }
      );
    }

    // Validate topics structure
    for (const topic of topics) {
      if (!topic.id || !topic.name || typeof topic.isActive !== 'boolean') {
        return NextResponse.json(
          { error: 'Estructura de topic inválida. Requiere id, name e isActive' },
          { status: 400 }
        );
      }
    }

    await saveEmailTopicsAsync(topics);
    
    return NextResponse.json({
      success: true,
      message: 'Temas de email guardados exitosamente'
    });
    
  } catch (error) {
    console.error('Error saving email topics:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Update email topics for a user
export async function PUT(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const { topics } = await request.json();
    
    if (!Array.isArray(topics)) {
      return NextResponse.json(
        { error: 'Topics debe ser un array' },
        { status: 400 }
      );
    }

    // Validate topics structure
    for (const topic of topics) {
      if (!topic.id || !topic.name || typeof topic.isActive !== 'boolean') {
        return NextResponse.json(
          { error: 'Estructura de topic inválida. Requiere id, name e isActive' },
          { status: 400 }
        );
      }
    }

    await saveEmailTopicsAsync(topics);
    
    return NextResponse.json({
      success: true,
      message: 'Temas de email actualizados exitosamente'
    });
    
  } catch (error) {
    console.error('Error updating email topics:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}