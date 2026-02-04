import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { logApiError } from '../../lib/api-error-handler';


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

// KV helper functions
async function kvGet(key: string): Promise<any> {
  try {
    return await kv.get(key);
  } catch (error) {
    console.error(`Error getting KV key ${key}:`, error);
    return null;
  }
}

async function kvSet(key: string, value: any): Promise<void> {
  try {
    await kv.set(key, value);
  } catch (error) {
    console.error(`Error setting KV key ${key}:`, error);
  }
}

const BUSINESS_CONTEXT_KEY = 'business-contexts';

// Leer contextos empresariales
const readBusinessContexts = async (): Promise<UserBusinessContext> => {
  try {
    const data = await kvGet(BUSINESS_CONTEXT_KEY);
    return data || {};
  } catch (error) {
    console.error('Error reading business contexts:', error);
    return {};
  }
};

// Escribir contextos empresariales
const writeBusinessContexts = async (contexts: UserBusinessContext) => {
  try {
    await kvSet(BUSINESS_CONTEXT_KEY, contexts);
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

    const contexts = await readBusinessContexts();
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
    logApiError(request, error, { userEmail: request.headers.get('x-user-email') });
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

    const contexts = await readBusinessContexts();
    contexts[userEmail] = {
      ...businessContext,
      // Asegurar que la estrategia de contenido tenga la estructura correcta
      contentStrategy: {
        valueToSalesRatio: businessContext.contentStrategy?.valueToSalesRatio || '4:1',
        valueEmailTypes: businessContext.contentStrategy?.valueEmailTypes || [],
        salesEmailTypes: businessContext.contentStrategy?.salesEmailTypes || []
      }
    };
    
    await writeBusinessContexts(contexts);

    return NextResponse.json(
      { message: 'Contexto empresarial guardado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    logApiError(request, error, { 
      userEmail: request.headers.get('x-user-email'),
      operation: 'save_business_context'
    });
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

    const contexts = await readBusinessContexts();
    
    if (contexts[userEmail]) {
      delete contexts[userEmail];
      await writeBusinessContexts(contexts);
    }

    return NextResponse.json(
      { message: 'Contexto empresarial eliminado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    logApiError(request, error, { 
      userEmail: request.headers.get('x-user-email'),
      operation: 'delete_business_context'
    });
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
