import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { LocalizationConfig } from '@/app/lib/geo-detection'

// Path to configuration file
const CONFIG_FILE_PATH = path.join(process.cwd(), 'localization.config.json')

// Interface for persistent configuration
export interface AdminConfig {
    taxRates: Record<string, number>
    paymentMethods: Record<string, boolean> // enabled/disabled
    lastUpdated: number
}

// Default configuration
const DEFAULT_CONFIG: AdminConfig = {
    taxRates: {
        MX: 0.16,
        CO: 0.19,
        AR: 0.21,
        CL: 0.19,
        PE: 0.18,
        EC: 0.12,
        BR: 0.17, // Average ICMS
        US: 0.08
    },
    paymentMethods: {
        card: true,
        oxxo: true,
        spei: true,
        pse: true,
        efecty: true,
        mercadopago: true,
        rapipago: true,
        webpay: true,
        pagoefectivo: true,
        pix: true,
        boleto: true,
        paypal: true
    },
    lastUpdated: Date.now()
}

/**
 * Helper to read config
 */
function readConfig(): AdminConfig {
    try {
        if (fs.existsSync(CONFIG_FILE_PATH)) {
            const data = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8')
            const parsed = JSON.parse(data)
            return { ...DEFAULT_CONFIG, ...parsed }
        }
    } catch (error) {
        console.error('Error reading config file:', error)
    }
    return DEFAULT_CONFIG
}

/**
 * Helper to write config
 */
function writeConfig(config: AdminConfig): boolean {
    try {
        fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8')
        return true
    } catch (error) {
        console.error('Error writing config file:', error)
        return false
    }
}

/**
 * GET handler - Read configuration
 */
export async function GET(request: NextRequest) {
    // Security check: In production, verify admin session/token here
    // const token = request.headers.get('Authorization')
    // if (!verifyAdmin(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const config = readConfig()
    return NextResponse.json(config)
}

/**
 * POST handler - Update configuration
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate body structure (basic validation)
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
        }

        const currentConfig = readConfig()

        // updates
        const newConfig: AdminConfig = {
            ...currentConfig,
            ...body,
            lastUpdated: Date.now()
        }

        // Sanitize tax rates (ensure numbers)
        if (newConfig.taxRates) {
            Object.keys(newConfig.taxRates).forEach(key => {
                newConfig.taxRates[key] = Number(newConfig.taxRates[key])
            })
        }

        if (writeConfig(newConfig)) {
            return NextResponse.json({ success: true, config: newConfig })
        } else {
            return NextResponse.json({ error: 'Failed to write configuration' }, { status: 500 })
        }

    } catch (error) {
        console.error('Config API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
