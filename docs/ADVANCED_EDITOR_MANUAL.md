# Manual del Editor Avanzado IA - Red Creativa Pro

## Descripción General
El nuevo sistema de edición avanzada proporciona mejoras de texto en tiempo real con latencia ultra-baja y perfiles estilísticos especializados. A diferencia de los chatbots tradicionales, este sistema actúa como un editor profesional silencioso que refina su texto sin interrumpir su flujo.

## Características Principales

### 1. Mejora en Streaming (Baja Latencia)
El editor ahora procesa el texto y muestra las mejoras progresivamente (streaming), lo que reduce la percepción de espera y permite ver cómo el texto se transforma en tiempo real.

### 2. Perfiles de Escritura (NUEVO)
Hemos implementado perfiles especializados para adaptar el tono y las reglas de mejora:

- **Periodismo General**: Estilo objetivo, claro y conciso (pirámide invertida).
- **Periodismo de Investigación**: Tono serio, profundo y analítico.
- **Narrativa Creativa**: Enfocado en metáforas, ritmo y expresividad.
- **Académico Formal**: Riguroso, técnico y estructurado.
- **Blog Tecnológico**: Moderno, dinámico y "engaging".
- **Personalizado**: Define tus propias reglas.

### 3. Configuración del Modo Personalizado
Si seleccionas el perfil "Personalizado" en el panel de configuración, podrás editar el "System Prompt" (Instrucciones) directamente.
- Ve al panel **"Instrucciones"** (icono de documento).
- Escribe tus reglas (ej: "Actúa como un poeta sarcástico...").
- El sistema obedecerá estas reglas por encima de cualquier otra configuración.

## Guía de Uso

1. **Seleccionar Perfil**:
   - Abre el panel derecho (dock).
   - Ve a la pestaña **"Configuración"** (icono de engranaje) o **"Agente"**.
   - Usa el selector "Perfil de Escritura" para elegir el estilo deseado.

2. **Verificar Instrucciones**:
   - Ve a la pestaña **"Instrucciones"**.
   - Verás la descripción del perfil activo (solo lectura).
   - Si usas "Personalizado", podrás editar el texto.

3. **Mejorar Texto**:
   - Haz clic en "Mejorar Texto" (varita mágica) o usa el atajo de teclado.
   - El texto se reescribirá automáticamente manteniendo su formato.

## Detalles Técnicos para Desarrolladores

- **API Endpoint**: `/api/improve-text-stream`
- **Tecnología**: Vercel AI SDK (`streamText`) + OpenRouter (Llama 3.3 / GPT-4o-mini).
- **Contexto**: `EscritorContext` maneja el estado global `profileId`.
- **Extensibilidad**: Los perfiles se definen en `app/lib/writing-profiles.ts`. Agregar uno nuevo es tan simple como añadir un objeto al array.
