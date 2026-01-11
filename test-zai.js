const https = require('https');

function testModel(model) {
    const data = JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: 'Hello' }]
    });

    const options = {
        hostname: 'api.z.ai',
        path: '/api/paas/v4/chat/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer a767bdd91d0b49ee87d947dfe8ced853.cG5B2xbxCWynt3xF',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res) => {
        console.log(`MODEL: ${model} - STATUS: ${res.statusCode}`);
        res.on('data', (d) => {
            process.stdout.write(d);
            process.stdout.write('\n');
        });
    });

    req.on('error', console.error);
    req.write(data);
    req.end();
}

testModel('glm-4');
testModel('glm-4-flash');
