/**
 * Aviso breve que sube desde abajo y se va solo, como el "toast" de una app.
 * Del lado del navegador: lo usan los botones que no tienen otra respuesta
 * visible, como copiar un enlace.
 */
let temporizador: ReturnType<typeof setTimeout> | undefined;

export function avisar(texto: string): void {
  let aviso = document.querySelector<HTMLElement>("[data-aviso]");
  if (!aviso) {
    aviso = document.createElement("p");
    aviso.dataset.aviso = "";
    aviso.className = "aviso";
    aviso.setAttribute("role", "status");
    document.body.append(aviso);
  }
  aviso.textContent = texto;
  aviso.classList.add("visible");
  clearTimeout(temporizador);
  temporizador = setTimeout(() => aviso?.classList.remove("visible"), 2200);
}
