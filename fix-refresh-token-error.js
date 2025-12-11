/**
 * Emergency fix for "Invalid Refresh Token: Refresh Token Not Found" error
 * This script cleans up corrupted authentication tokens and resets the auth state
 */

console.log('🔧 Starting refresh token error fix...');

// Function to clear all Supabase authentication tokens
function clearAllSupabaseTokens() {
  const keysToCheck = [
    'sb-auth-token',
    'sb-kvhhppipogfvcwtphiak-auth-token',
    'supabase.auth.token',
    'sb-localhost-auth-token'
  ];

  console.log('🧹 Clearing localStorage tokens...');
  keysToCheck.forEach(key => {
    try {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`✅ Removed localStorage key: ${key}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to remove localStorage key ${key}:`, error);
    }
  });

  console.log('🧹 Clearing sessionStorage tokens...');
  keysToCheck.forEach(key => {
    try {
      if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
        console.log(`✅ Removed sessionStorage key: ${key}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to remove sessionStorage key ${key}:`, error);
    }
  });

  // Clear any dynamic Supabase keys
  console.log('🧹 Clearing dynamic Supabase keys...');
  try {
    const localStorageKeys = Object.keys(localStorage);
    localStorageKeys.forEach(key => {
      if (key.includes('supabase') && key.includes('auth')) {
        localStorage.removeItem(key);
        console.log(`✅ Removed dynamic localStorage key: ${key}`);
      }
    });

    const sessionStorageKeys = Object.keys(sessionStorage);
    sessionStorageKeys.forEach(key => {
      if (key.includes('supabase') && key.includes('auth')) {
        sessionStorage.removeItem(key);
        console.log(`✅ Removed dynamic sessionStorage key: ${key}`);
      }
    });
  } catch (error) {
    console.warn('⚠️ Failed to clear dynamic storage keys:', error);
  }

  // Clear authentication cookies
  console.log('🧹 Clearing authentication cookies...');
  const cookiesToClear = [
    'sb-access-token',
    'sb-refresh-token',
    'supabase-auth-token'
  ];

  cookiesToClear.forEach(cookieName => {
    try {
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      document.cookie = `${cookieName}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      console.log(`✅ Cleared cookie: ${cookieName}`);
    } catch (error) {
      console.warn(`⚠️ Failed to clear cookie ${cookieName}:`, error);
    }
  });
}

// Function to diagnose current token state
function diagnoseTokenState() {
  console.log('🔍 Diagnosing current token state...');
  
  const keysToCheck = [
    'sb-auth-token',
    'sb-kvhhppipogfvcwtphiak-auth-token',
    'supabase.auth.token',
    'sb-localhost-auth-token'
  ];

  let foundTokens = false;
  let corruptedTokens = false;

  keysToCheck.forEach(key => {
    const localValue = localStorage.getItem(key);
    const sessionValue = sessionStorage.getItem(key);

    if (localValue) {
      foundTokens = true;
      console.log(`📋 Found localStorage token: ${key}`);
      
      try {
        const parsed = JSON.parse(localValue);
        if (!parsed.access_token || !parsed.refresh_token) {
          corruptedTokens = true;
          console.warn(`⚠️ Corrupted token in localStorage: ${key}`);
        }
      } catch {
        corruptedTokens = true;
        console.warn(`⚠️ Malformed token in localStorage: ${key}`);
      }
    }

    if (sessionValue) {
      foundTokens = true;
      console.log(`📋 Found sessionStorage token: ${key}`);
      
      try {
        const parsed = JSON.parse(sessionValue);
        if (!parsed.access_token || !parsed.refresh_token) {
          corruptedTokens = true;
          console.warn(`⚠️ Corrupted token in sessionStorage: ${key}`);
        }
      } catch {
        corruptedTokens = true;
        console.warn(`⚠️ Malformed token in sessionStorage: ${key}`);
      }
    }
  });

  return { foundTokens, corruptedTokens };
}

// Main execution
try {
  const diagnosis = diagnoseTokenState();
  
  if (diagnosis.foundTokens) {
    console.log('📊 Tokens found in storage');
    
    if (diagnosis.corruptedTokens) {
      console.log('⚠️ Corrupted tokens detected - performing cleanup');
      clearAllSupabaseTokens();
      console.log('✅ Token cleanup completed');
      console.log('🔄 Please refresh the page and try logging in again');
    } else {
      console.log('ℹ️ Tokens appear valid - the issue might be network-related');
      console.log('💡 Try refreshing the page or checking your internet connection');
    }
  } else {
    console.log('ℹ️ No authentication tokens found');
    console.log('💡 Please try logging in again');
  }

  // Additional recommendations
  console.log('\n📋 Troubleshooting recommendations:');
  console.log('1. Refresh the page and try logging in again');
  console.log('2. Check your internet connection');
  console.log('3. Clear browser cache if the issue persists');
  console.log('4. Try logging in from an incognito/private window');

} catch (error) {
  console.error('❌ Error during token cleanup:', error);
  console.log('🔄 Please refresh the page manually and try again');
}

console.log('✅ Refresh token error fix completed');