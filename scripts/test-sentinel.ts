
async function testSentinel() {
    console.log('🧪 Testing Nexus Sentinel API...');

    // Test payload with HTML
    const htmlInput = "<p>Hola, este es un <strong>texto de prueba</strong> para ver si el sistema mejora la redacción sin romper el formato.</p>";

    console.log('\n📤 Sending HTML Input:');
    console.log(htmlInput);

    try {
        const response = await fetch('http://localhost:3000/api/improve-text-stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: htmlInput,
                profileId: 'test-cli',
                customInstructions: 'Mejora la redacción levemente.'
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API returned ${response.status}: ${response.statusText} - ${errText}`);
        }

        const output = await response.text();

        console.log('\n📥 Received Output:');
        console.log(output);

        // Verification checks
        const hasBold = output.includes('<strong>');
        const hasChanges = output !== htmlInput;

        console.log('\n📊 Results:');
        console.log(`- HTML Preserved (<strong>): ${hasBold ? '✅ YES' : '❌ NO'}`);
        console.log(`- Content Changed: ${hasChanges ? '✅ YES' : '❌ NO'}`);

        if (hasBold && hasChanges) {
            console.log('\n✨ TEST PASSED: Sentinel is working and respecting HTML.');
        } else {
            console.log('\n⚠️ TEST FAILED: Check conditions above.');
        }

    } catch (error) {
        console.error('\n❌ Error connecting to API:', error);
        console.log('Make sure the dev server is running on localhost:3000');
    }
}

testSentinel();
