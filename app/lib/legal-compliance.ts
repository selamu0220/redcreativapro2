/**
 * Legal Compliance Manager for Latin American Markets
 * 
 * Handles country-specific legal compliance requirements including:
 * - LGPD (Brazil)
 * - PDPA (Argentina) 
 * - LFPDPPP (Mexico)
 * - Law 1581 (Colombia)
 * - General data protection and e-commerce compliance
 */

export type CountryCode = 'BR' | 'AR' | 'MX' | 'CO' | 'CL' | 'PE' | 'EC' | 'US' | 'ES' | 'UNKNOWN';
export type ConsentType = 'data_collection' | 'marketing' | 'cookies' | 'analytics' | 'third_party_sharing';
export type DataRetentionPeriod = '1_year' | '2_years' | '5_years' | '10_years' | 'indefinite';
export type UserRightType = 'access' | 'rectification' | 'deletion' | 'portability' | 'objection' | 'restriction';

export interface ConsentRequirement {
  type: ConsentType;
  required: boolean;
  description: string;
  legalBasis: string;
  retentionPeriod: DataRetentionPeriod;
}

export interface LegalDocument {
  type: 'privacy_policy' | 'terms_of_service' | 'cookie_policy' | 'data_processing_notice';
  title: string;
  content: string;
  lastUpdated: Date;
  version: string;
  language: string;
}

export interface UserRight {
  type: UserRightType;
  description: string;
  processTimeLimit: string;
  contactMethod: string;
}

export interface ComplianceRule {
  countryCode: CountryCode;
  lawName: string;
  consentRequirements: ConsentRequirement[];
  userRights: UserRight[];
  dataRetentionRules: DataRetentionRule[];
  privacyNoticeRequirements: PrivacyNoticeRequirement[];
}

export interface DataRetentionRule {
  dataType: string;
  retentionPeriod: DataRetentionPeriod;
  deletionMethod: 'automatic' | 'manual' | 'anonymization';
  legalBasis: string;
}

export interface PrivacyNoticeRequirement {
  element: string;
  required: boolean;
  description: string;
}

export interface ConsentRecord {
  userId: string;
  consentType: ConsentType;
  granted: boolean;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  version: string;
}

export interface ValidationResult {
  isCompliant: boolean;
  violations: string[];
  recommendations: string[];
}

/**
 * Legal Compliance Manager
 * Manages country-specific legal compliance requirements for Latin American markets
 */
export class LegalComplianceManager {
  private complianceRules: Map<CountryCode, ComplianceRule>;
  private documentTemplates: Map<string, LegalDocument>;

  constructor() {
    this.complianceRules = new Map();
    this.documentTemplates = new Map();
    this.initializeComplianceRules();
    this.initializeDocumentTemplates();
  }

  /**
   * Initialize compliance rules for each supported country
   */
  private initializeComplianceRules(): void {
    // Brazil - LGPD (Lei Geral de Proteção de Dados)
    this.complianceRules.set('BR', {
      countryCode: 'BR',
      lawName: 'LGPD - Lei Geral de Proteção de Dados',
      consentRequirements: [
        {
          type: 'data_collection',
          required: true,
          description: 'Consentimento explícito para coleta de dados pessoais',
          legalBasis: 'Art. 7º, I da LGPD',
          retentionPeriod: '2_years'
        },
        {
          type: 'marketing',
          required: true,
          description: 'Consentimento específico para comunicações de marketing',
          legalBasis: 'Art. 7º, I da LGPD',
          retentionPeriod: '2_years'
        },
        {
          type: 'cookies',
          required: true,
          description: 'Consentimento para uso de cookies não essenciais',
          legalBasis: 'Art. 7º, I da LGPD',
          retentionPeriod: '1_year'
        }
      ],
      userRights: [
        {
          type: 'access',
          description: 'Direito de acesso aos dados pessoais',
          processTimeLimit: '15 dias',
          contactMethod: 'dpo@empresa.com'
        },
        {
          type: 'rectification',
          description: 'Direito de correção de dados incompletos ou inexatos',
          processTimeLimit: '15 dias',
          contactMethod: 'dpo@empresa.com'
        },
        {
          type: 'deletion',
          description: 'Direito de eliminação dos dados pessoais',
          processTimeLimit: '15 dias',
          contactMethod: 'dpo@empresa.com'
        },
        {
          type: 'portability',
          description: 'Direito de portabilidade dos dados',
          processTimeLimit: '15 dias',
          contactMethod: 'dpo@empresa.com'
        }
      ],
      dataRetentionRules: [
        {
          dataType: 'personal_data',
          retentionPeriod: '2_years',
          deletionMethod: 'automatic',
          legalBasis: 'Art. 16 da LGPD'
        },
        {
          dataType: 'marketing_data',
          retentionPeriod: '2_years',
          deletionMethod: 'automatic',
          legalBasis: 'Art. 16 da LGPD'
        }
      ],
      privacyNoticeRequirements: [
        {
          element: 'data_controller_identity',
          required: true,
          description: 'Identidade do controlador de dados'
        },
        {
          element: 'processing_purpose',
          required: true,
          description: 'Finalidade do tratamento'
        },
        {
          element: 'legal_basis',
          required: true,
          description: 'Base legal para o tratamento'
        },
        {
          element: 'data_sharing',
          required: true,
          description: 'Compartilhamento de dados com terceiros'
        }
      ]
    });

    // Argentina - PDPA (Personal Data Protection Act)
    this.complianceRules.set('AR', {
      countryCode: 'AR',
      lawName: 'PDPA - Ley de Protección de Datos Personales',
      consentRequirements: [
        {
          type: 'data_collection',
          required: true,
          description: 'Consentimiento informado para recolección de datos',
          legalBasis: 'Art. 5 Ley 25.326',
          retentionPeriod: '2_years'
        },
        {
          type: 'marketing',
          required: true,
          description: 'Consentimiento para comunicaciones comerciales',
          legalBasis: 'Art. 27 Ley 25.326',
          retentionPeriod: '2_years'
        }
      ],
      userRights: [
        {
          type: 'access',
          description: 'Derecho de acceso a la información',
          processTimeLimit: '10 días hábiles',
          contactMethod: 'privacidad@empresa.com'
        },
        {
          type: 'rectification',
          description: 'Derecho de rectificación de datos',
          processTimeLimit: '5 días hábiles',
          contactMethod: 'privacidad@empresa.com'
        },
        {
          type: 'deletion',
          description: 'Derecho de supresión de datos',
          processTimeLimit: '10 días hábiles',
          contactMethod: 'privacidad@empresa.com'
        }
      ],
      dataRetentionRules: [
        {
          dataType: 'personal_data',
          retentionPeriod: '2_years',
          deletionMethod: 'manual',
          legalBasis: 'Art. 4 Ley 25.326'
        }
      ],
      privacyNoticeRequirements: [
        {
          element: 'data_controller_identity',
          required: true,
          description: 'Identidad del responsable del archivo'
        },
        {
          element: 'processing_purpose',
          required: true,
          description: 'Finalidad del tratamiento'
        }
      ]
    });

    // Mexico - LFPDPPP (Ley Federal de Protección de Datos Personales en Posesión de los Particulares)
    this.complianceRules.set('MX', {
      countryCode: 'MX',
      lawName: 'LFPDPPP - Ley Federal de Protección de Datos Personales',
      consentRequirements: [
        {
          type: 'data_collection',
          required: true,
          description: 'Consentimiento expreso para datos personales',
          legalBasis: 'Art. 8 LFPDPPP',
          retentionPeriod: '5_years'
        },
        {
          type: 'marketing',
          required: true,
          description: 'Consentimiento para fines mercadotécnicos',
          legalBasis: 'Art. 8 LFPDPPP',
          retentionPeriod: '2_years'
        }
      ],
      userRights: [
        {
          type: 'access',
          description: 'Derecho de acceso (ARCO)',
          processTimeLimit: '20 días hábiles',
          contactMethod: 'datos.personales@empresa.com'
        },
        {
          type: 'rectification',
          description: 'Derecho de rectificación (ARCO)',
          processTimeLimit: '15 días hábiles',
          contactMethod: 'datos.personales@empresa.com'
        },
        {
          type: 'deletion',
          description: 'Derecho de cancelación (ARCO)',
          processTimeLimit: '15 días hábiles',
          contactMethod: 'datos.personales@empresa.com'
        },
        {
          type: 'objection',
          description: 'Derecho de oposición (ARCO)',
          processTimeLimit: '15 días hábiles',
          contactMethod: 'datos.personales@empresa.com'
        }
      ],
      dataRetentionRules: [
        {
          dataType: 'personal_data',
          retentionPeriod: '5_years',
          deletionMethod: 'manual',
          legalBasis: 'Art. 11 LFPDPPP'
        }
      ],
      privacyNoticeRequirements: [
        {
          element: 'data_controller_identity',
          required: true,
          description: 'Identidad del responsable'
        },
        {
          element: 'processing_purpose',
          required: true,
          description: 'Finalidades del tratamiento'
        },
        {
          element: 'transfer_information',
          required: true,
          description: 'Transferencias de datos'
        }
      ]
    });

    // Colombia - Law 1581 of 2012
    this.complianceRules.set('CO', {
      countryCode: 'CO',
      lawName: 'Ley 1581 de 2012 - Protección de Datos Personales',
      consentRequirements: [
        {
          type: 'data_collection',
          required: true,
          description: 'Autorización previa e informada',
          legalBasis: 'Art. 9 Ley 1581',
          retentionPeriod: '10_years'
        },
        {
          type: 'marketing',
          required: true,
          description: 'Autorización para finalidades comerciales',
          legalBasis: 'Art. 6 Ley 1581',
          retentionPeriod: '2_years'
        }
      ],
      userRights: [
        {
          type: 'access',
          description: 'Derecho de acceso',
          processTimeLimit: '10 días hábiles',
          contactMethod: 'habeasdata@empresa.com'
        },
        {
          type: 'rectification',
          description: 'Derecho de actualización',
          processTimeLimit: '5 días hábiles',
          contactMethod: 'habeasdata@empresa.com'
        },
        {
          type: 'deletion',
          description: 'Derecho de supresión',
          processTimeLimit: '15 días hábiles',
          contactMethod: 'habeasdata@empresa.com'
        }
      ],
      dataRetentionRules: [
        {
          dataType: 'personal_data',
          retentionPeriod: '10_years',
          deletionMethod: 'manual',
          legalBasis: 'Art. 11 Ley 1581'
        }
      ],
      privacyNoticeRequirements: [
        {
          element: 'data_controller_identity',
          required: true,
          description: 'Identidad del responsable'
        },
        {
          element: 'processing_purpose',
          required: true,
          description: 'Finalidad del tratamiento'
        }
      ]
    });

    // Add other countries with basic compliance
    const basicCountries: CountryCode[] = ['CL', 'PE', 'EC'];
    basicCountries.forEach(country => {
      this.complianceRules.set(country, {
        countryCode: country,
        lawName: 'General Data Protection Regulations',
        consentRequirements: [
          {
            type: 'data_collection',
            required: true,
            description: 'Consentimiento para recolección de datos',
            legalBasis: 'Regulaciones locales de protección de datos',
            retentionPeriod: '2_years'
          }
        ],
        userRights: [
          {
            type: 'access',
            description: 'Derecho de acceso a datos personales',
            processTimeLimit: '30 días',
            contactMethod: 'privacidad@empresa.com'
          }
        ],
        dataRetentionRules: [
          {
            dataType: 'personal_data',
            retentionPeriod: '2_years',
            deletionMethod: 'manual',
            legalBasis: 'Regulaciones locales'
          }
        ],
        privacyNoticeRequirements: [
          {
            element: 'data_controller_identity',
            required: true,
            description: 'Identidad del responsable'
          }
        ]
      });
    });
  }

  /**
   * Initialize legal document templates
   */
  private initializeDocumentTemplates(): void {
    // Privacy Policy Templates
    this.documentTemplates.set('privacy_policy_BR', {
      type: 'privacy_policy',
      title: 'Política de Privacidade',
      content: this.getBrazilPrivacyPolicyTemplate(),
      lastUpdated: new Date(),
      version: '1.0',
      language: 'pt-BR'
    });

    this.documentTemplates.set('privacy_policy_AR', {
      type: 'privacy_policy',
      title: 'Política de Privacidad',
      content: this.getArgentinaPrivacyPolicyTemplate(),
      lastUpdated: new Date(),
      version: '1.0',
      language: 'es-AR'
    });

    this.documentTemplates.set('privacy_policy_MX', {
      type: 'privacy_policy',
      title: 'Aviso de Privacidad',
      content: this.getMexicoPrivacyPolicyTemplate(),
      lastUpdated: new Date(),
      version: '1.0',
      language: 'es-MX'
    });

    this.documentTemplates.set('privacy_policy_CO', {
      type: 'privacy_policy',
      title: 'Política de Tratamiento de Datos Personales',
      content: this.getColombiaPrivacyPolicyTemplate(),
      lastUpdated: new Date(),
      version: '1.0',
      language: 'es-CO'
    });
  }

  /**
   * Get required consents for a specific country
   */
  public getRequiredConsents(countryCode: CountryCode): ConsentRequirement[] {
    const rule = this.complianceRules.get(countryCode);
    return rule?.consentRequirements || [];
  }

  /**
   * Generate privacy notice for a specific country
   */
  public generatePrivacyNotice(countryCode: CountryCode): LegalDocument | null {
    const templateKey = `privacy_policy_${countryCode}`;
    return this.documentTemplates.get(templateKey) || null;
  }

  /**
   * Validate data collection compliance for a country
   */
  public validateDataCollection(userData: any, countryCode: CountryCode): ValidationResult {
    const rule = this.complianceRules.get(countryCode);
    if (!rule) {
      return {
        isCompliant: false,
        violations: ['Country not supported for compliance validation'],
        recommendations: ['Add compliance rules for this country']
      };
    }

    const violations: string[] = [];
    const recommendations: string[] = [];

    // Check consent requirements
    rule.consentRequirements.forEach(requirement => {
      if (requirement.required && !userData.consents?.[requirement.type]) {
        violations.push(`Missing required consent: ${requirement.description}`);
        recommendations.push(`Obtain ${requirement.type} consent before processing data`);
      }
    });

    // Check data retention compliance
    rule.dataRetentionRules.forEach(retentionRule => {
      if (userData.dataAge && this.isDataExpired(userData.dataAge, retentionRule.retentionPeriod)) {
        violations.push(`Data retention period exceeded for ${retentionRule.dataType}`);
        recommendations.push(`Delete or anonymize ${retentionRule.dataType} data`);
      }
    });

    return {
      isCompliant: violations.length === 0,
      violations,
      recommendations
    };
  }

  /**
   * Get user rights for a specific country
   */
  public getUserRights(countryCode: CountryCode): UserRight[] {
    const rule = this.complianceRules.get(countryCode);
    return rule?.userRights || [];
  }

  /**
   * Track consent record
   */
  public trackConsent(consentRecord: ConsentRecord): void {
    // In a real implementation, this would save to database
    console.log('Consent tracked:', consentRecord);
  }

  /**
   * Check if data has expired based on retention period
   */
  private isDataExpired(dataAge: Date, retentionPeriod: DataRetentionPeriod): boolean {
    const now = new Date();
    const ageInYears = (now.getTime() - dataAge.getTime()) / (1000 * 60 * 60 * 24 * 365);

    switch (retentionPeriod) {
      case '1_year':
        return ageInYears > 1;
      case '2_years':
        return ageInYears > 2;
      case '5_years':
        return ageInYears > 5;
      case '10_years':
        return ageInYears > 10;
      case 'indefinite':
        return false;
      default:
        return false;
    }
  }

  /**
   * Get compliance rule for a country
   */
  public getComplianceRule(countryCode: CountryCode): ComplianceRule | null {
    return this.complianceRules.get(countryCode) || null;
  }

  /**
   * Get all supported countries
   */
  public getSupportedCountries(): CountryCode[] {
    return Array.from(this.complianceRules.keys());
  }

  // Privacy Policy Templates
  private getBrazilPrivacyPolicyTemplate(): string {
    return `
# Política de Privacidade - LGPD

## 1. Identidade do Controlador
[Nome da Empresa] é o controlador dos seus dados pessoais, conforme definido na Lei Geral de Proteção de Dados (LGPD).

## 2. Dados Coletados
Coletamos os seguintes tipos de dados pessoais:
- Dados de identificação (nome, e-mail, telefone)
- Dados de navegação (cookies, logs de acesso)
- Dados de pagamento (informações de cartão, quando aplicável)

## 3. Finalidade do Tratamento
Seus dados são tratados para:
- Prestação de serviços contratados
- Comunicação sobre produtos e serviços
- Cumprimento de obrigações legais
- Melhoria da experiência do usuário

## 4. Base Legal
O tratamento dos seus dados tem como base legal:
- Consentimento (Art. 7º, I da LGPD)
- Execução de contrato (Art. 7º, V da LGPD)
- Cumprimento de obrigação legal (Art. 7º, II da LGPD)

## 5. Seus Direitos
Você tem direito a:
- Acessar seus dados pessoais
- Corrigir dados incompletos ou inexatos
- Solicitar a eliminação dos dados
- Solicitar a portabilidade dos dados
- Revogar o consentimento

## 6. Contato
Para exercer seus direitos ou esclarecer dúvidas: dpo@empresa.com

## 7. Retenção de Dados
Seus dados serão mantidos pelo período necessário para as finalidades descritas, respeitando os prazos legais.

Última atualização: ${new Date().toLocaleDateString('pt-BR')}
    `.trim();
  }

  private getArgentinaPrivacyPolicyTemplate(): string {
    return `
# Política de Privacidad - Ley 25.326

## 1. Responsable del Archivo
[Nombre de la Empresa] es responsable del archivo de datos personales, conforme a la Ley 25.326.

## 2. Datos Recolectados
Recolectamos los siguientes datos personales:
- Datos de identificación personal
- Información de contacto
- Datos de navegación

## 3. Finalidad
Los datos son utilizados para:
- Prestación de servicios
- Comunicaciones comerciales
- Cumplimiento de obligaciones legales

## 4. Derechos del Titular
Usted tiene derecho a:
- Acceder a sus datos personales
- Rectificar datos inexactos
- Suprimir datos cuando corresponda

## 5. Contacto
Para ejercer sus derechos: privacidad@empresa.com

Última actualización: ${new Date().toLocaleDateString('es-AR')}
    `.trim();
  }

  private getMexicoPrivacyPolicyTemplate(): string {
    return `
# Aviso de Privacidad - LFPDPPP

## 1. Responsable
[Nombre de la Empresa] es responsable del tratamiento de sus datos personales.

## 2. Datos Personales Recabados
Recabamos los siguientes datos personales:
- Datos de identificación
- Datos de contacto
- Datos patrimoniales (cuando aplique)

## 3. Finalidades
Sus datos personales serán utilizados para:
- Prestación de servicios contratados
- Mercadotecnia y publicidad
- Cumplimiento de obligaciones

## 4. Derechos ARCO
Usted tiene derecho a:
- Acceder a sus datos personales
- Rectificar datos inexactos
- Cancelar el tratamiento
- Oponerse al tratamiento

## 5. Contacto
Para ejercer sus derechos ARCO: datos.personales@empresa.com

Última actualización: ${new Date().toLocaleDateString('es-MX')}
    `.trim();
  }

  private getColombiaPrivacyPolicyTemplate(): string {
    return `
# Política de Tratamiento de Datos Personales - Ley 1581

## 1. Responsable del Tratamiento
[Nombre de la Empresa] es responsable del tratamiento de datos personales.

## 2. Datos Tratados
Tratamos los siguientes datos personales:
- Datos de identificación
- Información de contacto
- Datos de navegación

## 3. Finalidad del Tratamiento
Los datos son tratados para:
- Prestación de servicios
- Comunicaciones comerciales
- Cumplimiento legal

## 4. Derechos del Titular
Usted tiene derecho a:
- Conocer sus datos personales
- Actualizar y rectificar datos
- Suprimir datos cuando proceda

## 5. Contacto
Para ejercer sus derechos: habeasdata@empresa.com

Última actualización: ${new Date().toLocaleDateString('es-CO')}
    `.trim();
  }
}

// Export singleton instance
export const legalComplianceManager = new LegalComplianceManager();
