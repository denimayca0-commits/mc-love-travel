// Cloudflare Worker — Proxy seguro para Gemini API
// La API key NUNCA sale de Cloudflare. Se guarda como Secret (env.GEMINI_API_KEY).
//
// CÓMO USAR:
//  1. Ve a https://dash.cloudflare.com → Workers & Pages → Create Worker
//  2. Pega este código completo y haz clic en "Deploy"
//  3. En Settings → Variables → Add secret → nombre: GEMINI_API_KEY → pega tu nueva key
//  4. Copia la URL del Worker (ej: https://mc-love-chat.TU-USUARIO.workers.dev)
//  5. Pégala en index.html donde dice WORKER_URL

const ALLOWED_ORIGIN = 'https://denimayca0-commits.github.io';

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Solo acepta POST desde el origen permitido
    const origin = request.headers.get('Origin');
    if (request.method !== 'POST' || origin !== ALLOWED_ORIGIN) {
      return new Response('Forbidden', { status: 403 });
    }

    try {
      const body = await request.json();

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      const data = await geminiRes.json();
      return new Response(JSON.stringify(data), {
        status: geminiRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: { message: 'Error interno del Worker' } }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
