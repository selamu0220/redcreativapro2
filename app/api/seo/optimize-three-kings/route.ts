import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  OptimizationRequest, 
  OptimizationResponse, 
  OptimizationHistory,
  AIAnalysisRequest,
  AIAnalysisResponse
} from '../../../../types/seo-tres-reyes';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Función para obtener análisis de IA (OpenAI/Gemini)
async function getAIOptimization(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
  // TODO: Implementar integración real con OpenAI/Gemini
  // Por ahora retornamos una respuesta mock
  
  const mockResponse: AIAnalysisResponse = {
    optimized_title: `${request.keyword} - Guía Completa 2024 | Tu Marca`,
    optimized_h1: `Todo sobre ${request.keyword}: Guía Definitiva`,
    optimized_first_paragraph: `¿Buscas información sobre ${request.keyword}? En esta guía completa te explicamos todo lo que necesitas saber sobre ${request.keyword}, desde los conceptos básicos hasta las estrategias más avanzadas. Descubre cómo ${request.keyword} puede transformar tu negocio.`,
    semantic_keywords: [
      `${request.keyword} 2024`,
      `guía ${request.keyword}`,
      `estrategias ${request.keyword}`,
      `mejores prácticas ${request.keyword}`
    ],
    content_gaps: [
      'Falta información sobre tendencias actuales',
      'No incluye casos de estudio específicos',
      'Ausencia de datos estadísticos recientes'
    ],
    confidence_score: 0.85,
    reasoning: `Se optimizó el contenido para incluir la keyword principal "${request.keyword}" en los tres elementos clave (título, H1 y primer párrafo), manteniendo naturalidad y relevancia para el usuario.`
  };

  return mockResponse;
}

// Función para solicitar reindexación en Google Search Console
async function requestReindexing(urls: string[]): Promise<{ success: boolean; results: any[] }> {
  // TODO: Implementar integración real con Google Search Console API
  // Por ahora simulamos el proceso
  
  const results = urls.map(url => ({
    url,
    status: 'submitted',
    message: 'URL submitted for reindexing'
  }));

  return {
    success: true,
    results
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body: OptimizationRequest = await request.json();
    const { 
      keyword_opportunity_id, 
      optimizations, 
      change_reason, 
      request_reindex 
    } = body;

    if (!keyword_opportunity_id || !optimizations || !change_reason) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Obtener la oportunidad de keyword
    const { data: opportunity, error: opportunityError } = await supabase
      .from('keyword_opportunities')
      .select('*')
      .eq('id', keyword_opportunity_id)
      .single();

    if (opportunityError || !opportunity) {
      return NextResponse.json(
        { success: false, error: 'Keyword opportunity not found' },
        { status: 404 }
      );
    }

    // Obtener contenido original para comparación
    const originalContent = {
      title_tag: opportunity.page_title || '',
      h1_tag: opportunity.h1_tag || '',
      first_paragraph: opportunity.first_paragraph || '',
      meta_description: opportunity.meta_description || ''
    };

    // Si no se proporcionan optimizaciones específicas, usar IA para generarlas
    let finalOptimizations = optimizations;
    
    if (!optimizations.title_tag && !optimizations.h1_tag && !optimizations.first_paragraph) {
      // Solicitar optimización a la IA
      const aiRequest: AIAnalysisRequest = {
        keyword: opportunity.keyword,
        current_title: originalContent.title_tag,
        current_h1: originalContent.h1_tag,
        current_first_paragraph: originalContent.first_paragraph,
        competitors: [], // TODO: obtener competidores del análisis de intención
        search_intent: 'commercial' // TODO: obtener del análisis de intención
      };

      const aiResponse = await getAIOptimization(aiRequest);
      
      finalOptimizations = {
        title_tag: aiResponse.optimized_title,
        h1_tag: aiResponse.optimized_h1,
        first_paragraph: aiResponse.optimized_first_paragraph,
        meta_description: optimizations.meta_description || opportunity.meta_description
      };
    }

    // Crear registro de historial de optimización
    const optimizationHistory: Omit<OptimizationHistory, 'id' | 'created_at' | 'updated_at'> = {
      project_id: opportunity.project_id,
      keyword_opportunity_id: keyword_opportunity_id,
      optimization_type: 'full_optimization',
      original_content: JSON.stringify(originalContent),
      optimized_content: JSON.stringify(finalOptimizations),
      change_reason: change_reason,
      position_before: opportunity.current_position,
      position_after: undefined, // Se actualizará después del seguimiento
      ctr_before: opportunity.ctr,
      ctr_after: undefined, // Se actualizará después del seguimiento
      reindex_requested: request_reindex,
      reindex_status: request_reindex ? 'pending' : 'not_requested'
    };

    // Insertar historial de optimización
    const { data: historyRecord, error: historyError } = await supabase
      .from('optimization_history')
      .insert(optimizationHistory)
      .select()
      .single();

    if (historyError) {
      throw historyError;
    }

    // Actualizar el estado de la oportunidad
    const { error: updateError } = await supabase
      .from('keyword_opportunities')
      .update({
        status: 'optimized',
        page_title: finalOptimizations.title_tag || opportunity.page_title,
        h1_tag: finalOptimizations.h1_tag || opportunity.h1_tag,
        first_paragraph: finalOptimizations.first_paragraph || opportunity.first_paragraph,
        meta_description: finalOptimizations.meta_description || opportunity.meta_description,
        updated_at: new Date().toISOString()
      })
      .eq('id', keyword_opportunity_id);

    if (updateError) {
      throw updateError;
    }

    // Solicitar reindexación si se requiere
    let reindexStatus = 'not_requested';
    if (request_reindex) {
      try {
        const reindexResult = await requestReindexing([opportunity.url]);
        reindexStatus = reindexResult.success ? 'submitted' : 'failed';
        
        // Actualizar estado de reindexación
        await supabase
          .from('optimization_history')
          .update({ reindex_status: reindexStatus })
          .eq('id', historyRecord.id);
          
      } catch (reindexError) {
        console.error('Error requesting reindexing:', reindexError);
        reindexStatus = 'failed';
      }
    }

    const response: OptimizationResponse = {
      success: true,
      data: historyRecord,
      reindex_status: reindexStatus
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error optimizing three kings:', error);
    
    const response: OptimizationResponse = {
      success: false,
      data: {} as OptimizationHistory,
      error: error instanceof Error ? error.message : 'Unknown error'
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// Endpoint para obtener historial de optimizaciones
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const keywordOpportunityId = searchParams.get('keywordOpportunityId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!projectId) {
    return NextResponse.json(
      { success: false, error: 'Project ID is required' },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('optimization_history')
      .select(`
        *,
        keyword_opportunities (
          keyword,
          url,
          current_position
        )
      `, { count: 'exact' })
      .eq('project_id', projectId);

    if (keywordOpportunityId) {
      query = query.eq('keyword_opportunity_id', keywordOpportunityId);
    }

    const { data: history, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: history || [],
      total: count || 0,
      page,
      limit
    });

  } catch (error) {
    console.error('Error fetching optimization history:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch optimization history',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}