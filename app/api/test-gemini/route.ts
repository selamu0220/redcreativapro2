import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Build time detection - prevent Google API imports during build
    const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL && !process.env.RUNTIME;
    
    if (isBuildTime) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable during build' },
        { status: 503 }
      );
    }

    const { testApiKey } = await request.json();
    
    // Usar la API key del request o la del entorno
    const apiKey = testApiKey || process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === 'tu-gemini-api-key') {
      return NextResponse.json({
        success: false,
        error: 'API_KEY_NOT_CONFIGURED',
        message: 'La API key de Gemini no está configurada correctamente',
        details: {
          envKeyExists: !!process.env.GEMINI_API_KEY,
          envKeyValue: process.env.GEMINI_API_KEY?.substring(0, 10) + '...',
          isPlaceholder: process.env.GEMINI_API_KEY === 'your_gemini_api_key_here' || process.env.GEMINI_API_KEY === 'tu-gemini-api-key'
        }
      }, { status: 400 });
    }

    // Probar diferentes modelos disponibles
    const modelsToTest = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro'
    ];

    const results = [];

    for (const model of modelsToTest) {
      try {
        console.log(`🧪 Testing model: ${model}`);
        
        const payload = {
          contents: [{
            parts: [{
              text: 'Responde únicamente con "OK" si puedes procesar este mensaje.'
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10,
            topP: 0.8,
            topK: 40
          }
        };

        const startTime = Date.now();
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(10000) // 10 second timeout
          }
        );

        const responseTime = Date.now() - startTime;
        
        if (!response.ok) {
          let errorData: any = {};
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { message: 'Could not parse error response' };
          }
          
          results.push({
            model,
            success: false,
            status: response.status,
            statusText: response.statusText,
            error: errorData,
            responseTime
          });
          
          console.error(`❌ Model ${model} failed:`, errorData);
        } else {
          const data = await response.json();
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          results.push({
            model,
            success: true,
            status: response.status,
            responseTime,
            response: generatedText,
            fullResponse: data
          });
          
          console.log(`✅ Model ${model} succeeded: ${generatedText}`);
        }
      } catch (error) {
        results.push({
          model,
          success: false,
          error: {
            type: 'NETWORK_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
            name: error instanceof Error ? error.name : 'UnknownError'
          }
        });
        
        console.error(`🔥 Model ${model} network error:`, error);
      }
    }

    // Analizar resultados
    const successfulModels = results.filter(r => r.success);
    const failedModels = results.filter(r => !r.success);
    
    const diagnosis = {
      apiKeyConfigured: true,
      totalModels: modelsToTest.length,
      successfulModels: successfulModels.length,
      failedModels: failedModels.length,
      recommendedModel: successfulModels.length > 0 ? successfulModels[0].model : null,
      averageResponseTime: successfulModels.length > 0 
        ? Math.round(successfulModels.reduce((sum, r) => sum + (r.responseTime || 0), 0) / successfulModels.length)
        : null
    };

    return NextResponse.json({
      success: successfulModels.length > 0,
      diagnosis,
      results,
      recommendations: generateRecommendations(results)
    });

  } catch (error) {
    console.error('Error in test-gemini API:', error);
    return NextResponse.json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Error interno al probar la API de Gemini',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateRecommendations(results: any[]): string[] {
  const recommendations = [];
  
  const successfulModels = results.filter(r => r.success);
  const failedModels = results.filter(r => !r.success);
  
  if (successfulModels.length === 0) {
    recommendations.push('❌ Ningún modelo funcionó. Verifica tu API key de Gemini.');
    
    // Analizar tipos de errores
    const authErrors = failedModels.filter(r => r.status === 401 || r.status === 403);
    const quotaErrors = failedModels.filter(r => r.status === 429);
    const serverErrors = failedModels.filter(r => r.status >= 500);
    const networkErrors = failedModels.filter(r => r.error?.type === 'NETWORK_ERROR');
    
    if (authErrors.length > 0) {
      recommendations.push('🔑 Error de autenticación: Verifica que tu API key sea válida y tenga permisos.');
    }
    
    if (quotaErrors.length > 0) {
      recommendations.push('📊 Error de cuota: Has excedido el límite de uso de la API.');
    }
    
    if (serverErrors.length > 0) {
      recommendations.push('🔧 Error del servidor: Los servicios de Gemini pueden estar temporalmente no disponibles.');
    }
    
    if (networkErrors.length > 0) {
      recommendations.push('🌐 Error de red: Verifica tu conexión a internet.');
    }
  } else {
    recommendations.push(`✅ ${successfulModels.length} modelo(s) funcionando correctamente.`);
    
    if (successfulModels.length > 0) {
      const fastest = successfulModels.reduce((prev, current) => 
        (prev.responseTime || 0) < (current.responseTime || 0) ? prev : current
      );
      recommendations.push(`⚡ Modelo más rápido: ${fastest.model} (${fastest.responseTime}ms)`);
    }
    
    if (failedModels.length > 0) {
      recommendations.push(`⚠️ ${failedModels.length} modelo(s) no disponible(s). Usa los modelos que funcionan.`);
    }
  }
  
  return recommendations;
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de prueba de Gemini API. Usa POST con { "testApiKey": "tu-api-key" } para probar.'
  });
}