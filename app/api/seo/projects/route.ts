import { NextRequest, NextResponse } from 'next/server';
import { SEOProject } from '../../../types/seo';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    const supabase = null;const { data: projects, error } = await supabase
      .from('seo_projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: projects || []
    });

  } catch (error) {
    console.error('Error fetching SEO projects:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch SEO projects',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = null;const body = await request.json();
    const { 
      name, 
      domain, 
      userId, 
      targetLocation, 
      businessType, 
      targetKeywords = [],
      competitors = [],
      goals = []
    } = body;

    if (!name || !domain || !userId) {
      return NextResponse.json(
        { success: false, error: 'Name, domain, and user ID are required' },
        { status: 400 }
      );
    }

    // Create new SEO project
    const projectData = {
      name,
      domain,
      user_id: userId,
      target_location: targetLocation,
      business_type: businessType,
      target_keywords: targetKeywords,
      competitors: competitors,
      goals: goals,
      status: 'active',
      settings: {
        trackRankings: true,
        trackBacklinks: true,
        trackTraffic: true,
        automateReporting: false,
        notificationEmail: true
      }
    };

    const { data: project, error } = await supabase
      .from('seo_projects')
      .insert(projectData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Initialize project with basic keywords if provided
    if (targetKeywords.length > 0) {
      const keywordData = targetKeywords.map((keyword: string) => ({
        project_id: project.id,
        keyword: keyword,
        search_volume: 0, // Will be updated by keyword research
        difficulty: 0,
        current_position: null,
        target_url: '/',
        status: 'active'
      }));

      await supabase
        .from('seo_keywords')
        .insert(keywordData);
    }

    return NextResponse.json({
      success: true,
      data: project,
      message: 'SEO project created successfully'
    });

  } catch (error) {
    console.error('Error creating SEO project:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create SEO project',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = null;const body = await request.json();
    const { 
      id,
      name, 
      domain, 
      targetLocation, 
      businessType, 
      targetKeywords,
      competitors,
      goals,
      settings,
      status
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (domain !== undefined) updateData.domain = domain;
    if (targetLocation !== undefined) updateData.target_location = targetLocation;
    if (businessType !== undefined) updateData.business_type = businessType;
    if (targetKeywords !== undefined) updateData.target_keywords = targetKeywords;
    if (competitors !== undefined) updateData.competitors = competitors;
    if (goals !== undefined) updateData.goals = goals;
    if (settings !== undefined) updateData.settings = settings;
    if (status !== undefined) updateData.status = status;

    const { data: project, error } = await supabase
      .from('seo_projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: project,
      message: 'SEO project updated successfully'
    });

  } catch (error) {
    console.error('Error updating SEO project:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update SEO project',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('id');

  if (!projectId) {
    return NextResponse.json(
      { success: false, error: 'Project ID is required' },
      { status: 400 }
    );
  }

  try {
    const supabase = null;// Delete related data first (due to foreign key constraints)
    await Promise.all([
      supabase.from('seo_keywords').delete().eq('project_id', projectId),
      supabase.from('seo_content').delete().eq('project_id', projectId),
      supabase.from('seo_backlinks').delete().eq('project_id', projectId),
      supabase.from('seo_opportunities').delete().eq('project_id', projectId),
      supabase.from('seo_analytics').delete().eq('project_id', projectId),
      supabase.from('seo_workflows').delete().eq('project_id', projectId),
      supabase.from('seo_local_data').delete().eq('project_id', projectId),
      supabase.from('seo_audit_results').delete().eq('project_id', projectId)
    ]);

    // Delete the project
    const { error } = await supabase
      .from('seo_projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'SEO project deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting SEO project:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete SEO project',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
