import { describe, it, expect, vi, beforeEach } from 'vitest'
import { geoDetectionService } from '../geo-detection'
import { NextRequest } from 'next/server'

describe('GeoDetectionService', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it('should detect country from Cloudflare headers', async () => {
        const req = new NextRequest('http://localhost:3000', {
            headers: { 'cf-ipcountry': 'MX' }
        })

        const result = await geoDetectionService.detectCountry(req)
        expect(result.country).toBe('MX')
        expect(result.source).toBe('cloudflare')
    })

    it('should fallback to default (MX) if no headers', async () => {
        const req = new NextRequest('http://localhost:3000')
        const result = await geoDetectionService.detectCountry(req)
        expect(result.country).toBe('MX') // Fallback preference
    })

    it('should return correct localization config for CO', () => {
        const config = geoDetectionService.getLocalizationConfig('CO')
        expect(config.currency).toBe('COP')
        expect(config.locale).toBe('es-CO')
    })
})
