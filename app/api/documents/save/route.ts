
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { DocumentsService } from '@/app/lib/documents-service';

export async function POST(request: NextRequest) {
    console.log('[API] Save Request Started');
    try {
        // 1. Authentication
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.warn('[API] Unauthorized:', authError);
            return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 });
        }

        // 2. Parse Body
        const body = await request.json();
        const { title, content, mode, language, id, pre_prompt, context, group_id } = body;

        // Note: frontend sends 'id' sometimes, but previous code used 'documentId'. 
        // Let's handle both.
        const docId = id || body.documentId;

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const docData = {
            owner_id: user.id,
            title: title || 'Untitled',
            content,
            mode: mode || 'professional',
            language: language || 'es',
            pre_prompt: pre_prompt || null,
            context: context || null,
            // group_id: group_id || null, // Optional
            updated_at: new Date().toISOString()
        };

        let resultData;
        let operation;

        if (docId) {
            // UPDATE
            console.log('[API] Updating document:', docId);
            operation = 'update';

            const { data, error } = await supabase
                .from('user_documents')
                .update(docData)
                .eq('id', docId)
                .eq('owner_id', user.id) // RLS redundant but safe
                .select()
                .single();

            if (error) throw error;
            resultData = data;
        } else {
            // INSERT
            console.log('[API] Creating new document');
            operation = 'insert';

            const { data, error } = await supabase
                .from('user_documents')
                .insert([{
                    ...docData,
                    created_at: new Date().toISOString() // Explicitly set created_at for new docs
                }])
                .select()
                .single();

            if (error) throw error;
            resultData = data;
        }

        console.log(`[API] Save Success (${operation}). ID:`, resultData.id);

        return NextResponse.json({
            success: true,
            id: resultData.id,
            documentId: resultData.id, // Backwards compat
            message: 'Document saved successfully'
        });

    } catch (error: any) {
        console.error('[API] Save Fatal Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to save document',
                details: error.message || error.toString(),
                hint: error.hint || 'Check database permissions or table existence'
            },
            { status: 500 }
        );
    }
}
