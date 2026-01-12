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

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [
                Query.equal('owner_id', user.id),
                Query.orderDesc('$updatedAt'),
                Query.select(['$id', 'title', 'language', 'mode', '$updatedAt']) // Optimize payload
            ]
        );

        return NextResponse.json({
            documents: response.documents,
            total: response.total
        });

    } catch (error: any) {
        console.error('List documents error:', error);
        return NextResponse.json(
            { error: 'Failed to list documents', details: error.message },
            { status: 500 }
        );
    }
}
