export type CountryCode = string;

export interface RegionalBusinessExample {
  companies: string[];
  businessTypes: string[];
}

export interface CulturalAdaptationRules {
  formalityLevel: string;
  communicationStyle: string;
  businessCulture: string;
  timeOrientation: string;
}

export const getRegionalBusinessExamples = (code: CountryCode): RegionalBusinessExample => ({ companies: [], businessTypes: [] });

export const getCulturalAdaptationRules = (code: CountryCode): CulturalAdaptationRules => ({
    formalityLevel: 'estándar',
    communicationStyle: 'directo',
    businessCulture: 'profesional',
    timeOrientation: 'secuencial'
});

export const getRegionalGreeting = (code: CountryCode, timeOfDay: string) => 'Hola';

export const getRegionalBusinessContext = (code: CountryCode) => 'Contexto general de negocios.';

// Missing functions required by templateManager.ts
export const adaptTemplateForCountry = (template: any, country: CountryCode, language?: string) => {
    return {
        ...template,
        country,
        language,
        // Apply any country-specific adaptations here
    };
};

export const getCountrySpecificTemplateVariations = (country: CountryCode) => {
    // Return country-specific template variations
    return [];
};
