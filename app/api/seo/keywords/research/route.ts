import { NextRequest, NextResponse } from 'next/server';
import { KeywordResearchRequest, KeywordResearchResponse, KeywordData } from '../../../../types/seo';

// DataForSEO API configuration
const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;
const DATAFORSEO_BASE_URL = 'https://api.dataforseo.com/v3';

export async function POST(request: NextRequest) {
  try {
    const supabase = null;const body: KeywordResearchRequest = await request.json();
    const { seedKeyword, location = 'United States', language = 'English', maxSuggestions = 80 } = body;

    if (!seedKeyword) {
      return NextResponse.json(
        { success: false, error: 'Seed keyword is required' },
        { status: 400 }
      );
    }

    // Check if DataForSEO credentials are available
    if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
      // Return mock data for development
      const mockKeywords: KeywordData[] = [
        {
          keyword: `${seedKeyword} services`,
          searchVolume: 1200,
          difficulty: 45,
          cpc: 3.50,
          competition: 'medium',
          intent: 'commercial',
          trend: 5,
          relatedKeywords: [`best ${seedKeyword}`, `${seedKeyword} near me`]
        },
        {
          keyword: `${seedKeyword} near me`,
          searchVolume: 800,
          difficulty: 35,
          cpc: 4.20,
          competition: 'high',
          intent: 'transactional',
          trend: 10,
          relatedKeywords: [`local ${seedKeyword}`, `${seedKeyword} company`]
        },
        {
          keyword: `how to ${seedKeyword}`,
          searchVolume: 2100,
          difficulty: 25,
          cpc: 1.80,
          competition: 'low',
          intent: 'informational',
          trend: -2,
          relatedKeywords: [`${seedKeyword} guide`, `${seedKeyword} tips`]
        },
        {
          keyword: `best ${seedKeyword}`,
          searchVolume: 1500,
          difficulty: 55,
          cpc: 5.10,
          competition: 'high',
          intent: 'commercial',
          trend: 8,
          relatedKeywords: [`top ${seedKeyword}`, `${seedKeyword} reviews`]
        },
        {
          keyword: `${seedKeyword} cost`,
          searchVolume: 900,
          difficulty: 40,
          cpc: 3.90,
          competition: 'medium',
          intent: 'commercial',
          trend: 3,
          relatedKeywords: [`${seedKeyword} price`, `${seedKeyword} pricing`]
        }
      ];

      const response: KeywordResearchResponse = {
        keywords: mockKeywords,
        totalResults: mockKeywords.length,
        processingTime: 1.2,
        status: 'success',
        message: 'Mock data returned (DataForSEO API not configured)'
      };

      return NextResponse.json(response);
    }

    // Real DataForSEO API call
    const endpoint = `${DATAFORSEO_BASE_URL}/keywords_data/google_ads/search_volume/live`;
    
    const payload = {
      keywords: [seedKeyword],
      location_name: location,
      language_name: language,
      search_partners: false,
      date_from: '2024-01-01',
      date_to: '2024-12-31'
    };

    const startTime = Date.now();
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64')}`
      },
      body: JSON.stringify([payload])
    });

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.status}`);
    }

    const data = await response.json();
    const processingTime = (Date.now() - startTime) / 1000;

    // Process the API response
    const keywords: KeywordData[] = [];
    
    for (const task of data.tasks || []) {
      for (const result of task.result || []) {
        // Determine intent based on keyword patterns
        let intent: KeywordData['intent'] = 'informational';
        const keywordLower = result.keyword?.toLowerCase() || '';
        
        if (keywordLower.includes('buy') || keywordLower.includes('price') || keywordLower.includes('cost') || keywordLower.includes('near me')) {
          intent = 'transactional';
        } else if (keywordLower.includes('best') || keywordLower.includes('top') || keywordLower.includes('review')) {
          intent = 'commercial';
        } else if (keywordLower.includes('how to') || keywordLower.includes('what is') || keywordLower.includes('guide')) {
          intent = 'informational';
        } else if (keywordLower.includes('login') || keywordLower.includes('website') || keywordLower.includes('official')) {
          intent = 'navigational';
        }

        keywords.push({
          keyword: result.keyword || '',
          searchVolume: result.search_volume || 0,
          difficulty: result.keyword_difficulty || 0,
          cpc: result.cpc || 0,
          competition: result.competition || 'medium',
          intent,
          trend: Math.floor(Math.random() * 21) - 10, // Mock trend data
          relatedKeywords: [] // Would need additional API call for related keywords
        });
      }
    }

    // Limit results to maxSuggestions
    const limitedKeywords = keywords.slice(0, maxSuggestions);

    const apiResponse: KeywordResearchResponse = {
      keywords: limitedKeywords,
      totalResults: limitedKeywords.length,
      processingTime,
      status: 'success'
    };

    return NextResponse.json(apiResponse);

  } catch (error) {
    console.error('Keyword research error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch keyword data',
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json(
      { success: false, error: 'Project ID is required' },
      { status: 400 }
    );
  }

  try {
    const supabase = null;const { data: keywords, error } = await supabase
      .from('seo_keywords')
      .select('*')
      .eq('project_id', projectId)
      .order('search_volume', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: keywords || []
    });

  } catch (error) {
    console.error('Error fetching keywords:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch keywords',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
