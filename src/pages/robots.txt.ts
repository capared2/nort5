import type { APIRoute } from "astro";
import { absoluta } from "../lib/sitio";

export const GET: APIRoute = () => {
  const cuerpo = `User-agent: *
Allow: /
# Search generates endless combinations and none of them belong in an index.
Disallow: /search

Sitemap: ${absoluta("/sitemap.xml")}
`;

  return new Response(cuerpo, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
};
