// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

// Render en servidor sobre Cloudflare Workers: el catalogo crece sin limite y
// prerenderizar una pagina por pelicula chocaria con el tope de ficheros de
// Cloudflare. Cada respuesta se cachea en el edge (ver Base.astro).
export default defineConfig({
  site: "https://nort5.com",
  output: "server",
  adapter: cloudflare({ imageService: "passthrough" }),
  vite: { plugins: [tailwindcss()] },
});
