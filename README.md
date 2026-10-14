# nelmondo26

Sitio estático en HTML, CSS y JS puros con las propuestas del CAVA para la Consulta dei Veneti nel Mondo. No hace falta instalar ni compilar nada.

## Estructura

```
index.html          landing (propuestas, chi siamo, la rete, perché vale la pena, footer)
proposte/           una página por propuesta (proposte/<slug>.html)
css/style.css       todo el diseño. Colores y medidas, arriba de todo en :root
js/main.js          animaciones, menú, videos de fondo
assets/fonts/       ZT Nature (textos) y DM Serif Display (títulos, licencia OFL)
assets/img/         logo, favicon, imagen para redes (og.jpg)
video/              videos de fondo (ver videosabuscar.txt)
recursos/           material original, no se publica (incluye videos-originales/ en alta)
insporemake/        bocetos de inspiración
```

## Verlo

Abrí `index.html` con doble clic. Para verlo como en un servidor real (lo más fiel), desde esta carpeta:

```bash
npx serve .        # o: python -m http.server
```

Para publicarlo, subí la carpeta tal cual a Netlify, Vercel, GitHub Pages o cualquier hosting.

## Agregar los videos de fondo

Mirá `videosabuscar.txt`: dice qué video buscar para cada página y con qué nombre guardarlo en `video/`. Apenas el archivo existe, se muestra solo con un fundido sobre el gradiente, con una capa oscura encima para que el texto se lea. Si el visitante tiene activado el ahorro de datos o pidió reducir las animaciones, el video no se carga.

## Editar textos

Los textos están directamente en el HTML. Nav, menú y footer se repiten en las 8 páginas: si cambiás algo ahí (por ejemplo el mail de contacto del footer), cambialo en todas.
