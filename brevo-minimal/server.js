// Minimal Express server for forwarding lead emails to Brevo
// Requires Node.js >= 18 (global fetch)

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Security and basic middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Basic rate-limiting to avoid abuse
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 req/min per IP
});
app.use(limiter);

// Serve the demo form inline (no static files needed)
app.get('/', (_req, res) => {
  res.type('html').send(`<!doctype html>
  <html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Brevo Minimal Demo</title>
    <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu;max-width:640px;margin:40px auto;padding:0 16px}label{display:block;margin:12px 0 4px}input,button{padding:10px;font-size:16px}button{margin-top:12px}</style>
  </head>
  <body>
    <h1>Brevo Minimal Demo</h1>
    <p>Introduce tu API Key de Brevo, el ID de la lista y el email del lead. Esto se enviará al backend, que llamará a Brevo.</p>
    <form id="leadForm">
      <label>API Key</label>
      <input type="text" name="apiKey" placeholder="Tu API Key de Brevo" required />
      <label>List ID</label>
      <input type="number" name="listId" placeholder="ID de tu lista" required />
      <label>Email del lead</label>
      <input type="email" name="email" placeholder="email@ejemplo.com" required />
      <button type="submit">Guardar lead</button>
    </form>
    <pre id="out" style="background:#f6f8fa;padding:12px;border-radius:6px;margin-top:16px;white-space:pre-wrap"></pre>
    <script>
    const form = document.getElementById('leadForm');
    const out = document.getElementById('out');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      out.textContent = 'Enviando...';
      try {
        const res = await fetch('/guardar-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const json = await res.json();
        if (res.ok && json.success) {
          out.textContent = 'OK\n' + JSON.stringify(json, null, 2);
          alert('Lead guardado con éxito.');
          form.reset();
        } else {
          out.textContent = 'ERROR\n' + JSON.stringify(json, null, 2);
          alert('Error: ' + (json && (json.error ? JSON.stringify(json.error) : JSON.stringify(json))));
        }
      } catch (err) {
        out.textContent = 'ERROR\n' + err.message;
        alert('Error: ' + err.message);
      }
    });
    </script>
  </body>
  </html>`);
});

// Health check
app.get('/health', (_, res) => res.json({ ok: true }));

// Main endpoint: forwards to Brevo contacts API
app.post('/guardar-lead', async (req, res) => {
  try {
    const { apiKey, listId, email } = req.body || {};

    if (!apiKey || !listId || !email) {
      return res.status(400).json({ error: 'Faltan datos obligatorios: apiKey, listId, email' });
    }

    const parsedListId = Number(listId);
    if (!Number.isFinite(parsedListId) || parsedListId <= 0) {
      return res.status(400).json({ error: 'listId inválido' });
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'email inválido' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const respuesta = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email,
        listIds: [parsedListId]
      }),
      signal: controller.signal
    }).catch((err) => {
      if (err.name === 'AbortError') {
        throw new Error('Timeout al contactar Brevo');
      }
      throw err;
    });

    clearTimeout(timeout);

    const datos = await respuesta.json().catch(() => ({}));

    if (respuesta.ok) {
      return res.json({ success: true, datos });
    }

    return res.status(respuesta.status).json({ error: datos || 'Error desconocido de Brevo' });
  } catch (e) {
    console.error('Error /guardar-lead:', e);
    return res.status(500).json({ error: e.message || 'Error interno' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  console.log(`Abrir formulario: http://localhost:${PORT}/`);
});
