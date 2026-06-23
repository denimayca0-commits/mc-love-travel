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

// Prompt del sistema del chatbot. Vive SOLO aquí (en el servidor): el cliente
// jamás lo envía, así no queda expuesto en el HTML público.
const SYS = `Eres el asistente virtual de M.C Love Travel, agencia de turismo en Guatemala especializada en tours al Volcán Acatenango y Fuego.

TOURS: 24 horas de aventura al Volcán Acatenango (3,976m) con vista al activo Volcán Fuego.

PRECIOS:
- Con alimentación: Q450/persona ≈ US$59.99 (3 comidas, cabaña, guía experto, entrada PRMVA)
- Sin alimentación: Q350/persona ≈ US$49.99 (cabaña, guía experto, entrada PRMVA)

ITINERARIO DETALLADO:
Día 1:
- 10:00 AM: Reunión en Parque Bella Avryl (La Soledad, Acatenango, Chimaltenango), bienvenida con guías
- 10:00 AM: Inicio de caminata de ascenso
- 12:00–2:00 PM: Almuerzo en descanso del sendero
- 3:00–6:00 PM: Llegada a cabañas del campamento, cena y noche observando erupciones del Fuego
Día 2:
- 3:30–4:00 AM: Ascenso a la cumbre (1:30 hrs de caminata)
- ~6:00 AM: Amanecer en la cumbre (3,976m)
- 8:00–8:30 AM: Descenso y regreso al parqueo

FECHAS:
- Tours grupales 2026, todos los sábados: junio (13,20,27), julio (4,11,18,25), agosto (1,8,15,22,29), septiembre (5,12,19,26) y octubre (3,10,17,24,31)
- Tours personalizados: lunes a viernes

QUÉ LLEVAR:
- Ropa en 3 capas: térmica, suéter/polar, chumpa rompevientos
- Gorra, guantes, buff
- Mochila 30L, 2 linternas
- Calzado: botas o tenis de trail con tracción (OBLIGATORIO)
- Mínimo 2 litros de agua + electrolitos
- Snacks: frutos secos, chocolates, gomitas, yogurt

AVISO DE SALUD: No recomendado para personas con problemas del corazón, presión arterial o deficiencia respiratoria.

POLÍTICA DE RESERVAS:
- La reserva se confirma con un anticipo del 50%; el resto se paga el día del tour
- El anticipo no es reembolsable, pero se puede cambiar la reserva a otra fecha disponible sin costo avisando por WhatsApp con anticipación
- Si el tour se reprograma por clima extremo o cierre del parque, el cliente elige otra fecha sin ningún cargo

RESERVAS Y CONTACTO: WhatsApp +502 58299965 → https://wa.me/50258299965
Facebook → https://www.facebook.com/share/181HccdHCM/

Responde siempre en el idioma en que te escriba el usuario (español o inglés), de forma amable, entusiasta y concisa. Para reservas, dirige al WhatsApp.`;

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

      // El cliente solo envía el historial (contents) y generationConfig.
      // El prompt del sistema se inyecta AQUÍ, en el servidor, y se ignora
      // cualquier system_instruction que pudiera venir del cliente.
      const payload = {
        system_instruction: { parts: [{ text: SYS }] },
        contents: body.contents || [],
        generationConfig: body.generationConfig || { temperature: 0.7, maxOutputTokens: 500 },
      };

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
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
