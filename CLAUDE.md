# CLAUDE.md

Landing page estática de **M.C Love Travel** (tours al Volcán Acatenango, Guatemala). Dominio `mclovetravel.com`
(GitHub Pages desde la rama `main`; DNS en Cloudflare). Dueño: Denilson. No es técnico: explicarle en español sencillo.

## Archivos
- `index.html`: todo el sitio (HTML + CSS en `<style>` + JS al final). Sin build ni dependencias.
- `fotos/webp/N.webp`: 213 fotos; `fotos/og.jpg` vista previa para compartir.
- `sitemap.xml` / `robots.txt`: actualizar `<lastmod>` al cambiar contenido.
- `worker.js`: proxy de Gemini del chat antiguo. **Ya no se usa** (rediseño 2026-10-12 quitó el chat: todo va a WhatsApp,
  donde responde el bot del sistema `mclove-sistema`). El Worker sigue desplegado en Cloudflare hasta que el dueño lo borre.

## Reglas de contenido
- Trato de **usted**. Datos del negocio = los mismos que usa el bot (`mclove-sistema/conocimiento/conocimiento_clientes_v08.md`).
  Si cambian precios o fechas, cambiar en los dos lados.
- Cada tour dice claramente **qué volcán se sube y cuál solo se ve** (un cliente creyó que el camping Q450 subía el Fuego).
- Campaña de asalto: tarjetas con `data-date="AAAA-MM-DD"`; el JS las oculta solas cuando pasan y, sin fechas, esconde la
  sección y los enlaces `data-camp-link`. Para nuevas fechas: copiar una tarjeta y cambiar fecha/textos + `WA_TEXT`.
- No prometer seguridad, clima, erupciones ni cráter.

## Bilingüe
Cada texto traducible tiene su inglés en `data-en` (innerHTML); placeholders en `data-ph-en`. `applyLang()` alterna.
Idioma inicial: inglés si el navegador no está en español (se recuerda en localStorage).

## WhatsApp
Botones con `data-wa="clave"`; el texto prellenado sale de `WA_TEXT` (es/en). Los textos están pensados para el bot:
"quiero apartar ... 24 de octubre" inicia la reserva de la campaña; "información del tour al Acatenango" recibe la ficha.

## Vista previa y publicación
- Cambios en una rama (p. ej. `rediseno`) y vista previa en `https://raw.githack.com/denimayca0-commits/mc-love-travel/<commit>/index.html`.
- Publicar = fusionar a `main` y hacer push (GitHub Pages se actualiza en 1-2 minutos). Solo con aprobación del dueño.
