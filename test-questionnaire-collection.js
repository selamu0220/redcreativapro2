const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testQuestionnaireCollection() {
  const userEmail = 'selamu.garcia@gmail.com'; // The owner of the collection page
  const newEmail = `test-questionnaire-${Date.now()}@example.com`; // The email to be collected
  
  // Simulate questionnaire responses
  const customFields = {
    "¿Cuál es tu presupuesto mensual?": "$500-1000",
    "¿Qué tipo de productos te interesan?": "Tecnología",
    "¿Con qué frecuencia compras online?": "Semanalmente",
    "¿Cuál es tu edad?": "25-35 años"
  };

  console.log(`Attempting to add "${newEmail}" with questionnaire data to "${userEmail}"'s collection...`);
  console.log('Questionnaire data:', customFields);

  try {
    const response = await fetch(`http://localhost:3000/api/email-collection/${encodeURIComponent(userEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: newEmail,
        customFields: customFields
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Success:', data);
      console.log('\n🎉 Email with questionnaire data saved successfully!');
    } else {
      console.error('❌ Error:', data);
    }
  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

testQuestionnaireCollection();