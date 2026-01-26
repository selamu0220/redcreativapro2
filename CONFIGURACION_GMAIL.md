# Configuración de Gmail para Envío de Correos

## Problema Actual
Las campañas no pueden enviar correos porque falta la configuración de Gmail.

## Solución: Configurar Contraseña de Aplicación

### Paso 1: Habilitar Verificación en 2 Pasos
1. Ve a tu [Cuenta de Google](https://myaccount.google.com/)
2. Selecciona **Seguridad** en el panel izquierdo
3. En "Iniciar sesión en Google", selecciona **Verificación en 2 pasos**
4. Sigue las instrucciones para habilitarla si no la tienes activada

### Paso 2: Generar Contraseña de Aplicación
1. Una vez habilitada la verificación en 2 pasos, regresa a **Seguridad**
2. En "Iniciar sesión en Google", selecciona **Contraseñas de aplicaciones**
3. Selecciona la aplicación: **Correo**
4. Selecciona el dispositivo: **Otro (nombre personalizado)**
5. Escribe: "Red Creativa Pro"
6. Haz clic en **Generar**
7. **Copia la contraseña de 16 caracteres** que aparece

### Paso 3: Configurar Variables de Entorno
1. Abre el archivo `.env.local` en la raíz del proyecto
2. Reemplaza los valores:
   ```
   GMAIL_USER=tu-email@gmail.com
   GMAIL_APP_PASSWORD=la-contraseña-de-16-caracteres
   ```

### Paso 4: Reiniciar el Servidor
1. Detén el servidor de desarrollo (Ctrl+C)
2. Ejecuta nuevamente: `pnpm run dev`

## Verificación
Después de configurar, las campañas deberían poder enviar correos sin errores.

## Notas Importantes
- **NUNCA** uses tu contraseña normal de Gmail
- La contraseña de aplicación es específica para esta aplicación
- Mantén estas credenciales seguras y no las compartas
- Si cambias tu contraseña de Gmail, deberás generar una nueva contraseña de aplicación