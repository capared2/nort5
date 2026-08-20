import type { APIRoute } from "astro";

/**
 * Sirve los sitemaps que genera la recolección.
 *
 * Construirlos aquí costaría recorrer todo el catálogo en cada petición, y
 * Cloudflare Workers corta a los 10 ms de CPU: se devuelven tal cual llegan,
 * sin parsearlos.
 */
const PERMITIDOS = /^sitemap(-generos|-peliculas-\d{4})?$/;

const BASE = (
  import.meta.env.DATASET_BASE_URL ||
  "https://raw.githubusercontent.com/capared2/nort5bat/main/data"
).replace(/\/+$/, "");

export const GET: APIRoute = async ({ params }) => {
  const nombre = params.sitemap ?? "";
  if (!PERMITIDOS.test(nombre)) {
    return new Response("No encontrado", { status: 404 });
  }

  const respuesta = await fetch(`${BASE}/seo/${nombre}.xml`);
  if (!respuesta.ok) {
    return new Response("No encontrado", { status: 404 });
  }

  return new Response(respuesta.body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
};
