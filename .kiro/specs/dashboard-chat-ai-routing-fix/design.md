# Design Document

## Overview

El problema identificado es una inconsistencia en el dashboard donde el elemento de navegación muestra "Chat IA" pero en realidad lleva a la página de "Generador de Correos IA" (`/correos-ia`). Esto causa confusión en los usuarios ya que esperan una funcionalidad de chat general pero encuentran una herramienta específica para generar correos electrónicos.

## Architecture

### Current State Analysis

En el archivo `app/dashboard/page.tsx`, línea ~45-52:

```typescript
{
  id: 'correos-ia',
  name: 'Chat IA',  // ← PROBLEMA: Nombre incorrecto
  description: 'Conversa con IA usando tus propios prompts',  // ← PROBLEMA: Descripción incorrecta
  icon: '💬',
  color: 'from-blue-500 to-blue-700',
  href: '/correos-ia',  // ← Ruta correcta
  premium: false,
  videoUrl: 'https://youtu.be/k5OYlxYdIuA'
}
```

La página `/correos-ia` es efectivamente un "Generador de Correos IA" con funcionalidades específicas para:

- Generar correos personalizados con IA
- Importar datos de contactos
- Gestionar correos recopilados
- Enviar correos generados

### Solution Architecture

Hay dos posibles soluciones:

#### Opción 1: Corregir el nombre en el dashboard (Recomendada)

- Cambiar "Chat IA" por "Correos IA" o "Generador de Correos IA"
- Actualizar la descripción para reflejar la funcionalidad real
- Mantener la ruta `/correos-ia` existente

#### Opción 2: Crear una nueva funcionalidad de Chat IA

- Mantener "Chat IA" en el dashboard
- Crear una nueva ruta `/chat-ia` con funcionalidad de chat general
- Cambiar la ruta del dashboard para apuntar a `/chat-ia`
- Renombrar el elemento actual a "Correos IA"

**Recomendación**: Opción 1, ya que es más simple y no requiere crear nueva funcionalidad.

## Components and Interfaces

### Dashboard Configuration Update

```typescript
// app/dashboard/page.tsx - Elemento corregido
{
  id: 'correos-ia',
  name: 'Correos IA',  // ← CORREGIDO
  description: 'Genera correos personalizados con inteligencia artificial',  // ← CORREGIDO
  icon: '📧',  // ← ACTUALIZADO para reflejar mejor la funcionalidad
  color: 'from-blue-500 to-blue-700',
  href: '/correos-ia',
  premium: false,
  videoUrl: 'https://youtu.be/k5OYlxYdIuA'
}
```

### Alternative: If Chat IA functionality is needed

```typescript
// Nuevo elemento para Chat IA general (si se implementa en el futuro)
{
  id: 'chat-ia',
  name: 'Chat IA',
  description: 'Conversa con IA usando tus propios prompts',
  icon: '💬',
  color: 'from-green-500 to-green-700',
  href: '/chat-ia',
  premium: false,
  videoUrl: 'https://youtu.be/k5OYlxYdIuA'
},
// Elemento corregido para Correos IA
{
  id: 'correos-ia',
  name: 'Correos IA',
  description: 'Genera correos personalizados con inteligencia artificial',
  icon: '📧',
  color: 'from-blue-500 to-blue-700',
  href: '/correos-ia',
  premium: false,
  videoUrl: 'https://youtu.be/k5OYlxYdIuA'
}
```

## Data Models

No se requieren cambios en los modelos de datos, ya que el problema es únicamente de presentación en la interfaz de usuario.

## Error Handling

### Validation Steps

1. **Consistency Check**: Verificar que el nombre, descripción e icono del elemento del dashboard coincidan con la funcionalidad real de la página
2. **Navigation Test**: Confirmar que al hacer clic en el elemento se navega a la página correcta
3. **User Experience**: Validar que la experiencia del usuario sea coherente desde el dashboard hasta la página de destino

### Rollback Strategy

Si hay problemas después del cambio:

1. Revertir los cambios en `app/dashboard/page.tsx`
2. Verificar que no hay referencias hardcodeadas al nombre anterior
3. Confirmar que todos los enlaces y navegación funcionan correctamente

## Testing Strategy

### Manual Testing

1. **Dashboard Display Test**

   - Verificar que el nombre mostrado sea "Correos IA" o "Generador de Correos IA"
   - Confirmar que la descripción sea precisa
   - Validar que el icono sea apropiado

2. **Navigation Test**

   - Hacer clic en el elemento del dashboard
   - Verificar que navega a `/correos-ia`
   - Confirmar que la página cargada corresponde a la funcionalidad esperada

3. **User Experience Test**
   - Verificar que no hay confusión entre lo que se muestra en el dashboard y lo que se encuentra en la página
   - Confirmar que la transición es fluida y coherente

### Automated Testing

```typescript
// Ejemplo de test para verificar la configuración del dashboard
describe("Dashboard Configuration", () => {
  test("correos-ia tool should have correct name and description", () => {
    const correosIATool = tools.find((tool) => tool.id === "correos-ia");

    expect(correosIATool).toBeDefined();
    expect(correosIATool.name).toBe("Correos IA");
    expect(correosIATool.description).toContain("correos");
    expect(correosIATool.href).toBe("/correos-ia");
  });

  test("navigation should work correctly", () => {
    // Test navigation functionality
    const correosIATool = tools.find((tool) => tool.id === "correos-ia");
    expect(correosIATool.href).toBe("/correos-ia");
  });
});
```

## Security Considerations

No hay consideraciones de seguridad específicas para este cambio, ya que solo se están actualizando elementos de presentación en la interfaz de usuario.

## Performance Impact

El impacto en el rendimiento es mínimo:

- Solo se cambian strings estáticos en el dashboard
- No hay cambios en la lógica de navegación
- No se agregan nuevas dependencias o recursos

## Migration Strategy

### Phase 1: Update Dashboard Configuration

1. Actualizar el nombre de "Chat IA" a "Correos IA"
2. Actualizar la descripción para reflejar la funcionalidad real
3. Cambiar el icono de 💬 a 📧 para mejor representación

### Phase 2: Testing and Validation

1. Realizar pruebas manuales de navegación
2. Verificar que no hay referencias rotas
3. Confirmar que la experiencia de usuario es coherente

### Phase 3: Documentation Update

1. Actualizar cualquier documentación que haga referencia al nombre anterior
2. Verificar que los tutoriales o guías de usuario sean consistentes

## Future Considerations

### If Chat IA Functionality is Needed

Si en el futuro se requiere una funcionalidad de chat IA general:

1. **Create New Route**: `/chat-ia`
2. **Implement Chat Interface**: Interfaz de chat conversacional general
3. **Update Dashboard**: Agregar nuevo elemento para Chat IA
4. **Differentiate Tools**: Asegurar que ambas herramientas tengan propósitos claros y diferenciados

### Naming Convention

Para evitar confusiones futuras, establecer una convención de nombres clara:

- **Correos IA**: Generación específica de correos electrónicos
- **Chat IA**: Conversación general con IA
- **Escritor IA**: Mejora y edición de textos
- **Prompts**: Biblioteca de prompts para IA
