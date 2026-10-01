/**
 * Tema claro u oscuro, del lado del navegador.
 *
 * Lo usan el botón de la cabecera y el selector del menú. Además del color de
 * la página cambia el de la barra del sistema (`theme-color`): instalada como
 * app, una barra oscura encima de una página clara delata que es una web.
 */

/** El mismo fondo de cada tema (ver global.css), para la barra del sistema. */
const BARRA = { oscuro: "#0b0d12", claro: "#f5f6f8" } as const;

export function esClaro(): boolean {
  return document.documentElement.classList.contains("claro");
}

/** Marca el botón del tema activo en los selectores que haya en la página. */
export function sincronizarTema(): void {
  const claro = esClaro();
  document.querySelectorAll<HTMLElement>("[data-tema]").forEach((boton) => {
    boton.setAttribute("aria-pressed", String((boton.dataset.tema === "claro") === claro));
  });
}

export function ponerTema(claro: boolean): void {
  document.documentElement.classList.toggle("claro", claro);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", claro ? BARRA.claro : BARRA.oscuro);
  sincronizarTema();
  try {
    localStorage.setItem("tema", claro ? "claro" : "oscuro");
  } catch {
    // Navegador con el almacenamiento cerrado: el tema dura esta visita.
  }
}
