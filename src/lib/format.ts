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
  tv: "Serie",
  tvSeries: "Serie",
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

/** El color de un porcentaje de Rotten Tomatoes: fresco, regular o podrido. */
export function colorPorcentaje(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "var(--color-tinta-tenue)";
  if (valor >= 60) return "#3ea72d";
  if (valor >= 40) return "#d9a218";
  return "#d0342c";
}

/** Un acento por género, para que cada sección se reconozca de un vistazo. */
const COLORES: Record<string, string> = {
  accion: "#ff6b3d",
  aventura: "#f0a028",
  animacion: "#41b8d5",
  anime: "#7c9cf0",
  biografia: "#b08bd6",
  comedia: "#ffd23f",
  crimen: "#e0574d",
  documental: "#6ab7a8",
  drama: "#e08fb0",
  fantasia: "#a78bfa",
  historia: "#c9a227",
  navidad: "#e05252",
  terror: "#d64545",
  "infantil-y-familiar": "#7ec4a0",
  lgbtq: "#f471b5",
  musica: "#f471b5",
  musical: "#f9a8d4",
  "misterio-y-suspense": "#7c9cf0",
  naturaleza: "#5eb85e",
  romance: "#ff8fa3",
  "ciencia-ficcion": "#4fd1c5",
  cortometraje: "#9ca3af",
  deporte: "#5eb85e",
  monologos: "#ffd23f",
  belico: "#a68a64",
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
