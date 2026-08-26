/**
 * Catálogo de unidades publicitarias.
 *
 * Cada unidad se pide con la global `atOptions`, que todos los `invoke.js`
 * leen al ejecutarse. Por eso cada banner se pinta dentro de su propio iframe:
 * si compartieran página se pisarían la variable y acabarían mostrando todos
 * la misma unidad, o ninguna.
 */
export interface Unidad {
  key: string;
  ancho: number;
  alto: number;
  /** Anchura mínima de pantalla para usar esta unidad. */
  desde: number;
}

/**
 * Cada hueco declara sus variantes de mayor a menor. En el navegador se elige
 * una sola según la pantalla: cargar varias y esconder las que sobran contaría
 * impresiones que nadie ve, y eso es tráfico inválido.
 */
export const HUECOS: Record<string, Unidad[]> = {
  // Franja ancha: cabecera de sección, separadores entre bloques.
  horizontal: [
    { key: "4e64bc2568aebb503c7af3862d5faeb3", ancho: 728, alto: 90, desde: 768 },
    { key: "bd7c1d31e624daa0e9907f60f4239af9", ancho: 320, alto: 50, desde: 0 },
  ],
  // Franja estrecha, para huecos con menos aire.
  franja: [
    { key: "07d46868190a2c7b3c01021ea1af0929", ancho: 468, alto: 60, desde: 520 },
    { key: "bd7c1d31e624daa0e9907f60f4239af9", ancho: 320, alto: 50, desde: 0 },
  ],
  // Rectángulo: encaja tanto en la parrilla de carátulas como junto a la ficha.
  rectangulo: [{ key: "6c416d7a4e23cbcb962e593a2dd97243", ancho: 300, alto: 250, desde: 0 }],
  // Rascacielos del lateral izquierdo. El umbral no es el de una pantalla
  // "grande" cualquiera: el contenedor mide 82rem y hasta 1664px no sobran a
  // cada lado los 160 del banner más un respiro. Por debajo no hay unidad y el
  // hueco se apaga solo, que es justo lo que se quiere.
  vertical: [{ key: "0c027922db92aedc02138502730e63c0", ancho: 160, alto: 600, desde: 1664 }],
  // El del lateral derecho, más corto: dos rascacielos iguales enmarcando la
  // página cansan la vista, y este además es otra unidad distinta.
  columna: [{ key: "a2c5b02f44b0a5cb5f7f9d2b7a2124a8", ancho: 160, alto: 300, desde: 1664 }],
};

/** Unidad nativa: se integra con el contenido y solo admite una por página. */
export const NATIVO = {
  id: "container-2a237cfc90574c3ae6546f9847d8522d",
  script: "https://pl31044366.profitableratecpmnetwork.com/2a237cfc90574c3ae6546f9847d8522d/invoke.js",
};

/**
 * Unidad que se coloca sola, sin hueco en el HTML: se inyecta una vez por
 * página y se pinta donde decide la red. Al no ocupar sitio en el documento no
 * mueve el contenido, así que se carga con el resto, no al hacer scroll.
 */
export const SUELTO = "https://pl31044373.profitableratecpmnetwork.com/04/62/eb/0462ebad51ad5a9268eae6656047389c.js";

export const BASE_INVOKE = "https://www.highrevenueformat.com";

/** Altura que se reserva antes de cargar, para que nada salte al aparecer. */
export function altoReservado(hueco: string): number {
  const variantes = HUECOS[hueco] ?? [];
  return Math.max(...variantes.map((v) => v.alto), 0);
}
