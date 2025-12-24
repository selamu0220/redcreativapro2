const { createStrapi, compileStrapi } = require('@strapi/strapi');

async function run() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  try {
    const count = await strapi.documents('api::article.article').count();
    console.log('ARTICLE_COUNT:' + count);
  } catch (e) {
    console.error(e);
  } finally {
    await app.destroy();
    process.exit(0);
  }
}

run();
