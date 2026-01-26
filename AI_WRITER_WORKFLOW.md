# Flujo de Trabajo del Escritor IA

Este documento describe el funcionamiento del sistema de mejora de texto con IA, incluyendo los modos manual y automático, gestión de errores y optimización de rendimiento.

## 1. Modos de Funcionamiento

### Modo Manual
- **Activación**: El usuario hace clic en el botón "Mejorar con IA".
- **Flujo**:
  1. Se captura el texto actual del editor.
  2. Se envía una solicitud a la API `/api/improve-text` a través de `ai-client`.
  3. Se muestra un indicador de carga ("Procesando...").
  4. Al recibir la respuesta, se actualiza el contenido del editor.
  5. Se pausa temporalmente el modo automático (si está activo) para evitar conflictos.
- **Configuración**: Utiliza el "Nivel de Mejora" seleccionado en la configuración (Conservador, Equilibrado, Creativo).

### Modo Automático
- **Activación**: Interruptor "Activar Modo Automático" en el panel de configuración.
- **Flujo**:
  1. **Monitoreo**: Detecta cambios en el texto mientras el usuario escribe.
  2. **Debounce**: Espera un tiempo configurable (por defecto 1s) tras la última tecla pulsada.
  3. **Validación**: Verifica si cumple el mínimo de palabras (config.minWords) y si ha pasado el tiempo de espera (config.delay).
  4. **Mejora**: Envía el texto (o el último segmento) a la API de forma silenciosa.
  5. **Feedback**: Muestra indicadores discretos (puntos de estado, tooltips con latencia).
- **Optimización**: Utiliza una cola de peticiones y caché para evitar saturación.

## 2. Gestión de Solicitudes (Technical Internals)

### Sistema de Colas (`ai-client.ts`)
- Todas las peticiones pasan por una `globalRequestQueue`.
- Previene condiciones de carrera y asegura que las mejoras se apliquen en orden.
- Limita la concurrencia para respetar los límites de la API.

### Caché (`ai-client.ts`)
- Implementa un caché en memoria (`responseCache`).
- Clave de caché: Combinación de `content + instruction + model + temperature`.
- Evita llamadas redundantes a la API para el mismo texto y configuración.

### Gestión de Errores (`AIWriterEditor.tsx`)
- **Reintentos**: El cliente puede reintentar fallos transitorios.
- **Cooldown**: Si ocurren múltiples errores consecutivos (`consecutiveErrors`), se activa un periodo de enfriamiento (`errorCooldown`) donde se pausa el modo automático.
- **Feedback Visual**: Se notifica al usuario si hay problemas de conexión o errores de la API.

## 3. Configuración y Personalización

### Nivel de Mejora
Afecta tanto al modo manual como al automático:
- **Conservador**: Solo correcciones gramaticales y ortográficas.
- **Equilibrado**: Mejora fluidez y tono.
- **Creativo**: Reescribe para mayor impacto.

### Monitoreo de Rendimiento
- El sistema rastrea la latencia de las respuestas (`lastLatency`).
- Visible en el tooltip del indicador de estado del modo automático.
