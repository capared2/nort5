import type { APIRoute } from "astro";
import { absoluta } from "../lib/sitio";

export const GET: APIRoute = () => {
  const cuerpo = `User-agent: *
Allow: /
# La búsqueda genera infinitas combinaciones y ninguna aporta nada al índice.
Disallow: /buscar

Sitemap: ${absoluta("/sitemap.xml")}
`;

  return new Response(cuerpo, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
};
