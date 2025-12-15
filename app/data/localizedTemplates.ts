export type CountryCode = string;

export const getRegionalBusinessExamples = (code: CountryCode) => ({ companies: [], businessTypes: [] });

export const getCulturalAdaptationRules = (code: CountryCode) => ({
    formalityLevel: 'estándar',
    communicationStyle: 'directo',
    businessCulture: 'profesional',
    timeOrientation: 'secuencial'
});

export const getRegionalGreeting = (code: CountryCode, timeOfDay: string) => 'Hola';

export const getRegionalBusinessContext = (code: CountryCode) => 'Contexto general de negocios.';

// Missing functions required by templateManager.ts
export const adaptTemplateForCountry = (template: any, country: CountryCode) => {
    return {
        ...template,
        country,
        // Apply any country-specific adaptations here
    };
};

export const getCountrySpecificTemplateVariations = (country: CountryCode) => {
    // Return country-specific template variations
    return [];
};
