import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Imágenes confiables de Unsplash con parámetros correctos
const reliableImages = [
    'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1499750310159-5b5f87e8e12b?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1504384308090-c54be3855833?w=1200&h=630&fit=crop'
];

async function fixBrokenImages() {
    console.log('🔍 Buscando artículos con imágenes rotas o vacías...\n');

    // Buscar artículos sin imagen o con imagen problemática
    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, image')
        .or('image.is.null,image.eq.');

    if (error) {
        console.error('❌ Error al consultar:', error.message);
        return;
    }

    console.log(`📋 Encontrados ${posts?.length || 0} artículos sin imagen\n`);

    if (posts && posts.length > 0) {
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            const newImage = reliableImages[i % reliableImages.length];

            const { error: updateError } = await supabase
                .from('blog_posts')
                .update({ image: newImage })
                .eq('id', post.id);

            if (updateError) {
                console.log(`❌ ${post.slug}: ${updateError.message}`);
            } else {
                console.log(`✅ ${post.slug} → imagen asignada`);
            }
        }
    }

    // También actualizar artículos con URLs de imagen que podrían estar rotas (auto=format)
    console.log('\n🔧 Actualizando URLs de imagen con formato mejorado...\n');

    const { data: allPosts } = await supabase
        .from('blog_posts')
        .select('id, slug, image')
        .like('image', '%auto=format%');

    if (allPosts && allPosts.length > 0) {
        for (const post of allPosts) {
            // Reemplazar auto=format con w=1200&h=630&fit=crop para mejor compatibilidad
            const fixedImage = post.image
                .replace('auto=format&fit=crop&q=80', 'w=1200&h=630&fit=crop')
                .replace('auto=format&fit=crop', 'w=1200&h=630&fit=crop');

            if (fixedImage !== post.image) {
                const { error: updateError } = await supabase
                    .from('blog_posts')
                    .update({ image: fixedImage })
                    .eq('id', post.id);

                if (!updateError) {
                    console.log(`✅ ${post.slug} → URL corregida`);
                }
            }
        }
    }

    console.log('\n🎉 Proceso completado!');
}

fixBrokenImages().catch(console.error);
