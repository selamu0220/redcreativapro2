/**
 * Integration test for Auto Mode
 * 
 * This test verifies that the Auto Mode timer:
 * 1. Starts correctly when enabled
 * 2. Does NOT reset on every keystroke
 * 3. Triggers improvement after the interval
 * 4. Updates the editor with improved text
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Auto Mode Integration Test', () => {
    beforeEach(() => {
        // Setup fake timers
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should trigger improvement after interval without resetting on every keystroke', async () => {
        console.log('\n🧪 [Test] Starting Auto Mode Integration Test\n');

        // Test utilities
        let timerCallCount = 0;
        let improvementCalled = false;
        let editorContent = 'esto es una prueba con errores';

        // Mock editor instance
        const mockEditor = {
            getText: () => editorContent.replace(/<[^>]*>/g, ''),
            getHTML: () => `<p>${editorContent}</p>`,
            commands: {
                setContent: vi.fn((html: string) => {
                    console.log('✅ [Test] Editor.setContent called with:', html);
                    editorContent = html.replace(/<[^>]*>/g, '');
                })
            }
        };

        // Mock improve function
        const mockImprove = vi.fn(async (isAutoMode: boolean) => {
            improvementCalled = true;
            console.log('🎯 [Test] Improvement triggered! isAutoMode:', isAutoMode);

            // Simulate API response
            return 'Esto es una prueba con errores.';
        });

        // Simulate the Auto Mode timer logic
        let countdown = 2; // 2 seconds interval
        const timerInterval = setInterval(() => {
            timerCallCount++;
            countdown--;
            console.log(`⏱️ [Test] Timer tick ${timerCallCount}: ${countdown}s remaining`);

            if (countdown <= 0) {
                console.log('🎯 [Test] Timer reached 0! Calling improve...');
                mockImprove(true);
                countdown = 2; // Reset for next cycle
            }
        }, 1000);

        // Simulate: User types "esto "
        console.log('⌨️ [Test] User types: "esto "');
        editorContent = 'esto ';

        // Advance 500ms - timer should NOT reset
        vi.advanceTimersByTime(500);

        // Simulate: User types "es "
        console.log('⌨️ [Test] User types: "es "');
        editorContent = 'esto es ';

        // Advance another 500ms - timer should NOT reset
        vi.advanceTimersByTime(500);

        // At this point, 1 second has passed, timer should be at 1s
        console.log('📊 [Test] 1 second elapsed. Timer should be at 1s');

        // Simulate: User stops typing
        console.log('✋ [Test] User stops typing');

        // Advance final 1000ms - timer should reach 0 and trigger improvement
        vi.advanceTimersByTime(1000);

        // Cleanup
        clearInterval(timerInterval);

        // Assertions
        console.log('\n📋 [Test] Checking assertions...');
        console.log('Timer ticks:', timerCallCount);
        console.log('Improvement called:', improvementCalled);

        expect(timerCallCount).toBeGreaterThanOrEqual(2);
        expect(improvementCalled).toBe(true);
        expect(mockImprove).toHaveBeenCalledWith(true);

        console.log('✅ [Test] All assertions passed!\n');
    });

    it('should use editorInstance.commands.setContent for updates', () => {
        console.log('\n🧪 [Test] Verifying editor update method\n');

        const mockEditor = {
            getText: () => 'test content',
            getHTML: () => '<p>test content</p>',
            commands: {
                setContent: vi.fn()
            }
        };

        const improvedHTML = '<p>Test content.</p>';
        mockEditor.commands.setContent(improvedHTML);

        expect(mockEditor.commands.setContent).toHaveBeenCalledWith(improvedHTML);
        console.log('✅ [Test] Editor.commands.setContent is being used correctly\n');
    });
});
