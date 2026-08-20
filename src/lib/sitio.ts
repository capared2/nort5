/** Identidad del sitio, en un solo lugar. */
export const SITIO = {
  nombre: "nort5",
  dominio: "https://nort5.com",
  titulo: "nort5 · El cine, ordenado",
  // Corto a propósito: entero no cabe en la cabecera de un móvil sin recortarse.
  lema: "Agregador de películas",
  descripcion:
    "Miles de películas reunidas en un solo sitio: nota, sinopsis, reparto y ficha completa, " +
    "ordenadas por género y actualizadas cada pocas horas.",
  idioma: "es",
  locale: "es_ES",
  pais: "ES",
} as const;

/** Convierte una ruta del sitio en URL absoluta, que es lo que piden los buscadores. */
export function absoluta(ruta: string): string {
  return new URL(ruta, SITIO.dominio).href;
}
