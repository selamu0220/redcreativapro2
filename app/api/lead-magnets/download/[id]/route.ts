import { NextRequest, NextResponse } from 'next/server';
import { 
  getLeadMagnetByIdAsync,
  incrementLeadMagnetDownloadAsync,
  addCollectedEmailAsync
} from '../../../../lib/database';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET - Download lead magnet file
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    const source = url.searchParams.get('source') || 'direct';
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido para descargar' },
        { status: 400 }
      );
    }

    // Get lead magnet
    const leadMagnet = await getLeadMagnetByIdAsync(id);
    
    if (!leadMagnet || !leadMagnet.isActive) {
      return NextResponse.json(
        { error: 'Lead magnet no encontrado o inactivo' },
        { status: 404 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               request.headers.get('x-real-ip') || 
               'unknown';

    try {
      // Collect email
      await addCollectedEmailAsync({
        email,
        userEmail: leadMagnet.userEmail,
        source: `lead-magnet-${source}`,
        ipAddress: ip,
        leadMagnetId: id
      });

      // Increment download count
      await incrementLeadMagnetDownloadAsync(id);
    } catch (error) {
      console.error('Error tracking download:', error);
      // Continue with download even if tracking fails
    }

    // Handle different file types
    if (leadMagnet.fileType === 'link') {
      // Redirect to external URL
      if (leadMagnet.fileUrl) {
        return NextResponse.redirect(leadMagnet.fileUrl);
      } else {
        return NextResponse.json(
          { error: 'URL no disponible' },
          { status: 404 }
        );
      }
    } else {
      // Serve uploaded file
      if (!leadMagnet.filePath) {
        return NextResponse.json(
          { error: 'Archivo no disponible' },
          { status: 404 }
        );
      }

      // For file downloads, redirect to the public file path
      // This assumes files are stored in the public directory and accessible via URL
      if (!leadMagnet.filePath) {
        return NextResponse.json(
          { error: 'Archivo no disponible' },
          { status: 404 }
        );
      }

      // Create a direct URL to the file in the public directory
      const fileUrl = `${request.nextUrl.origin}/${leadMagnet.filePath}`;
      
      try {
        // Fetch the file to verify it exists and get its content
        const fileResponse = await fetch(fileUrl);
        
        if (!fileResponse.ok) {
          return NextResponse.json(
            { error: 'Archivo no encontrado en el servidor' },
            { status: 404 }
          );
        }

        const fileBuffer = await fileResponse.arrayBuffer();
        const fileName = leadMagnet.fileName || `lead-magnet-${id}`;
        
        // Determine content type
        let contentType = 'application/octet-stream';
        const fileName_lower = fileName.toLowerCase();
        
        const mimeTypes: { [key: string]: string } = {
          'pdf': 'application/pdf',
          'mp3': 'audio/mpeg',
          'wav': 'audio/wav',
          'mp4': 'video/mp4',
          'avi': 'video/x-msvideo',
          'mov': 'video/quicktime',
          'doc': 'application/msword',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'txt': 'text/plain',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif'
        };
        
        // Check file extension
        for (const [ext, mime] of Object.entries(mimeTypes)) {
          if (fileName_lower.endsWith(`.${ext}`)) {
            contentType = mime;
            break;
          }
        }

        return new NextResponse(fileBuffer as BodyInit, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Length': fileBuffer.byteLength.toString(),
          },
        });
      } catch (error) {
        console.error('Error fetching file:', error);
        return NextResponse.json(
          { error: 'Error al acceder al archivo' },
          { status: 500 }
        );
      }
    }
    
  } catch (error) {
    console.error('Error downloading lead magnet:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Alternative method for downloading with email collection
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const { email, source = 'form' } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Get lead magnet
    const leadMagnet = await getLeadMagnetByIdAsync(id);
    
    if (!leadMagnet || !leadMagnet.isActive) {
      return NextResponse.json(
        { error: 'Lead magnet no encontrado o inactivo' },
        { status: 404 }
      );
    }

    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               request.headers.get('x-real-ip') || 
               'unknown';

    try {
      // Collect email
      await addCollectedEmailAsync({
        email,
        userEmail: leadMagnet.userEmail,
        source: `lead-magnet-${source}`,
        ipAddress: ip,
        leadMagnetId: id
      });

      // Increment download count
      await incrementLeadMagnetDownloadAsync(id);
    } catch (error) {
      console.error('Error tracking download:', error);
      // Continue with response even if tracking fails
    }

    // Return download URL or file info
    if (leadMagnet.fileType === 'link') {
      return NextResponse.json({
        success: true,
        downloadUrl: leadMagnet.fileUrl,
        type: 'redirect'
      });
    } else {
      return NextResponse.json({
        success: true,
        downloadUrl: `/api/lead-magnets/download/${id}?email=${encodeURIComponent(email)}&source=${source}`,
        type: 'download',
        fileName: leadMagnet.fileName
      });
    }
    
  } catch (error) {
    console.error('Error processing download request:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}