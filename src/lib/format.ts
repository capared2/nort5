import { GENEROS } from "./generos";

const FECHA = new Intl.DateTimeFormat("en-US", {
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
/** 142 -> "2h 22m", que es como se lee una duracion antes de sentarse a verla. */
export function duracion(minutos: number | null): string {
  if (!minutos || minutos <= 0) return "";
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (!horas) return `${resto}m`;
  return resto ? `${horas}h ${resto}m` : `${horas}h`;
}

export function numero(valor: number | null | undefined): string {
  return new Intl.NumberFormat("en-US").format(valor ?? 0);
}

/** 2934567 -> "2,9 M". Los votos de una pelicula famosa no caben de otro modo. */
export function compacto(valor: number | null | undefined): string {
  if (!valor) return "";
  if (valor < 1000) return String(valor);
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(valor);
}

/** 9.3 -> "9.3": una decimal siempre, que es como se enseña una nota. */
export function nota(valor: number | null | undefined): string {
  if (valor == null) return "";
  return valor.toFixed(1);
}

export function dinero(valor: { amount: number; currency: string } | null): string {
  if (!valor?.amount) return "";
  try {
    return new Intl.NumberFormat("en-US", {
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
  movie: "Movie",
  tv: "TV series",
  tvSeries: "TV series",
};

export function nombreTipo(tipo: string): string {
  return TIPOS[tipo] ?? "Movie";
}

export function enlacePelicula(id: string): string {
  return `/movie/${id}`;
}

export function enlaceGenero(clave: string, pagina = 1): string {
  return pagina > 1 ? `/genre/${clave}?p=${pagina}` : `/genre/${clave}`;
}

/**
 * Pide la carátula del ancho que hace falta.
 *
 * Las imágenes de una parrilla se cuentan por decenas, así que se piden ya
 * servidas al tamaño en el que se van a ver. El redimensionador de Flixster
 * lleva la medida en la propia ruta y acepta cambiarla; sólo se toca la
 * primera, porque la URL lleva otra anidada dentro.
 */
export function caratula(url: string | null | undefined, ancho = 300): string | null {
  if (!url) return null;
  const alto = Math.round(ancho * 1.5);
  return url.replace(/\/\d{2,4}x\d{2,4}\//, `/${ancho}x${alto}/`);
}

/** Como la anterior, para las imágenes apaisadas (fondos y fotogramas). */
export function apaisada(url: string | null | undefined, ancho = 800): string | null {
  if (!url) return null;
  const alto = Math.round((ancho * 9) / 16);
  return url.replace(/\/\d{2,4}x\d{2,4}\//, `/${ancho}x${alto}/`);
}

/** El color de un porcentaje: alto, regular o bajo. */
export function colorPorcentaje(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "var(--color-tinta-tenue)";
  if (valor >= 60) return "#3ea72d";
  if (valor >= 40) return "#d9a218";
  return "#d0342c";
}

/** Un acento por género, para que cada sección se reconozca de un vistazo. */
const COLORES: Record<string, string> = {
  action: "#ff6b3d",
  adventure: "#f0a028",
  animation: "#41b8d5",
  anime: "#7c9cf0",
  biography: "#b08bd6",
  comedy: "#ffd23f",
  crime: "#e0574d",
  documentary: "#6ab7a8",
  drama: "#e08fb0",
  fantasy: "#a78bfa",
  history: "#c9a227",
  holiday: "#e05252",
  horror: "#d64545",
  "kids-family": "#7ec4a0",
  lgbtq: "#f471b5",
  music: "#f471b5",
  musical: "#f9a8d4",
  "mystery-thriller": "#7c9cf0",
  nature: "#5eb85e",
  romance: "#ff8fa3",
  "sci-fi": "#4fd1c5",
  short: "#9ca3af",
  sports: "#5eb85e",
  "stand-up": "#ffd23f",
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
