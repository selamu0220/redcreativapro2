// Test final para verificar que el dashboard está correctamente estructurado
console.log('🧪 Testing Final Dashboard Structure...');

const fs = require('fs');
const path = require('path');

function testDashboardStructure() {
  try {
    const dashboardPath = path.join(__dirname, 'app', 'dashboard', 'page.tsx');
    const content = fs.readFileSync(dashboardPath, 'utf8');
    
    console.log('📋 Checking Dashboard Structure...\n');
    
    // Check for correct structure
    const hasDashboardContent = content.includes('function DashboardContent()');
    const hasExportDefault = content.includes('export default function DashboardPage()');
    const hasWorkingClientLayout = content.includes('<WorkingClientLayout>');
    const hasProperNesting = content.includes('<DashboardContent />');
    
    console.log(`✅ DashboardContent function: ${hasDashboardContent}`);
    console.log(`✅ Export default DashboardPage: ${hasExportDefault}`);
    console.log(`✅ WorkingClientLayout wrapper: ${hasWorkingClientLayout}`);
    console.log(`✅ Proper component nesting: ${hasProperNesting}`);
    
    // Check that useAuth is inside DashboardContent (not in the wrapper)
    const useAuthInContent = content.indexOf('useAuth') > content.indexOf('function DashboardContent()');
    console.log(`✅ useAuth inside DashboardContent: ${useAuthInContent}`);
    
    if (hasDashboardContent && hasExportDefault && hasWorkingClientLayout && hasProperNesting && useAuthInContent) {
      console.log('\n🎉 Dashboard structure is CORRECT!');
      console.log('\n📋 Expected flow:');
      console.log('1. DashboardPage (export default)');
      console.log('2. └── WorkingClientLayout (provides AuthContext)');
      console.log('3.     └── DashboardContent (uses useAuth)');
      return true;
    } else {
      console.log('\n❌ Dashboard structure has issues');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing dashboard structure:', error.message);
    return false;
  }
}

function testProviderChain() {
  try {
    console.log('\n🔗 Checking Provider Chain...\n');
    
    // Check WorkingClientLayout
    const layoutPath = path.join(__dirname, 'app', 'components', 'WorkingClientLayout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    const hasWorkingAuthProvider = layoutContent.includes('WorkingAuthProvider');
    const hasToastProvider = layoutContent.includes('ToastProvider');
    
    console.log(`✅ WorkingClientLayout uses WorkingAuthProvider: ${hasWorkingAuthProvider}`);
    console.log(`✅ WorkingClientLayout uses ToastProvider: ${hasToastProvider}`);
    
    // Check WorkingAuthProvider
    const providerPath = path.join(__dirname, 'app', 'components', 'WorkingAuthProvider.tsx');
    const providerContent = fs.readFileSync(providerPath, 'utf8');
    
    const providesAuthContext = providerContent.includes('AuthContext.Provider');
    const hasContextValue = providerContent.includes('contextValue');
    
    console.log(`✅ WorkingAuthProvider provides AuthContext: ${providesAuthContext}`);
    console.log(`✅ WorkingAuthProvider has contextValue: ${hasContextValue}`);
    
    if (hasWorkingAuthProvider && hasToastProvider && providesAuthContext && hasContextValue) {
      console.log('\n🎉 Provider chain is CORRECT!');
      console.log('\n📋 Provider hierarchy:');
      console.log('1. WorkingClientLayout');
      console.log('2. └── WorkingAuthProvider (provides AuthContext)');
      console.log('3.     └── ToastProvider');
      console.log('4.         └── children (DashboardContent)');
      return true;
    } else {
      console.log('\n❌ Provider chain has issues');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing provider chain:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Running Final Dashboard Tests...\n');
  
  const structureTest = testDashboardStructure();
  const providerTest = testProviderChain();
  
  if (structureTest && providerTest) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('\n✅ The dashboard should now work correctly:');
    console.log('  - AuthContext is properly provided');
    console.log('  - useAuth hook should work without errors');
    console.log('  - No more "useAuthContext must be used within an AuthProvider" errors');
    console.log('\n🔧 If you still see errors, check:');
    console.log('  - Browser console for specific error messages');
    console.log('  - Network tab for failed imports');
    console.log('  - React DevTools for component tree');
  } else {
    console.log('\n❌ Some tests failed. Please check the issues above.');
  }
}

runTests();