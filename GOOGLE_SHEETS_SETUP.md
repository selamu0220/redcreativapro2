# Configuración de Google Sheets para Captura de Datos

Este documento explica cómo configurar Google Sheets como alternativa al sistema de base de datos local para las páginas de captura de datos.

## ¿Por qué Google Sheets?

Google Sheets ofrece varias ventajas como sistema de almacenamiento para páginas de captura:

- **Confiabilidad**: No depende de archivos locales que pueden corromperse
- **Accesibilidad**: Los datos están disponibles desde cualquier lugar
- **Colaboración**: Múltiples usuarios pueden acceder y gestionar los datos
- **Backup automático**: Google maneja las copias de seguridad automáticamente
- **Escalabilidad**: Puede manejar grandes volúmenes de datos

## Configuración Paso a Paso

### 1. Crear un Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el ID del proyecto

### 2. Habilitar la API de Google Sheets

1. En Google Cloud Console, ve a "APIs & Services" > "Library"
2. Busca "Google Sheets API"
3. Haz clic en "Enable"

### 3. Crear una Cuenta de Servicio

1. Ve a "APIs & Services" > "Credentials"
2. Haz clic en "Create Credentials" > "Service Account"
3. Completa los detalles de la cuenta de servicio
4. Asigna el rol "Editor" o "Owner"
5. Haz clic en "Done"

### 4. Generar Clave de la Cuenta de Servicio

1. En la lista de cuentas de servicio, haz clic en la que acabas de crear
2. Ve a la pestaña "Keys"
3. Haz clic en "Add Key" > "Create New Key"
4. Selecciona "JSON" y haz clic en "Create"
5. Se descargará un archivo JSON con las credenciales

### 5. Crear una Hoja de Cálculo de Google

1. Ve a [Google Sheets](https://sheets.google.com/)
2. Crea una nueva hoja de cálculo
3. Copia la URL de la hoja de cálculo
4. Extrae el ID de la hoja de cálculo de la URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

### 6. Compartir la Hoja de Cálculo

1. En la hoja de cálculo, haz clic en "Share"
2. Agrega el email de la cuenta de servicio (se encuentra en el archivo JSON descargado)
3. Asigna permisos de "Editor"
4. Haz clic en "Send"

### 7. Configurar Variables de Entorno

Agrega las siguientes variables a tu archivo `.env.local`:

```env
# Google Sheets Configuration
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[TU_PRIVATE_KEY]\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL="tu-cuenta-servicio@tu-proyecto.iam.gserviceaccount.com"
GOOGLE_SHEETS_SPREADSHEET_ID="tu_spreadsheet_id_aqui"
```

**Importante**: 
- Reemplaza `[TU_PRIVATE_KEY]` con la clave privada del archivo JSON (sin las líneas BEGIN/END)
- Asegúrate de mantener los `\n` para los saltos de línea
- El `PRIVATE_KEY` debe estar entre comillas dobles

### 8. Estructura de las Hojas

El sistema creará automáticamente las siguientes hojas en tu spreadsheet:

- **EmailPages**: Almacena la configuración de las páginas de captura
- **Contacts**: Almacena los contactos capturados

## Verificación de la Configuración

Para verificar que todo está configurado correctamente:

1. Reinicia tu aplicación Next.js
2. Revisa los logs de la consola para mensajes como:
   - "Google Sheets configurado correctamente"
   - "Obteniendo páginas desde Google Sheets"
   - "Guardando contacto en Google Sheets"

## Fallback al Sistema de Archivos

Si Google Sheets no está configurado o hay algún error, el sistema automáticamente usará el sistema de archivos JSON como respaldo.

## Solución de Problemas

### Error: "Unable to parse key"
- Verifica que el `PRIVATE_KEY` esté correctamente formateado
- Asegúrate de que los `\n` estén presentes para los saltos de línea

### Error: "Insufficient permissions"
- Verifica que la cuenta de servicio tenga permisos de "Editor" en la hoja de cálculo
- Asegúrate de haber compartido la hoja con el email de la cuenta de servicio

### Error: "Spreadsheet not found"
- Verifica que el `SPREADSHEET_ID` sea correcto
- Asegúrate de que la hoja de cálculo exista y sea accesible

## Migración de Datos Existentes

Si ya tienes datos en el sistema de archivos JSON, puedes migrarlos manualmente:

1. Exporta los datos existentes desde los archivos JSON
2. Crea las hojas correspondientes en Google Sheets
3. Importa los datos usando la interfaz de Google Sheets

## Consideraciones de Seguridad

- Nunca commits las credenciales de Google Sheets al repositorio
- Usa variables de entorno para todas las configuraciones sensibles
- Revisa regularmente los permisos de la cuenta de servicio
- Considera rotar las claves de la cuenta de servicio periódicamente