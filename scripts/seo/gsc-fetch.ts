/**
 * Google Search Console Fetcher
 *
 * Usage:
 *   npx ts-node scripts/seo/gsc-fetch.ts <URL>
 *
 * Requirements:
 * 1. npm install googleapis
 * 2. Place 'credentials.json' (Service Account Key) in the project root.
 */

import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];

async function main() {
    const url = process.argv[2];

    if (!url) {
        console.error('Please provide a URL to inspect. Example: npx ts-node scripts/seo/gsc-fetch.ts https://mysite.com/blog/post-1');
        process.exit(1);
    }

    // Check if credentials exist
    if (!fs.existsSync(CREDENTIALS_PATH)) {
        console.error('❌ Error: credentials.json not found in root directory.');
        console.error('Please download your Service Account JSON key from Google Cloud Console and save it as credentials.json');
        process.exit(1);
    }

    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: CREDENTIALS_PATH,
            scopes: SCOPES,
        });

        const searchconsole = google.searchconsole({ version: 'v1', auth });

        // Assuming the property is the domain/root of the URL
        // You might need to adjust this depending on how your property is defined in GSC (Domain property vs URL prefix)
        const urlObj = new URL(url);
        const siteUrl = `${urlObj.protocol}//${urlObj.hostname}/`; // Simple guess for URL prefix property

        // Adjust date range as needed
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days ago

        console.log(`Fetching GSC data for: ${url} (Site: ${siteUrl})`);
        console.log(`Period: ${startDate} to ${endDate}`);

        const res = await searchconsole.searchanalytics.query({
            siteUrl: siteUrl,
            requestBody: {
                startDate,
                endDate,
                dimensions: ['query'],
                dimensionFilterGroups: [
                    {
                        filters: [
                            {
                                dimension: 'page',
                                operator: 'equals',
                                expression: url,
                            },
                        ],
                    },
                ],
                rowLimit: 10,
            },
        });

        const rows = res.data.rows;

        if (!rows || rows.length === 0) {
            console.log('No data found for this URL in the last 30 days.');
        } else {
            console.log('\nTop 10 Search Queries:');
            console.table(
                rows.map((row) => ({
                    query: row.keys?.[0],
                    ctr: `${(row.ctr! * 100).toFixed(2)}%`,
                    clicks: row.clicks,
                    impressions: row.impressions,
                    position: row.position?.toFixed(1),
                }))
            );
        }
    } catch (error: any) {
        console.error('Failed to fetch GSC data:', error.message);
        if (error.message.includes('User does not have sufficient permissions')) {
            console.error('👉 Tip: Ensure you have added the Service Account email to your GSC Property users in Search Console settings.');
        }
    }
}

main().catch(console.error);
