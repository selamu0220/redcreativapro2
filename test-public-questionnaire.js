const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testPublicQuestionnaire() {
  const userEmail = 'selamu.garcia@gmail.com';
  
  console.log('Testing public questionnaire collection page...');
  console.log(`URL: http://localhost:3000/correosia/${encodeURIComponent(userEmail)}`);
  
  // First, let's test if the page loads
  try {
    const pageResponse = await fetch(`http://localhost:3000/correosia/${encodeURIComponent(userEmail)}`);
    
    if (pageResponse.ok) {
      console.log('✅ Public collection page loads successfully');
      
      // Now test submitting with questionnaire data
      const testEmail = `public-test-${Date.now()}@example.com`;
      const customFields = {
        "¿Cuál es tu industria?": "Tecnología",
        "¿Cuántos empleados tiene tu empresa?": "10-50",
        "¿Cuál es tu rol?": "Desarrollador"
      };
      
      console.log(`\nTesting form submission with email: ${testEmail}`);
      console.log('Custom fields:', customFields);
      
      const submitResponse = await fetch(`http://localhost:3000/api/email-collection/${encodeURIComponent(userEmail)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: testEmail,
          customFields: customFields
        }),
      });
      
      const submitData = await submitResponse.json();
      
      if (submitResponse.ok) {
        console.log('✅ Form submission successful:', submitData);
        console.log('\n🎉 Public questionnaire collection is working!');
      } else {
        console.error('❌ Form submission failed:', submitData);
      }
      
    } else {
      console.error('❌ Public collection page failed to load:', pageResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

testPublicQuestionnaire();