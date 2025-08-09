import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserContactsAsync, 
  createContactAsync, 
  updateContactAsync, 
  deleteContactAsync,
  ContactData 
} from '../../lib/database';

// GET - Obtener contactos del usuario
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const contacts = await getUserContactsAsync(userEmail);
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST - Crear nuevo contacto
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const body = await request.json();
    const { email, name, source, tags, additionalContext } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email del contacto es requerido' }, { status: 400 });
    }

    // Verificar si el contacto ya existe
    const existingContacts = await getUserContactsAsync(userEmail);
    const existingContact = existingContacts.find(contact => contact.email === email);
    
    if (existingContact) {
      return NextResponse.json({ error: 'El contacto ya existe' }, { status: 409 });
    }

    const contactData: Omit<ContactData, 'id' | 'createdAt' | 'updatedAt'> = {
      email,
      name,
      userEmail,
      isSubscribed: true,
      source,
      tags: tags || [],
      additionalContext
    };

    const newContact = await createContactAsync(contactData);
    return NextResponse.json({ contact: newContact }, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT - Actualizar contacto
export async function PUT(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const body = await request.json();
    const { id, name, tags, isSubscribed, additionalContext } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID del contacto es requerido' }, { status: 400 });
    }

    const updatedContact = await updateContactAsync(id, {
      name,
      tags,
      isSubscribed,
      additionalContext
    });

    if (!updatedContact) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 });
    }

    // Verificar que el contacto pertenece al usuario
    if (updatedContact.userEmail !== userEmail) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    return NextResponse.json({ contact: updatedContact });
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar contacto
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    const url = new URL(request.url);
    const contactId = url.searchParams.get('id');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    if (!contactId) {
      return NextResponse.json({ error: 'ID del contacto es requerido' }, { status: 400 });
    }

    // Verificar que el contacto pertenece al usuario antes de eliminar
    const contacts = await getUserContactsAsync(userEmail);
    const contact = contacts.find(c => c.id === contactId);
    
    if (!contact) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 });
    }

    const deleted = await deleteContactAsync(contactId);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Error al eliminar contacto' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Contacto eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}