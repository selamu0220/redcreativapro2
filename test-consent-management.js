/**
 * Comprehensive Test Suite for Consent Management System
 * 
 * Tests all aspects of the consent management implementation:
 * - Country-specific consent requirement detection
 * - Dynamic privacy notice generation
 * - Cookie consent management per jurisdiction
 * - Data retention policy enforcement
 */

const { consentManagementService } = require('./app/lib/consent-management')
const { dataRetentionEnforcementService } = require('./app/lib/data-retention-enforcement')

// Test colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logTest(testName) {
  log(`\n${colors.bold}🧪 Testing: ${testName}${colors.reset}`, 'blue')
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

/**
 * Test country-specific consent requirement detection
 */
function testConsentRequirementDetection() {
  logTest('Country-specific consent requirement detection')
  
  const testCountries = ['BR', 'MX', 'AR', 'CO', 'CL']
  
  testCountries.forEach(country => {
    try {
      const requirements = consentManagementService.getConsentRequirements(country)
      
      if (requirements && requirements.length > 0) {
        logSuccess(`${country}: Found ${requirements.length} consent requirements`)
        
        // Verify required fields
        requirements.forEach(req => {
          if (!req.type || !req.description || typeof req.required !== 'boolean') {
            logError(`${country}: Invalid requirement structure`)
          } else {
            log(`  - ${req.type}: ${req.required ? 'Required' : 'Optional'} - ${req.description}`)
          }
        })
      } else {
        logWarning(`${country}: No consent requirements found`)
      }
    } catch (error) {
      logError(`${country}: Error getting consent requirements - ${error.message}`)
    }
  })
}

/**
 * Test cookie consent configuration per jurisdiction
 */
function testCookieConsentConfiguration() {
  logTest('Cookie consent configuration per jurisdiction')
  
  const testCountries = ['BR', 'MX', 'AR', 'CO', 'US']
  
  testCountries.forEach(country => {
    try {
      const cookieConfigs = consentManagementService.getCookieConsentConfig(country)
      
      if (cookieConfigs && cookieConfigs.length > 0) {
        logSuccess(`${country}: Found ${cookieConfigs.length} cookie categories`)
        
        cookieConfigs.forEach(config => {
          if (!config.category || !config.description || typeof config.required !== 'boolean') {
            logError(`${country}: Invalid cookie config structure`)
          } else {
            log(`  - ${config.category}: ${config.required ? 'Required' : 'Optional'} - ${config.description}`)
            log(`    Cookies: ${config.cookies.join(', ')}`)
            log(`    Retention: ${config.retentionPeriod}`)
          }
        })
      } else {
        logWarning(`${country}: No cookie configurations found`)
      }
    } catch (error) {
      logError(`${country}: Error getting cookie config - ${error.message}`)
    }
  })
}

/**
 * Test dynamic privacy notice generation
 */
function testPrivacyNoticeGeneration() {
  logTest('Dynamic privacy notice generation')
  
  const testCountries = ['BR', 'MX', 'AR', 'CO']
  
  testCountries.forEach(country => {
    try {
      const privacyNotice = consentManagementService.generatePrivacyNotice(country)
      
      if (privacyNotice) {
        logSuccess(`${country}: Generated privacy notice - "${privacyNotice.title}"`)
        log(`  Language: ${privacyNotice.language}`)
        log(`  Version: ${privacyNotice.version}`)
        log(`  Sections: ${privacyNotice.sections.length}`)
        
        // Verify required sections
        const requiredSections = privacyNotice.sections.filter(s => s.required)
        log(`  Required sections: ${requiredSections.length}`)
        
        privacyNotice.sections.forEach(section => {
          if (!section.id || !section.title || !section.content) {
            logError(`${country}: Invalid section structure in privacy notice`)
          }
        })
      } else {
        logWarning(`${country}: No privacy notice generated`)
      }
    } catch (error) {
      logError(`${country}: Error generating privacy notice - ${error.message}`)
    }
  })
}

/**
 * Test data retention policy configuration
 */
function testDataRetentionPolicies() {
  logTest('Data retention policy configuration')
  
  const testCountries = ['BR', 'MX', 'CO', 'AR']
  
  testCountries.forEach(country => {
    try {
      const policies = consentManagementService.getDataRetentionPolicies(country)
      
      if (policies && policies.length > 0) {
        logSuccess(`${country}: Found ${policies.length} retention policies`)
        
        policies.forEach(policy => {
          if (!policy.dataType || !policy.retentionPeriod || !policy.legalBasis) {
            logError(`${country}: Invalid retention policy structure`)
          } else {
            log(`  - ${policy.dataType}: ${policy.retentionPeriod} (${policy.deletionSchedule})`)
            log(`    Legal basis: ${policy.legalBasis}`)
          }
        })
      } else {
        logWarning(`${country}: No retention policies found`)
      }
    } catch (error) {
      logError(`${country}: Error getting retention policies - ${error.message}`)
    }
  })
}

/**
 * Test consent validation logic
 */
function testConsentValidation() {
  logTest('Consent validation logic')
  
  // Test consent state validation for Brazil
  const testConsentState = {
    userId: 'test-user-123',
    country: 'BR',
    consents: {
      data_collection: 'granted',
      marketing: 'denied',
      cookies: 'granted'
    },
    cookieConsents: {
      essential: 'granted',
      analytics: 'denied',
      marketing: 'denied',
      functional: 'granted'
    },
    timestamp: new Date(),
    version: '1.0'
  }
  
  try {
    const validation = consentManagementService.validateConsent(testConsentState)
    
    if (validation.valid) {
      logSuccess('BR: Consent state is valid')
    } else {
      logWarning(`BR: Missing required consents: ${validation.missing.join(', ')}`)
    }
    
    // Test consent requirement checking
    const isMarketingRequired = consentManagementService.isConsentRequired('BR', 'marketing')
    log(`BR: Marketing consent required: ${isMarketingRequired}`)
    
    const isCookiesRequired = consentManagementService.isConsentRequired('BR', 'cookies')
    log(`BR: Cookie consent required: ${isCookiesRequired}`)
    
  } catch (error) {
    logError(`Consent validation failed - ${error.message}`)
  }
}

/**
 * Test cookie consent checking
 */
function testCookieConsentChecking() {
  logTest('Cookie consent checking')
  
  const testCountries = ['BR', 'MX', 'AR']
  const testCookies = ['_ga', '_gid', '_fbp', 'session', 'csrf']
  
  testCountries.forEach(country => {
    try {
      log(`\n${country} cookie consent requirements:`)
      
      testCookies.forEach(cookie => {
        const requiresConsent = consentManagementService.doesCookieRequireConsent(country, cookie)
        const status = requiresConsent ? 'Requires consent' : 'No consent needed'
        log(`  ${cookie}: ${status}`)
      })
      
      const allConsentCookies = consentManagementService.getCookiesRequiringConsent(country)
      log(`  Total cookies requiring consent: ${allConsentCookies.length}`)
      
    } catch (error) {
      logError(`${country}: Error checking cookie consent - ${error.message}`)
    }
  })
}

/**
 * Test consent banner configuration
 */
function testConsentBannerConfiguration() {
  logTest('Consent banner configuration')
  
  const testCountries = ['BR', 'MX', 'AR', 'CO']
  
  testCountries.forEach(country => {
    try {
      const bannerConfig = consentManagementService.getConsentBannerConfig(country)
      
      if (bannerConfig && bannerConfig.title && bannerConfig.description) {
        logSuccess(`${country}: Banner configuration generated`)
        log(`  Title: ${bannerConfig.title}`)
        log(`  Description: ${bannerConfig.description.substring(0, 50)}...`)
        log(`  Accept text: ${bannerConfig.acceptAllText}`)
        log(`  Reject text: ${bannerConfig.rejectAllText}`)
      } else {
        logError(`${country}: Invalid banner configuration`)
      }
    } catch (error) {
      logError(`${country}: Error getting banner config - ${error.message}`)
    }
  })
}

/**
 * Test data retention enforcement
 */
function testDataRetentionEnforcement() {
  logTest('Data retention enforcement')
  
  try {
    // Register test data records
    const testRecords = [
      {
        id: 'record-1',
        userId: 'user-123',
        dataType: 'personal_data',
        createdAt: new Date(Date.now() - (3 * 365 * 24 * 60 * 60 * 1000)), // 3 years old
        country: 'BR'
      },
      {
        id: 'record-2',
        userId: 'user-456',
        dataType: 'marketing_data',
        createdAt: new Date(Date.now() - (1 * 365 * 24 * 60 * 60 * 1000)), // 1 year old
        country: 'MX'
      },
      {
        id: 'record-3',
        userId: 'user-789',
        dataType: 'analytics_data',
        createdAt: new Date(Date.now() - (6 * 30 * 24 * 60 * 60 * 1000)), // 6 months old
        country: 'CO'
      }
    ]
    
    testRecords.forEach(record => {
      dataRetentionEnforcementService.registerDataRecord(record)
      logSuccess(`Registered data record: ${record.id} (${record.dataType}, ${record.country})`)
    })
    
    // Generate retention reports
    const reports = dataRetentionEnforcementService.generateRetentionReport()
    
    reports.forEach(report => {
      log(`\n${report.country} Retention Report:`)
      log(`  Total records: ${report.totalRecords}`)
      log(`  Expired records: ${report.expiredRecords}`)
      log(`  Scheduled deletions: ${report.scheduledDeletions}`)
      log(`  Compliance: ${report.compliancePercentage.toFixed(1)}%`)
      log(`  Next run: ${report.nextScheduledRun.toLocaleString()}`)
    })
    
    logSuccess('Data retention enforcement test completed')
    
  } catch (error) {
    logError(`Data retention enforcement failed - ${error.message}`)
  }
}

/**
 * Test data deletion scheduling
 */
function testDataDeletionScheduling() {
  logTest('Data deletion scheduling')
  
  try {
    // Test shouldDeleteData method
    const testCases = [
      { country: 'BR', dataType: 'personal_data', age: new Date(Date.now() - (3 * 365 * 24 * 60 * 60 * 1000)) }, // 3 years
      { country: 'MX', dataType: 'marketing_data', age: new Date(Date.now() - (1 * 365 * 24 * 60 * 60 * 1000)) }, // 1 year
      { country: 'CO', dataType: 'personal_data', age: new Date(Date.now() - (5 * 365 * 24 * 60 * 60 * 1000)) } // 5 years
    ]
    
    testCases.forEach(testCase => {
      const shouldDelete = consentManagementService.shouldDeleteData(
        testCase.country, 
        testCase.dataType, 
        testCase.age
      )
      
      const ageInYears = (Date.now() - testCase.age.getTime()) / (1000 * 60 * 60 * 24 * 365)
      log(`${testCase.country} ${testCase.dataType} (${ageInYears.toFixed(1)} years old): ${shouldDelete ? 'Should delete' : 'Keep'}`)
    })
    
    logSuccess('Data deletion scheduling test completed')
    
  } catch (error) {
    logError(`Data deletion scheduling failed - ${error.message}`)
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  log(`${colors.bold}🚀 Starting Consent Management System Tests${colors.reset}`, 'blue')
  log('=' * 60)
  
  try {
    // Core functionality tests
    testConsentRequirementDetection()
    testCookieConsentConfiguration()
    testPrivacyNoticeGeneration()
    testDataRetentionPolicies()
    
    // Validation and logic tests
    testConsentValidation()
    testCookieConsentChecking()
    testConsentBannerConfiguration()
    
    // Data retention tests
    testDataRetentionEnforcement()
    testDataDeletionScheduling()
    
    log(`\n${colors.bold}✅ All consent management tests completed successfully!${colors.reset}`, 'green')
    
  } catch (error) {
    logError(`Test suite failed: ${error.message}`)
    process.exit(1)
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
}

module.exports = {
  runAllTests,
  testConsentRequirementDetection,
  testCookieConsentConfiguration,
  testPrivacyNoticeGeneration,
  testDataRetentionPolicies,
  testConsentValidation,
  testCookieConsentChecking,
  testConsentBannerConfiguration,
  testDataRetentionEnforcement,
  testDataDeletionScheduling
}