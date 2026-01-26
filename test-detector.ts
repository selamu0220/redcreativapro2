// Quick test script for AI detector - TypeScript version
// Run with: npx tsx test-detector.ts

import { analyzeText } from './app/lib/ai-detector';

// User's AI-generated text that was incorrectly classified as 100% human
const userAIText = `El 3 de enero de 2026 marcó un antes y un después en la historia reciente de Venezuela: fuerzas militares de los Estados Unidos llevaron a cabo una operación en territorio venezolano que terminó con la captura del presidente Nicolás Maduro y su esposa Cilia Flores, quienes posteriormente fueron trasladados a Nueva York para responder ante un tribunal federal estadounidense por cargos relacionados con narcotráfico y actividades de narco-terrorismo.

Fin de una Era en Venezuela: Las Claves de la Detención y Proceso Judicial de Nicolás Maduro

1. El Hecho: Operación Caracas y Traslado a Nueva York
A principios de este mes, en un movimiento sorpresivo, fuerzas estadounidenses ejecutaron una operación en Caracas que resultó en la captura de Nicolás Maduro y su esposa, Cilia Flores.

2. El Contexto Político: La Administración Trump
Este evento marca el punto álgido de la política exterior del segundo mandato de Donald Trump hacia Venezuela.

3. Reacciones Internacionales y División
La comunidad internacional se encuentra fracturada ante lo de Maduro.

4. Impacto Económico: El Bolívar y la Incertidumbre
La economía venezolana ha reaccionado con volatilidad.

Conclusión: ¿Qué sigue ahora?
Venezuela entra en un terreno inexplorado. Con Maduro procesado en Nueva York y un vacío de liderazgo claro en Miraflores, los próximos días serán críticos.`;

// Test with genuine human text
const humanText = `Ayer me comí una pizza gigante... ¡qué locura! Mi perro Bruno casi se la roba jaja. Bueno, lo típico de los domingos. A ver qué tal esta semana, tengo mil cosas que hacer.`;

console.log('==============================================');
console.log('=== USER AI TEXT (Should detect as AI!) ===');
console.log('==============================================');
const aiResult = analyzeText(userAIText);
console.log('Human Score:', aiResult.humanScore);
console.log('AI Score:', aiResult.aiScore);
console.log('Verdict:', aiResult.verdict);
console.log('Confidence:', aiResult.confidence);
console.log('\n--- DETAILED METRICS ---');
console.log('Structural AI:', aiResult.analysis.structuralAI, '(NEW - listicles, headers, etc.)');
console.log('Perplexity:', aiResult.analysis.perplexity);
console.log('Burstiness:', aiResult.analysis.burstiness);
console.log('Formality:', aiResult.analysis.formality);
console.log('Creativity:', aiResult.analysis.creativity);
console.log('Predictability:', aiResult.analysis.predictability);
console.log('\n--- ISSUES DETECTED ---');
aiResult.issues.forEach(i => console.log(`[${i.severity.toUpperCase()}] ${i.type}: ${i.description}`));

console.log('\n==============================================');
console.log('=== GENUINE HUMAN TEXT (Should detect as Human) ===');
console.log('==============================================');
const humanResult = analyzeText(humanText);
console.log('Human Score:', humanResult.humanScore);
console.log('AI Score:', humanResult.aiScore);
console.log('Verdict:', humanResult.verdict);
console.log('Confidence:', humanResult.confidence);
console.log('\n--- DETAILED METRICS ---');
console.log('Structural AI:', humanResult.analysis.structuralAI);
console.log('Perplexity:', humanResult.analysis.perplexity);
console.log('Burstiness:', humanResult.analysis.burstiness);
console.log('Formality:', humanResult.analysis.formality);
console.log('Creativity:', humanResult.analysis.creativity);
console.log('Predictability:', humanResult.analysis.predictability);
console.log('\n--- ISSUES DETECTED ---');
humanResult.issues.forEach(i => console.log(`[${i.severity.toUpperCase()}] ${i.type}: ${i.description}`));
