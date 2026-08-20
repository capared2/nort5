import type { APIRoute } from "astro";
import { obtenerIndice } from "../lib/data";
import { SITIO, absoluta } from "../lib/sitio";
import { enlaceGenero } from "../lib/format";

/**
 * Un resumen del sitio para modelos de lenguaje.
 *
 * Es el equivalente de robots.txt para quien lee para responder, no para
 * indexar: dice qué hay aquí y cómo están organizadas las páginas, sin que
 * haya que deducirlo del HTML.
 */
export const GET: APIRoute = async () => {
  const indice = await obtenerIndice();
  const generos = (indice?.genres ?? []).filter((genero) => genero.tagged > 0);

  const cuerpo = `# ${SITIO.nombre}

> ${SITIO.descripcion}

${SITIO.nombre} is a movie aggregator. Each entry gathers the critics and
audience scores, the number of reviews, the synopsis, the cast, the runtime and
where the film can be watched. Data is compiled from external sources.

- Catalogue: ${indice?.total_titles ?? 0} movies across ${generos.length} genres.
- Last updated: ${indice?.generated_at ?? "no data"}.

## How the pages are organised

- ${absoluta("/")} — featured, trending, top rated, new releases and classics.
- ${absoluta("/movie/{id}")} — a single movie; {id} is its catalogue identifier (e.g. the_godfather).
- ${absoluta("/genre/{genre}")} — every movie in a genre, paginated with ?p=N.
- ${absoluta("/genres")} — the list of genres.
- ${absoluta("/top")} — ranked by score, only movies with enough votes behind them.
- ${absoluta("/search?q={query}")} — search by title.

## Genres

${generos.map((genero) => `- [${genero.name}](${absoluta(enlaceGenero(genero.genre))}): ${genero.tagged} movies`).join("\n")}
`;

  return new Response(cuerpo, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
};
