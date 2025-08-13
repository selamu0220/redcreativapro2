# Brevo Minimal Demo

Backend Express mínimo para reenviar leads a Brevo (Sendinblue) por cada usuario usando su propia API Key y List ID.

## Requisitos
- Node.js >= 18 (usa `fetch` global)

## Ejecutar localmente
```bash
# Instalar dependencias
npm install

# Iniciar servidor
npm start
```

Servidor en: http://localhost:3000

Abre en el navegador y completa:
- API Key (del usuario)
- List ID (lista de ese usuario en Brevo)
- Email del lead

El backend llamará a `POST https://api.brevo.com/v3/contacts` con `listIds: [listId]`.

## Endpoints
- `GET /` — formulario HTML de prueba.
- `POST /guardar-lead` — cuerpo JSON `{ apiKey, listId, email }`.
- `GET /health` — healthcheck.

## Seguridad (recomendaciones)
- Usar HTTPS (no enviar API keys por HTTP).
- Validar inputs (email, listId numérico).
- Timeouts y manejo de errores/429 en Brevo.
- Rate limiting básico incluido.
- CORS según tu caso.

## Despliegue rápido
- Vercel / Railway / Render: sube este directorio y define `node >= 18`.
- Comando de inicio: `npm start`.

## Nota
Este demo no almacena nada en tu servidor; sólo reenvía al API de Brevo. Para producción en tu app principal, lo ideal es guardar la API key y List ID por usuario una vez (autenticado) y enviar sólo el email del lead en el formulario público.
