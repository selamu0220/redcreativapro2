# Arquitectura Clerk-Only

## 🎯 Visión General

Red Creativa Pro ahora usa una arquitectura ultra-simplificada donde **Clerk maneja TODO**:

- ✅ Autenticación de usuarios
- ✅ Gestión de sesiones
- ✅ Suscripciones y pagos
- ✅ Webhooks de eventos

## 🏗️ Stack Tecnológico

```
┌─────────────────────────────────────┐
│         Red Creativa Pro            │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │  Clerk   │  │ Vercel   │       │
│  │  Auth +  │  │   KV     │       │
│  │   Pay    │  │  Store   │       │
│  └──────────┘  └──────────┘       │
│                                     │
│  ┌──────────┐                      │
│  │OpenRouter│                      │
│  │    IA    │                      │
│  └──────────┘                      │
│                                     │
└─────────────────────────────────────┘
```

## 📦 Servicios Utilizados

### 1. Clerk (Todo-en-Uno)
**Responsabilidades:**
- Registro y login de usuarios
- Gestión de sesiones
- Autenticación social (Google, GitHub, etc.)
- Suscripciones y planes
- Procesamiento de pagos
- Webhooks de eventos

**Configuración:**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

### 2. Vercel KV (Almacenamiento)
**Responsabilidades:**
- Datos de usuarios
- Estadísticas de uso
- Caché temporal
- Configuraciones

**Configuración:**
```bash
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

### 3. OpenRouter (IA)
**Responsabilidades:**
- Generación de contenido
- Mejora de textos
- Procesamiento de IA

**Configuración:**
```bash
OPENROUTER_API_KEY=...
```

## 🔄 Flujo de Suscripciones

```
Usuario → Clerk UI → Clerk Backend → Webhook → Tu App
                                         ↓
                                    Actualizar KV
```

### Implementación con Clerk

1. **Configurar planes en Clerk Dashboard**
2. **Usar componentes de Clerk para UI de suscripción**
3. **Recibir webhooks de Clerk para eventos**
4. **Actualizar estado en Vercel KV**

## 💳 Gestión de Pagos

Clerk maneja todo el flujo de pagos:

```typescript
import { useUser } from '@clerk/nextjs';

function SubscriptionButton() {
  const { user } = useUser();
  
  // Clerk proporciona el estado de suscripción
  const isSubscribed = user?.publicMetadata?.subscribed;
  
  return (
    <button onClick={() => {
      // Redirigir a la página de suscripción de Clerk
      window.location.href = '/subscribe';
    }}>
      {isSubscribed ? 'Gestionar' : 'Suscribirse'}
    </button>
  );
}
```

## 🎨 Componentes de UI

### Autenticación
```typescript
import { SignIn, SignUp, UserButton } from '@clerk/nextjs';

// Login
<SignIn />

// Registro
<SignUp />

// Botón de usuario
<UserButton />
```

### Suscripciones
```typescript
import { useUser } from '@clerk/nextjs';

function SubscriptionStatus() {
  const { user } = useUser();
  const plan = user?.publicMetadata?.plan || 'free';
  
  return <div>Plan actual: {plan}</div>;
}
```

## 🔔 Webhooks

Clerk envía webhooks para eventos importantes:

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';

export async function POST(req: Request) {
  const payload = await req.json();
  const headers = req.headers;
  
  // Verificar firma
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  const evt = wh.verify(JSON.stringify(payload), {
    'svix-id': headers.get('svix-id')!,
    'svix-timestamp': headers.get('svix-timestamp')!,
    'svix-signature': headers.get('svix-signature')!,
  });
  
  // Manejar eventos
  switch (evt.type) {
    case 'user.created':
      // Crear usuario en KV
      break;
    case 'subscription.created':
      // Actualizar suscripción en KV
      break;
    case 'subscription.updated':
      // Actualizar estado
      break;
  }
  
  return new Response('OK', { status: 200 });
}
```

## 📊 Almacenamiento de Datos

### Estructura en Vercel KV

```typescript
// Usuarios
users: UserData[] = [
  {
    email: 'user@example.com',
    subscriptionStatus: 'pro',
    clerkUserId: 'user_xxx',
    createdAt: '2024-12-20',
    lastActiveAt: '2024-12-20'
  }
]

// Uso
usage-data: UsageData[] = [
  {
    email: 'user@example.com',
    date: '2024-12-20',
    escritorIA: 5,
    correosIA: 3,
    prompts: 10
  }
]
```

## 🚀 Ventajas de esta Arquitectura

1. **Simplicidad Extrema**: Un solo proveedor para auth y pagos
2. **Menos Código**: Sin integraciones complejas
3. **Menos Bugs**: Menos puntos de fallo
4. **Mejor UX**: UI consistente de Clerk
5. **Menos Costos**: Solo 3 servicios en total
6. **Fácil Mantenimiento**: Menos dependencias
7. **Rápido Desarrollo**: Componentes pre-construidos

## 📝 Checklist de Migración

- [x] Eliminar Supabase completamente
- [x] Eliminar Stripe completamente
- [x] Configurar Clerk para autenticación
- [ ] Configurar planes de suscripción en Clerk
- [ ] Implementar webhooks de Clerk
- [ ] Actualizar UI para usar componentes de Clerk
- [ ] Migrar datos de usuarios a estructura Clerk
- [ ] Probar flujo completo de suscripción

## 🔗 Recursos

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Subscriptions](https://clerk.com/docs/subscriptions)
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv)
- [OpenRouter](https://openrouter.ai/docs)

---

**Última actualización**: 20 de diciembre de 2024  
**Arquitectura**: Clerk-Only v3.0
