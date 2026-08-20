import { GENEROS } from "./generos";

const FECHA = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function fecha(iso: string | null): string {
  if (!iso) return "";
  const valor = new Date(iso);
  if (Number.isNaN(valor.getTime())) return "";
  return FECHA.format(valor);
}

/** 142 -> "2 h 22 min". Es como lo lee cualquiera antes de sentarse a verla. */
export function duracion(minutos: number | null): string {
  if (!minutos || minutos <= 0) return "";
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (!horas) return `${resto} min`;
  return resto ? `${horas} h ${resto} min` : `${horas} h`;
}

export function numero(valor: number | null | undefined): string {
  return new Intl.NumberFormat("es-ES").format(valor ?? 0);
}

/** 2934567 -> "2,9 M". Los votos de una pelicula famosa no caben de otro modo. */
export function compacto(valor: number | null | undefined): string {
  if (!valor) return "";
  if (valor < 1000) return String(valor);
  return new Intl.NumberFormat("es-ES", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(valor);
}

/** 9.3 -> "9,3": una decimal siempre, que es como se enseña una nota. */
export function nota(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "";
  return valor.toFixed(1).replace(".", ",");
}

export function dinero(valor: { amount: number; currency: string } | null): string {
  if (!valor?.amount) return "";
  try {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: valor.currency,
      maximumFractionDigits: 0,
      notation: valor.amount >= 1_000_000 ? "compact" : "standard",
    }).format(valor.amount);
  } catch {
    return `${numero(valor.amount)} ${valor.currency}`;
  }
}

/** "Sci-Fi" o "sci-fi" -> "Ciencia ficción". */
export function nombreGenero(clave: string): string {
  const slug = clave
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return GENEROS[slug] ?? clave;
}

export function claveGenero(nombre: string): string {
  return nombre
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const TIPOS: Record<string, string> = {
  movie: "Película",
  tvMovie: "Telefilme",
  tvSeries: "Serie",
  tvMiniSeries: "Miniserie",
  tvSpecial: "Especial",
  short: "Cortometraje",
  video: "Vídeo",
  videoGame: "Videojuego",
  tvEpisode: "Episodio",
  Movie: "Película",
  TVSeries: "Serie",
};

export function nombreTipo(tipo: string): string {
  return TIPOS[tipo] ?? "Película";
}

export function enlacePelicula(id: string): string {
  return `/pelicula/${id}`;
}

export function enlaceGenero(clave: string, pagina = 1): string {
  return pagina > 1 ? `/genero/${clave}?p=${pagina}` : `/genero/${clave}`;
}

/** Los anchos que sirve TMDB; se elige el más ajustado por arriba. */
const ANCHOS_TMDB = [92, 154, 185, 342, 500, 780];

/**
 * Pide la carátula del ancho que hace falta.
 *
 * Las imágenes originales pesan cientos de kilobytes y una parrilla enseña
 * treinta, así que se piden ya servidas al tamaño en el que se van a ver. Los
 * dos orígenes lo permiten por URL: IMDb con instrucciones de recorte en el
 * nombre del fichero, TMDB con un tramo de ruta por ancho.
 */
export function caratula(url: string | null | undefined, ancho = 300): string | null {
  if (!url) return null;

  if (url.includes("image.tmdb.org")) {
    const elegido = ANCHOS_TMDB.find((valor) => valor >= ancho);
    return url.replace(/\/t\/p\/[^/]+\//, `/t/p/${elegido ? `w${elegido}` : "original"}/`);
  }

  return url.replace(/\._V1_[^./]*(\.[a-z]+)$/i, `._V1_QL75_UX${ancho}_$1`);
}

/** El color del metascore: verde, ámbar o rojo, como en la prensa. */
export function colorMetascore(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "var(--color-tinta-tenue)";
  if (valor >= 61) return "#3ea72d";
  if (valor >= 40) return "#d9a218";
  return "#d0342c";
}

/** Un acento por género, para que cada sección se reconozca de un vistazo. */
const COLORES: Record<string, string> = {
  action: "#ff6b3d",
  adventure: "#f0a028",
  animation: "#41b8d5",
  biography: "#b08bd6",
  comedy: "#ffd23f",
  crime: "#e0574d",
  documentary: "#6ab7a8",
  drama: "#e08fb0",
  family: "#7ec4a0",
  fantasy: "#a78bfa",
  "film-noir": "#8f9bb3",
  history: "#c9a227",
  horror: "#d64545",
  music: "#f471b5",
  musical: "#f9a8d4",
  mystery: "#7c9cf0",
  romance: "#ff8fa3",
  "sci-fi": "#4fd1c5",
  short: "#9ca3af",
  sport: "#5eb85e",
  thriller: "#e8845e",
  war: "#a68a64",
  western: "#c98b5a",
};

export function colorGenero(clave: string): string {
  return COLORES[clave] ?? "var(--color-marca)";
}

/** Quita acentos y mayúsculas: es lo que hace comparable lo que teclea la gente. */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
