const Stripe = require('stripe');
const stripe = new Stripe('sk_test_51SiKtEDVkQ0BJYJ93hL0YamZg7YIMdYLjenLOBfR4v2Udt6Z41149MrRZceWcrQwQUeJE8TDWqJNk9MEgJurXK2o00oeCxryuT');

async function checkPrices() {
  try {
    console.log('Listing prices for account...');
    const prices = await stripe.prices.list({ limit: 10 });
    console.log('Found prices:');
    prices.data.forEach(p => {
      console.log(`- ID: ${p.id}, Amount: ${p.unit_amount/100} ${p.currency}, Product: ${p.product}`);
    });
    
    const targetPrice1 = 'price_1ShtwQAZjhZ6eQncGlzoFUQW';
    const targetPrice2 = 'price_1RnMKwAZjhZ6eQncM71bv8Zh';
    
    for (const targetPrice of [targetPrice1, targetPrice2]) {
      try {
        const price = await stripe.prices.retrieve(targetPrice);
        console.log(`\nTarget price ${targetPrice} EXISTS in this account.`);
      } catch (e) {
        console.log(`\nTarget price ${targetPrice} DOES NOT EXIST in this account.`);
        console.log(`Error: ${e.message}`);
      }
    }
  } catch (err) {
    console.error('Error listing prices:', err.message);
  }
}

checkPrices();
