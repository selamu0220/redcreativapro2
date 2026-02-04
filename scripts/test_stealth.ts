
import { analyzeText } from '../app/lib/stealth/engine';

async function runTests() {
    console.log('🧪 Testing Stealth Engine v10...');

    // Test 1: Short text (should handle gracefully or be rejected by API, but engine should safe-guard)
    const shortResult = analyzeText('Too short');
    console.log(`Test 1 (Short): Score ${shortResult.score} (Expected result, though score might be irrelevant due to length)`);

    // Test 2: AI-like text (Standard GPT-4 style)
    const aiText = "It is important to note that the landscape of artificial intelligence is a testament to human ingenuity. In conclusion, we must delve into the realm of possibilities.";
    const aiResult = analyzeText(aiText);
    console.log(`Test 2 (AI-like): Score ${aiResult.score} / Verdict: ${aiResult.verdict}`);
    if (aiResult.score > 50) console.error('❌ FAIL: AI text scored too high');
    else console.log('✅ PASS: AI text correctly penalized');

    // Test 3: Human-like text (with imperfections and sensory details)
    const humanText = "Listen, it's kinda messy, literally. The stench of the old room made me shiver. I mean, break the ice, right? It was rough.";
    const humanResult = analyzeText(humanText);
    console.log(`Test 3 (Human-like): Score ${humanResult.score} / Verdict: ${humanResult.verdict}`);
    if (humanResult.score < 60) console.error('❌ FAIL: Human text scored too low');
    else console.log('✅ PASS: Human text correctly scored high');

    // Test 4: Spanish AI text
    const esAiText = "En conclusión, es importante señalar que este es un hito monumental en el panorama tecnológico. Cabe destacar la complejidad del asunto.";
    const esAiResult = analyzeText(esAiText);
    console.log(`Test 4 (ES AI): Score ${esAiResult.score} / Verdict: ${esAiResult.verdict}`);
    if (esAiResult.score > 50) console.error('❌ FAIL: Spanish AI text scored too high');
    else console.log('✅ PASS: Spanish AI text correctly penalized');

    // Test 5: Spanish Human text
    const esHumanText = "Oye, pues la verdad es que el olor a café recién hecho es una delicia. Vaya, no me lo esperaba. Es genial.";
    const esHumanResult = analyzeText(esHumanText);
    console.log(`Test 5 (ES Human): Score ${esHumanResult.score} / Verdict: ${esHumanResult.verdict}`);
    if (esHumanResult.score < 60) console.error('❌ FAIL: Spanish Human text scored too low');
    else console.log('✅ PASS: Spanish Human text correctly scored high');

    console.log('✅ Tests Completed.');
}

runTests();
