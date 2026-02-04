import Dexie, { Table } from 'dexie';

export interface LocalDocument {
    id?: string; // UUID from remote or temp local ID
    title: string;
    content: string; // JSON or HTML
    folderId?: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    isSynced: boolean; // False if changes are pending upload
    lastSyncedAt?: Date;
}

export interface LocalFolder {
    id: string;
    name: string;
    parentId?: string;
    createdAt: Date;
}

export interface LocalVersion {
    id?: number;
    docId: string;
    content: string;
    title: string;
    createdAt: Date;
    autoSaved: boolean; // boolean to distinguish auto-snapshots from manual snapshots
}

export class PhoenixDatabase extends Dexie {
    documents!: Table<LocalDocument>;
    folders!: Table<LocalFolder>;
    versions!: Table<LocalVersion>;

    constructor() {
        super('PhoenixDB');
        this.version(1).stores({
            documents: '++id, title, folderId, *tags, updatedAt, isSynced',
            folders: 'id, parentId, name'
        });

        this.version(2).stores({
            versions: '++id, docId, createdAt'
        });
    }
}

export const db = new PhoenixDatabase();

export async function saveDocumentLocally(doc: LocalDocument) {
    if (!doc.id) {
        // If no ID, generate one or let Dexie auto-increment if using numbers (but we use UUID strings usually)
        // For local-first, we might use uuid if available, or just rely on auto-increment for now
        // Let's assume passed ID is robust.
        return await db.documents.add(doc);
    } else {
        return await db.documents.put(doc);
    }
}
