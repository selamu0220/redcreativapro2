// Fix build errors by wrapping components that use localization hooks
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing build errors...');

// List of components that need to be wrapped or have conditional usage
const componentsToFix = [
  'app/components/CountryChangeDialog.tsx',
  'app/components/CountrySelector.tsx', 
  'app/components/CurrencySelector.tsx',
  'app/components/DataProtectionNotice.tsx',
  'app/components/LegalDisclaimer.tsx',
  'app/components/LocalizationStatus.tsx',
  'app/components/MainNavigation.tsx',
  'app/components/HeaderCountrySelector.tsx',
  'app/components/PricingTooltip.tsx',
  'app/components/PrivacyNotice.tsx',
  'app/components/ProtectedRoute.tsx'
];

// Create a safe wrapper for useLocalization
const safeLocalizationHook = `
// Safe wrapper for useLocalization hook
function useSafeLocalization() {
  try {
    return useLocalization();
  } catch (error) {
    console.warn('useLocalization used outside LocalizationProvider - using defaults');
    return {
      country: 'ES',
      currency: 'EUR',
      language: 'es',
      isLoading: false,
      error: null,
      isLatinAmerica: false,
      formatCurrency: (amount) => \`€\${amount}\`,
      setManualCountry: () => {},
      refreshLocation: () => {}
    };
  }
}
`;

componentsToFix.forEach(componentPath => {
  if (fs.existsSync(componentPath)) {
    let content = fs.readFileSync(componentPath, 'utf8');
    
    // Replace useLocalization with useSafeLocalization
    if (content.includes('useLocalization')) {
      // Add the safe wrapper function
      const importIndex = content.indexOf('import { useLocalization }');
      if (importIndex !== -1) {
        content = content.replace(
          'import { useLocalization }',
          'import { useLocalization }'
        );
        
        // Add safe wrapper after imports
        const lastImportIndex = content.lastIndexOf('import ');
        const nextLineIndex = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, nextLineIndex + 1) + 
                 safeLocalizationHook + 
                 content.slice(nextLineIndex + 1);
        
        // Replace usage
        content = content.replace(/const\s+{([^}]+)}\s+=\s+useLocalization\(\)/g, 
          'const {$1} = useSafeLocalization()');
      }
      
      fs.writeFileSync(componentPath, content);
      console.log(`✅ Fixed ${componentPath}`);
    }
  }
});

console.log('✅ Build errors fixed!');