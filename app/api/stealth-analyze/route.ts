/**
 * StealthWrite™ Analysis API v10.0 - GOD MODE MULTILINGUAL
 * 
 * Capability:
 * - Uses shared `app/lib/stealth/engine.ts` for consistent logic.
 * - Handles request validation and error responses.
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeText } from '@/app/lib/stealth/engine';

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        if (!text || text.length < 50) {
            return NextResponse.json({
                success: false,
                error: 'El texto es demasiado corto para analizar (mínimo 50 caracteres).'
            }, { status: 400 });
        }

        const result = analyzeText(text);

        return NextResponse.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('[StealthAnalyze v10] Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Error interno en el análisis de Stealth Mode.'
        }, { status: 500 });
    }
}
