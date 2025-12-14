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
