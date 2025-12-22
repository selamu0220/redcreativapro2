import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserLeadMagnetsAsync, 
  createLeadMagnetAsync, 
  updateLeadMagnetAsync,
  deleteLeadMagnetAsync,
  getLeadMagnetByIdAsync
} from '../../lib/database';
// File operations removed - using edge runtime compatible approach

// File upload functionality disabled for edge runtime compatibility
// Files should be handled via external storage services (e.g., Vercel Blob, AWS S3)
function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot === -1 ? '' : fileName.substring(lastDot);
}

function getBaseName(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot === -1 ? fileName : fileName.substring(0, lastDot);
}

// Validate file type and size
function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    'application/pdf',
    'audio/mpeg', 'audio/wav', 'audio/mp3',
    'video/mp4', 'video/avi', 'video/mov',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg', 'image/png', 'image/gif'
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'El archivo es demasiado grande. Máximo 50MB.' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Tipo de archivo no permitido.' };
  }

  return { valid: true };
}

// GET - Get user's lead magnets
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const leadMagnets = await getUserLeadMagnetsAsync(userEmail);
    
    return NextResponse.json({
      success: true,
      leadMagnets
    });
    
  } catch (error) {
    console.error('Error fetching lead magnets:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Create new lead magnet
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const fileType = formData.get('fileType') as string;
    const fileUrl = formData.get('fileUrl') as string;
    const file = formData.get('file') as File | null;

    // Validation
    if (!title || !description || !fileType) {
      return NextResponse.json(
        { error: 'Título, descripción y tipo de archivo son requeridos' },
        { status: 400 }
      );
    }

    let filePath: string | undefined;
    let fileName: string | undefined;
    let fileSize: number | undefined;

    // Handle file upload or URL
    if (fileType === 'link') {
      if (!fileUrl) {
        return NextResponse.json(
          { error: 'URL es requerida para tipo link' },
          { status: 400 }
        );
      }
    } else if (file) {
      // Validate uploaded file
      const validation = validateFile(file);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      // Save file to public directory
      try {
        const fileExtension = getFileExtension(file.name);
        const fileNameBase = getBaseName(file.name);
        const timestamp = Date.now();
        const generatedFileName = `${fileNameBase}-${timestamp}${fileExtension}`;
        const generatedFilePath = `lead-magnets/${generatedFileName}`;
        
        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Ensure directory exists
        const fs = await import('fs/promises');
        const path = await import('path');
        const publicDir = path.join(process.cwd(), 'public', 'lead-magnets');
        
        try {
          await fs.access(publicDir);
        } catch {
          await fs.mkdir(publicDir, { recursive: true });
        }
        
        // Save file
        const fullPath = path.join(publicDir, generatedFileName);
        await fs.writeFile(fullPath, buffer);
        
        fileName = file.name;
        filePath = generatedFilePath;
        fileSize = file.size;
        
      } catch (error) {
        console.error('Error saving file:', error);
        return NextResponse.json(
          { error: 'Error al guardar el archivo' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Archivo o URL es requerido' },
        { status: 400 }
      );
    }

    // Create lead magnet
    const leadMagnet = await createLeadMagnetAsync({
      userEmail,
      title,
      description,
      // fileType: fileType as any,
      fileName,
      filePath,
      fileUrl: fileType === 'link' ? fileUrl : undefined,
      fileSize,
      isActive: true
    });

    return NextResponse.json({
      success: true,
      leadMagnet
    });
    
  } catch (error) {
    console.error('Error creating lead magnet:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Update lead magnet
export async function PUT(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const { id, ...updates } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID del lead magnet es requerido' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingMagnet = await getLeadMagnetByIdAsync(id);
    if (!existingMagnet || existingMagnet.userEmail !== userEmail) {
      return NextResponse.json(
        { error: 'Lead magnet no encontrado o sin permisos' },
        { status: 404 }
      );
    }

    const updatedMagnet = await updateLeadMagnetAsync(id, updates);
    
    return NextResponse.json({
      success: true,
      leadMagnet: updatedMagnet
    });
    
  } catch (error) {
    console.error('Error updating lead magnet:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Delete lead magnet
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID del lead magnet es requerido' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingMagnet = await getLeadMagnetByIdAsync(id);
    if (!existingMagnet || existingMagnet.userEmail !== userEmail) {
      return NextResponse.json(
        { error: 'Lead magnet no encontrado o sin permisos' },
        { status: 404 }
      );
    }

    const deleted = await deleteLeadMagnetAsync(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Error al eliminar lead magnet' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Lead magnet eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('Error deleting lead magnet:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}