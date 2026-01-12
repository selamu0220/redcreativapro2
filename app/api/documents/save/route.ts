import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { databases, getOrCreateCollection, DATABASE_ID, COLLECTION_ID, ID } from '../../../lib/appwrite-server';

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

        const { title, content, mode, language, documentId, pre_prompt, context } = body;

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        // 3. Ensure DB
        console.log('[API] Initializing Appwrite...');
        await getOrCreateCollection();
        console.log('[API] Appwrite Initialized');

        const data = {
            owner_id: user.id,
            title: title || new Date().toLocaleString(),
            content,
            mode: mode || 'professional',
            language: language || 'es',
            pre_prompt: pre_prompt || '',
            context: context || '',
        };

        let result;

        if (documentId) {
            // 4a. Update existing
            console.log('[API] Updating document:', documentId);
            // Verify ownership first
            try {
                const existing = await databases.getDocument(DATABASE_ID, COLLECTION_ID, documentId);
                if (existing.owner_id !== user.id) {
                    console.warn('[API] Forbidden update attempt');
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                }

                result = await databases.updateDocument(DATABASE_ID, COLLECTION_ID, documentId, data);
            } catch (e: any) {
                console.error('[API] Update error:', e);
                if (e.code === 404) {
                    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
                }
                throw e;
            }
        } else {
            // 4b. Create new
            console.log('[API] Creating new document');
            result = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                data
            );
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
