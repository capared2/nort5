import type { APIRoute } from "astro";
import { obtenerPortada } from "../lib/data";
import { SITIO, absoluta } from "../lib/sitio";
import { enlacePelicula, nombreGenero } from "../lib/format";

const escapar = (texto: string) =>
  texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const GET: APIRoute = async () => {
  const portada = await obtenerPortada();
  const peliculas = portada?.recientes ?? [];

  const items = peliculas
    .map((pelicula) => {
      const url = absoluta(enlacePelicula(pelicula.id));
      const generos = pelicula.genres.map(nombreGenero).join(", ");
      const descripcion = [pelicula.plot, generos && `Género: ${generos}`]
        .filter(Boolean)
        .join(" · ");
      return `    <item>
      <title>${escapar(pelicula.year ? `${pelicula.title} (${pelicula.year})` : pelicula.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapar(descripcion)}</description>
      ${generos ? `<category>${escapar(generos)}</category>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapar(SITIO.nombre)} · novedades</title>
    <link>${SITIO.dominio}</link>
    <description>${escapar(SITIO.descripcion)}</description>
    <language>${SITIO.idioma}</language>
    <lastBuildDate>${new Date(portada?.generated_at ?? Date.now()).toUTCString()}</lastBuildDate>
    <atom:link href="${absoluta("/rss.xml")}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
};
