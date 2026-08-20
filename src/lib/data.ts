import type {
  ArchivoParte,
  CuboBusqueda,
  EntradaBusqueda,
  EntradaGenero,
  Indice,
  ListaGenero,
  Pelicula,
  Portada,
  Rutas,
  Tarjeta,
} from "./types";
import { claveGenero, normalizar } from "./format";

/**
 * De dónde sale el catálogo.
 *
 * Lo produce y versiona el repositorio del scraper (capared2/nort5bat); este
 * sitio solo lo consume. GitHub lo sirve con `max-age=300` y el scraper publica
 * cada pocas horas, así que las fichas llegan frescas sin reconstruir el sitio.
 *
 * Se puede apuntar a otro origen con la variable de entorno DATASET_BASE_URL
 * (otra rama, un fork o un bucket propio).
 */
const BASE = (
  import.meta.env.DATASET_BASE_URL ||
  "https://raw.githubusercontent.com/capared2/nort5bat/main/data"
).replace(/\/+$/, "");

async function leerJson<T>(ruta: string): Promise<T | null> {
  try {
    const respuesta = await fetch(`${BASE}${ruta}`);
    if (!respuesta.ok) return null;
    return (await respuesta.json()) as T;
  } catch {
    return null;
  }
}

export const obtenerIndice = () => leerJson<Indice>("/index.json");
export const obtenerPortada = () => leerJson<Portada>("/portada.json");
export const obtenerGenero = (clave: string) => leerJson<ListaGenero>(`/generos/${clave}.json`);

const obtenerParte = (genero: string, parte: number) =>
  leerJson<ArchivoParte>(`/titulos/${genero}/part-${String(parte).padStart(4, "0")}.json`);

/** De más votada a menos: es el orden en que se recorre todo el sitio. */
function porPopularidad<T extends { votes: number | null; rating: number | null }>(lista: T[]): T[] {
  return [...lista].sort(
    (a, b) => (b.votes ?? 0) - (a.votes ?? 0) || (b.rating ?? 0) - (a.rating ?? 0),
  );
}

/**
 * Una película a partir de su identificador.
 *
 * Cuesta dos lecturas pequeñas: el cubo de rutas dice en qué género y en qué
 * fichero vive, y ese fichero trae la ficha. Así la dirección pública no tiene
 * que llevar el género dentro y no se rompe si la película cambia de género.
 */
export async function obtenerPelicula(id: string): Promise<Pelicula | null> {
  // El identificador es el slug de Rotten Tomatoes, y va en la URL: se
  // comprueba antes de convertirlo en una ruta de fichero.
  if (!/^[a-z0-9][a-z0-9_-]{0,120}$/.test(id)) return null;

  const rutas = await leerJson<Rutas>(`/rutas/${id.slice(-2)}.json`);
  const destino = rutas?.titles?.[id];
  if (!destino) return null;

  const [genero, parte] = destino;
  const archivo = await obtenerParte(genero, parte);
  return archivo?.titles.find((pelicula) => pelicula.id === id) ?? null;
}

export interface PaginaGenero {
  peliculas: Pelicula[];
  total: number;
  pagina: number;
  paginas: number;
}

/**
 * Una página de películas de un género.
 *
 * Los ficheros se recorren en orden y solo se descargan los que cubren la
 * página pedida, así que el coste no depende del tamaño del archivo completo.
 */
export async function obtenerPaginaGenero(
  entrada: EntradaGenero,
  pagina: number,
  porPagina: number,
): Promise<PaginaGenero> {
  const paginas = Math.max(1, Math.ceil(entrada.titles / porPagina));
  const actual = Math.min(Math.max(1, pagina), paginas);

  const desde = (actual - 1) * porPagina;
  const hasta = desde + porPagina;

  const peliculas: Pelicula[] = [];
  let recorridos = 0;
  let inicioDelPrimero: number | null = null;

  for (const archivo of entrada.files) {
    const fin = recorridos + archivo.count;
    if (fin > desde && recorridos < hasta) {
      if (inicioDelPrimero === null) inicioDelPrimero = recorridos;
      const numero = Number(archivo.file.match(/part-(\d+)\.json$/)?.[1] ?? 1);
      const parte = await obtenerParte(entrada.genre, numero);
      if (parte) peliculas.push(...porPopularidad(parte.titles));
    }

    recorridos = fin;
    if (recorridos >= hasta) break;
  }

  const corte = desde - (inicioDelPrimero ?? 0);
  return {
    peliculas: peliculas.slice(corte, corte + porPagina),
    total: entrada.titles,
    pagina: actual,
    paginas,
  };
}

/**
 * Películas parecidas a una dada.
 *
 * La ficha de origen enlaza a otras películas, pero sólo por identificador:
 * resolver cada uno costaría una lectura por película. Se cruza esa lista con
 * lo mejor de su género, que ya es un solo fichero, así que las señaladas salen
 * primero y el resto rellena hasta completar la fila.
 */
export async function obtenerParecidas(pelicula: Pelicula, limite = 12): Promise<Tarjeta[]> {
  const claves = pelicula.genres.length
    ? pelicula.genres.map(claveGenero)
    : [pelicula.category];

  const listas = await Promise.all(claves.slice(0, 2).map((clave) => obtenerGenero(clave)));
  const candidatas = new Map<string, Tarjeta>();
  for (const lista of listas) {
    for (const tarjeta of lista?.titles ?? []) {
      if (tarjeta.id !== pelicula.id) candidatas.set(tarjeta.id, tarjeta);
    }
  }

  const senaladas = pelicula.similar
    .map((id) => candidatas.get(id))
    .filter((tarjeta): tarjeta is Tarjeta => Boolean(tarjeta));

  const vistas = new Set(senaladas.map((tarjeta) => tarjeta.id));
  const relleno = porPopularidad([...candidatas.values()].filter((t) => !vistas.has(t.id)));

  return [...senaladas, ...relleno].slice(0, limite);
}

export interface Resultado {
  id: string;
  category: string;
  title: string;
  year: number | null;
  rating: number | null;
}

/**
 * Busca por título.
 *
 * El índice está troceado por la inicial del título, así que se descargan solo
 * los trozos que empiezan como alguna de las palabras buscadas: escribir
 * «matrix» pide un fichero, y «the matrix» dos.
 */
export async function buscar(consulta: string, limite = 60): Promise<Resultado[]> {
  const terminos = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (!terminos.length) return [];

  const iniciales = [...new Set(terminos.map((t) => (/[a-z]/.test(t[0]!) ? t[0]! : "0")))].slice(0, 3);
  const cubos = await Promise.all(
    iniciales.map((letra) => leerJson<CuboBusqueda>(`/buscar/${letra}.json`)),
  );

  const vistas = new Set<string>();
  const resultados: Resultado[] = [];

  for (const cubo of cubos) {
    for (const entrada of cubo?.titles ?? []) {
      const [id, category, title, year, rating] = entrada as EntradaBusqueda;
      if (vistas.has(id)) continue;
      const heno = normalizar(title);
      if (!terminos.every((termino) => heno.includes(termino))) continue;
      vistas.add(id);
      resultados.push({ id, category, title, year, rating });
    }
  }

  // Lo que se teclea entero manda: buscar «matrix» pone «Matrix» por delante
  // de «Matrix Resurrections», y esta por delante de «The Animatrix».
  const consultaLimpia = normalizar(consulta);
  const peso = (titulo: string) => {
    const limpio = normalizar(titulo);
    if (limpio === consultaLimpia) return 3;
    if (limpio.startsWith(consultaLimpia)) return 2;
    return 1;
  };
  resultados.sort(
    (a, b) => peso(b.title) - peso(a.title) || (b.rating ?? 0) - (a.rating ?? 0),
  );

  return resultados.slice(0, limite);
}
