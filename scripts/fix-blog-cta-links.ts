import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kkdjorivsmewtzflgcyw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZGpvcml2c21ld3R6ZmxnY3l3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIxMzUzNywiZXhwIjoyMDg0Nzg5NTM3fQ.AwwX9KFAaJc3rLrpqGCqBL6LULRFDYdHua9_R2KwGyE'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Patterns to fix - map wrong URLs to correct ones
const urlFixes = [
    { wrong: '/es/escritor-ia-gratis-online', correct: '/escritor-ia' },
    { wrong: '/en/escritor-ia-gratis-online', correct: '/escritor-ia' },
    { wrong: '/escritor-ia-gratis-online', correct: '/escritor-ia' },
    { wrong: '/es/escritor-ia', correct: '/escritor-ia' },
    { wrong: '/en/escritor-ia', correct: '/escritor-ia' },
    { wrong: '/es/ai-writer', correct: '/escritor-ia' },
    { wrong: '/en/ai-writer', correct: '/escritor-ia' },
    { wrong: '/ai-writer', correct: '/escritor-ia' },
]

async function fixBlogLinks() {
    console.log('🔍 Buscando artículos con enlaces incorrectos...\n')

    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, content')

    if (error) {
        console.error('❌ Error fetching posts:', error)
        return
    }

    console.log(`📚 Encontrados ${posts?.length || 0} artículos\n`)

    let updatedCount = 0

    for (const post of posts || []) {
        if (!post.content) continue

        let newContent = post.content
        let wasChanged = false

        for (const fix of urlFixes) {
            if (newContent.includes(fix.wrong)) {
                newContent = newContent.replaceAll(fix.wrong, fix.correct)
                wasChanged = true
                console.log(`  🔗 ${post.slug}: "${fix.wrong}" → "${fix.correct}"`)
            }
        }

        if (wasChanged) {
            const { error: updateError } = await supabase
                .from('blog_posts')
                .update({ content: newContent, updated_at: new Date().toISOString() })
                .eq('id', post.id)

            if (updateError) {
                console.error(`  ❌ Error updating ${post.slug}:`, updateError)
            } else {
                updatedCount++
                console.log(`  ✅ Actualizado: ${post.title}\n`)
            }
        }
    }

    console.log(`\n🎉 Proceso completado. ${updatedCount} artículos actualizados.`)
}

fixBlogLinks()
