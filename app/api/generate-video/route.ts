import { NextRequest, NextResponse } from 'next/server';
import { renderInstagramVideo } from '../../scripts/render-video';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, outputName, voiceId } = body;

    if (!text || !outputName) {
      return NextResponse.json(
        { error: 'Se requiere "text" y "outputName"' },
        { status: 400 }
      );
    }

    const videoPath = await renderInstagramVideo({
      script: { text },
      outputName,
      voiceId,
    });

    const videoUrl = `/videos/${outputName}.mp4`;

    return NextResponse.json({
      success: true,
      videoUrl,
      videoPath,
    });
  } catch (error) {
    console.error('Error generando video:', error);
    return NextResponse.json(
      { error: 'Error generando video', details: String(error) },
      { status: 500 }
    );
  }
}
