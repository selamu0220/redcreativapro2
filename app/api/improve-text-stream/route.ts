import { NextRequest } from 'next/server';
import { NexusCore } from '@/app/nexus-ai/core/NexusCore';
import { SentinelMonitor } from '@/app/nexus-ai/monitoring/SentinelMonitor';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const sentinel = SentinelMonitor.getInstance();
        const start = Date.now();

        const body = await req.json().catch(e => null);
        if (!body) return new Response('Invalid JSON', { status: 400 });

        const { content, profileId, customInstructions, model } = body;

        if (!content) {
            return new Response('Content is required', { status: 400 });
        }

        const nexus = NexusCore.getInstance();

        // Construct a specialized prompt for improvement
        const systemPrompt = `Eres un motor de optimización de texto HTML.
        TU OBJETIVO: Mejorar la redacción del contenido HTML proporcionado sin romper su estructura.
        
        Configuración:
        - Perfil: ${profileId || 'General'}
        - Instrucciones extra: ${customInstructions || 'Mejora claridad y corrección.'}
        
        REGLAS DE SALIDA (CRÍTICO):
        1. Devuelve **ÚNICAMENTE** el código HTML crudo.
        2. **PROHIBIDO** usar bloques de código Markdown (\`\`\`html ... \`\`\`).
        3. **PROHIBIDO** añadir comentarios o texto introductorio.
        4. Si recibes <p>Texto</p>, devuelve <p>Texto Mejorado</p>. No alteres las etiquetas raíz ni elimines clases si las hubiera.`;

        const history = [
            { role: 'system', content: systemPrompt }
        ];

        const streamConfig = await nexus.processMessageStream(content, history as any);

        sentinel.recordRequest(Date.now() - start, 'openrouter', true);

        return streamConfig.toTextStreamResponse();

    } catch (error: any) {
        console.error('[NexusImprover] Error:', error);

        try {
            SentinelMonitor.getInstance().recordRequest(0, 'openrouter', false);
        } catch { }

        return new Response(JSON.stringify({
            error: error.message,
            stack: error.stack,
            envCheck: process.env.OPEN_ROUTER_API_KEY ? 'Key Present' : 'Key Missing'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
