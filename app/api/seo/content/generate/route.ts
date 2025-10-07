import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ContentGenerationRequest, ContentGenerationResponse, LinkSuggestion } from '../../../../types/seo';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  // Verificar que las variables no sean placeholders
  if (!supabaseUrl || !supabaseServiceKey || 
      supabaseUrl === 'your_supabase_url' || 
      supabaseServiceKey === 'your_supabase_service_role_key') {
    console.warn('Supabase environment variables not configured or using placeholder values');
    return null;
  }
  
  try {
    // Validar URL
    new URL(supabaseUrl);
    return createClient(supabaseUrl, supabaseServiceKey);
  } catch (error) {
    console.warn('Failed to initialize Supabase client during build:', error);
    return null;
  }
}

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Check if Supabase client is available
    if (!supabase) {
      console.warn('Supabase client not available during build');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    
    const body: ContentGenerationRequest = await request.json();
    const { 
      contentType, 
      targetKeyword, 
      location, 
      tone = 'professional', 
      wordCount = 800,
      businessContext,
      competitorUrls = []
    } = body;

    if (!targetKeyword || !contentType) {
      return NextResponse.json(
        { success: false, error: 'Target keyword and content type are required' },
        { status: 400 }
      );
    }

    // Check if OpenRouter API key is available
    if (!OPENROUTER_API_KEY) {
      // Return mock content for development
      const mockContent = generateMockContent(contentType, targetKeyword, location, wordCount);
      return NextResponse.json(mockContent);
    }

    // Generate content using OpenRouter API
    const prompt = buildContentPrompt(contentType, targetKeyword, location, tone, wordCount, businessContext, competitorUrls);
    
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Red Creativa Pro SEO Tool'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content || '';

    // Parse the generated content
    const parsedContent = parseGeneratedContent(generatedContent, contentType);

    const apiResponse: ContentGenerationResponse = {
      ...parsedContent,
      status: 'success'
    };

    return NextResponse.json(apiResponse);

  } catch (error) {
    console.error('Content generation error:', error);
    
    // Fallback to mock content on error
    const body: ContentGenerationRequest = await request.json();
    const mockContent = generateMockContent(
      body.contentType, 
      body.targetKeyword, 
      body.location, 
      body.wordCount || 800
    );
    
    return NextResponse.json({
      ...mockContent,
      message: 'Fallback content generated (API error)'
    });
  }
}

function buildContentPrompt(
  contentType: string,
  targetKeyword: string,
  location?: string,
  tone: string = 'professional',
  wordCount: number = 800,
  businessContext?: string,
  competitorUrls: string[] = []
): string {
  const locationText = location ? ` in ${location}` : '';
  const contextText = businessContext ? `\n\nBusiness Context: ${businessContext}` : '';
  const competitorText = competitorUrls.length > 0 ? `\n\nCompetitor URLs to reference: ${competitorUrls.join(', ')}` : '';

  const prompts = {
    'service-page': `Create a comprehensive service page for "${targetKeyword}"${locationText}. 

Requirements:
- Target keyword: ${targetKeyword}
- Tone: ${tone}
- Word count: approximately ${wordCount} words
- Include compelling headlines (H1, H2, H3)
- Focus on benefits and solutions
- Include local SEO elements if location provided
- Add trust signals and social proof
- Include clear call-to-actions
- Optimize for search intent

Format the response as JSON with these fields:
{
  "title": "SEO-optimized title tag",
  "metaDescription": "155-character meta description",
  "content": "Full HTML content with proper heading structure",
  "headings": ["H2 heading 1", "H2 heading 2", "H3 heading 1"],
  "internalLinks": [{"anchorText": "link text", "targetUrl": "/suggested-url", "context": "why this link", "relevanceScore": 85}],
  "schemaMarkup": "JSON-LD schema markup if applicable"
}${contextText}${competitorText}`,

    'blog-post': `Write an informative blog post about "${targetKeyword}"${locationText}.

Requirements:
- Target keyword: ${targetKeyword}
- Tone: ${tone}
- Word count: approximately ${wordCount} words
- Educational and engaging content
- Include actionable tips and insights
- Use proper heading hierarchy
- Optimize for featured snippets
- Include relevant examples
- Add internal linking opportunities

Format the response as JSON with these fields:
{
  "title": "Engaging blog post title",
  "metaDescription": "155-character meta description",
  "content": "Full HTML content with proper structure",
  "headings": ["H2 heading 1", "H2 heading 2"],
  "internalLinks": [{"anchorText": "link text", "targetUrl": "/suggested-url", "context": "relevance", "relevanceScore": 90}]
}${contextText}${competitorText}`,

    'gbp-post': `Create a Google Business Profile post about "${targetKeyword}"${locationText}.

Requirements:
- Target keyword: ${targetKeyword}
- Tone: ${tone}
- Keep it concise (under 300 words)
- Include engaging hook
- Add clear call-to-action
- Use local relevance
- Include relevant hashtags

Format the response as JSON:
{
  "title": "Engaging post title",
  "content": "Post content with hashtags",
  "metaDescription": "Brief description for tracking"
}${contextText}`,

    'meta-description': `Write an SEO-optimized meta description for "${targetKeyword}"${locationText}.

Requirements:
- Target keyword: ${targetKeyword}
- Exactly 155 characters or less
- Include compelling call-to-action
- Mention location if provided
- Use active voice

Format as JSON:
{
  "title": "Suggested title tag",
  "metaDescription": "155-character meta description",
  "content": "Brief explanation of the meta description strategy"
}${contextText}`,

    'title-tag': `Create an SEO-optimized title tag for "${targetKeyword}"${locationText}.

Requirements:
- Target keyword: ${targetKeyword}
- Under 60 characters
- Include location if provided
- Compelling and clickable
- Brand mention if space allows

Format as JSON:
{
  "title": "SEO-optimized title tag",
  "metaDescription": "Supporting meta description",
  "content": "Explanation of title tag strategy"
}${contextText}`
  };

  return prompts[contentType as keyof typeof prompts] || prompts['blog-post'];
}

function parseGeneratedContent(content: string, contentType: string): Omit<ContentGenerationResponse, 'status'> {
  try {
    // Try to parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || '',
        content: parsed.content || content,
        metaDescription: parsed.metaDescription || '',
        headings: parsed.headings || [],
        internalLinks: parsed.internalLinks || [],
        schemaMarkup: parsed.schemaMarkup
      };
    }
  } catch (error) {
    console.error('Error parsing generated content:', error);
  }

  // Fallback: extract content manually
  const lines = content.split('\n');
  const title = lines.find(line => line.includes('Title:') || line.includes('H1:'))?.replace(/^.*?:/, '').trim() || '';
  const metaDescription = lines.find(line => line.includes('Meta:'))?.replace(/^.*?:/, '').trim() || '';
  
  return {
    title,
    content,
    metaDescription,
    headings: [],
    internalLinks: []
  };
}

function generateMockContent(
  contentType: string,
  targetKeyword: string,
  location?: string,
  wordCount: number = 800
): ContentGenerationResponse {
  const locationText = location ? ` in ${location}` : '';
  
  const mockContent = {
    'service-page': {
      title: `Professional ${targetKeyword} Services${locationText} | Expert Solutions`,
      metaDescription: `Get expert ${targetKeyword} services${locationText}. Professional solutions with proven results. Contact us today for a free consultation.`,
      content: `<h1>Professional ${targetKeyword} Services${locationText}</h1>
      
      <p>Looking for reliable ${targetKeyword} services${locationText}? Our expert team delivers exceptional results with a focus on quality and customer satisfaction.</p>
      
      <h2>Why Choose Our ${targetKeyword} Services?</h2>
      <ul>
        <li>Experienced professionals with proven track record</li>
        <li>Customized solutions for your specific needs</li>
        <li>Competitive pricing and transparent quotes</li>
        <li>100% satisfaction guarantee</li>
      </ul>
      
      <h2>Our ${targetKeyword} Process</h2>
      <p>We follow a systematic approach to ensure the best results for your ${targetKeyword} needs.</p>
      
      <h3>1. Initial Consultation</h3>
      <p>We start with a comprehensive assessment of your requirements.</p>
      
      <h3>2. Custom Strategy Development</h3>
      <p>Our experts create a tailored plan specific to your goals.</p>
      
      <h3>3. Implementation & Monitoring</h3>
      <p>We execute the plan with continuous monitoring and optimization.</p>
      
      <h2>Get Started Today</h2>
      <p>Ready to experience the difference professional ${targetKeyword} services can make? Contact us today for a free consultation.</p>`,
      headings: [
        `Why Choose Our ${targetKeyword} Services?`,
        `Our ${targetKeyword} Process`,
        'Initial Consultation',
        'Custom Strategy Development',
        'Implementation & Monitoring',
        'Get Started Today'
      ],
      internalLinks: [
        {
          anchorText: 'contact us',
          targetUrl: '/contact',
          context: 'Call-to-action for service inquiry',
          relevanceScore: 95
        },
        {
          anchorText: 'our services',
          targetUrl: '/services',
          context: 'Link to services overview page',
          relevanceScore: 85
        }
      ]
    },
    'blog-post': {
      title: `The Complete Guide to ${targetKeyword}${locationText}`,
      metaDescription: `Learn everything about ${targetKeyword}${locationText}. Expert tips, best practices, and actionable insights in our comprehensive guide.`,
      content: `<h1>The Complete Guide to ${targetKeyword}${locationText}</h1>
      
      <p>Understanding ${targetKeyword} is crucial for success in today's competitive landscape. This comprehensive guide covers everything you need to know.</p>
      
      <h2>What is ${targetKeyword}?</h2>
      <p>${targetKeyword} refers to the process and strategies involved in optimizing and improving specific outcomes through targeted approaches.</p>
      
      <h2>Key Benefits of ${targetKeyword}</h2>
      <ul>
        <li>Improved efficiency and results</li>
        <li>Cost-effective solutions</li>
        <li>Long-term sustainable growth</li>
        <li>Competitive advantage</li>
      </ul>
      
      <h2>Best Practices for ${targetKeyword}</h2>
      <p>Follow these proven strategies to maximize your ${targetKeyword} success:</p>
      
      <h3>1. Start with Clear Goals</h3>
      <p>Define specific, measurable objectives before beginning any ${targetKeyword} initiative.</p>
      
      <h3>2. Research and Planning</h3>
      <p>Thorough research and strategic planning are essential for ${targetKeyword} success.</p>
      
      <h3>3. Implementation and Monitoring</h3>
      <p>Execute your plan systematically while continuously monitoring progress and making adjustments.</p>
      
      <h2>Common Mistakes to Avoid</h2>
      <p>Learn from these common ${targetKeyword} pitfalls to ensure better results.</p>
      
      <h2>Conclusion</h2>
      <p>Mastering ${targetKeyword} requires dedication, proper planning, and continuous learning. Start implementing these strategies today for better results.</p>`,
      headings: [
        `What is ${targetKeyword}?`,
        `Key Benefits of ${targetKeyword}`,
        `Best Practices for ${targetKeyword}`,
        'Start with Clear Goals',
        'Research and Planning',
        'Implementation and Monitoring',
        'Common Mistakes to Avoid',
        'Conclusion'
      ],
      internalLinks: [
        {
          anchorText: 'strategic planning',
          targetUrl: '/services/strategy',
          context: 'Link to strategy services',
          relevanceScore: 80
        }
      ]
    },
    'gbp-post': {
      title: `New ${targetKeyword} Services Available${locationText}!`,
      metaDescription: `Exciting news about our ${targetKeyword} services${locationText}`,
      content: `🎉 Exciting news! We're now offering enhanced ${targetKeyword} services${locationText}!

Our expert team is ready to help you achieve outstanding results with our proven ${targetKeyword} solutions.

✅ Professional expertise
✅ Customized approach  
✅ Guaranteed satisfaction
✅ Competitive pricing

Ready to get started? Contact us today for a free consultation!

#${targetKeyword.replace(/\s+/g, '')} #ProfessionalServices #QualityWork ${location ? `#${location.replace(/\s+/g, '')}` : ''}`,
      headings: [
        `New ${targetKeyword} Services Available${locationText}!`
      ],
      internalLinks: [
        {
          anchorText: 'contact us',
          targetUrl: '/contact',
          context: 'Link to contact page',
          relevanceScore: 90
        }
      ]
    }
  };

  const defaultContent = mockContent['blog-post'];
  const selectedContent = mockContent[contentType as keyof typeof mockContent] || defaultContent;

  return {
    ...selectedContent,
    status: 'success',
    message: 'Mock content generated (OpenRouter API not configured)'
  };
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
    const supabase = getSupabaseClient();
    
    // Check if Supabase client is available
    if (!supabase) {
      console.warn('Supabase client not available during build');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    
    const { data: content, error } = await supabase
      .from('seo_content')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: content || []
    });

  } catch (error) {
    console.error('Error fetching content:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch content',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}