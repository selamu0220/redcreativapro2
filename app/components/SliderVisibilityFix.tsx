'use client';

import { useEffect } from 'react';

/**
 * This component fixes language slider visibility issues by:
 * 1. Monitoring if the slider gets hidden
 * 2. Force-enabling visibility if it gets hidden
 * 3. Logging diagnostic information
 */
export function SliderVisibilityFix() {
    useEffect(() => {
        // Check immediately and then periodically
        const checkSlider = () => {
            // Find the language slider
            const slider = document.querySelector('[aria-label*="language"], [aria-label*="idioma"], .language-slider, [class*="LanguageSlider"], [class*="language-slider"]');

            if (slider) {
                const computedStyle = window.getComputedStyle(slider);
                const parent = slider.parentElement;

                // Check if slider is hidden
                const isHidden =
                    computedStyle.display === 'none' ||
                    computedStyle.visibility === 'hidden' ||
                    computedStyle.opacity === '0' ||
                    slider.clientWidth === 0 ||
                    slider.clientHeight === 0;

                if (isHidden) {
                    console.warn('🚨 Language slider detected as hidden! Fixing...', {
                        display: computedStyle.display,
                        visibility: computedStyle.visibility,
                        opacity: computedStyle.opacity,
                        width: slider.clientWidth,
                        height: slider.clientHeight,
                        parent: parent ? {
                            tag: parent.tagName,
                            className: parent.className,
                            style: parent.getAttribute('style')
                        } : 'no parent'
                    });

                    // Force remove any hiding styles
                    (slider as HTMLElement).style.display = '';
                    (slider as HTMLElement).style.visibility = '';
                    (slider as HTMLElement).style.opacity = '';
                    (slider as HTMLElement).style.pointerEvents = '';

                    // Also fix parent if needed
                    if (parent) {
                        (parent as HTMLElement).style.display = '';
                        (parent as HTMLElement).style.visibility = '';
                        (parent as HTMLElement).style.opacity = '';
                    }
                }
            }
        };

        // Run check multiple times to catch timing issues
        const intervals = [100, 500, 1000, 2000, 3000];
        intervals.forEach(delay => {
            setTimeout(checkSlider, delay);
        });

        // Also set up a periodic check
        const periodicId = setInterval(checkSlider, 5000);

        return () => clearInterval(periodicId);
    }, []);

    return null;
}

export default SliderVisibilityFix;
