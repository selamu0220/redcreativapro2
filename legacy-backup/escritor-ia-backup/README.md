# Escritor IA - Sistema de Mejora de Texto

Este módulo implementa un sistema avanzado de mejora de texto con dos modos de operación: Manual y Automático.

## Características Principales

### 1. Modo Manual
- **Activación**: Botón "Mejorar con IA" en la barra de herramientas.
- **Flujo**:
  1. El usuario selecciona el texto o deja el cursor en el editor.
  2. Al hacer clic, el sistema captura el contenido actual.
  3. Se envía una solicitud a la API de IA a través de una cola de procesamiento.
  4. Se muestra un indicador de carga ("Procesando...").
  5. El texto mejorado reemplaza el segmento seleccionado o el texto completo.
  6. Se muestra una notificación de éxito o error.

### 2. Modo Automático
- **Activación**: Interruptor "Modo Automático" en la barra de herramientas.
- **Configuración**: Panel de ajustes accesible mediante el icono de engranaje.
- **Flujo**:
  1. El sistema monitorea la escritura del usuario.
  2. Detecta pausas en la escritura (debounce configurable).
  3. Verifica si se cumplen las condiciones mínimas (longitud de texto).
  4. Envía automáticamente el último segmento de texto para mejorar.
  5. Aplica la mejora de forma no intrusiva.
  6. Muestra indicadores visuales de estado (escribiendo, mejorando, pausado).

## Configuración

El usuario puede personalizar el comportamiento del modo automático:
- **Tiempo de Espera**: Retardo después de dejar de escribir (1-10s).
- **Palabras Mínimas**: Cantidad mínima de texto para activar la IA.
- **Sensibilidad**: Tiempo para detectar el fin de la escritura.
- **Nivel de Mejora**:
  - **Conservador**: Solo correcciones básicas (ortografía/gramática).
  - **Equilibrado**: Mejora fluidez y tono profesional.
  - **Creativo**: Reescribe para mayor impacto.

## Arquitectura Técnica

### Sistema de Colas (`RequestQueue`)
Gestiona la concurrencia y límites de tasa para evitar saturar la API y exceder cuotas.
- **Límite de Tasa**: 20 peticiones por minuto (configurable).
- **Concurrencia**: Máximo 2 peticiones simultáneas.

### Cliente API (`ai-client.ts`)
- Proxy seguro a través de `/api/improve-text`.
- Caché en memoria para evitar peticiones duplicadas.
- Manejo robusto de errores de red y API.

### Hooks (`useOptimizedAutoImprovement`)
- Gestión eficiente de temporizadores y memoria.
- Lógica de debounce y pausa automática.
- Integración con sistema de monitoreo de rendimiento.

## Pruebas
Se incluyen pruebas unitarias para validar la lógica crítica:
- `app/lib/__tests__/request-queue.test.ts`: Valida la cola y límites.
- `app/hooks/__tests__/useOptimizedAutoImprovement.test.ts`: Valida el comportamiento del modo automático.

Para ejecutar las pruebas:
```bash
npm test
```
