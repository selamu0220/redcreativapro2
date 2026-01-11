const https = require('https');

const data = JSON.stringify({
    content: "hola amigo, amigo como estas amigo",
    model: "meta-llama/llama-3.3-70b-instruct:free",
    creativity: 0.1
});

const options = {
    hostname: 'redcreativa.pro',
    path: '/api/improve-text-openrouter',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

console.log("🚀 Testing Production Endpoint (Commentary Check)...");

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (d) => { body += d; });
    res.on('end', () => {
        console.log('RESPONSE:', body);
        try {
            const json = JSON.parse(body);
            if (json.improvedContent) {
                console.log('✅ SUCCESS! Improved Content:', json.improvedContent);
                if (json.improvedContent.includes("(") || json.improvedContent.includes("redundante")) {
                    console.log("❌ FAILURE: Commentary detected!");
                }
            } else {
                console.log('❌ FAILED. Details:', json);
            }
        } catch (e) {
            console.log('❌ Invalid JSON response:', body);
        }
    });
});

req.on('error', (error) => {
    console.error('Network Error:', error);
});

req.write(data);
req.end();
