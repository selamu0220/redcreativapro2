/**
 * Diagnostic script to identify language slider hydration issues
 */

console.log('🔍 Starting Language Slider Hydration Diagnosis...');

// Check if we're in browser environment
if (typeof window !== 'undefined') {
  
  // 1. Check for hydration errors
  const originalError = console.error;
  console.error = function(...args) {
    if (args.some(arg => 
      typeof arg === 'string' && 
      (arg.includes('hydration') || 
       arg.includes('Hydration') || 
       arg.includes('next-intl') ||
       arg.includes('useTranslations'))
    )) {
      console.log('🚨 HYDRATION ERROR DETECTED:', ...args);
    }
    originalError.apply(console, args);
  };

  // 2. Monitor LanguageSlider component lifecycle
  let sliderObserver;
  
  function checkSliderVisibility() {
    const slider = document.querySelector('[aria-label*="language"], [aria-label*="idioma"], .language-slider, [class*="language"]');
    
    if (slider) {
      console.log('✅ Language slider found:', slider);
      console.log('📊 Slider visibility:', {
        display: getComputedStyle(slider).display,
        visibility: getComputedStyle(slider).visibility,
        opacity: getComputedStyle(slider).opacity,
        offsetWidth: slider.offsetWidth,
        offsetHeight: slider.offsetHeight,
        classList: Array.from(slider.classList)
      });
      
      // Check if it disappears
      setTimeout(() => {
        const stillVisible = document.contains(slider) && 
                           getComputedStyle(slider).display !== 'none' &&
                           getComputedStyle(slider).visibility !== 'hidden' &&
                           slider.offsetWidth > 0;
        
        if (!stillVisible) {
          console.log('🚨 SLIDER DISAPPEARED after 1 second!');
          console.log('📊 Current state:', {
            inDOM: document.contains(slider),
            display: getComputedStyle(slider).display,
            visibility: getComputedStyle(slider).visibility,
            opacity: getComputedStyle(slider).opacity
          });
        } else {
          console.log('✅ Slider still visible after 1 second');
        }
      }, 1000);
      
      return true;
    }
    return false;
  }

  // 3. Check next-intl context availability
  function checkNextIntlContext() {
    // Look for next-intl provider in React DevTools or DOM
    const intlProvider = document.querySelector('[data-nextintl], [class*="nextintl"], [class*="NextIntl"]');
    console.log('🌐 Next-intl provider found:', !!intlProvider);
    
    // Check for locale in HTML
    const htmlLang = document.documentElement.lang;
    console.log('🌍 HTML lang attribute:', htmlLang);
    
    // Check for locale cookie
    const localeCookie = document.cookie.split(';').find(c => c.trim().startsWith('locale='));
    console.log('🍪 Locale cookie:', localeCookie);
  }

  // 4. Monitor DOM changes
  function startMonitoring() {
    console.log('👀 Starting DOM monitoring...');
    
    sliderObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.removedNodes.forEach((node) => {
            if (node.nodeType === 1 && 
                (node.matches && node.matches('[class*="language"], [aria-label*="language"]') ||
                 node.querySelector && node.querySelector('[class*="language"], [aria-label*="language"]'))) {
              console.log('🚨 Language slider or container REMOVED from DOM:', node);
            }
          });
          
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && 
                (node.matches && node.matches('[class*="language"], [aria-label*="language"]') ||
                 node.querySelector && node.querySelector('[class*="language"], [aria-label*="language"]'))) {
              console.log('✅ Language slider or container ADDED to DOM:', node);
            }
          });
        }
        
        if (mutation.type === 'attributes' && 
            mutation.target.matches && 
            mutation.target.matches('[class*="language"], [aria-label*="language"]')) {
          console.log('🔄 Language slider attributes changed:', {
            target: mutation.target,
            attributeName: mutation.attributeName,
            oldValue: mutation.oldValue,
            newValue: mutation.target.getAttribute(mutation.attributeName)
          });
        }
      });
    });
    
    sliderObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ['class', 'style', 'aria-label']
    });
  }

  // 5. Check React hydration status
  function checkReactHydration() {
    // Look for React hydration markers
    const reactRoot = document.querySelector('#__next, [data-reactroot]');
    console.log('⚛️ React root found:', !!reactRoot);
    
    // Check for hydration completion
    setTimeout(() => {
      const isHydrated = window.React || window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      console.log('💧 React hydration status:', isHydrated ? 'Likely hydrated' : 'Unknown');
    }, 500);
  }

  // Run diagnostics
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📋 Running diagnostics on DOMContentLoaded...');
    checkNextIntlContext();
    checkReactHydration();
    checkSliderVisibility();
    startMonitoring();
  });

  // Also run immediately if DOM is already loaded
  if (document.readyState === 'loading') {
    // DOM not ready yet
  } else {
    console.log('📋 Running diagnostics immediately (DOM already loaded)...');
    checkNextIntlContext();
    checkReactHydration();
    checkSliderVisibility();
    startMonitoring();
  }

  // Cleanup function
  window.cleanupSliderDiagnostics = function() {
    if (sliderObserver) {
      sliderObserver.disconnect();
      console.log('🧹 Diagnostics cleanup completed');
    }
  };

} else {
  console.log('❌ Not in browser environment, skipping diagnostics');
}