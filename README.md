# nelmondo26

Sitio estático (Astro) con las propuestas del CAVA para la Consulta dei Veneti nel Mondo.

## Estructura

```
src/            el sitio (lo que hay que editar)
  data/         proposte.json: todos los textos
  pages/        landing y subpáginas de las propuestas
  components/   piezas reutilizables (tarjetas, chips, header…)
  layouts/      estructura común (head, footer)
  styles/       tokens.css (colores, medidas) y global.css
  assets/       logo y fuentes que usa la web (optimizados)
public/         archivos que se sirven tal cual (favicon, imagen OG, video/)
recursos/       material original, no se publica
  presentaciones/  las dos presentaciones HTML (fuente del contenido)
  fuentes/         paquete completo de ZT Nature
  logo/            logo original en alta resolución
```

`dist/`, `node_modules/` y `.astro/` se generan solos: no hace falta tocarlos.

## Correrlo

Requiere Node 20+.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # genera dist/ (para Netlify, Vercel o GitHub Pages)
npm run preview  # sirve dist/ en local
```

Antes de publicar, poné el dominio en `astro.config.mjs` (`site`). Si va a GitHub Pages en un subpath, agregá también `base: '/nombre-repo'`.

## Agregar un video a una propuesta

1. Copiá el archivo a `public/video/<slug>.mp4`. El slug es el de la URL, por ejemplo `scambio-giovanile`.
2. Opcional, pero recomendado: agregá el poster en `public/video/<slug>.jpg` (o `.webp`).
3. Volvé a hacer el build. El video se detecta solo.

También podés indicar las rutas a mano en los campos `video` y `poster` de `src/data/proposte.json`. Conviene un video corto, sin audio y comprimido (H.264, ~1080p, pocos MB). Si el usuario tiene activado el ahorro de datos, el video no se carga, y si pidió reducir las animaciones, queda en pausa.

## Editar un texto

Todo el contenido está en `src/data/proposte.json`:

- `proposte`: `titolo`, `sintesi` (se usa como meta description) y `testo` (un elemento del array por cada párrafo).
- `ragioni`: los 5 motivos de "Perché puntare sull'Argentina".
- `rete`: los datos de la sección "La rete".

El footer (contacto) está en `src/layouts/BaseLayout.astro`. Los placeholders entre `[corchetes]` están marcados con `TODO`. Colores y medidas: `src/styles/tokens.css`.
