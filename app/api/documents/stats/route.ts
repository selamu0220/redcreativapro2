import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { databases, getOrCreateCollection, DATABASE_ID, COLLECTION_ID } from '../../../lib/appwrite-server';
import { Query } from 'node-appwrite';

export async function GET(request: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user || !user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await getOrCreateCollection();

        // Get all documents with content to calculate word count
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [
                Query.equal('owner_id', user.id),
                Query.select(['$id', 'content', '$createdAt']),
                Query.limit(100) // Reasonable limit
            ]
        );

        const documents = response.documents;
        const totalDocuments = response.total;

        // Calculate total words across all documents
        let totalWords = 0;
        documents.forEach((doc: any) => {
            if (doc.content) {
                // Strip HTML tags and count words
                const textContent = doc.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                const words = textContent.split(/\s+/).filter(Boolean).length;
                totalWords += words;
            }
        });

        // Calculate documents created this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const docsThisMonth = documents.filter((doc: any) =>
            new Date(doc.$createdAt) >= startOfMonth
        ).length;

        return NextResponse.json({
            totalDocuments,
            totalWords,
            docsThisMonth,
        });

    } catch (error: any) {
        console.error('Stats error:', error);
        return NextResponse.json(
            { error: 'Failed to get stats', details: error.message },
            { status: 500 }
        );
    }
}
