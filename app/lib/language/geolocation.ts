import { LanguageCode, DEFAULT_LANGUAGE } from './config';

/**
 * Mapeo de códigos de país a idiomas
 */
const COUNTRY_LANGUAGE_MAP: Record<string, LanguageCode> = {
  // Países de habla inglesa
  'US': 'en', // Estados Unidos
  'GB': 'en', // Reino Unido
  'CA': 'en', // Canadá (principalmente inglés)
  'AU': 'en', // Australia
  'NZ': 'en', // Nueva Zelanda
  'IE': 'en', // Irlanda
  'ZA': 'en', // Sudáfrica
  'SG': 'en', // Singapur
  'IN': 'en', // India
  'PH': 'en', // Filipinas
  'MY': 'en', // Malasia
  'HK': 'en', // Hong Kong
  
  // Países de habla española
  'ES': 'es', // España
  'MX': 'es', // México
  'AR': 'es', // Argentina
  'CO': 'es', // Colombia
  'PE': 'es', // Perú
  'VE': 'es', // Venezuela
  'CL': 'es', // Chile
  'EC': 'es', // Ecuador
  'GT': 'es', // Guatemala
  'CU': 'es', // Cuba
  'BO': 'es', // Bolivia
  'DO': 'es', // República Dominicana
  'HN': 'es', // Honduras
  'PY': 'es', // Paraguay
  'SV': 'es', // El Salvador
  'NI': 'es', // Nicaragua
  'CR': 'es', // Costa Rica
  'PA': 'es', // Panamá
  'UY': 'es', // Uruguay
  'PR': 'es', // Puerto Rico
  'GQ': 'es', // Guinea Ecuatorial
};

/**
 * Interfaz para la respuesta de la API de geolocalización
 */
interface GeolocationResponse {
  country?: string;
  countryCode?: string;
  status?: string;
  message?: string;
}

/**
 * Detecta el idioma basado en la geolocalización/IP del usuario
 * Útil para detectar cambios de ubicación por VPN
 */
export async function detectLanguageByLocation(): Promise<LanguageCode | null> {
  try {
    console.log('🌍 Detectando idioma por geolocalización...');
    
    // Usar múltiples servicios para mayor confiabilidad
    const services = [
      'https://ipapi.co/json/',
      'https://ip-api.com/json/',
      'https://ipinfo.io/json'
    ];
    
    for (const serviceUrl of services) {
      try {
        console.log(`🔍 Probando servicio: ${serviceUrl}`);
        
        const response = await fetch(serviceUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.warn(`⚠️ Servicio ${serviceUrl} respondió con error:`, response.status);
          continue;
        }
        
        const data: GeolocationResponse = await response.json();
        console.log(`📍 Respuesta de ${serviceUrl}:`, data);
        
        // Extraer código de país de diferentes formatos de respuesta
        let countryCode: string | undefined;
        
        if (data.countryCode) {
          countryCode = data.countryCode;
        } else if ((data as any).country_code) {
          countryCode = (data as any).country_code;
        } else if ((data as any).country) {
          // Si solo tenemos el nombre del país, intentar mapear algunos comunes
          const countryName = (data as any).country.toLowerCase();
          if (countryName.includes('united states') || countryName.includes('usa')) {
            countryCode = 'US';
          } else if (countryName.includes('spain') || countryName.includes('españa')) {
            countryCode = 'ES';
          } else if (countryName.includes('mexico') || countryName.includes('méxico')) {
            countryCode = 'MX';
          }
        }
        
        if (countryCode) {
          const upperCountryCode = countryCode.toUpperCase();
          console.log(`🏳️ Código de país detectado: ${upperCountryCode}`);
          
          const language = COUNTRY_LANGUAGE_MAP[upperCountryCode];
          if (language) {
            console.log(`✅ Idioma por geolocalización: ${upperCountryCode} → ${language}`);
            return language;
          } else {
            console.log(`❓ País no mapeado: ${upperCountryCode}, usando idioma por defecto`);
          }
        }
        
      } catch (serviceError) {
        console.warn(`❌ Error con servicio ${serviceUrl}:`, serviceError);
        continue;
      }
    }
    
    console.log('🔄 No se pudo detectar idioma por geolocalización, usando método por defecto');
    return null;
    
  } catch (error) {
    console.error('❌ Error general en detección por geolocalización:', error);
    return null;
  }
}

/**
 * Detecta el idioma combinando geolocalización y navegador
 * Prioriza la geolocalización para casos de VPN
 */
export async function detectLanguageHybrid(): Promise<LanguageCode> {
  console.log('🔀 Iniciando detección híbrida de idioma...');
  
  try {
    // 1. Intentar detección por geolocalización primero
    const locationLanguage = await detectLanguageByLocation();
    if (locationLanguage) {
      console.log(`🌍 Usando idioma por geolocalización: ${locationLanguage}`);
      return locationLanguage;
    }
    
    // 2. Fallback a detección del navegador
    console.log('🌐 Fallback a detección del navegador...');
    const { detectBrowserLanguage } = await import('./utils');
    const browserLanguage = detectBrowserLanguage();
    
    console.log(`🔄 Usando idioma del navegador: ${browserLanguage}`);
    return browserLanguage;
    
  } catch (error) {
    console.error('❌ Error en detección híbrida:', error);
    console.log(`🔄 Usando idioma por defecto: ${DEFAULT_LANGUAGE}`);
    return DEFAULT_LANGUAGE;
  }
}

/**
 * Función de prueba para verificar qué detectan las APIs
 */
export async function testGeolocationAPIs(): Promise<void> {
  console.log('🧪 === PRUEBA DE APIs DE GEOLOCALIZACIÓN ===');
  
  const services = [
    { name: 'ipapi.co', url: 'https://ipapi.co/json/' },
    { name: 'ip-api.com', url: 'https://ip-api.com/json/' },
    { name: 'ipinfo.io', url: 'https://ipinfo.io/json' }
  ];
  
  for (const service of services) {
    try {
      console.log(`\n🔍 Probando ${service.name}...`);
      
      const response = await fetch(service.url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      
      if (!response.ok) {
        console.error(`❌ ${service.name} falló:`, response.status);
        continue;
      }
      
      const data = await response.json();
      console.log(`📍 ${service.name} respuesta:`, data);
      
      // Extraer información relevante
      const country = data.country || data.country_name || data.countryCode || data.country_code;
      const ip = data.ip || data.query;
      
      console.log(`🌍 ${service.name} - IP: ${ip}, País: ${country}`);
      
    } catch (error) {
      console.error(`❌ Error con ${service.name}:`, error);
    }
  }
  
  console.log('\n🧪 === FIN DE PRUEBA ===');
}

/**
 * Verifica si la ubicación actual sugiere un idioma diferente al configurado
 */
export async function checkLocationLanguageMismatch(currentLanguage: LanguageCode): Promise<{
  hasMismatch: boolean;
  suggestedLanguage?: LanguageCode;
  locationInfo?: string;
}> {
  try {
    const locationLanguage = await detectLanguageByLocation();
    
    if (locationLanguage && locationLanguage !== currentLanguage) {
      return {
        hasMismatch: true,
        suggestedLanguage: locationLanguage,
        locationInfo: `Ubicación detectada sugiere ${locationLanguage}, pero tienes configurado ${currentLanguage}`
      };
    }
    
    return { hasMismatch: false };
    
  } catch (error) {
    console.error('Error verificando discrepancia de ubicación:', error);
    return { hasMismatch: false };
  }
}
