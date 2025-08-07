import { NextRequest, NextResponse } from 'next/server';
import { 
  createDocument, 
  getUserDocuments, 
  getDocumentById, 
  updateDocument, 
  deleteDocument,
  DocumentData 
} from '../../lib/database';

// GET /api/documents - Get user documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const folderId = searchParams.get('folderId');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    const documents = getUserDocuments(email, folderId || undefined);
    
    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error getting documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Create new document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, userEmail, folderId, type } = body;
    
    if (!title || !content || !userEmail || !type) {
      return NextResponse.json(
        { error: 'Title, content, userEmail, and type are required' },
        { status: 400 }
      );
    }
    
    const documentData = {
      title,
      content,
      userEmail,
      folderId: folderId || undefined,
      type: type as DocumentData['type']
    };
    
    const newDocument = createDocument(documentData);
    
    return NextResponse.json({ document: newDocument }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/documents - Update document
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, content, folderId } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    const updates: Partial<DocumentData> = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (folderId !== undefined) updates.folderId = folderId;
    
    const updatedDocument = updateDocument(id, updates);
    
    if (!updatedDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ document: updatedDocument });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/documents - Delete document
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    const deleted = deleteDocument(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}