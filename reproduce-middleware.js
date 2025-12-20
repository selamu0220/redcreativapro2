const { spawn } = require('child_process');
const http = require('http');

const dev = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    shell: true,
    env: { ...process.env, PORT: '3003' } // Use different port

});

let output = '';

dev.stdout.on('data', (data) => {
    const str = data.toString();
    output += str;
    process.stdout.write(str);
    if (str.includes('Ready in') || str.includes('started server') || str.includes('localhost:3002')) {
        console.log('Server query ready, making request to /dashboard...');
        setTimeout(makeRequest, 5000); // Wait a bit more
    }
});

dev.stderr.on('data', (data) => {
    const str = data.toString();
    output += str;
    process.stderr.write(str);
});

function makeRequest() {
    const req = http.get('http://localhost:3003/dashboard', (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            // Just print first 200 chars
            console.log(`BODY: ${chunk.substring(0, 200)}...`);
        });
        res.on('end', () => {
            console.log('No more data.');
            cleanup();
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
        cleanup();
    });
}

function cleanup() {
    console.log('Killing server...');
    dev.kill();
    process.exit(0);
}

setTimeout(() => {
    console.log('Timeout.');
    cleanup();
}, 60000);
