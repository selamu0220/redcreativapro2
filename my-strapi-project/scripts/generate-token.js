'use strict';

async function generateToken() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  try {
    const tokenService = strapi.service('admin::api-token');
    
    const existing = await strapi.query('admin::api-token').findOne({
      where: { name: 'Full Access Token' }
    });

    if (existing) {
      console.log('Token already exists. You can use the existing one or delete it from the dashboard.');
      return;
    }

    const token = await tokenService.create({
      name: 'Full Access Token',
      description: 'Token for Next.js frontend',
      type: 'full-access',
      lifespan: null,
    });

    console.log('-------------------------------------------');
    console.log('API TOKEN GENERATED:');
    console.log(token.accessKey);
    console.log('-------------------------------------------');
    console.log('Please copy this token to your .env file as STRAPI_API_TOKEN');

  } catch (error) {
    console.error('Failed to generate token:', error);
  } finally {
    await app.destroy();
    process.exit(0);
  }
}

generateToken();
