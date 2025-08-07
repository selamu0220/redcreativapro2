import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';


interface BusinessContext {
  businessName: string;
  businessType: string;
  services: string;
  targetAudience: string;
  valueProposition: string;
  salesTactics: string;
  contentStrategy: {
    valueToSalesRatio: string;
    valueEmailTypes: string[];
    salesEmailTypes: string[];
  };
  brandTone: string;
  keyMessages: string[];
}

interface UserBusinessContext {
  [userEmail: string]: BusinessContext;
}

const BUSINESS_CONTEXT_FILE = path.join(process.cwd(), 'data', 'business-context.json');

// Asegurar que el directorio data existe
const ensureDataDirectory = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Leer contextos empresariales
const readBusinessContexts = (): UserBusinessContext => {
  ensureDataDirectory();
  
  if (!fs.existsSync(BUSINESS_CONTEXT_FILE)) {
    return {};
  }
  
  try {
    const data = fs.readFileSync(BUSINESS_CONTEXT_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading business contexts:', error);
    return {};
  }
};

// Escribir contextos empresariales
const writeBusinessContexts = (contexts: UserBusinessContext) => {
  ensureDataDirectory();
  
  try {
    fs.writeFileSync(BUSINESS_CONTEXT_FILE, JSON.stringify(contexts, null, 2));
  } catch (error) {
    console.error('Error writing business contexts:', error);
    throw error;
  }
};

// GET - Obtener contexto empresarial del usuario
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email de usuario requerido' },
        { status: 400 }
      );
    }

    const contexts = readBusinessContexts();
    const userContext = contexts[userEmail];

    if (!userContext) {
      // Retornar contexto por defecto
      const defaultContext: BusinessContext = {
        businessName: '',
        businessType: '',
        services: '',
        targetAudience: '',
        valueProposition: '',
        salesTactics: '',
        contentStrategy: {
          valueToSalesRatio: '4:1',
          valueEmailTypes: [
            'Consejos y tips útiles',
            'Casos de éxito y testimonios',
            'Contenido educativo',
            'Noticias del sector'
          ],
          salesEmailTypes: [
            'Promociones y ofertas',
            'Lanzamiento de productos',
            'Llamadas a la acción directas'
          ]
        },
        brandTone: 'profesional',
        keyMessages: []
      };
      
      return NextResponse.json(defaultContext);
    }

    return NextResponse.json(userContext);
  } catch (error) {
    console.error('Error getting business context:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Guardar contexto empresarial del usuario
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email de usuario requerido' },
        { status: 400 }
      );
    }

    const businessContext: BusinessContext = await request.json();
    
    // Validar campos requeridos
    if (!businessContext.businessName || !businessContext.businessType) {
      return NextResponse.json(
        { error: 'Nombre del negocio y tipo de negocio son requeridos' },
        { status: 400 }
      );
    }

    const contexts = readBusinessContexts();
    contexts[userEmail] = {
      ...businessContext,
      // Asegurar que la estrategia de contenido tenga la estructura correcta
      contentStrategy: {
        valueToSalesRatio: businessContext.contentStrategy?.valueToSalesRatio || '4:1',
        valueEmailTypes: businessContext.contentStrategy?.valueEmailTypes || [],
        salesEmailTypes: businessContext.contentStrategy?.salesEmailTypes || []
      }
    };
    
    writeBusinessContexts(contexts);

    return NextResponse.json(
      { message: 'Contexto empresarial guardado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving business context:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar contexto empresarial del usuario
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email de usuario requerido' },
        { status: 400 }
      );
    }

    const contexts = readBusinessContexts();
    
    if (contexts[userEmail]) {
      delete contexts[userEmail];
      writeBusinessContexts(contexts);
    }

    return NextResponse.json(
      { message: 'Contexto empresarial eliminado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting business context:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}