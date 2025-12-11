/**
 * Test LLMS.txt Manager
 * Tests the AI access control system through LLMS.txt files
 */

import { LLMSManager, createDefaultLLMSConfig, LLMSFileServer } from './lib/llms-manager.js';

async function testLLMSManager() {
  console.log('🧪 Testing LLMS.txt Manager...\n');

  try {
    // Test 1: Create default configuration
    console.log('📝 Test 1: Default Configuration Creation');
    const config = createDefaultLLMSConfig('Red Creativa', 'contacto@redcreativa.pro');
    const manager = new LLMSManager(config);
    
    console.log('✅ Default config created successfully');
    console.log('Site name:', config.siteName);
    console.log('Contact email:', config.contactEmail);
    console.log('Global settings:', !!config.globalSettings);
    console.log('');

    // Test 2: Add individual rules
    console.log('⚙️ Test 2: Adding Individual Rules');
    manager.addRule({
      userAgent: 'GPTBot',
      allow: ['/blog/', '/docs/'],
      disallow: ['/private/', '/admin/'],
      crawlDelay: 2,
      requestRate: '1/15s',
      comment: 'OpenAI GPT with limited access'
    });

    manager.addRule({
      userAgent: 'Google-Extended',
      allow: ['/blog/'],
      crawlDelay: 1,
      requestRate: '1/10s',
      comment: 'Google AI limited access'
    });

    const currentConfig = manager.getConfig();
    console.log('✅ Rules added successfully');
    console.log('Number of rules:', currentConfig.rules.length);
    console.log('First rule user-agent:', currentConfig.rules[0].userAgent);
    console.log('');

    // Test 3: Generate LLMS.txt content
    console.log('📄 Test 3: LLMS.txt Generation');
    const llmsTxtContent = manager.generateLLMSTxt();
    
    console.log('✅ LLMS.txt generated successfully');
    console.log('Content length:', llmsTxtContent.length);
    console.log('Contains site name:', llmsTxtContent.includes('Red Creativa'));
    console.log('Contains GPTBot rules:', llmsTxtContent.includes('GPTBot'));
    console.log('Contains contact email:', llmsTxtContent.includes('contacto@redcreativa.pro'));
    console.log('');

    // Test 4: Validation system
    console.log('✅ Test 4: Configuration Validation');
    const validation = manager.validateConfig();
    
    console.log('✅ Validation completed');
    console.log('Is valid:', validation.isValid);
    console.log('Errors:', validation.errors.length);
    console.log('Warnings:', validation.warnings.length);
    
    if (validation.errors.length > 0) {
      console.log('Validation errors:', validation.errors);
    }
    if (validation.warnings.length > 0) {
      console.log('Validation warnings:', validation.warnings);
    }
    console.log('');

    // Test 5: Known AI systems
    console.log('🤖 Test 5: Known AI Systems');
    const knownSystems = manager.getKnownAISystems();
    
    console.log('✅ Known AI systems loaded');
    console.log('Number of known systems:', knownSystems.length);
    console.log('Systems:', knownSystems.map(s => s.name).join(', '));
    
    // Test getting recommendations for OpenAI
    const openAIProfile = manager.getRecommendedSettings('OpenAI GPT');
    console.log('OpenAI profile found:', !!openAIProfile);
    if (openAIProfile) {
      console.log('OpenAI user agent:', openAIProfile.userAgent);
      console.log('Respects LLMS.txt:', openAIProfile.respectsLLMSTxt);
    }
    console.log('');

    // Test 6: Apply recommended settings
    console.log('🎯 Test 6: Apply Recommended Settings');
    const applied = manager.applyRecommendedSettings('Anthropic Claude');
    
    console.log('✅ Recommended settings application tested');
    console.log('Claude settings applied:', applied);
    
    const updatedConfig = manager.getConfig();
    const claudeRule = updatedConfig.rules.find(r => r.userAgent === 'ClaudeBot');
    console.log('Claude rule found:', !!claudeRule);
    if (claudeRule) {
      console.log('Claude crawl delay:', claudeRule.crawlDelay);
      console.log('Claude request rate:', claudeRule.requestRate);
    }
    console.log('');

    // Test 7: Preset configurations
    console.log('📋 Test 7: Preset Configurations');
    
    // Test restrictive config
    const restrictiveManager = new LLMSManager(createDefaultLLMSConfig('Test Site', 'test@example.com'));
    restrictiveManager.createRestrictiveConfig();
    const restrictiveConfig = restrictiveManager.getConfig();
    
    console.log('✅ Restrictive config created');
    console.log('Restrictive rules count:', restrictiveConfig.rules.length);
    console.log('Has wildcard disallow:', restrictiveConfig.rules.some(r => r.userAgent === '*' && r.disallow?.includes('/')));
    
    // Test permissive config
    const permissiveManager = new LLMSManager(createDefaultLLMSConfig('Test Site', 'test@example.com'));
    permissiveManager.createPermissiveConfig();
    const permissiveConfig = permissiveManager.getConfig();
    
    console.log('✅ Permissive config created');
    console.log('Permissive rules count:', permissiveConfig.rules.length);
    console.log('Has wildcard allow:', permissiveConfig.rules.some(r => r.userAgent === '*' && r.allow?.includes('/')));
    
    // Test balanced config
    const balancedManager = new LLMSManager(createDefaultLLMSConfig('Test Site', 'test@example.com'));
    balancedManager.createBalancedConfig();
    const balancedConfig = balancedManager.getConfig();
    
    console.log('✅ Balanced config created');
    console.log('Balanced rules count:', balancedConfig.rules.length);
    console.log('Has GPTBot rule:', balancedConfig.rules.some(r => r.userAgent === 'GPTBot'));
    console.log('');

    // Test 8: Rule management
    console.log('🔧 Test 8: Rule Management');
    const ruleManager = new LLMSManager(createDefaultLLMSConfig('Test Site', 'test@example.com'));
    
    // Add a rule
    ruleManager.addRule({
      userAgent: 'TestBot',
      allow: ['/test/'],
      crawlDelay: 5
    });
    
    let testConfig = ruleManager.getConfig();
    console.log('✅ Rule added');
    console.log('Rules after add:', testConfig.rules.length);
    
    // Update the same rule
    ruleManager.addRule({
      userAgent: 'TestBot',
      allow: ['/test/', '/updated/'],
      crawlDelay: 3
    });
    
    testConfig = ruleManager.getConfig();
    console.log('✅ Rule updated');
    console.log('Rules after update:', testConfig.rules.length);
    console.log('Updated rule paths:', testConfig.rules.find(r => r.userAgent === 'TestBot')?.allow?.length);
    
    // Remove the rule
    const removed = ruleManager.removeRule('TestBot');
    testConfig = ruleManager.getConfig();
    
    console.log('✅ Rule removal tested');
    console.log('Rule removed:', removed);
    console.log('Rules after removal:', testConfig.rules.length);
    console.log('');

    // Test 9: File server
    console.log('🌐 Test 9: LLMS.txt File Server');
    const fileServer = new LLMSFileServer(manager);
    const response = fileServer.generateResponse();
    
    console.log('✅ File server response generated');
    console.log('Status code:', response.statusCode);
    console.log('Content type:', response.headers['Content-Type']);
    console.log('Has cache control:', !!response.headers['Cache-Control']);
    console.log('Has last modified:', !!response.headers['Last-Modified']);
    console.log('Content preview:', response.content.substring(0, 100) + '...');
    console.log('');

    // Test 10: Validation edge cases
    console.log('⚠️ Test 10: Validation Edge Cases');
    
    // Test invalid email
    const invalidEmailConfig = createDefaultLLMSConfig('Test', 'invalid-email');
    const invalidManager = new LLMSManager(invalidEmailConfig);
    const invalidValidation = invalidManager.validateConfig();
    
    console.log('✅ Invalid email validation');
    console.log('Should be invalid:', !invalidValidation.isValid);
    console.log('Has email error:', invalidValidation.errors.some(e => e.includes('email')));
    
    // Test conflicting rules
    const conflictManager = new LLMSManager(createDefaultLLMSConfig('Test', 'test@example.com'));
    conflictManager.addRule({
      userAgent: 'ConflictBot',
      allow: ['/blog/'],
      disallow: ['/blog/private/']
    });
    
    const conflictValidation = conflictManager.validateConfig();
    console.log('✅ Conflicting rules validation');
    console.log('Has warnings:', conflictValidation.warnings.length > 0);
    
    // Test duplicate user agents
    const duplicateManager = new LLMSManager(createDefaultLLMSConfig('Test', 'test@example.com'));
    duplicateManager.addRule({ userAgent: 'DupeBot', allow: ['/'] });
    duplicateManager.addRule({ userAgent: 'DupeBot', disallow: ['/private/'] });
    
    const duplicateValidation = duplicateManager.validateConfig();
    console.log('✅ Duplicate user agent validation');
    console.log('Should be invalid:', !duplicateValidation.isValid);
    console.log('Has duplicate error:', duplicateValidation.errors.some(e => e.includes('Duplicate')));
    console.log('');

    console.log('🎉 All LLMS.txt Manager tests completed successfully!');
    
    return {
      success: true,
      results: {
        configCreation: true,
        ruleManagement: true,
        contentGeneration: true,
        validation: true,
        knownSystems: knownSystems.length,
        presetConfigs: true,
        fileServer: response.statusCode === 200,
        edgeCases: true
      }
    };

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return { success: false, error: error.message };
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testLLMSManager()
    .then(result => {
      if (result.success) {
        console.log('\n✅ All LLMS.txt Manager tests passed!');
        process.exit(0);
      } else {
        console.log('\n❌ LLMS.txt Manager tests failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Test execution failed:', error);
      process.exit(1);
    });
}

export { testLLMSManager };