import fs from 'fs';

const SITE_URL = 'sc-domain:redcreativa.pro';

export interface GSCRow {
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

    const crypto = await import('crypto');
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signatureInput);
    const signature = sign.sign(credentials.private_key, 'base64url');

    return `${signatureInput}.${signature}`;
}

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

const FALLBACK_CREDENTIALS = {
    "type": "service_account",
    "project_id": "zippy-parity-482821-f8",
    "private_key_id": "81ea59badeca6e857845600147024a12dbf25cd5",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCkVYIPw0Du4ced\nW3HhlDmGlyVnttZ3wwhPW/7I0Et5u5VsrVK2eXUiBzOA1SQ1Qx1jFU7C04f3E8vm\nKJIdyWBxcTrEPvt7//AwmBSiAsJr0xEqKzQk1Ud30YRnnbSl+VgkPf1MvkGh2au9\njf8Ss1EkA6zEzxiCSYIVWavkgee8niKe0xM87zCbGQ8PV2Z73Qdf9sQlR3Mx16SX\nmbWzYA428wBF+AwXbTdyU4vEg/v7GKPj2K9NMTFr5ftaq6fTzAjZTfPzGFhJgtFe\novl/P1mlVE5RrerKsUU+S2ESPVJ7k7bzNRcifptdLIsyJOS+/2Y0tyOsH+zx6/fl\nkMQ2KAwnAgMBAAECggEAMuJ7THA0OgPVcIcxQx1HlsJUhcHatOjCOPiOcxX0WPRZ\nt3YPx4riVzANpZXaCVgH0Hd3lOI1Fq+dkl37qJeDcn0SKlQqQOImOJXOxb++/e40\nQW9xTPpxj8tjiUYO+tmzjj1XopzC69/fyukeE2dM967fn21U9HrYec3zaOVEoWWB\n5kjTvlCHTGa+QBviMfrEG3F2bqkhP7pWrTpimSUZ47EqOBL199rIK2oRPbj+kcOb\nlgaq9Vpe9vzH2cVxBejN579t+1aTxSaFMbgF/n3W6rY9ZjeoYjuBCyXC2W+ZoL2e\nT413l7bYXaBWUPNXsnM7jgSoEDXrXu1gB891P6xKOQKBgQDoVKJPcOKkDbPnir25\nGcTGicD/2slTPpASAnwpH3zaeLJVQuZkRo+C21iYRK06FY+m2AgeeutmbU9ob7mO\nhMwjbMULTklIQhRfMRg7HKrfl2Pyo+jY45hqvNp/4m3q+Pd4qPXXnixqLWDflLO3\nibcoZFBclaQ2J4yLt6A6VJsmrQKBgQC1E3gg66v/TQtm1eDV8Vc27mLa4huGkGTy\nwObm/yVHsL21+/OkujzPnyOqK4DemWZ0zobkqWH1ajLttwSVLDWGk3YG+T9zMBYl\n4NOGOnc+AwZYUT/SG+5Px+L4r7W7S8TdE0KgjPT6PdpHjDbMRpDd9fENPhhcsd1Z\nEKqMfaGcowKBgGobNSHI8YlxRKfLwohGD4uJIF75ohblrNC8183ENrZkhzXPXv+P\nBj4CRX0NaHvtmvTdFyAsjVPzOl/9HqbLWZwYMgnO0EMzArDS8DkXB6ckMh5/43ki\nwNqGs9fSJtc4q3Us3VKDR8+aN/MEq+t39vF4lwchxKSC/XpV+9SIDW/lAoGAZtOH\nhCpQocm+j8ckxlkmjasRt/puZxvYN4ITnVmGcg+Lq6xHz2Ny5PQZ7KiHpeC2rd4Z\n+/+0AQktopArqgpQ2vsiKxOfVGoaKahidfb9f9l34O9Crq3txqBb45zkNlfwkxo8\n268v7mrxaW/WLmpkGadwG3UHoJvgdpNgRieRfsECgYEAzezMvNgyGABhIj21u2L/\nW7QWfNVdcIkKb2cxHwyOTs3L7AVlUpyc84p250Bw2t6CJsYy6PS4CemPjEIdnR96\nt5LUeggI8RTLRWi3cCGI2Se8LqZx2uCBSTQqBe8DPkFKRPTfGV7ezERStM2HbzI3\n4xEfRMjRjqV0D7HbYEh3YeA=\n-----END PRIVATE KEY-----\n",
    "client_email": "antigravity-gsc@zippy-parity-482821-f8.iam.gserviceaccount.com",
    "client_id": "112600816040844927503",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/antigravity-gsc%40zippy-parity-482821-f8.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
};

async function getCredentials(): Promise<ServiceAccountCredentials | null> {
    // Option 1: Try to read from file (local development)
    const credentialsFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const devPath = 'C:/credentials/gsc-credentials.json';
    const pathToCheck = credentialsFilePath || (fs.existsSync(devPath) ? devPath : null);

    if (pathToCheck && fs.existsSync(pathToCheck)) {
        try {
            const fileContent = fs.readFileSync(pathToCheck, 'utf-8');
            console.log('GSC Service: Using credentials from file:', pathToCheck);
            return JSON.parse(fileContent);
        } catch (e) {
            console.warn('GSC Service: Could not read credentials file, checking env var');
        }
    }

    // Option 2: Read from environment variable (Vercel production)
    const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (credentialsJson) {
        try {
            console.log('GSC Service: Using credentials from env var');
            return JSON.parse(credentialsJson);
        } catch (e) {
            console.error('GSC Service: Invalid credentials JSON in env var, falling back to hardcoded');
        }
    }

    // Option 3: Fallback to hardcoded credentials (Emergency Fix)
    console.warn('GSC Service: Using FALLBACK hardcoded credentials');
    return FALLBACK_CREDENTIALS;
}

export async function getGSCAnalytics(
    startDate: string,
    endDate: string,
    dimension: string,
    limit: number = 25
): Promise<GSCRow[]> {
    const credentials = await getCredentials();

    if (!credentials) {
        console.error('GSC Service: No credentials available');
        throw new Error('Google credentials not configured');
    }

    const accessToken = await getAccessToken(credentials);

    const dimensionMap: Record<string, string[]> = {
        page: ['page'],
        country: ['country'],
        device: ['device'],
        query: ['query'],
        date: ['date'],
    };

    const dimensions = dimensionMap[dimension] || ['page'];

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
                rowLimit: limit,
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error('GSC API Error:', response.status, errorText);
        throw new Error(`GSC API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return data.rows?.map((row: any) => ({
        keys: row.keys,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
    })) || [];
}
