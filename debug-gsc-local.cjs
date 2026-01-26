const fs = require('fs');
const https = require('https');
const crypto = require('crypto');
const path = require('path');

const SITE_URL = 'sc-domain:redcreativa.pro';

// --- GSC Service Logic (Mimicked) ---

function createJWT(credentials) {
    const header = {
        alg: 'RS256',
        typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iss: credentials.client_email,
        scope: 'https://www.googleapis.com/auth/webmasters.readonly',
        aud: credentials.token_uri,
        iat: now,
        exp: now + 3600, // 1 hour
    };

    const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signatureInput = `${base64Header}.${base64Payload}`;

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signatureInput);
    const signature = sign.sign(credentials.private_key, 'base64url');

    return `${signatureInput}.${signature}`;
}

async function getAccessToken(credentials) {
    const jwt = createJWT(credentials);

    console.log('Exchanging JWT for access token...');
    const response = await fetch(credentials.token_uri, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt,
        }),
    });

    if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    return data.access_token;
}

function getCredentials() {
    // Hardcoded for test
    const devPath = 'C:/credentials/gsc-credentials.json';
    if (fs.existsSync(devPath)) {
        try {
            const fileContent = fs.readFileSync(devPath, 'utf-8');
            console.log('Found credentials at:', devPath);
            return JSON.parse(fileContent);
        } catch (e) {
            console.error('Error reading credentials:', e);
        }
    }
    return null;
}

async function getGSCAnalytics(startDate, endDate, dimension, limit = 25) {
    const credentials = getCredentials();
    if (!credentials) {
        throw new Error('No credentials found');
    }

    const accessToken = await getAccessToken(credentials);
    console.log('Access Token obtained.');

    const dimensionMap = {
        page: ['page'],
        country: ['country'],
        device: ['device'],
        query: ['query'],
        date: ['date'],
    };

    const dimensions = dimensionMap[dimension] || ['page'];
    const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`;

    console.log(`Fetching from ${url} for ${startDate} to ${endDate} with dimensions ${dimensions}`);

    const response = await fetch(url,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                startDate,
                endDate,
                dimensions,
                rowLimit: limit,
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GSC API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Data received:', JSON.stringify(data, null, 2));
    return data;
}

// --- Main Test ---

async function main() {
    try {
        const end = new Date();
        const start = new Date();
        end.setDate(end.getDate() - 3);
        start.setDate(end.getDate() - 10);

        const startDate = start.toISOString().split('T')[0];
        const endDate = end.toISOString().split('T')[0];

        console.log(`Testing GSC Fetch...`);
        await getGSCAnalytics(startDate, endDate, 'page', 5);
    } catch (error) {
        console.error('TEST FAILED:', error);
    }
}

main();
