
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testEmailCollection() {
  const userEmail = 'selamu.garcia@gmail.com'; // The owner of the collection page
  const newEmail = `test-${Date.now()}@example.com`; // The email to be collected

  console.log(`Attempting to add "${newEmail}" to "${userEmail}"'s collection...`);

  try {
    const response = await fetch(`http://localhost:3000/api/email-collection/${encodeURIComponent(userEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: newEmail }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Success:', data);
    } else {
      console.error('❌ Error:', data);
    }
  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

testEmailCollection();
