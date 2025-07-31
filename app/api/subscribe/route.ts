import { NextRequest, NextResponse } from 'next/server';
import { 
  getEmailPageById,
  createContact,
  getUserContacts,
  ContactData 
} from '../../lib/database';

// POST - Suscribir nuevo contacto desde página de recopilación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageId, email, name, customFields } = body;

    if (!pageId || !email) {
      return NextResponse.json({ error: 'ID de página y email son requeridos' }, { status: 400 });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Formato de email inválido' }, { status: 400 });
    }

    // Obtener la página de recopilación
    const page = getEmailPageById(pageId);
    if (!page) {
      return NextResponse.json({ error: 'Página no encontrada' }, { status: 404 });
    }

    // Verificar que la página está activa
    if (!page.isActive) {
      return NextResponse.json({ error: 'Esta página de suscripción no está activa' }, { status: 400 });
    }

    // Verificar si el contacto ya existe para este usuario
    const existingContacts = getUserContacts(page.userEmail);
    const existingContact = existingContacts.find(contact => contact.email === email);
    
    if (existingContact) {
      if (existingContact.isSubscribed) {
        return NextResponse.json({ 
          error: 'Este email ya está suscrito',
          message: page.successMessage 
        }, { status: 409 });
      } else {
        // Reactivar suscripción si estaba desuscrito
        const { updateContact } = await import('../../lib/database');
        const updatedContact = updateContact(existingContact.id, {
          isSubscribed: true,
          source: `Página: ${page.title}`
        });
        
        return NextResponse.json({ 
          message: page.successMessage,
          contact: updatedContact 
        });
      }
    }

    // Crear nuevo contacto
    const contactData: Omit<ContactData, 'id' | 'createdAt' | 'updatedAt'> = {
      email,
      name: page.collectName ? name : undefined,
      userEmail: page.userEmail,
      isSubscribed: true,
      source: `Página: ${page.title}`,
      tags: ['página-suscripción']
    };

    // Agregar campos personalizados como tags si existen
    if (customFields && Object.keys(customFields).length > 0) {
      const customTags = Object.entries(customFields).map(([key, value]) => `${key}:${value}`);
      contactData.tags = [...(contactData.tags || []), ...customTags];
    }

    const newContact = createContact(contactData);
    
    return NextResponse.json({ 
      message: page.successMessage,
      contact: newContact 
    }, { status: 201 });

  } catch (error) {
    console.error('Error subscribing contact:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}