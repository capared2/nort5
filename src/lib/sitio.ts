/** Identidad del sitio, en un solo lugar. */
export const SITIO = {
  nombre: "nort5",
  dominio: "https://nort5.com",
  titulo: "nort5 · Movies, sorted",
  // Corto a proposito: entero no cabe en la cabecera de un movil sin recortarse.
  lema: "Movie aggregator",
  descripcion:
    "Thousands of movies in one place: scores, synopsis, cast and full details, " +
    "sorted by genre and refreshed every few hours.",
  idioma: "en",
  locale: "en_US",
  pais: "US",
} as const;

/** Convierte una ruta del sitio en URL absoluta, que es lo que piden los buscadores. */
export function absoluta(ruta: string): string {
  return new URL(ruta, SITIO.dominio).href;
}
