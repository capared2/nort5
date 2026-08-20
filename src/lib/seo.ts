import type { EntradaGenero, Indice, Pelicula, Tarjeta } from "./types";
import { SITIO, absoluta } from "./sitio";
import { claveGenero, enlaceGenero, enlacePelicula, nombreGenero } from "./format";

/** El sitio como entidad: lo consultan tanto buscadores como modelos de lenguaje. */
export function organizacion() {
  return {
    "@type": "Organization",
    "@id": absoluta("/#organizacion"),
    name: SITIO.nombre,
    url: SITIO.dominio,
    description: SITIO.descripcion,
    logo: {
      "@type": "ImageObject",
      url: absoluta("/logo.svg"),
      width: 512,
      height: 512,
    },
  };
}

export function sitioWeb() {
  return {
    "@type": "WebSite",
    "@id": absoluta("/#sitio"),
    url: SITIO.dominio,
    name: SITIO.nombre,
    description: SITIO.descripcion,
    inLanguage: SITIO.idioma,
    publisher: { "@id": absoluta("/#organizacion") },
    // Habilita la caja de búsqueda en los resultados de Google.
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluta("/buscar?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function migas(pasos: { nombre: string; ruta: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: pasos.map((paso, indice) => ({
      "@type": "ListItem",
      position: indice + 1,
      name: paso.nombre,
      item: absoluta(paso.ruta),
    })),
  };
}

/** 142 -> "PT2H22M", que es como schema.org quiere una duración. */
function duracionIso(minutos: number | null): string | undefined {
  if (!minutos || minutos <= 0) return undefined;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return `PT${horas ? `${horas}H` : ""}${resto ? `${resto}M` : ""}`;
}

const persona = (nombre: string) => ({ "@type": "Person", name: nombre });

export function peliculaJsonLd(pelicula: Pelicula) {
  const url = absoluta(enlacePelicula(pelicula.id));
  return {
    "@type": "Movie",
    "@id": `${url}#pelicula`,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    name: pelicula.title,
    alternateName:
      pelicula.original_title !== pelicula.title ? pelicula.original_title : undefined,
    description: pelicula.plot || undefined,
    image: pelicula.poster ?? undefined,
    genre: pelicula.genres.map(nombreGenero),
    datePublished: pelicula.release_date ?? undefined,
    duration: duracionIso(pelicula.runtime_minutes),
    contentRating: pelicula.certificate ?? undefined,
    inLanguage: pelicula.languages[0] ?? undefined,
    countryOfOrigin: pelicula.countries.map((pais) => ({ "@type": "Country", name: pais })),
    productionCompany: pelicula.companies.map((nombre) => ({
      "@type": "Organization",
      name: nombre,
    })),
    keywords: pelicula.keywords.length ? pelicula.keywords.join(", ") : undefined,
    director: pelicula.directors.map((quien) => persona(quien.name)),
    author: pelicula.writers.map((quien) => persona(quien.name)),
    actor: pelicula.cast.slice(0, 10).map((quien) => persona(quien.name)),
    aggregateRating:
      pelicula.rating !== null && pelicula.votes
        ? {
            "@type": "AggregateRating",
            ratingValue: pelicula.rating,
            ratingCount: pelicula.votes,
            bestRating: 10,
            worstRating: 1,
          }
        : undefined,
    // Los datos son de IMDb: decirlo también aquí, no solo en el pie.
    sameAs: pelicula.url,
    // Para asistentes de voz y respuestas generadas: qué leer en alto si
    // alguien pregunta por esta película.
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".sinopsis"],
    },
  };
}

/** Una lista ordenada: así los buscadores entienden portadas y géneros. */
export function listado(peliculas: (Tarjeta | Pelicula)[], nombre: string) {
  const listadas = peliculas.slice(0, 30);
  return {
    "@type": "ItemList",
    name: nombre,
    numberOfItems: listadas.length,
    itemListElement: listadas.map((pelicula, indice) => ({
      "@type": "ListItem",
      position: indice + 1,
      url: absoluta(enlacePelicula(pelicula.id)),
      name: pelicula.title,
    })),
  };
}

/** Envuelve los bloques en un solo @graph, que es como conviene servirlos. */
export function grafo(bloques: object[]) {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": bloques });
}

// --- Grafos listos para cada tipo de página ---

export function grafoPortada(peliculas: Tarjeta[]) {
  return [
    organizacion(),
    sitioWeb(),
    {
      "@type": "CollectionPage",
      "@id": absoluta("/#inicio"),
      url: SITIO.dominio,
      name: SITIO.titulo,
      description: SITIO.descripcion,
      inLanguage: SITIO.idioma,
      isPartOf: { "@id": absoluta("/#sitio") },
      about: { "@type": "Thing", name: "Cine" },
      mainEntity: listado(peliculas, "Películas destacadas"),
    },
  ];
}

export function grafoGenero(clave: string, nombre: string, peliculas: (Tarjeta | Pelicula)[], pagina: number) {
  const url = absoluta(enlaceGenero(clave, pagina));
  return [
    organizacion(),
    sitioWeb(),
    migas([
      { nombre: "Inicio", ruta: "/" },
      { nombre: "Géneros", ruta: "/generos" },
      { nombre, ruta: enlaceGenero(clave) },
    ]),
    {
      "@type": "CollectionPage",
      "@id": `${url}#coleccion`,
      url,
      name: `Películas de ${nombre}`,
      description: `Las mejores películas de ${nombre}, con su nota, su sinopsis y su ficha completa.`,
      inLanguage: SITIO.idioma,
      isPartOf: { "@id": absoluta("/#sitio") },
      about: { "@type": "Thing", name: nombre },
      mainEntity: listado(peliculas, `Películas de ${nombre}`),
    },
  ];
}

export function grafoGeneros(indice: Indice | null) {
  return [
    organizacion(),
    sitioWeb(),
    migas([
      { nombre: "Inicio", ruta: "/" },
      { nombre: "Géneros", ruta: "/generos" },
    ]),
    {
      "@type": "CollectionPage",
      "@id": absoluta("/generos#coleccion"),
      url: absoluta("/generos"),
      name: "Todos los géneros",
      inLanguage: SITIO.idioma,
      isPartOf: { "@id": absoluta("/#sitio") },
      hasPart: (indice?.genres ?? []).map((genero: EntradaGenero) => ({
        "@type": "CollectionPage",
        url: absoluta(enlaceGenero(genero.genre)),
        name: genero.name || nombreGenero(genero.genre),
      })),
    },
  ];
}

export function grafoPelicula(pelicula: Pelicula) {
  const principal = pelicula.genres[0] ?? pelicula.category;
  return [
    organizacion(),
    sitioWeb(),
    migas([
      { nombre: "Inicio", ruta: "/" },
      { nombre: "Géneros", ruta: "/generos" },
      { nombre: nombreGenero(principal), ruta: enlaceGenero(claveGenero(principal)) },
      { nombre: pelicula.title, ruta: enlacePelicula(pelicula.id) },
    ]),
    peliculaJsonLd(pelicula),
  ];
}

export function grafoTop(peliculas: Tarjeta[]) {
  return [
    organizacion(),
    sitioWeb(),
    migas([
      { nombre: "Inicio", ruta: "/" },
      { nombre: "Mejor valoradas", ruta: "/top" },
    ]),
    {
      "@type": "CollectionPage",
      "@id": absoluta("/top#coleccion"),
      url: absoluta("/top"),
      name: "Las películas mejor valoradas",
      inLanguage: SITIO.idioma,
      isPartOf: { "@id": absoluta("/#sitio") },
      mainEntity: listado(peliculas, "Películas mejor valoradas"),
    },
  ];
}
