import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Se requieren NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Limpia posts duplicados basándose en títulos similares
 */
async function findDuplicatePosts() {
  console.log('🔍 Buscando posts duplicados...\n');

  // 1. Buscar posts con título "sdfefss" (posts de prueba)
  console.log('1️⃣ Buscando posts de prueba "sdfefss"...');
  const { data: testPosts, error: testError } = await supabase
    .from('blog_posts')
    .select('id, title, slug, created_at, published_at')
    .ilike('title', '%sdfefss%');

  if (testError) {
    console.error('❌ Error:', testError);
    return;
  }

  console.log(`   Encontrados: ${testPosts?.length || 0} posts de prueba`);
  if (testPosts && testPosts.length > 0) {
    testPosts.forEach(post => {
      console.log(`   - "${post.title}" (slug: ${post.slug})`);
    });
  }

  // 2. Buscar posts duplicados por título exacto
  console.log('\n2️⃣ Buscando títulos duplicados exactos...');
  const { data: allPosts, error: postsError } = await supabase
    .from('blog_posts')
    .select('id, title, slug, content, created_at, published_at, views')
    .order('created_at', { ascending: false });

  if (postsError) {
    console.error('❌ Error:', postsError);
    return;
  }

  const titleGroups: { [key: string]: typeof allPosts } = {};
  allPosts?.forEach(post => {
    const normalizedTitle = post.title.toLowerCase().trim();
    if (!titleGroups[normalizedTitle]) {
      titleGroups[normalizedTitle] = [];
    }
    titleGroups[normalizedTitle].push(post);
  });

  const duplicates = Object.entries(titleGroups).filter(([_, posts]) => posts.length > 1);
  
  console.log(`   Encontrados: ${duplicates.length} títulos duplicados`);
  duplicates.forEach(([title, posts]) => {
    console.log(`\n   📄 "${title}" (${posts.length} versiones):`);
    posts.forEach((post, idx) => {
      const wordCount = post.content ? post.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length : 0;
      console.log(`      ${idx + 1}. slug: ${post.slug} | ${wordCount} palabras | ${post.views} views`);
    });
  });

  // 3. Buscar posts con contenido muy similar (similitud > 80%)
  console.log('\n3️⃣ Buscando posts con contenido similar...');
  const similarPosts: Array<{ title1: string; title2: string; similarity: number }> = [];
  
  for (let i = 0; i < (allPosts?.length || 0); i++) {
    for (let j = i + 1; j < (allPosts?.length || 0); j++) {
      const post1 = allPosts![i];
      const post2 = allPosts![j];
      
      const content1 = (post1.content || '').replace(/<[^>]*>?/gm, '').toLowerCase();
      const content2 = (post2.content || '').replace(/<[^>]*>?/gm, '').toLowerCase();
      
      if (content1.length > 100 && content2.length > 100) {
        const similarity = calculateSimilarity(content1, content2);
        if (similarity > 0.7) { // 70% de similitud
          similarPosts.push({
            title1: post1.title,
            title2: post2.title,
            similarity: Math.round(similarity * 100)
          });
        }
      }
    }
  }

  console.log(`   Encontrados: ${similarPosts.length} pares similares`);
  similarPosts.slice(0, 10).forEach(({ title1, title2, similarity }) => {
    console.log(`   - "${title1.substring(0, 40)}..." ↔ "${title2.substring(0, 40)}..." (${similarity}%)`);
  });

  // 4. Buscar posts con contenido thin (< 300 palabras)
  console.log('\n4️⃣ Buscando posts con contenido thin (< 300 palabras)...');
  const thinPosts = allPosts?.filter(post => {
    const wordCount = post.content ? post.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length : 0;
    return wordCount < 300;
  });

  console.log(`   Encontrados: ${thinPosts?.length || 0} posts thin`);
  thinPosts?.slice(0, 10).forEach(post => {
    const wordCount = post.content ? post.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length : 0;
    console.log(`   - "${post.title.substring(0, 50)}..." (${wordCount} palabras)`);
  });

  // Resumen
  console.log('\n📊 RESUMEN:');
  console.log(`   Posts de prueba: ${testPosts?.length || 0}`);
  console.log(`   Títulos duplicados: ${duplicates.length}`);
  console.log(`   Posts similares (>70%): ${similarPosts.length}`);
  console.log(`   Posts thin (<300 palabras): ${thinPosts?.length || 0}`);
  console.log(`   Total posts analizados: ${allPosts?.length || 0}`);

  return {
    testPosts,
    duplicates,
    similarPosts,
    thinPosts,
    totalPosts: allPosts?.length || 0
  };
}

/**
 * Calcula similitud entre dos textos usando coeficiente de Jaccard
 */
function calculateSimilarity(str1: string, str2: string): number {
  // Dividir en palabras de 3 caracteres (trigramas)
  const getTrigrams = (str: string) => {
    const trigrams = new Set<string>();
    for (let i = 0; i < str.length - 2; i++) {
      trigrams.add(str.substring(i, i + 3));
    }
    return trigrams;
  };

  const trigrams1 = getTrigrams(str1);
  const trigrams2 = getTrigrams(str2);

  const intersection = new Set([...trigrams1].filter(x => trigrams2.has(x)));
  const union = new Set([...trigrams1, ...trigrams2]);

  return intersection.size / union.size;
}

/**
 * Elimina posts de prueba (sdfefss)
 */
async function removeTestPosts(dryRun = true) {
  console.log(`${dryRun ? '🔍' : '🗑️'} ${dryRun ? 'Simulando' : 'Eliminando'} posts de prueba...\n`);

  const { data: testPosts, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug')
    .ilike('title', '%sdfefss%');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!testPosts || testPosts.length === 0) {
    console.log('✅ No se encontraron posts de prueba');
    return;
  }

  console.log(`Posts a ${dryRun ? 'eliminar' : 'eliminar'}: ${testPosts.length}`);
  testPosts.forEach(post => {
    console.log(`  - "${post.title}" (${post.slug})`);
  });

  if (!dryRun) {
    const idsToDelete = testPosts.map(p => p.id);
    const { error: deleteError, count } = await supabase
      .from('blog_posts')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      console.error('❌ Error al eliminar:', deleteError);
    } else {
      console.log(`✅ Eliminados ${count} posts de prueba`);
    }
  }
}

/**
 * Marca posts duplicados como no publicados (conserva el más reciente)
 */
async function consolidateDuplicates(dryRun = true) {
  console.log(`${dryRun ? '🔍' : '🔄'} ${dryRun ? 'Simulando' : 'Consolidando'} duplicados...\n`);

  const { data: allPosts, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, content, created_at, published_at, views')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  const titleGroups: { [key: string]: typeof allPosts } = {};
  allPosts?.forEach(post => {
    const normalizedTitle = post.title.toLowerCase().trim();
    if (!titleGroups[normalizedTitle]) {
      titleGroups[normalizedTitle] = [];
    }
    titleGroups[normalizedTitle].push(post);
  });

  const duplicates = Object.entries(titleGroups).filter(([_, posts]) => posts.length > 1);
  
  for (const [title, posts] of duplicates) {
    console.log(`\n📄 "${title}"`);
    
    // Ordenar por fecha (más reciente primero) y views
    const sorted = posts.sort((a, b) => {
      const dateDiff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (dateDiff !== 0) return dateDiff;
      return (b.views || 0) - (a.views || 0);
    });

    // Conservar el primero (más reciente), marcar el resto
    const keep = sorted[0];
    const toUnpublish = sorted.slice(1);

    console.log(`   ✅ Conservar: ${keep.slug} (${keep.views || 0} views)`);
    
    if (toUnpublish.length > 0) {
      console.log(`   📝 Marcar como no publicados:`);
      toUnpublish.forEach(post => {
        console.log(`      - ${post.slug} (${post.views || 0} views)`);
      });

      if (!dryRun) {
        const idsToUnpublish = toUnpublish.map(p => p.id);
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update({ published_at: null, status: 'draft' })
          .in('id', idsToUnpublish);

        if (updateError) {
          console.error('❌ Error al actualizar:', updateError);
        } else {
          console.log(`   ✅ Marcados ${toUnpublish.length} como borradores`);
        }
      }
    }
  }
}

// Ejecutar según argumentos
const command = process.argv[2];
const dryRun = process.argv[3] !== '--execute';

if (dryRun && command) {
  console.log('🔍 MODO SIMULACIÓN (usa --execute para aplicar cambios)\n');
}

switch (command) {
  case 'analyze':
    findDuplicatePosts();
    break;
  case 'clean-test':
    removeTestPosts(dryRun);
    break;
  case 'consolidate':
    consolidateDuplicates(dryRun);
    break;
  default:
    console.log(`
🧹 LIMPIADOR DE DUPLICADOS - redcreativa.pro

Uso:
  npx tsx scripts/clean-duplicates.ts analyze              # Analizar duplicados
  npx tsx scripts/clean-duplicates.ts clean-test           # Simular limpieza de posts de prueba
  npx tsx scripts/clean-duplicates.ts clean-test --execute # Eliminar posts de prueba
  npx tsx scripts/clean-duplicates.ts consolidate          # Simular consolidación
  npx tsx scripts/clean-duplicates.ts consolidate --execute # Consolidar duplicados

Opciones:
  --execute    Aplicar cambios reales (por defecto es simulación)
`);
    process.exit(0);
}
