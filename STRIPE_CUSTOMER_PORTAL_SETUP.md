# Configuración del Portal de Clientes de Stripe

## 📋 Resumen

El Portal de Clientes de Stripe permite a tus clientes gestionar sus suscripciones, métodos de pago, facturas y más de forma autónoma.

## 🔗 Enlace del Portal

**URL del Portal**: `https://billing.stripe.com/p/login/bJe3cu1Ht4FDfbcba48og00`

**ID de Configuración**: `bpc_1RRfnYAZjhZ6eQncUQAPY0jF`

## ⚙️ Configuración Recomendada

### 1. Facturas ✅
- **Estado**: Activo
- **Descripción**: Permite que los clientes vean una lista de sus facturas abiertas y pagadas
- **Beneficio**: Transparencia total del historial de pagos

### 2. Información del Cliente ✅
- **Estado**: Activo
- **Descripción**: Permite que los clientes vean y actualicen su información de facturación
- **Beneficio**: Los clientes pueden mantener sus datos actualizados sin contactar soporte

### 3. Métodos de Pago ✅
- **Estado**: Activo
- **Descripción**: Permite a los clientes actualizar los métodos de pago
- **Beneficio**: Reduce fallos de pago por tarjetas vencidas

### 4. Cancelaciones ✅
- **Estado**: Activo
- **Descripción**: Permite que el cliente cancele su suscripción
- **Opciones recomendadas**:
  - ✅ Cancelar al final del período de facturación
  - ✅ Solicitar feedback al cancelar
  - ✅ Ofrecer pausa de suscripción como alternativa

### 5. Actualización de Suscripciones ✅
- **Estado**: Activo
- **Descripción**: Permite que los clientes actualicen (upgrade/downgrade) sus suscripciones
- **Beneficio**: Los clientes pueden cambiar de plan sin contactar soporte

## 🎨 Personalización

### Información de la Empresa
Configura estos elementos en el Dashboard de Stripe:

1. **Logo de la empresa**: Sube tu logo en Settings > Branding
2. **Colores del tema**: Personaliza los colores para que coincidan con tu marca
3. **URL de retorno**: Configura la URL a la que los clientes volverán después de usar el portal

### URLs de Redirección
```
URL de retorno por defecto: https://tudominio.com/subscription
```

## 🔧 Implementación Técnica

### Archivos Creados

1. **`app/api/stripe/create-portal-session/route.ts`**
   - API endpoint para crear sesiones del portal
   - Maneja la autenticación y redirección

2. **`app/components/CustomerPortalButton.tsx`**
   - Componente React reutilizable
   - Botón con loading state y manejo de errores

3. **Integración en `app/subscription/page.tsx`**
   - Botón visible solo para usuarios con suscripción activa
   - Ubicado en la sección de "Acciones Rápidas"

### Uso del Componente

```tsx
import CustomerPortalButton from '@/app/components/CustomerPortalButton';

<CustomerPortalButton
  customerId={subscriptionData.stripeCustomerId}
  returnUrl="/subscription"
  variant="default"
  size="sm"
  className="w-full"
/>
```

### Variables de Entorno Necesarias

Asegúrate de tener estas variables en tu archivo `.env.local`:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# App URL
NEXT_PUBLIC_APP_URL=https://tudominio.com
```

## 🚀 Activación en Stripe Dashboard

### Paso 1: Acceder a la Configuración
1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. Navega a **Settings** > **Billing** > **Customer Portal**

### Paso 2: Activar Funcionalidades
Marca las siguientes opciones:

- ✅ **Facturas**: Mostrar historial de facturas
- ✅ **Información del cliente**: Permitir actualización de datos
- ✅ **Métodos de pago**: Permitir actualización de tarjetas
- ✅ **Cancelaciones**: Permitir cancelación (al final del período)
- ✅ **Suscripciones**: Permitir actualización de planes

### Paso 3: Personalizar Apariencia
1. Sube tu logo de empresa
2. Configura los colores de tu marca
3. Establece la URL de retorno: `https://tudominio.com/subscription`

### Paso 4: Configurar Comportamiento de Cancelación
Opciones recomendadas:
- **Cancelar al final del período**: ✅ Sí
- **Solicitar razón de cancelación**: ✅ Sí
- **Ofrecer pausa**: ✅ Sí (opcional)
- **Ofrecer descuento**: ⚠️ Considera según tu estrategia

### Paso 5: Guardar Cambios
Haz clic en **"Guardar cambios"** en la parte inferior de la página.

## 📊 Funcionalidades del Portal

### Para los Clientes
Los clientes pueden:
- 📄 Ver y descargar facturas
- 💳 Actualizar métodos de pago
- 📝 Actualizar información de facturación
- 🔄 Cambiar de plan (upgrade/downgrade)
- ⏸️ Pausar suscripción (si está habilitado)
- ❌ Cancelar suscripción

### Para el Negocio
Beneficios:
- ⏱️ Reduce carga de soporte al cliente
- 💰 Disminuye fallos de pago por tarjetas vencidas
- 😊 Mejora la experiencia del cliente
- 📈 Aumenta retención con opciones de pausa
- 🔄 Facilita upgrades y cambios de plan

## 🔒 Seguridad

- ✅ Las sesiones del portal son de un solo uso
- ✅ Expiran automáticamente después de su uso
- ✅ Requieren autenticación del cliente
- ✅ Todas las comunicaciones son encriptadas (HTTPS)

## 🧪 Pruebas

### En Modo Test
1. Usa tu clave de API de test: `sk_test_...`
2. Crea un cliente de prueba en Stripe
3. Genera una sesión del portal
4. Verifica todas las funcionalidades

### En Modo Producción
1. Cambia a claves de producción: `sk_live_...`
2. Prueba con una cuenta real (puedes usar tu propia suscripción)
3. Verifica el flujo completo

## 📞 Soporte

Si los clientes tienen problemas con el portal:
1. Verifica que el `customerId` sea correcto
2. Confirma que las claves de API sean válidas
3. Revisa los logs en Stripe Dashboard > Developers > Logs
4. Contacta a soporte de Stripe si es necesario

## 🔗 Enlaces Útiles

- [Documentación del Portal de Clientes](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Guía de Personalización](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- [API Reference](https://stripe.com/docs/api/customer_portal)

## ✅ Checklist de Implementación

- [x] Crear API endpoint (`/api/stripe/create-portal-session`)
- [x] Crear componente `CustomerPortalButton`
- [x] Integrar en página de suscripción
- [ ] Configurar portal en Stripe Dashboard
- [ ] Personalizar apariencia (logo, colores)
- [ ] Configurar URL de retorno
- [ ] Activar funcionalidades deseadas
- [ ] Probar en modo test
- [ ] Probar en modo producción
- [ ] Documentar para el equipo

## 🎉 ¡Listo!

Una vez completados estos pasos, tus clientes podrán gestionar sus suscripciones de forma autónoma a través del Portal de Clientes de Stripe.

