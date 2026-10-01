/**
 * Service worker de nort5.
 *
 * Hace una sola cosa: que, instalada como app, una navegación sin conexión
 * enseñe una pantalla propia en vez del dinosaurio del navegador. No guarda
 * páginas ni datos: el HTML ya lo cachea el edge (ver src/middleware.ts) y
 * duplicarlo aquí solo serviría fichas viejas.
 *
 * La pantalla va dentro de este mismo fichero y no en uno aparte: así no hay
 * nada que precargar ni redirecciones del servidor de estáticos que la
 * estropeen al servirla como respuesta de una navegación.
 */

const SIN_CONEXION = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0b0d12">
<title>Offline · nort5</title>
<style>
  :root { color-scheme: dark; --fondo: #0b0d12; --tinta: #f3f5f9; --suave: #a8b2c1; --marca: #ffc233; }
  html.claro { color-scheme: light; --fondo: #f5f6f8; --tinta: #0f1319; --suave: #4c5666; --marca: #a97400; }
  * { box-sizing: border-box; margin: 0; }
  body {
    min-height: 100dvh; display: grid; place-items: center; padding: 2rem;
    background: var(--fondo); color: var(--tinta); text-align: center;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    -webkit-tap-highlight-color: transparent;
  }
  svg { width: 4.5rem; height: 4.5rem; color: var(--marca); }
  h1 { margin-top: 1.5rem; font-size: 1.6rem; letter-spacing: -0.02em; }
  p { margin: 0.75rem auto 0; max-width: 22rem; color: var(--suave); line-height: 1.5; }
  button {
    margin-top: 1.75rem; border: 0; border-radius: 999px; padding: 0.8rem 1.6rem;
    background: var(--marca); color: #10131a; font: inherit; font-weight: 700; cursor: pointer;
  }
  button:active { transform: scale(0.96); }
</style>
<script>try{document.documentElement.classList.toggle("claro",localStorage.getItem("tema")==="claro")}catch(e){}</script>
</head>
<body>
<main>
  <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <rect width="40" height="40" rx="9" fill="currentColor"></rect>
    <rect x="6.5" y="10" width="27" height="20" rx="2.5" fill="#0b0d12"></rect>
    <g fill="currentColor">
      <rect x="8.5" y="12" width="3" height="3" rx="0.8"></rect>
      <rect x="8.5" y="18.5" width="3" height="3" rx="0.8"></rect>
      <rect x="8.5" y="25" width="3" height="3" rx="0.8"></rect>
      <rect x="28.5" y="12" width="3" height="3" rx="0.8"></rect>
      <rect x="28.5" y="18.5" width="3" height="3" rx="0.8"></rect>
      <rect x="28.5" y="25" width="3" height="3" rx="0.8"></rect>
      <path d="M17.5 15.2 25 20l-7.5 4.8V15.2Z"></path>
    </g>
  </svg>
  <h1>You are offline</h1>
  <p>The movies will be back as soon as your connection is. Check it and try again.</p>
  <button type="button" onclick="location.reload()">Try again</button>
</main>
</body>
</html>`;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    (async () => {
      // La precarga pide la página en paralelo al arranque del worker: sin
      // ella, cada navegación esperaría a que el worker despierte.
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (evento) => {
  // Imágenes, estilos, anuncios y analítica van directos a la red.
  if (evento.request.mode !== "navigate") return;

  evento.respondWith(
    (async () => {
      try {
        const precargada = await evento.preloadResponse;
        if (precargada) return precargada;
        return await fetch(evento.request);
      } catch {
        return new Response(SIN_CONEXION, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
    })(),
  );
});
