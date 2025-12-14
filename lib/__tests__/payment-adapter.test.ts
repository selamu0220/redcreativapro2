import { paymentMethodService } from '../payment-adapter'
import { PaymentMethod } from '../payment-adapter'

describe('PaymentMethodService', () => {
    it('should return correct methods for MX', () => {
        const methods = paymentMethodService.getAvailableMethodsForCountry('MX')
        const types = methods.map(m => m.type)
        expect(types).toContain('oxxo')
        expect(types).toContain('spei')
        expect(types).toContain('card')
        expect(types).not.toContain('efecty') // EFECTY is Colombia only
    })

    it('should validate amounts correctly', () => {
        const oxxo = paymentMethodService.getPaymentMethod('oxxo') as PaymentMethod
        expect(oxxo).toBeDefined()

        // OXXO min is 50 MXN
        expect(paymentMethodService.validateAmount(40, 'MXN', oxxo)).toBe(false)
        expect(paymentMethodService.validateAmount(100, 'MXN', oxxo)).toBe(true)
    })

    it('should calculate fees correctly', () => {
        const card = paymentMethodService.getPaymentMethod('card')
        if (card) {
            // 2.9% fee
            const fee = paymentMethodService.calculateFees(card, 100, 'USD')
            expect(fee).toBeCloseTo(2.9, 1)
        }
    })
})
