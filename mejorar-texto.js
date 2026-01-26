const fetch = require('node-fetch');

const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'openai/gpt-3.5-turbo';

async function mejorarTexto(texto) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ejemplo.com',
            'X-Title': 'Mejorar Texto CLI'
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [{
                role: 'user',
                content: `Mejora este texto, corrige errores, hazlo más claro y profesional: "${texto}"`
            }]
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}

const texto = process.argv[2] || 'Hola esto es una prueba de mejora de texto';

mejorarTexto(texto).then(console.log);