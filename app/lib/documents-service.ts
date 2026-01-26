
import { createClient } from '@supabase/supabase-js';

// Initialize Admin Client (Bypass RLS)
// We use this because Kinde Auth ID doesn't match Supabase Auth ID directly.
// Security is enforced by ensuring this service is ONLY called after Kinde session verification.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export interface UserDocument {
    id: string; // Supabase UUID
    owner_id: string;
    title: string;
    content: string;
    mode?: string;
    language?: string;
    pre_prompt?: string;
    context?: string;
    group_id?: string | null; // UUID or null
    created_at: string;
    updated_at: string;
}

export const DocumentsService = {
    async listDocuments(userId: string, groupId?: string) {
        let query = supabaseAdmin
            .from('user_documents')
            .select('id, title, language, mode, updated_at, group_id')
            .eq('owner_id', userId)
            .order('updated_at', { ascending: false });

        if (groupId) {
            query = query.eq('group_id', groupId);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Map to expected Appwrite-like format if needed, or just return data
        // For compatibility with existing frontend, we might need to map 'id' to '$id' if the frontend expects it.
        // Let's assume frontend expects '$id'. I should check the frontend code to be sure, but for now I'll return clean objects 
        // and let the API route handle mapping if necessary.
        // Actually, the API route mapped it directly from Appwrite response.
        return {
            documents: data.map(d => ({
                ...d,
                $id: d.id, // Compat alias
                $updatedAt: d.updated_at // Compat alias
            })),
            total: data.length
        };
    },

    async createDocument(data: Partial<UserDocument> & { owner_id: string }) {
        const { data: doc, error } = await supabaseAdmin
            .from('user_documents')
            .insert([{
                owner_id: data.owner_id,
                title: data.title || 'Untitled',
                content: data.content || '',
                mode: data.mode,
                language: data.language,
                pre_prompt: data.pre_prompt,
                context: data.context,
                group_id: data.group_id
            }])
            .select()
            .single();

        if (error) throw error;

        return {
            ...doc,
            $id: doc.id,
            $createdAt: doc.created_at,
            $updatedAt: doc.updated_at
        };
    },

    async getDocument(documentId: string, userId: string) {
        const { data, error } = await supabaseAdmin
            .from('user_documents')
            .select('*')
            .eq('id', documentId)
            .eq('owner_id', userId) // Security check
            .single();

        if (error) return null;

        return {
            ...data,
            $id: data.id,
            $createdAt: data.created_at,
            $updatedAt: data.updated_at
        };
    },

    async updateDocument(documentId: string, userId: string, data: Partial<UserDocument>) {
        const { data: doc, error } = await supabaseAdmin
            .from('user_documents')
            .update({
                ...data,
                updated_at: new Date().toISOString()
            })
            .eq('id', documentId)
            .eq('owner_id', userId) // Security check
            .select()
            .single();

        if (error) throw error;

        return {
            ...doc,
            $id: doc.id,
            $createdAt: doc.created_at,
            $updatedAt: doc.updated_at
        };
    },

    async deleteDocument(documentId: string, userId: string) {
        const { error } = await supabaseAdmin
            .from('user_documents')
            .delete()
            .eq('id', documentId)
            .eq('owner_id', userId); // Security check

        if (error) throw error;
        return true;
    },

    async getUserStats(userId: string) {
        const { count, error } = await supabaseAdmin
            .from('user_documents')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', userId);

        if (error) throw error;

        // Calculate docs this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: monthCount, error: monthError } = await supabaseAdmin
            .from('user_documents')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', userId)
            .gte('created_at', startOfMonth.toISOString());

        return {
            totalDocuments: count || 0,
            totalWords: 0, // TODO: Add word_count column to documents table for performant stats
            docsThisMonth: monthCount || 0
        };
    }
};
