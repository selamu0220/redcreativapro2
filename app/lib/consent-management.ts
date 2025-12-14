/**
 * Consent Management System for Latin American Markets
 * 
 * Handles country-specific consent requirements including:
 * - Cookie consent management per jurisdiction
 * - Dynamic privacy notice generation
 * - Data retention policy enforcement
 * - Consent tracking and validation
 */

import { CountryCode, ConsentType, ConsentRequirement, LegalDocument, ConsentRecord, legalComplianceManager } from './legal-compliance'

export type ConsentStatus = 'granted' | 'denied' | 'pending' | 'expired'
export type CookieCategory = 'essential' | 'analytics' | 'marketing' | 'functional' | 'advertising'

export interface ConsentState {
  userId?: string
  country: CountryCode
  consents: Record<ConsentType, ConsentStatus>
  cookieConsents: Record<CookieCategory, ConsentStatus>
  timestamp: Date
  version: string
  ipAddress?: string
  userAgent?: string
}

export interface CookieConsentConfig {
  category: CookieCategory
  required: boolean
  description: string
  cookies: string[]
  purpose: string
  retentionPeriod: string
}

export interface PrivacyNoticeConfig {
  country: CountryCode
  title: string
  sections: PrivacyNoticeSection[]
  lastUpdated: Date
  version: string
  language: string
}

export interface PrivacyNoticeSection {
  id: string
  title: string
  content: string
  required: boolean
  order: number
}

export interface DataRetentionPolicy {
  dataType: string
  retentionPeriod: string
  deletionSchedule: 'automatic' | 'manual'
  legalBasis: string
  country: CountryCode
}

/**
 * Consent Management Service
 * Manages consent collection, validation, and enforcement per country
 */
export class ConsentManagementService {
  private consentStorage: Map<string, ConsentState>
  private cookieConfigs: Map<CountryCode, CookieConsentConfig[]>
  private privacyNotices: Map<CountryCode, PrivacyNoticeConfig>
  private retentionPolicies: Map<CountryCode, DataRetentionPolicy[]>

  constructor() {
    this.consentStorage = new Map()
    this.cookieConfigs = new Map()
    this.privacyNotices = new Map()
    this.retentionPolicies = new Map()
    this.initializeCookieConfigs()
    this.initializePrivacyNotices()
    this.initializeRetentionPolicies()
  }

  /**
   * Initialize cookie consent configurations per country
   */
  private initializeCookieConfigs(): void {
    // Brazil - LGPD requires explicit consent for non-essential cookies
    this.cookieConfigs.set('BR', [
      {
        category: 'essential',
        required: true,
        description: 'Cookies essenciais para o funcionamento do site',
        cookies: ['session', 'csrf', 'auth'],
        purpose: 'Funcionalidade básica do site',
        retentionPeriod: 'Sessão'
      },
      {
        category: 'analytics',
        required: false,
        description: 'Cookies para análise de uso do site',
        cookies: ['_ga', '_gid', 'umami'],
        purpose: 'Melhoria da experiência do usuário',
        retentionPeriod: '2 anos'
      },
      {
        category: 'marketing',
        required: false,
        description: 'Cookies para personalização de marketing',
        cookies: ['_fbp', 'marketing_prefs'],
        purpose: 'Comunicações personalizadas',
        retentionPeriod: '1 ano'
      },
      {
        category: 'functional',
        required: false,
        description: 'Cookies para funcionalidades avançadas',
        cookies: ['language_pref', 'theme_pref'],
        purpose: 'Personalização da interface',
        retentionPeriod: '1 ano'
      }
    ])

    // Argentina - PDPA requires consent for tracking cookies
    this.cookieConfigs.set('AR', [
      {
        category: 'essential',
        required: true,
        description: 'Cookies esenciales para el funcionamiento del sitio',
        cookies: ['session', 'csrf', 'auth'],
        purpose: 'Funcionalidad básica del sitio',
        retentionPeriod: 'Sesión'
      },
      {
        category: 'analytics',
        required: false,
        description: 'Cookies para análisis de uso',
        cookies: ['_ga', '_gid', 'umami'],
        purpose: 'Mejora de la experiencia',
        retentionPeriod: '2 años'
      },
      {
        category: 'marketing',
        required: false,
        description: 'Cookies para marketing personalizado',
        cookies: ['_fbp', 'marketing_prefs'],
        purpose: 'Comunicaciones comerciales',
        retentionPeriod: '2 años'
      }
    ])

    // Mexico - LFPDPPP requires consent for personal data processing
    this.cookieConfigs.set('MX', [
      {
        category: 'essential',
        required: true,
        description: 'Cookies esenciales para el funcionamiento',
        cookies: ['session', 'csrf', 'auth'],
        purpose: 'Operación del sitio web',
        retentionPeriod: 'Sesión'
      },
      {
        category: 'analytics',
        required: false,
        description: 'Cookies para análisis estadístico',
        cookies: ['_ga', '_gid', 'umami'],
        purpose: 'Análisis de uso y mejoras',
        retentionPeriod: '2 años'
      },
      {
        category: 'marketing',
        required: false,
        description: 'Cookies para fines mercadotécnicos',
        cookies: ['_fbp', 'marketing_prefs'],
        purpose: 'Publicidad personalizada',
        retentionPeriod: '2 años'
      }
    ])

    // Colombia - Law 1581 requires authorization for data processing
    this.cookieConfigs.set('CO', [
      {
        category: 'essential',
        required: true,
        description: 'Cookies esenciales para el funcionamiento',
        cookies: ['session', 'csrf', 'auth'],
        purpose: 'Funcionalidad básica',
        retentionPeriod: 'Sesión'
      },
      {
        category: 'analytics',
        required: false,
        description: 'Cookies para análisis de navegación',
        cookies: ['_ga', '_gid', 'umami'],
        purpose: 'Mejoramiento del servicio',
        retentionPeriod: '2 años'
      },
      {
        category: 'marketing',
        required: false,
        description: 'Cookies para comunicaciones comerciales',
        cookies: ['_fbp', 'marketing_prefs'],
        purpose: 'Marketing directo',
        retentionPeriod: '2 años'
      }
    ])

    // Default configuration for other countries
    const defaultConfig: CookieConsentConfig[] = [
      {
        category: 'essential',
        required: true,
        description: 'Cookies esenciales',
        cookies: ['session', 'csrf', 'auth'],
        purpose: 'Funcionalidad básica',
        retentionPeriod: 'Sesión'
      },
      {
        category: 'analytics',
        required: false,
        description: 'Cookies de análisis',
        cookies: ['_ga', '_gid', 'umami'],
        purpose: 'Análisis de uso',
        retentionPeriod: '2 años'
      }
    ]

    const otherCountries: CountryCode[] = ['CL', 'PE', 'EC', 'US', 'ES']
    otherCountries.forEach(country => {
      this.cookieConfigs.set(country, defaultConfig)
    })
  }

  /**
   * Initialize privacy notice configurations
   */
  private initializePrivacyNotices(): void {
    // Brazil - LGPD Privacy Notice
    this.privacyNotices.set('BR', {
      country: 'BR',
      title: 'Aviso de Privacidade - LGPD',
      language: 'pt-BR',
      version: '1.0',
      lastUpdated: new Date(),
      sections: [
        {
          id: 'controller',
          title: 'Controlador de Dados',
          content: 'Somos o controlador dos seus dados pessoais conforme a LGPD.',
          required: true,
          order: 1
        },
        {
          id: 'data_collected',
          title: 'Dados Coletados',
          content: 'Coletamos dados de identificação, navegação e pagamento.',
          required: true,
          order: 2
        },
        {
          id: 'purpose',
          title: 'Finalidade do Tratamento',
          content: 'Seus dados são usados para prestação de serviços e comunicação.',
          required: true,
          order: 3
        },
        {
          id: 'legal_basis',
          title: 'Base Legal',
          content: 'Consentimento, execução de contrato e cumprimento legal.',
          required: true,
          order: 4
        },
        {
          id: 'rights',
          title: 'Seus Direitos',
          content: 'Você pode acessar, corrigir, excluir e portar seus dados.',
          required: true,
          order: 5
        },
        {
          id: 'contact',
          title: 'Contato',
          content: 'Entre em contato conosco em dpo@empresa.com',
          required: true,
          order: 6
        }
      ]
    })

    // Mexico - LFPDPPP Privacy Notice
    this.privacyNotices.set('MX', {
      country: 'MX',
      title: 'Aviso de Privacidad - LFPDPPP',
      language: 'es-MX',
      version: '1.0',
      lastUpdated: new Date(),
      sections: [
        {
          id: 'responsible',
          title: 'Responsable',
          content: 'Somos responsables del tratamiento de sus datos personales.',
          required: true,
          order: 1
        },
        {
          id: 'data_collected',
          title: 'Datos Recabados',
          content: 'Recabamos datos de identificación y contacto.',
          required: true,
          order: 2
        },
        {
          id: 'purposes',
          title: 'Finalidades',
          content: 'Sus datos se usan para prestación de servicios y marketing.',
          required: true,
          order: 3
        },
        {
          id: 'arco_rights',
          title: 'Derechos ARCO',
          content: 'Puede acceder, rectificar, cancelar u oponerse al tratamiento.',
          required: true,
          order: 4
        },
        {
          id: 'contact',
          title: 'Contacto',
          content: 'Contacte datos.personales@empresa.com para ejercer derechos.',
          required: true,
          order: 5
        }
      ]
    })

    // Add other countries with basic privacy notices
    const otherCountries: CountryCode[] = ['AR', 'CO', 'CL', 'PE', 'EC']
    otherCountries.forEach(country => {
      this.privacyNotices.set(country, {
        country,
        title: 'Política de Privacidad',
        language: `es-${country}`,
        version: '1.0',
        lastUpdated: new Date(),
        sections: [
          {
            id: 'controller',
            title: 'Responsable',
            content: 'Somos responsables del tratamiento de datos personales.',
            required: true,
            order: 1
          },
          {
            id: 'data',
            title: 'Datos Tratados',
            content: 'Tratamos datos de identificación y contacto.',
            required: true,
            order: 2
          },
          {
            id: 'rights',
            title: 'Sus Derechos',
            content: 'Puede ejercer derechos sobre sus datos personales.',
            required: true,
            order: 3
          }
        ]
      })
    })
  }

  /**
   * Initialize data retention policies per country
   */
  private initializeRetentionPolicies(): void {
    // Brazil - LGPD retention policies
    this.retentionPolicies.set('BR', [
      {
        dataType: 'personal_data',
        retentionPeriod: '2 anos',
        deletionSchedule: 'automatic',
        legalBasis: 'Art. 16 LGPD',
        country: 'BR'
      },
      {
        dataType: 'marketing_data',
        retentionPeriod: '2 anos',
        deletionSchedule: 'automatic',
        legalBasis: 'Art. 16 LGPD',
        country: 'BR'
      },
      {
        dataType: 'analytics_data',
        retentionPeriod: '2 anos',
        deletionSchedule: 'automatic',
        legalBasis: 'Art. 16 LGPD',
        country: 'BR'
      }
    ])

    // Mexico - LFPDPPP retention policies
    this.retentionPolicies.set('MX', [
      {
        dataType: 'personal_data',
        retentionPeriod: '5 años',
        deletionSchedule: 'manual',
        legalBasis: 'Art. 11 LFPDPPP',
        country: 'MX'
      },
      {
        dataType: 'marketing_data',
        retentionPeriod: '2 años',
        deletionSchedule: 'automatic',
        legalBasis: 'Art. 8 LFPDPPP',
        country: 'MX'
      }
    ])

    // Colombia - Law 1581 retention policies
    this.retentionPolicies.set('CO', [
      {
        dataType: 'personal_data',
        retentionPeriod: '10 años',
        deletionSchedule: 'manual',
        legalBasis: 'Art. 11 Ley 1581',
        country: 'CO'
      },
      {
        dataType: 'marketing_data',
        retentionPeriod: '2 años',
        deletionSchedule: 'automatic',
        legalBasis: 'Art. 6 Ley 1581',
        country: 'CO'
      }
    ])

    // Default retention policies for other countries
    const defaultPolicies: DataRetentionPolicy[] = [
      {
        dataType: 'personal_data',
        retentionPeriod: '2 años',
        deletionSchedule: 'manual',
        legalBasis: 'Regulaciones locales',
        country: 'AR' // Will be overridden
      }
    ]

    const otherCountries: CountryCode[] = ['AR', 'CL', 'PE', 'EC']
    otherCountries.forEach(country => {
      this.retentionPolicies.set(country, defaultPolicies.map(policy => ({
        ...policy,
        country
      })))
    })
  }

  /**
   * Get consent requirements for a specific country
   */
  public getConsentRequirements(country: CountryCode): ConsentRequirement[] {
    return legalComplianceManager.getRequiredConsents(country)
  }

  /**
   * Get cookie consent configuration for a country
   */
  public getCookieConsentConfig(country: CountryCode): CookieConsentConfig[] {
    return this.cookieConfigs.get(country) || this.cookieConfigs.get('US') || []
  }

  /**
   * Generate dynamic privacy notice for a country
   */
  public generatePrivacyNotice(country: CountryCode): PrivacyNoticeConfig | null {
    return this.privacyNotices.get(country) || null
  }

  /**
   * Get data retention policies for a country
   */
  public getDataRetentionPolicies(country: CountryCode): DataRetentionPolicy[] {
    return this.retentionPolicies.get(country) || []
  }

  /**
   * Record user consent
   */
  public recordConsent(consentState: ConsentState): void {
    const key = consentState.userId || `anonymous_${Date.now()}`
    this.consentStorage.set(key, consentState)

    // Track individual consent records
    Object.entries(consentState.consents).forEach(([type, status]) => {
      if (status === 'granted') {
        const record: ConsentRecord = {
          userId: consentState.userId || key,
          consentType: type as ConsentType,
          granted: true,
          timestamp: consentState.timestamp,
          ipAddress: consentState.ipAddress || '',
          userAgent: consentState.userAgent || '',
          version: consentState.version
        }
        legalComplianceManager.trackConsent(record)
      }
    })
  }

  /**
   * Get current consent state for a user
   */
  public getConsentState(userId: string): ConsentState | null {
    return this.consentStorage.get(userId) || null
  }

  /**
   * Check if consent is required for a specific action
   */
  public isConsentRequired(country: CountryCode, consentType: ConsentType): boolean {
    const requirements = this.getConsentRequirements(country)
    const requirement = requirements.find(req => req.type === consentType)
    return requirement?.required || false
  }

  /**
   * Validate consent state against country requirements
   */
  public validateConsent(consentState: ConsentState): { valid: boolean; missing: ConsentType[] } {
    const requirements = this.getConsentRequirements(consentState.country)
    const missing: ConsentType[] = []

    requirements.forEach(requirement => {
      if (requirement.required) {
        const status = consentState.consents[requirement.type]
        if (status !== 'granted') {
          missing.push(requirement.type)
        }
      }
    })

    return {
      valid: missing.length === 0,
      missing
    }
  }

  /**
   * Check if data should be deleted based on retention policies
   */
  public shouldDeleteData(country: CountryCode, dataType: string, dataAge: Date): boolean {
    const policies = this.getDataRetentionPolicies(country)
    const policy = policies.find(p => p.dataType === dataType)
    
    if (!policy) return false

    const now = new Date()
    const ageInYears = (now.getTime() - dataAge.getTime()) / (1000 * 60 * 60 * 24 * 365)

    // Parse retention period
    const periodMatch = policy.retentionPeriod.match(/(\d+)\s*(año|anos|year|years)/i)
    if (periodMatch) {
      const years = parseInt(periodMatch[1])
      return ageInYears > years
    }

    return false
  }

  /**
   * Get cookies that require consent for a country
   */
  public getCookiesRequiringConsent(country: CountryCode): string[] {
    const configs = this.getCookieConsentConfig(country)
    return configs
      .filter(config => !config.required)
      .flatMap(config => config.cookies)
  }

  /**
   * Check if a specific cookie requires consent
   */
  public doesCookieRequireConsent(country: CountryCode, cookieName: string): boolean {
    const cookiesRequiringConsent = this.getCookiesRequiringConsent(country)
    return cookiesRequiringConsent.includes(cookieName)
  }

  /**
   * Get consent banner configuration for a country
   */
  public getConsentBannerConfig(country: CountryCode): {
    title: string
    description: string
    acceptAllText: string
    rejectAllText: string
    customizeText: string
    essentialOnlyText: string
  } {
    const configs = {
      'BR': {
        title: 'Configurações de Cookies',
        description: 'Usamos cookies para melhorar sua experiência. Alguns são essenciais para o funcionamento do site.',
        acceptAllText: 'Aceitar Todos',
        rejectAllText: 'Rejeitar Todos',
        customizeText: 'Personalizar',
        essentialOnlyText: 'Apenas Essenciais'
      },
      'MX': {
        title: 'Configuración de Cookies',
        description: 'Utilizamos cookies para mejorar su experiencia. Algunos son esenciales para el funcionamiento.',
        acceptAllText: 'Aceptar Todos',
        rejectAllText: 'Rechazar Todos',
        customizeText: 'Personalizar',
        essentialOnlyText: 'Solo Esenciales'
      },
      'AR': {
        title: 'Configuración de Cookies',
        description: 'Utilizamos cookies para mejorar su experiencia en nuestro sitio web.',
        acceptAllText: 'Aceptar Todos',
        rejectAllText: 'Rechazar Todos',
        customizeText: 'Personalizar',
        essentialOnlyText: 'Solo Esenciales'
      },
      'CO': {
        title: 'Configuración de Cookies',
        description: 'Usamos cookies para mejorar su experiencia y personalizar el contenido.',
        acceptAllText: 'Aceptar Todos',
        rejectAllText: 'Rechazar Todos',
        customizeText: 'Personalizar',
        essentialOnlyText: 'Solo Esenciales'
      }
    }

    return configs[country] || configs['MX'] // Default to Mexican Spanish
  }
}

// Export singleton instance
export const consentManagementService = new ConsentManagementService()