# nort5 — agregador de películas

Frontend de **nort5.com**: reúne miles de películas, las ordena por género y
enlaza cada ficha a su página de origen en Rotten Tomatoes.

Hecho con **Astro 7 + TypeScript + Tailwind 4**, renderizado en el servidor
sobre **Cloudflare Workers**.

## Cómo obtiene los datos

Este repositorio **no guarda ninguna ficha**: las lee por HTTP, en tiempo de
ejecución, del repositorio que se encarga de recogerlas
([capared2/nort5bat](https://github.com/capared2/nort5bat)).

```
capared2/nort5bat  ──── data/*.json ────►  raw.githubusercontent.com
   (recolección)                                     │
                                                     ▼
                                            este sitio (Cloudflare)
                                                     │
                                                     ▼
                                            caché en el edge
```

Esto tiene dos consecuencias útiles: el sitio no necesita reconstruirse cuando
entran películas nuevas (aparecen solas), y las dos piezas evolucionan por
separado.

GitHub sirve esos JSON con `max-age=300` y la recolección publica cada pocas
horas, así que el catálogo llega fresco. Encima, cada página se cachea en el
edge de Cloudflare (`s-maxage` + `stale-while-revalidate`), de modo que la
mayoría de las visitas ni siquiera llegan a pedir nada a GitHub.

Para apuntar a otro origen —otra rama, un fork, un bucket propio— basta con
definir `DATASET_BASE_URL`. Por defecto:
`https://raw.githubusercontent.com/capared2/nort5bat/main/data`.

## Por qué SSR y no páginas estáticas

El catálogo crece sin límite. Prerenderizar una página por película chocaría
con los límites de ficheros por despliegue, así que las páginas se generan en
el servidor y se cachean en el edge.

Cloudflare Workers corta a los 10 ms de CPU por petición en el plan gratuito,
y eso condiciona todo el diseño de los datos: **ninguna página recorre el
archivo entero**.

| Página | Lecturas al dataset |
| --- | --- |
| Inicio | 2 (`index.json` + `portada.json`) |
| Ficha de una película | 3 (rutas, su parte, y el género para las parecidas) |
| Género | 3 (índice, lista del género, una parte del archivo) |
| Búsqueda | 2-4 (un trozo del índice por inicial buscada) |
| Sitemaps | 1, y se devuelve tal cual, sin parsear |

## Páginas

| Ruta | Qué es |
| --- | --- |
| `/` | destacada, lo más visto, mejor valoradas, estrenos y clásicos |
| `/pelicula/{id}` | ficha completa; `{id}` es el identificador en Rotten Tomatoes (p. ej. `the_godfather`) |
| `/genero/{género}` | imprescindibles del género y su archivo, paginado con `?p=N` |
| `/generos` | todos los géneros, con su peso en el catálogo |
| `/top` | ranking por nota, solo con las que superan los 25.000 votos |
| `/buscar?q=` | búsqueda por título, original o traducido |
| `/rss.xml`, `/robots.txt`, `/llms.txt`, `/sitemap*.xml` | lo que consumen buscadores y modelos |

La dirección de una película es solo su identificador, sin el género: una
película puede cambiar de género principal entre recolecciones y una dirección
ya publicada no puede romperse por eso.

## SEO, AEO y GEO

Todo sale del propio dataset, sin nada que mantener a mano:

- **Metadatos**: canónica, `robots` sin límite de fragmento ni de imagen,
  Open Graph (con `video:*` en las fichas), Twitter Cards y `rel=prev/next` en
  las páginas de género.
- **Datos estructurados**: un solo `@graph` de schema.org por página, con
  `Organization`, `WebSite` (más `SearchAction`, que habilita la caja de
  búsqueda en Google), `BreadcrumbList`, `CollectionPage`, `ItemList` y
  `Movie` completa —nota, votos, duración, clasificación, dirección, reparto,
  país y productora.
- **AEO**: `speakable` en cada ficha, que marca qué leer en alto si alguien
  pregunta por una película.
- **GEO**: `/llms.txt` describe el sitio, cómo están organizadas las páginas y
  de dónde salen los datos, para quien lee para responder y no para indexar.
- **Sitemaps**: los genera la recolección, con la carátula de cada película
  incluida para entrar en Google Imágenes; aquí solo se sirven.

## Diseño

Oscuro de partida, porque el cine se ve a oscuras, con un único color fuerte
—el ámbar de la sala— para notas, acentos y botones. Hay tema claro detrás del
botón de la cabecera; la preferencia se guarda en el navegador.

Las carátulas se piden ya servidas al ancho en el que se van a ver: el
redimensionador de Flixster lleva la medida en la propia ruta, y una parrilla
enseña treinta imágenes de golpe. En origen vienen a 68×102 píxeles.

Cada tarjeta enseña el porcentaje de los críticos con su color —verde, ámbar o
rojo—, que es lo que se lee de un vistazo sin interpretar un número.

## Desarrollo

```bash
npm install
npm run dev          # servidor local
npm run check        # tipos
npm run build        # construir el worker
npm run check:deploy # comprobar que el worker se puede desplegar
```

Para trabajar contra un dataset propio:

```bash
DATASET_BASE_URL=http://127.0.0.1:8787 npm run dev
```

## Origen de los datos

Las fichas y las carátulas proceden de Rotten Tomatoes, que es de Fandango.
nort5 no está asociado con ellos y cada ficha enlaza a su página de origen.
