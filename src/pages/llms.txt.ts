import type { APIRoute } from "astro";
import { obtenerIndice } from "../lib/data";
import { SITIO, absoluta } from "../lib/sitio";
import { enlaceGenero } from "../lib/format";

/**
 * Un resumen del sitio para modelos de lenguaje.
 *
 * Es el equivalente de robots.txt para quien lee para responder, no para
 * indexar: dice qué hay aquí, cómo están organizadas las páginas y de dónde
 * salen los datos, sin que haya que deducirlo del HTML.
 */
export const GET: APIRoute = async () => {
  const indice = await obtenerIndice();
  const generos = (indice?.genres ?? []).filter((genero) => genero.tagged > 0);

  const cuerpo = `# ${SITIO.nombre}

> ${SITIO.descripcion}

${SITIO.nombre} es un agregador de películas. Cada ficha reúne la nota, el número
de votos, la sinopsis, el reparto, la duración y los datos de producción, y
enlaza a su página de origen en IMDb, que es de donde se recogen.

- Catálogo: ${indice?.total_titles ?? 0} películas en ${generos.length} géneros.
- Actualizado: ${indice?.generated_at ?? "sin datos"}.
- Origen de los datos: imdb.com (recogidos por https://github.com/capared2/nort5bat).

## Cómo están organizadas las páginas

- ${absoluta("/")} — destacadas, mejor valoradas, estrenos y clásicos.
- ${absoluta("/pelicula/{id}")} — ficha de una película; {id} es su identificador de IMDb (ttNNNNNNN).
- ${absoluta("/genero/{género}")} — todas las películas de un género, paginadas con ?p=N.
- ${absoluta("/generos")} — el listado de géneros.
- ${absoluta("/top")} — ranking por nota, solo con las que superan los 25.000 votos.
- ${absoluta("/buscar?q={consulta}")} — búsqueda por título.

## Géneros

${generos.map((genero) => `- [${genero.name}](${absoluta(enlaceGenero(genero.genre))}): ${genero.tagged} películas`).join("\n")}
`;

  return new Response(cuerpo, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
};
