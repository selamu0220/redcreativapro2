#!/usr/bin/env tsx
/**
 * 🧪 TEST COMPLETO DE IAs - Gemini, OpenRouter, xAI
 * 
 * Este script prueba todas las APIs de IA configuradas
 */

import 'dotenv/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY;
const XAI_API_KEY = process.env.XAI_API_KEY;

// Colores para terminal
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    bold: '\x1b[1m',
    dim: '\x1b[2m'
};

function log(msg: string, color = colors.reset) {
    console.log(`${color}${msg}${colors.reset}`);
}

function success(msg: string) {
    log(`✅ ${msg}`, colors.green);
}

function error(msg: string) {
    log(`❌ ${msg}`, colors.red);
}

function info(msg: string) {
    log(`ℹ️  ${msg}`, colors.blue);
}

function header(msg: string) {
    log(`\n${'='.repeat(70)}`, colors.bold);
    log(msg, colors.bold);
    log('='.repeat(70), colors.bold);
}

// Test 1: Gemini API
async function testGemini() {
    header('TEST 1: GEMINI API (Google)');

    if (!GEMINI_API_KEY) {
        error('GEMINI_API_KEY no configurada');
        return false;
    }

    info(`API Key: ${GEMINI_API_KEY.substring(0, 15)}...`);

    try {
        const prompt = 'Responde con exactamente 5 palabras: ¿Funciona Gemini?';

        info('Enviando request a Gemini 2.0 Flash...');

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 100
                    }
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
            return false;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            error('No se recibió respuesta válida');
            return false;
        }

        success('Respuesta de Gemini:');
        log(`   "${text}"`, colors.green);
        return true;

    } catch (err: any) {
        error(`Error: ${err.message}`);
        return false;
    }
}

// Test 2: OpenRouter API
async function testOpenRouter() {
    header('TEST 2: OPENROUTER API');

    if (!OPENROUTER_API_KEY) {
        error('OPEN_ROUTER_API_KEY no configurada');
        return false;
    }

    info(`API Key: ${OPENROUTER_API_KEY.substring(0, 15)}...`);

    try {
        const prompt = 'Di "OpenRouter funciona" en 3 palabras';

        info('Enviando request a OpenRouter...');

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://redcreativa.pro',
                'X-Title': 'Red Creativa Pro'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-exp:free',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 50
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
            return false;
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;

        if (!text) {
            error('No se recibió respuesta válida');
            return false;
        }

        success('Respuesta de OpenRouter:');
        log(`   "${text}"`, colors.green);
        return true;

    } catch (err: any) {
        error(`Error: ${err.message}`);
        return false;
    }
}

// Test 3: xAI (Grok)
async function testXAI() {
    header('TEST 3: XAI API (Grok)');

    if (!XAI_API_KEY) {
        error('XAI_API_KEY no configurada');
        return false;
    }

    info(`API Key: ${XAI_API_KEY.substring(0, 15)}...`);

    try {
        const prompt = 'Responde "Grok funciona" en 2 palabras';

        info('Enviando request a xAI Grok...');

        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${XAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'grok-beta',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 50,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
            return false;
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;

        if (!text) {
            error('No se recibió respuesta válida');
            return false;
        }

        success('Respuesta de xAI:');
        log(`   "${text}"`, colors.green);
        return true;

    } catch (err: any) {
        error(`Error: ${err.message}`);
        return false;
    }
}

// Test 4: Mejora de texto (simulando auto-mejora)
async function testTextImprovement() {
    header('TEST 4: MEJORA DE TEXTO (Auto-Mejora Simulada)');

    if (!GEMINI_API_KEY) {
        error('GEMINI_API_KEY no configurada');
        return false;
    }

    const textoOriginal = 'este es un texto de prueba para demostrar la mejora automatica';

    info('Texto original:');
    log(`   "${textoOriginal}"`, colors.dim);

    try {
        const prompt = `Mejora este texto corrigiendo ortografía, gramática y estilo. Devuelve SOLO el texto mejorado, sin explicaciones:

"${textoOriginal}"`;

        info('Mejorando con Gemini...');

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 200
                    }
                })
            }
        );

        if (!response.ok) {
            error(`HTTP ${response.status}`);
            return false;
        }

        const data = await response.json();
        const textoMejorado = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!textoMejorado) {
            error('No se recibió texto mejorado');
            return false;
        }

        success('Texto mejorado:');
        log(`   "${textoMejorado}"`, colors.green);

        info('\n📊 Comparación:');
        log(`   Original:  "${textoOriginal}"`, colors.dim);
        log(`   Mejorado:  "${textoMejorado}"`, colors.green);

        return true;

    } catch (err: any) {
        error(`Error: ${err.message}`);
        return false;
    }
}

// Ejecutar todos los tests
async function runAllTests() {
    log('\n🧪 INICIANDO BATERÍA DE TESTS DE IAs\n', colors.bold);

    const results = {
        gemini: await testGemini(),
        openrouter: await testOpenRouter(),
        xai: await testXAI(),
        textImprovement: await testTextImprovement()
    };

    // Resumen
    header('📊 RESUMEN DE RESULTADOS');

    const tests = [
        { name: 'Gemini API', result: results.gemini },
        { name: 'OpenRouter API', result: results.openrouter },
        { name: 'xAI (Grok)', result: results.xai },
        { name: 'Mejora de Texto', result: results.textImprovement }
    ];

    tests.forEach(test => {
        const icon = test.result ? '✅' : '❌';
        const color = test.result ? colors.green : colors.red;
        log(`${icon} ${test.name}: ${test.result ? 'PASS' : 'FAIL'}`, color);
    });

    const passed = Object.values(results).filter(r => r).length;
    const total = Object.keys(results).length;

    log(`\n${'─'.repeat(70)}`, colors.dim);
    info(`Total: ${total} tests`);
    success(`Pasados: ${passed}`);
    if (passed < total) {
        error(`Fallidos: ${total - passed}`);
    }
    log('─'.repeat(70) + '\n', colors.dim);

    if (passed === total) {
        success('🎉 ¡TODOS LOS TESTS PASARON! Todas las IAs funcionan correctamente.');
    } else {
        error('⚠️  Algunos tests fallaron. Revisa la configuración de las APIs.');
    }

    process.exit(passed === total ? 0 : 1);
}

// Ejecutar
runAllTests().catch(err => {
    error(`Error fatal: ${err.message}`);
    process.exit(1);
});
