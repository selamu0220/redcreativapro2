import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>Red Creativa Pro</h1>
      <p style={{ fontSize: '20px', marginBottom: '30px' }}>
        Plataforma de IA para copywriting y marketing
      </p>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
        <Link 
          href="/dashboard" 
          style={{ 
            padding: '12px 24px', 
            background: '#000', 
            color: '#fff', 
            textDecoration: 'none',
            borderRadius: '6px'
          }}
        >
          Dashboard
        </Link>
        <Link 
          href="/blog" 
          style={{ 
            padding: '12px 24px', 
            border: '1px solid #000', 
            color: '#000', 
            textDecoration: 'none',
            borderRadius: '6px'
          }}
        >
          Blog
        </Link>
      </div>
      
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <h2>Estado: Modo Minimal</h2>
        <p>Si ves esta página, el problema está en los componentes complejos.</p>
        <p>Revisa la consola del navegador (F12) para más detalles.</p>
      </div>
    </div>
  )
}
