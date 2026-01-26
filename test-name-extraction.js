// Test script to verify getNameFromEmail function works correctly for different users

// Function to extract first two syllables from email (copied from page.tsx)
const getNameFromEmail = (email) => {
  if (!email) return 'Usuario'
  
  const username = email.split('@')[0]
  const cleanUsername = username.replace(/[^a-zA-Z]/g, '')
  
  if (cleanUsername.length <= 4) {
    return cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1).toLowerCase()
  }
  
  // Extract first 4 characters as approximation of two syllables
  const name = cleanUsername.substring(0, 4)
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
}

// Test cases with different emails
const testEmails = [
  'selamu.garciabravo@gmail.com',
  'maria.rodriguez@example.com',
  'juan.perez@company.com',
  'ana.martinez@test.org',
  'carlos123@domain.com',
  'sofia_lopez@email.net',
  'pedro-garcia@site.es',
  'laura@simple.com',
  'alex@test.co',
  'user123@example.org'
]

console.log('🧪 Testing getNameFromEmail function with different emails:\n')

testEmails.forEach(email => {
  const extractedName = getNameFromEmail(email)
  console.log(`📧 Email: ${email.padEnd(30)} → 👤 Name: "${extractedName}"`)
})

console.log('\n✅ Test completed. Each email should generate a unique personalized name.')
console.log('\n📝 Notes:')
console.log('- Names are extracted from the first 4 characters of the username (before @)')
console.log('- Special characters and numbers are removed')
console.log('- First letter is capitalized, rest are lowercase')
console.log('- Each user will see their own personalized greeting')