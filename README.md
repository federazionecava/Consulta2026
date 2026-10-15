# nelmondo26

Sitio estático en HTML, CSS y JS puros con las propuestas del CAVA para la Consulta dei Veneti nel Mondo. No hace falta instalar ni compilar nada.

## Estructura

```
index.html          landing (propuestas, chi siamo, la rete, perché vale la pena, footer)
proposte/           una página por propuesta (proposte/<slug>.html)
css/style.css       todo el diseño. Colores y medidas, arriba de todo en :root
js/main.js          animaciones, nav, menú, mapa, videos de fondo
assets/fonts/       ZT Nature (la tipografía del CAVA)
assets/img/         logo, íconos, imágenes de vista previa (og.jpg y og/)
video/              videos de fondo, ya comprimidos (720p, sin audio)
favicon.ico         ícono de la pestaña
site.webmanifest    íconos para "agregar a inicio" en celulares

recursos/           material de trabajo: NO se publica
  presentaciones/     las dos presentaciones HTML (fuente del contenido)
  fuentes/            paquete completo de ZT Nature
  logo/               logo original (png y svg)
  videos-originales/  videos en alta, sin comprimir (fuera de git, ver .gitignore)
  insporemake/        bocetos de inspiración
  generador/          script que genera los .html (ver abajo)
  tiempos.txt         distancias y horas de micro desde Buenos Aires
  videosabuscar.txt   qué video va en cada página
```

Para publicar, alcanza con subir todo **menos** `recursos/`.

## Verlo

Abrí `index.html` con doble clic. Para verlo como en un servidor real (lo más fiel), desde esta carpeta:

```bash
npx serve .        # o: python -m http.server
```

## Editar

Los textos están directamente en el HTML. Nav, menú y footer se repiten en las 8 páginas: si cambiás algo ahí (por ejemplo el mail de contacto), cambialo en todas.

Las páginas se generaron con `recursos/generador/build.mjs` (necesita Node):

```bash
node recursos/generador/build.mjs .
```

Es más cómodo para cambios grandes (todas las páginas de una), pero **reescribe los .html**: si editaste algo a mano, pasalo también al script antes de correrlo.

## Antes de publicar: el dominio

La vista previa al compartir por WhatsApp (imagen + título) necesita la dirección completa de la web. Todos los `.html` usan `https://consulta.comitatocava.org`. Si el dominio cambia, hacé un **buscar y reemplazar** por la nueva dirección (sin barra al final) en `index.html`, en la carpeta `proposte/` y en `recursos/generador/build.mjs` (constante `SITE`).

Después de publicar, se puede probar cómo se ve el link en https://www.opengraph.xyz o en el depurador de Facebook. WhatsApp guarda en caché las vistas previas: si cambiás la imagen, puede tardar en actualizarse.

## Videos de fondo

Están en `video/`, uno por página (`landing.mp4` y `<slug-de-la-propuesta>.mp4`). Si querés cambiar uno, reemplazá el archivo con el mismo nombre (mp4 H.264, sin audio, idealmente < 5 MB). Si un archivo no existe, la página muestra el gradiente. Detalle en `recursos/videosabuscar.txt`.

---

## Pendientes para mañana

**Para que la web funcione bien publicada**
- [x] Dominio configurado en los `.html`: `https://consulta.comitatocava.org`.
- [ ] **Elegir dónde publicar** (GitHub Pages, Netlify, Vercel…) y apuntar `consulta.comitatocava.org` ahí. Hasta que esté online, WhatsApp no muestra la imagen de vista previa.
- [ ] **Hacer el primer commit.** Nada de lo de hoy está commiteado. Ojo: `git` no está en el PATH de esta compu (se puede usar GitHub Desktop).
- [ ] Probar el link compartido por WhatsApp una vez publicado.
- [ ] Probar en un **iPhone y un Android reales**: videos de fondo, menú, mapa (tocar ciudades) y navegación entre propuestas.

**Datos para confirmar con el CAVA**
- [ ] **Gualeguay o Gualeguaychú**: la presentación dice *Gualeguay*, `tiempos.txt` dice *Gualeguaychú* (son ciudades distintas). Hoy la web usa Gualeguaychú.
- [ ] **18 o 19 località**: "Chi siamo" dice 18 (como la presentación), pero la lista de sedes tiene 19 contando Mar del Plata.
- [ ] **La Pampa = Santa Rosa**: confirmar que la asociación está en Santa Rosa.
- [ ] Comparaciones con Italia que agregué yo (aproximadas): **Rosario ≈ Venezia–Milano (270 km)** y **Mar del Plata ≈ Venezia–Genova (390 km)**. Las de Córdoba y Mendoza vienen de la presentación.

**Textos en italiano para que revise alguien del CAVA**
- [ ] Hero corto de la propuesta 2: *Candidatura dell'Argentina a sede della Consulta* + su subtítulo.
- [ ] Footer: *Un ponte tra il Veneto e l'Argentina. / Per sostenere le proposte o collaborare con il CAVA, scriveteci.*
- [ ] La rete: *…per ritrovarsi, ognuno parte da qui.*
- [ ] Vista previa al compartir: *Da Venezia a Buenos Aires: sette proposte…* / *11.400 km tra il Veneto e l'Argentina, una sola comunità…*

**Contenido que falta**
- [ ] Video para la franja "Perché vale la pena" (`video/associazioni.mp4`): gente del CAVA, una fiesta, una reunión. Hoy tiene fondo liso.
- [ ] Fotos reales (eventos, sedes, socios): es lo que más haría que la web no parezca hecha por IA.
- [ ] Más texto por propuesta si existe (antecedentes, ejemplos concretos). Hoy cada una tiene una sola frase.
- [ ] Opcional: firma y fecha ("Buenos Aires, [fecha] · [Nombre], Presidente del CAVA").

**Ideas que quedaron sueltas**
- [ ] Emojis de las propuestas: quedaron los del sistema (en Windows se ven distintos que en iPhone). Opción: Fluent Emoji 3D como imágenes.
- [ ] Título corto en el hero también para otras propuestas largas (por ejemplo la 1), como se hizo en la 2.
- [ ] Versión más liviana del video de la landing para celulares (hoy pesa 6,6 MB).
