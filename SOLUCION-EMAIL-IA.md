# 🔧 Solución: Problema de Generación de Emails con IA

## 📋 Problema Identificado

El sistema no puede generar emails con IA debido a un **modelo Gemini incorrecto** configurado. El error específico es:

```
Publisher Model `projects/generativelanguage-ga/locations/us-central1/publishers/google/models/gemini-1.5-flash-002` was not found
```

## ✅ Solución Paso a Paso

### Paso 1: Limpiar Configuración en el Navegador

1. **Abrir la aplicación** en el navegador (http://localhost:3000)
2. **Abrir las herramientas de desarrollador** (F12)
3. **Ir a la pestaña Console**
4. **Copiar y pegar** el siguiente código:

```javascript
// Verificar configuración actual
console.log('🔍 Configuración actual:');
console.log('Modelo:', localStorage.getItem('gemini_model'));
console.log('API Key:', localStorage.getItem('gemini_api_key') ? 'Configurada' : 'No configurada');

// Limpiar configuración problemática
if (localStorage.getItem('gemini_model') && localStorage.getItem('gemini_model').includes('gemini-1.5-flash-002')) {
  console.log('❌ Modelo incorrecto encontrado, corrigiendo...');
  localStorage.setItem('gemini_model', 'gemini-1.5-flash');
  console.log('✅ Modelo corregido');
} else {
  console.log('✅ Modelo OK');
}

// Verificar configuración final
console.log('🎉 Configuración final:');
console.log('Modelo:', localStorage.getItem('gemini_model') || 'gemini-1.5-flash (por defecto)');
```

5. **Presionar Enter** para ejecutar
6. **Recargar la página** (F5)

### Paso 2: Configurar API Key de Gemini (Si no está configurada)

1. **Ir a Google AI Studio**: https://aistudio.google.com/
2. **Crear una cuenta** o iniciar sesión
3. **Generar una nueva API Key**:
   - Hacer clic en "Get API Key"
   - Crear un nuevo proyecto si es necesario
   - Copiar la API Key generada

4. **En la aplicación**:
   - Ir a **Ajustes** (Settings)
   - Buscar la sección **"Configuración de Gemini AI"**
   - Pegar la API Key en el campo correspondiente
   - Hacer clic en **"Guardar API Key"**

### Paso 3: Verificar Variables de Entorno (Opcional)

Si prefieres usar una API Key global en lugar de por usuario:

1. **Abrir el archivo `.env`** en la raíz del proyecto
2. **Reemplazar** la línea:
   ```
   GEMINI_API_KEY=tu-gemini-api-key
   ```
   Por:
   ```
   GEMINI_API_KEY=TU_API_KEY_REAL_AQUI
   ```
3. **Reiniciar el servidor** de desarrollo

### Paso 4: Probar la Generación de Emails

1. **Ir a la página** "Correos IA" en la aplicación
2. **Completar el formulario**:
   - **Destinatario**: Cualquier email válido (ej: test@example.com)
   - **Asunto**: Un asunto descriptivo
   - **Propósito**: Describir el objetivo del email
   - **Contexto**: Información adicional (opcional)

3. **Hacer clic** en "Generar Email con IA"
4. **Verificar** que el email se genera correctamente

## 🔍 Scripts de Diagnóstico Creados

Se han creado varios scripts para diagnosticar el problema:

- **`diagnostico-gemini.cjs`**: Prueba la conectividad con la API de Gemini
- **`test-generate-email.cjs`**: Prueba específicamente la generación de emails
- **`fix-gemini-model.js`**: Script para limpiar configuración problemática

### Ejecutar Diagnóstico Completo

```bash
node diagnostico-gemini.cjs
```

### Probar Generación de Emails

```bash
node test-generate-email.cjs
```

## 🚨 Errores Comunes y Soluciones

### Error: "API Key no configurada"
**Solución**: Seguir el Paso 2 para configurar la API Key

### Error: "Modelo no encontrado"
**Solución**: Seguir el Paso 1 para limpiar la configuración del navegador

### Error: "Conectividad"
**Solución**: Verificar conexión a internet y que la API Key sea válida

### Error: "Parámetros faltantes"
**Solución**: Asegurarse de completar todos los campos requeridos (destinatario, asunto, propósito)

## ✅ Verificación Final

Después de seguir todos los pasos:

1. ✅ La API Key de Gemini está configurada
2. ✅ El modelo correcto (gemini-1.5-flash) está siendo usado
3. ✅ No hay configuraciones problemáticas en localStorage
4. ✅ El servidor de desarrollo está ejecutándose
5. ✅ Los emails se generan correctamente

## 📞 Soporte Adicional

Si el problema persiste después de seguir esta guía:

1. **Revisar los logs** de la consola del navegador
2. **Ejecutar el script de diagnóstico** para obtener más información
3. **Verificar** que la API Key de Gemini sea válida y tenga permisos
4. **Asegurarse** de que no hay restricciones de red o firewall

---

**Nota**: Esta solución resuelve el problema específico del modelo Gemini incorrecto que estaba causando el error 404 en la generación de emails con IA.