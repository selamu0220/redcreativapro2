
import { POST } from '../route';
import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the dependencies
vi.mock('ai', () => ({
    generateText: vi.fn().mockResolvedValue({ text: JSON.stringify({ corrected_text: "Texto mejorado" }) }),
}));

// Mock the openrouter provider
const mockOpenRouter = vi.fn().mockReturnValue('mock-model-object');
vi.mock('../../../lib/ai/openrouter', () => ({
    openrouter: (model: string) => mockOpenRouter(model)
}));

describe('API Route: improve-text-openrouter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('hould enforce MiniMax model regardless of input', async () => {
        // Create a mock request with a DIFFERENT model to test enforcement
        const req = new NextRequest('http://localhost/api/improve-text-openrouter', {
            method: 'POST',
            body: JSON.stringify({
                content: 'Texto prueba',
                model: 'gpt-4o' // Intentionally wrong model
            })
        });

        const response = await POST(req);
        const data = await response.json();

        // Verify response success
        expect(response.status).toBe(200);
        expect(data.improvedContent).toBeDefined();

        // Verify openrouter was called with the ENFORCED model, not the input model
        expect(mockOpenRouter).toHaveBeenCalledWith('minimax/abab-6.5-chat');
    });

    it('should return 400 if content is empty', async () => {
        const req = new NextRequest('http://localhost/api/improve-text-openrouter', {
            method: 'POST',
            body: JSON.stringify({
                content: ''
            })
        });

        const response = await POST(req);
        expect(response.status).toBe(400);
    });
});
