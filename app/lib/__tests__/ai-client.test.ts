import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { improveContent } from '../ai-client';
import { globalRequestQueue } from '../request-queue';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ai-client integration', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.spyOn(globalRequestQueue, 'add');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should queue requests via globalRequestQueue', async () => {
    // Mock successful API response
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ improvedContent: 'Improved text' }),
      success: true
    } as any);

    const request = {
      content: 'Original text',
      instruction: 'Improve this',
      language: 'es'
    };

    const config = {
      model: 'gpt-4o',
      temperature: 0.7
    };

    await improveContent(request, config);

    expect(globalRequestQueue.add).toHaveBeenCalled();
  });

  it('should call the correct API endpoint with correct body', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ improvedContent: 'Improved text' }),
      success: true
    } as any);

    const request = {
      content: 'Test content',
      instruction: 'Fix grammar',
      language: 'en'
    };

    const config = {
      model: 'test-model',
      temperature: 0.5,
      apiKey: 'test-key'
    };

    await improveContent(request, config);

    expect(mockFetch).toHaveBeenCalledWith('/api/improve-text', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
        'x-model': 'test-model',
        'x-temperature': '0.5',
        'x-openrouter-api-key': 'test-key'
      }),
      body: JSON.stringify({
        content: 'Test content',
        prompt: 'Fix grammar', // Note: client maps instruction to prompt
        language: 'en'
      })
    }));
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await improveContent({ content: 'test', instruction: 'test' }, { model: 'test', temperature: 0.7 });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('NETWORK_ERROR');
  });

  it('should return cached response if available', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ improvedContent: 'Cached result' }),
      success: true
    } as any);

    const request = { content: 'Unique content', instruction: 'instr' };
    
    // First call
    await improveContent(request, { model: 'm', temperature: 0.7 });
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Second call with same params
    const result2 = await improveContent(request, { model: 'm', temperature: 0.7 });
    
    expect(mockFetch).toHaveBeenCalledTimes(1); // Should still be 1
    expect(result2.improvedContent).toBe('Cached result');
  });
});
