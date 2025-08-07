import { NextRequest, NextResponse } from 'next/server';
import { 

  createFolder, 
  getUserFolders, 
  getFolderById, 
  updateFolder, 
  deleteFolder,
  getFolderStructure,
  FolderData 
} from '../../lib/database';

// GET /api/folders - Get user folders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const parentFolderId = searchParams.get('parentFolderId');
    const includeStructure = searchParams.get('includeStructure') === 'true';
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    if (includeStructure) {
      const structure = getFolderStructure(email, parentFolderId || undefined);
      return NextResponse.json(structure);
    } else {
      const folders = getUserFolders(email, parentFolderId || undefined);
      return NextResponse.json({ folders });
    }
  } catch (error) {
    console.error('Error getting folders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/folders - Create new folder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, userEmail, parentFolderId } = body;
    
    if (!name || !userEmail) {
      return NextResponse.json(
        { error: 'Name and userEmail are required' },
        { status: 400 }
      );
    }
    
    const folderData = {
      name,
      userEmail,
      parentFolderId: parentFolderId || undefined
    };
    
    const newFolder = createFolder(folderData);
    
    return NextResponse.json({ folder: newFolder }, { status: 201 });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/folders - Update folder
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, parentFolderId } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Folder ID is required' },
        { status: 400 }
      );
    }
    
    const updates: Partial<FolderData> = {};
    if (name !== undefined) updates.name = name;
    if (parentFolderId !== undefined) updates.parentFolderId = parentFolderId;
    
    const updatedFolder = updateFolder(id, updates);
    
    if (!updatedFolder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ folder: updatedFolder });
  } catch (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/folders - Delete folder
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Folder ID is required' },
        { status: 400 }
      );
    }
    
    const deleted = deleteFolder(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}