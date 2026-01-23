import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { DocumentsService } from '@/app/lib/documents-service';

export async function POST(request: NextRequest) {
    console.log('[API] Save Request Started');
    try {
        // 1. Authentication
        const { getUser } = getKindeServerSession();
        const user = await getUser();
        console.log('[API] User:', user?.id ? 'Authenticated' : 'No User');

        if (!user || !user.id) {
            console.warn('[API] Unauthorized access attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse Body
        const body = await request.json();
        console.log('[API] Body received:', { title: body.title, mode: body.mode, hasContent: !!body.content, docId: body.documentId });

        const { title, content, mode, language, documentId, pre_prompt, context, group_id } = body;

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const data: any = {
            owner_id: user.id,
            title: title || new Date().toLocaleString(),
            content,
            mode: mode || 'professional',
            language: language || 'es',
            pre_prompt: pre_prompt || '',
            context: context || '',
            group_id: group_id || null,
        };

        let result;

        if (documentId) {
            // 4a. Update existing
            console.log('[API] Updating document:', documentId);
            try {
                // DocumentsService handles ownership check internally via query filter
                result = await DocumentsService.updateDocument(documentId, user.id, data);
            } catch (e: any) {
                console.error('[API] Update error:', e);
                return NextResponse.json({ error: 'Failed to update or unauthorized' }, { status: 403 });
            }
        } else {
            // 4b. Create new
            console.log('[API] Creating new document');
            result = await DocumentsService.createDocument(data);
        }

        console.log('[API] Success. Doc ID:', result.$id);
        return NextResponse.json({
            success: true,
            documentId: result.$id,
            message: 'Document saved successfully'
        });

    } catch (error: any) {
        console.error('[API] Save Fatal Error:', error);
        return NextResponse.json(
            { error: 'Failed to save document', details: error.message, stack: error.stack },
            { status: 500 }
        );
    }
}
