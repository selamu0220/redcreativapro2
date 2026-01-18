import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const SITE_URL = 'sc-domain:redcreativa.pro';

interface GSCRow {
    keys: string[];
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
}

interface ServiceAccountCredentials {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
}

// Create JWT for Google API authentication
async function createJWT(credentials: ServiceAccountCredentials): Promise<string> {
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

    // Import the private key and sign
    const crypto = await import('crypto');
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signatureInput);
    const signature = sign.sign(credentials.private_key, 'base64url');

    return `${signatureInput}.${signature}`;
}

// Get access token using service account
async function getAccessToken(credentials: ServiceAccountCredentials): Promise<string> {
    const jwt = await createJWT(credentials);

    const response = await fetch(credentials.token_uri, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt,
        }),
    });

    if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
}

// Fetch GSC data
async function fetchGSCData(
    accessToken: string,
    startDate: string,
    endDate: string,
    dimensions: string[],
    rowLimit: number = 25
): Promise<{ rows: GSCRow[] }> {
    const response = await fetch(
        `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
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
                rowLimit,
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error('GSC API Error:', response.status, errorText);
        throw new Error(`GSC API error: ${response.status}`);
    }

    return response.json();
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const dimension = searchParams.get('dimension') || 'page';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const limit = parseInt(searchParams.get('limit') || '25');

        if (!startDate || !endDate) {
            return NextResponse.json(
                { success: false, error: 'Missing startDate or endDate' },
                { status: 400 }
            );
        }

        // Get credentials - try file first (development), then env var (production)
        let credentials: ServiceAccountCredentials | null = null;

        // Option 1: Try to read from file (local development)
        const credentialsFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        // Also check if we have a hardcoded path for dev if env var is missing but file exists
        const devPath = 'C:/credentials/gsc-credentials.json';

        const pathToCheck = credentialsFilePath || (fs.existsSync(devPath) ? devPath : null);

        if (pathToCheck && fs.existsSync(pathToCheck)) {
            try {
                const fileContent = fs.readFileSync(pathToCheck, 'utf-8');
                credentials = JSON.parse(fileContent);
                console.log('GSC: Using credentials from file:', pathToCheck);
            } catch (e) {
                console.log('GSC: Could not read credentials file, trying env var');
            }
        }

        // Option 2: Read from environment variable (Vercel production)
        if (!credentials) {
            const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
            if (credentialsJson) {
                try {
                    credentials = JSON.parse(credentialsJson);
                    console.log('GSC: Using credentials from env var');
                } catch (e) {
                    console.error('GSC: Invalid credentials JSON in env var');
                }
            }
        }

        if (!credentials) {
            console.error('GSC: No credentials available');
            return NextResponse.json({
                success: false,
                error: 'Google credentials not configured. Set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_SERVICE_ACCOUNT_JSON',
                rows: []
            }, { status: 500 });
        }

        // Get access token
        const accessToken = await getAccessToken(credentials);

        // Map dimension to GSC dimension format
        const dimensionMap: Record<string, string[]> = {
            page: ['page'],
            country: ['country'],
            device: ['device'],
            query: ['query'],
            date: ['date'],
        };

        const dimensions = dimensionMap[dimension] || ['page'];

        const data = await fetchGSCData(accessToken, startDate, endDate, dimensions, limit);

        // Transform response
        const rows = data.rows?.map(row => ({
            keys: row.keys,
            clicks: row.clicks,
            impressions: row.impressions,
            ctr: row.ctr,
            position: row.position,
        })) || [];

        return NextResponse.json({
            success: true,
            dimension,
            startDate,
            endDate,
            rows,
            totalRows: rows.length,
        });

    } catch (error) {
        console.error('GSC Proxy Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                rows: []
            },
            { status: 500 }
        );
    }
}
