"use client";

import { blogPosts } from "@/lib/blog-data";

export default function BlogDebugPage() {
  console.log('Blog posts data:', blogPosts);
  console.log('Number of posts:', blogPosts?.length || 0);

  return (
    <div className="min-h-screen bg-card dark:bg-black p-8 mobile-spacing">
      <h1 className="text-3xl font-bold mb-8">Blog Debug</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Diagnóstico:</h2>
        <ul className="space-y-2">
          <li>✅ Página cargada correctamente</li>
          <li>📊 Posts encontrados: {blogPosts?.length || 0}</li>
          <li>🔍 Datos disponibles: {blogPosts ? 'Sí' : 'No'}</li>
        </ul>
      </div>

      {blogPosts && blogPosts.length > 0 ? (
        <div className="grid gap-6">
          <h2 className="text-xl font-semibold">Artículos encontrados:</h2>
          {blogPosts.slice(0, 3).map((post) => (
            <div key={post.id} className="border p-4 rounded-lg">
              <h3 className="font-semibold text-lg">{post.title}</h3>
              <p className="text-muted-foreground mt-2">{post.excerpt}</p>
              <div className="mt-2 text-sm text-gray-500">
                <span>Categoría: {post.category}</span>
                <span className="ml-4">Fecha: {post.publishedAt}</span>
                <span className="ml-4">Vistas: {post.views}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600">❌ No se encontraron artículos</h2>
          <p className="text-muted-foreground mt-2">Hay un problema con la carga de datos del blog</p>
        </div>
      )}
    </div>
  );
}