import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Service Key exists:', !!supabaseServiceKey);
    
    if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase configuration missing during build');
    return NextResponse.json({
      error: 'Missing Supabase configuration',
      url: !!supabaseUrl,
      key: !!supabaseServiceKey
    }, { status: 500 });
  }
  
  // Validar URL
  try {
    new URL(supabaseUrl);
  } catch {
    console.warn('Invalid Supabase URL during build');
    return NextResponse.json({
      error: 'Invalid Supabase URL format'
    }, { status: 500 });
  }
  
  let supabase;
  try {
    // Verificar que las variables no sean placeholders

    if (!supabaseUrl || !supabaseServiceKey || 

        supabaseUrl === 'your_supabase_url' || 

        supabaseServiceKey === 'your_supabase_service_role_key') {

      console.warn('Supabase environment variables not configured or using placeholder values');

      supabase = null;

    } else {

      try {

        // Validar URL

        new URL(supabaseUrl);

        supabase = createClient(supabaseUrl, supabaseServiceKey);

      } catch (error) {

        console.warn('Failed to initialize Supabase client during build:', error);

        supabase = null;

      }

    }
  } catch (error) {
    console.warn('Failed to create Supabase client during build:', error);
    return NextResponse.json({
      error: 'Failed to initialize Supabase client',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
    
    // Test simple query
    const { data, error } = await supabase
      .from('email_collection_pages')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({
        error: 'Supabase query failed',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      data
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('Supabase configuration missing during build');
      return NextResponse.json({
        error: 'Missing Supabase configuration'
      }, { status: 500 });
    }
    
    // Validar URL
    try {
      new URL(supabaseUrl);
    } catch {
      console.warn('Invalid Supabase URL during build');
      return NextResponse.json({
        error: 'Invalid Supabase URL format'
      }, { status: 500 });
    }
    
    let supabase;
    try {
      // Verificar que las variables no sean placeholders

      if (!supabaseUrl || !supabaseServiceKey || 

          supabaseUrl === 'your_supabase_url' || 

          supabaseServiceKey === 'your_supabase_service_role_key') {

        console.warn('Supabase environment variables not configured or using placeholder values');

        supabase = null;

      } else {

        try {

          // Validar URL

          new URL(supabaseUrl);

          supabase = createClient(supabaseUrl, supabaseServiceKey);

        } catch (error) {

          console.warn('Failed to initialize Supabase client during build:', error);

          supabase = null;

        }

      }
    } catch (error) {
      console.warn('Failed to create Supabase client during build:', error);
      return NextResponse.json({
        error: 'Failed to initialize Supabase client',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
    
    // Test insert
    const { data, error } = await supabase
      .from('email_collection_pages')
      .insert({
        user_email: 'test@example.com',
        title: 'Test Page',
        description: 'Test Description',
        button_text: 'Test Button',
        success_message: 'Test Success',
        is_active: true,
        collect_name: false,
        custom_fields: [],
        qualification_form: { enabled: false, questions: [] }
      })
      .select()
      .single();
    
    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({
        error: 'Insert failed',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }
    
    // Clean up - delete the test record
    await supabase
      .from('email_collection_pages')
      .delete()
      .eq('id', data.id);
    
    return NextResponse.json({
      success: true,
      message: 'Insert test successful',
      testId: data.id
    });
    
  } catch (error) {
    console.error('Insert test error:', error);
    return NextResponse.json({
      error: 'Insert test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}