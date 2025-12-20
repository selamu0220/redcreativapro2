# Requirements Document

## Introduction

El Escritor de IA actual está completamente roto con aproximadamente 20 problemas críticos y una arquitectura excesivamente compleja. Este documento define los requisitos para reconstruir el Escritor de IA desde cero con una arquitectura simple y funcional que solo requiere autenticación con Clerk y llamadas directas a APIs de proveedores de IA, sin ninguna base de datos.

## Glossary

- **AI_Writer**: El sistema de escritura asistida por inteligencia artificial
- **Clerk**: Sistema de autenticación utilizado para gestionar usuarios
- **AI_Provider**: Proveedor externo de servicios de IA (OpenAI, Anthropic, etc.)
- **Editor**: Componente de interfaz donde el usuario escribe y edita texto
- **Improvement_Request**: Solicitud del usuario para mejorar texto usando IA

## Requirements

### Requirement 1: Autenticación Simple con Clerk

**User Story:** Como usuario, quiero autenticarme con Clerk para acceder al Escritor de IA, de manera que solo usuarios autenticados puedan usar la herramienta.

#### Acceptance Criteria

1. WHEN un usuario no autenticado intenta acceder a /escritor-ia THEN THE System SHALL redirigir al usuario a la página de login de Clerk
2. WHEN un usuario autenticado accede a /escritor-ia THEN THE System SHALL mostrar la interfaz del editor
3. WHEN un usuario cierra sesión THEN THE System SHALL limpiar el estado local y redirigir al inicio
4. THE System SHALL obtener el email del usuario desde Clerk para identificación
5. THE System SHALL verificar el estado de autenticación antes de cada llamada a la API

### Requirement 2: Editor de Texto Simple

**User Story:** Como usuario, quiero un editor de texto simple y funcional, de manera que pueda escribir y editar contenido sin complejidad innecesaria.

#### Acceptance Criteria

1. WHEN el usuario accede al editor THEN THE System SHALL mostrar un área de texto vacía lista para escribir
2. WHEN el usuario escribe texto THEN THE Editor SHALL actualizar el contenido en tiempo real
3. THE Editor SHALL mantener el contenido solo en el estado local del componente
4. THE Editor SHALL permitir copiar y pegar texto sin restricciones
5. THE Editor SHALL ser responsive y funcionar en dispositivos móviles

### Requirement 3: Mejora de Contenido con IA

**User Story:** Como usuario, quiero mejorar mi texto usando IA, de manera que pueda obtener versiones mejoradas de mi contenido con un solo clic.

#### Acceptance Criteria

1. WHEN el usuario hace clic en "Mejorar con IA" THEN THE System SHALL enviar el contenido actual a la API de IA
2. WHEN la API responde exitosamente THEN THE System SHALL reemplazar el contenido con la versión mejorada
3. WHEN la API falla THEN THE System SHALL mostrar un mensaje de error claro al usuario
4. THE System SHALL deshabilitar el botón de mejora mientras procesa la solicitud
5. THE System SHALL mostrar un indicador de carga durante el procesamiento

### Requirement 4: Configuración de Proveedor de IA

**User Story:** Como usuario, quiero poder seleccionar el proveedor de IA que deseo usar, de manera que pueda elegir entre diferentes servicios según mis preferencias.

#### Acceptance Criteria

1. THE System SHALL proporcionar un selector para elegir el proveedor de IA
2. WHEN el usuario selecciona un proveedor THEN THE System SHALL guardar la selección en localStorage
3. WHEN el usuario regresa a la aplicación THEN THE System SHALL restaurar el proveedor seleccionado previamente
4. THE System SHALL soportar al menos OpenAI como proveedor inicial
5. WHERE se configure un nuevo proveedor THEN THE System SHALL validar que tenga las credenciales necesarias

### Requirement 5: Gestión de API Keys

**User Story:** Como usuario, quiero poder configurar mi propia API key del proveedor de IA, de manera que pueda usar mi propia cuenta sin depender de límites compartidos.

#### Acceptance Criteria

1. THE System SHALL proporcionar un campo para ingresar la API key del proveedor
2. WHEN el usuario ingresa una API key THEN THE System SHALL guardarla en localStorage de forma segura
3. WHEN se realiza una llamada a la API THEN THE System SHALL usar la API key del usuario si está configurada
4. THE System SHALL permitir al usuario borrar su API key almacenada
5. THE System SHALL mostrar si está usando una API key personal o del sistema

### Requirement 6: Manejo de Errores Simple

**User Story:** Como usuario, quiero recibir mensajes de error claros cuando algo falla, de manera que pueda entender qué salió mal y cómo solucionarlo.

#### Acceptance Criteria

1. WHEN ocurre un error de red THEN THE System SHALL mostrar "Error de conexión. Verifica tu internet."
2. WHEN la API key es inválida THEN THE System SHALL mostrar "API key inválida. Verifica tu configuración."
3. WHEN el contenido está vacío THEN THE System SHALL mostrar "Escribe algo de texto primero."
4. WHEN hay un error desconocido THEN THE System SHALL mostrar el mensaje de error técnico
5. THE System SHALL limpiar los mensajes de error después de 5 segundos

### Requirement 7: Interfaz Minimalista

**User Story:** Como usuario, quiero una interfaz limpia y sin distracciones, de manera que pueda concentrarme en escribir sin elementos innecesarios.

#### Acceptance Criteria

1. THE Interface SHALL mostrar solo el editor de texto y controles esenciales
2. THE Interface SHALL usar un diseño simple con colores neutros
3. THE Interface SHALL tener un botón principal "Mejorar con IA" claramente visible
4. THE Interface SHALL incluir un botón de configuración para ajustes de IA
5. THE Interface SHALL mostrar el nombre del usuario autenticado en la esquina

### Requirement 8: Sin Persistencia de Datos

**User Story:** Como usuario, entiendo que mi contenido no se guarda automáticamente, de manera que soy responsable de copiar mi trabajo si deseo conservarlo.

#### Acceptance Criteria

1. THE System SHALL NOT guardar contenido en ninguna base de datos
2. THE System SHALL NOT crear documentos persistentes
3. WHEN el usuario recarga la página THEN THE System SHALL mostrar un editor vacío
4. THE System SHALL mostrar un aviso claro de que el contenido no se guarda automáticamente
5. THE System SHALL proporcionar un botón "Copiar todo" para facilitar el guardado manual

### Requirement 9: Llamadas Directas a API

**User Story:** Como desarrollador, quiero que las llamadas a la API de IA sean directas y simples, de manera que el código sea fácil de mantener y depurar.

#### Acceptance Criteria

1. THE System SHALL hacer llamadas HTTP directas a las APIs de los proveedores
2. THE System SHALL usar fetch o axios sin capas de abstracción complejas
3. THE System SHALL incluir timeout de 30 segundos para las llamadas
4. THE System SHALL pasar solo los parámetros esenciales (texto, modelo, temperatura)
5. THE System SHALL manejar respuestas en formato JSON estándar

### Requirement 10: Configuración Básica de Parámetros

**User Story:** Como usuario, quiero ajustar parámetros básicos de la IA, de manera que pueda controlar el estilo de las mejoras generadas.

#### Acceptance Criteria

1. THE System SHALL proporcionar un control deslizante para "Creatividad" (temperature)
2. WHEN el usuario ajusta la creatividad THEN THE System SHALL guardar el valor en localStorage
3. THE System SHALL usar valores por defecto razonables (temperature: 0.7)
4. THE System SHALL permitir seleccionar el modelo de IA disponible del proveedor
5. THE System SHALL mostrar los parámetros actuales en la interfaz de configuración
