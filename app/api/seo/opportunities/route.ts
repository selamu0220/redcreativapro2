import { NextRequest, NextResponse } from 'next/server';
import { 
  KeywordOpportunity, 
  OpportunitiesResponse, 
  OpportunityFilters,
  GoogleSearchConsoleData 
} from '../../../../types/seo-tres-reyes';

// Función para obtener datos de Google Search Console (mock por ahora)
async function fetchGSCData(domain: string, startDate: string, endDate: string): Promise<GoogleSearchConsoleData[]> {
  // TODO: Implementar integración real con Google Search Console API
  // Por ahora retornamos datos mock para testing
  return [
    {
      keyword: "marketing digital",
      position: 8.5,
      clicks: 45,
      impressions: 1200,
      ctr: 3.75,
      url: "/blog/marketing-digital-guia"
    },
    {
      keyword: "seo para empresas",
      position: 12.3,
      clicks: 23,
      impressions: 890,
      ctr: 2.58,
      url: "/servicios/seo-empresas"
    },
    {
      keyword: "consultoria seo",
      position: 6.8,
      clicks: 67,
      impressions: 1450,
      ctr: 4.62,
      url: "/consultoria-seo"
    }
  ];
}

// Función para calcular el score de prioridad
function calculatePriorityScore(
  position: number, 
  searchVolume: number, 
  clicks: number, 
  ctr: number
): number {
  // Algoritmo de priorización basado en:
  // - Posición (peso 40%): mejor score para posiciones 5-15
  // - Volumen de búsqueda (peso 30%)
  // - CTR actual vs potencial (peso 20%)
  // - Clicks actuales (peso 10%)
  
  const positionScore = position >= 5 && position <= 15 ? 
    (16 - position) / 10 * 100 : 
    Math.max(0, (20 - position) / 20 * 50);
  
  const volumeScore = Math.min(100, searchVolume / 1000 * 100);
  const ctrScore = ctr * 10; // CTR como porcentaje * 10
  const clicksScore = Math.min(100, clicks / 100 * 100);
  
  return Math.round(
    positionScore * 0.4 + 
    volumeScore * 0.3 + 
    ctrScore * 0.2 + 
    clicksScore * 0.1
  );
}

// Función para calcular el potencial aumento de CTR
function calculatePotentialCTRIncrease(currentPosition: number): number {
  // CTR promedio por posición según estudios de la industria
  const avgCTRByPosition: { [key: number]: number } = {
    1: 31.7, 2: 24.7, 3: 18.7, 4: 13.7, 5: 9.5,
    6: 7.2, 7: 5.1, 8: 3.8, 9: 2.8, 10: 2.1,
    11: 1.6, 12: 1.2, 13: 0.9, 14: 0.7, 15: 0.5
  };
  
  const currentCTR = avgCTRByPosition[Math.round(currentPosition)] || 0.3;
  const targetPosition = Math.max(1, Math.round(currentPosition) - 3); // Objetivo: subir 3 posiciones
  const targetCTR = avgCTRByPosition[targetPosition] || currentCTR;
  
  return Math.round((targetCTR - currentCTR) * 100) / 100;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const sortField = searchParams.get('sortField') || 'priority_score';
  const sortDirection = searchParams.get('sortDirection') || 'desc';

  // Filtros
  const filters: OpportunityFilters = {
    position_min: searchParams.get('positionMin') ? parseFloat(searchParams.get('positionMin')!) : undefined,
    position_max: searchParams.get('positionMax') ? parseFloat(searchParams.get('positionMax')!) : undefined,
    search_volume_min: searchParams.get('volumeMin') ? parseInt(searchParams.get('volumeMin')!) : undefined,
    search_volume_max: searchParams.get('volumeMax') ? parseInt(searchParams.get('volumeMax')!) : undefined,
    status: searchParams.get('status') ? [searchParams.get('status')! as KeywordOpportunity['status']] : undefined,
    keyword_contains: searchParams.get('keyword') || undefined
  };

  if (!projectId) {
    return NextResponse.json(
      { success: false, error: 'Project ID is required' },
      { status: 400 }
    );
  }

  try {
    const supabase = null;// Construir query base
    let query = supabase
      .from('keyword_opportunities')
      .select('*', { count: 'exact' })
      .eq('project_id', projectId);

    // Aplicar filtros
    if (filters.position_min !== undefined) {
      query = query.gte('current_position', filters.position_min);
    }
    if (filters.position_max !== undefined) {
      query = query.lte('current_position', filters.position_max);
    }
    if (filters.search_volume_min !== undefined) {
      query = query.gte('search_volume', filters.search_volume_min);
    }
    if (filters.search_volume_max !== undefined) {
      query = query.lte('search_volume', filters.search_volume_max);
    }
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    if (filters.keyword_contains) {
      query = query.ilike('keyword', `%${filters.keyword_contains}%`);
    }

    // Aplicar ordenamiento y paginación
    query = query
      .order(sortField, { ascending: sortDirection === 'asc' })
      .range((page - 1) * limit, page * limit - 1);

    const { data: opportunities, error, count } = await query;

    if (error) {
      throw error;
    }

    const response: OpportunitiesResponse = {
      success: true,
      data: opportunities || [],
      total: count || 0,
      page,
      limit
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching keyword opportunities:', error);
    
    return NextResponse.json(
      {
        success: false,
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        error: 'Failed to fetch keyword opportunities',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as OpportunitiesResponse,
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = null;const body = await request.json();
    const { projectId, refreshFromGSC = false } = body;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Obtener información del proyecto
    const { data: project, error: projectError } = await supabase
      .from('seo_projects')
      .select('domain')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Obtener datos de Google Search Console
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const gscData = await fetchGSCData(project.domain, startDate, endDate);

    // Filtrar keywords en posiciones 5-15
    const opportunities = gscData
      .filter(item => item.position >= 5 && item.position <= 15)
      .map(item => {
        const priorityScore = calculatePriorityScore(
          item.position, 
          1000, // TODO: obtener volumen real de búsqueda
          item.clicks, 
          item.ctr
        );
        
        const potentialIncrease = calculatePotentialCTRIncrease(item.position);

        return {
          project_id: projectId,
          keyword: item.keyword,
          current_position: item.position,
          search_volume: 1000, // TODO: integrar con herramienta de volumen de búsqueda
          clicks: item.clicks,
          impressions: item.impressions,
          ctr: item.ctr,
          url: item.url,
          page_title: '', // TODO: obtener del sitio web
          meta_description: '', // TODO: obtener del sitio web
          h1_tag: '', // TODO: obtener del sitio web
          first_paragraph: '', // TODO: obtener del sitio web
          potential_ctr_increase: potentialIncrease,
          priority_score: priorityScore,
          status: 'identified' as const
        };
      });

    // Insertar o actualizar oportunidades en la base de datos
    if (opportunities.length > 0) {
      const { data: insertedOpportunities, error: insertError } = await supabase
        .from('keyword_opportunities')
        .upsert(opportunities, { 
          onConflict: 'project_id,keyword',
          ignoreDuplicates: false 
        })
        .select();

      if (insertError) {
        throw insertError;
      }

      return NextResponse.json({
        success: true,
        data: insertedOpportunities,
        message: `Found ${opportunities.length} keyword opportunities in positions 5-15`
      });
    } else {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No keyword opportunities found in positions 5-15'
      });
    }

  } catch (error) {
    console.error('Error creating keyword opportunities:', error);
    
    return NextResponse.json(
      {
        success: false,
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        error: 'Failed to create keyword opportunities',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as OpportunitiesResponse,
      { status: 500 }
    );
  }
}
