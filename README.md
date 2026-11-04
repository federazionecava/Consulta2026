# nelmondo26

Sitio estático en HTML, CSS y JS puros con las propuestas del CAVA para la Consulta dei Veneti nel Mondo. No hace falta instalar ni compilar nada.

## Estructura

```
index.html          landing (propuestas, chi siamo, la rete, perché vale la pena, footer)
proposte/           una página por propuesta (proposte/<slug>.html)
documento/          el PDF con las ocho propuestas (lo genera build.mjs)
css/style.css       todo el diseño. Colores y medidas, arriba de todo en :root
js/main.js          animaciones, nav, menú, mapa, chips de sedes (celular), botón compartir, videos de fondo
assets/fonts/       ZT Nature (la tipografía del CAVA): solo los 5 pesos que usa la web
assets/img/         logo, íconos, imágenes de vista previa (og.jpg y og/)
video/              videos de fondo, ya comprimidos (720p, sin audio)
favicon.ico         ícono de la pestaña
site.webmanifest    íconos para "agregar a inicio" en celulares

recursos/           material de trabajo: NO se publica
  presentaciones/     las dos presentaciones HTML (fuente del contenido)
  logo/               logo original (png y svg)
  videos-originales/  videos en alta, sin comprimir (fuera de git, ver .gitignore)
  insporemake/        bocetos de inspiración
  generador/          script que genera los .html (ver abajo) y plantilla de las imágenes de vista previa (og.html)
  tiempos.txt         distancias y horas de micro desde Buenos Aires
  videosabuscar.txt   qué video va en cada página
  propuesta8-radicamento-attivo.docx   texto original que mandaron para la propuesta 8
```

Para publicar, alcanza con subir todo **menos** `recursos/` (en Vercel lo deja afuera `.vercelignore`).

## Verlo

Abrí `index.html` con doble clic. Para verlo como en un servidor real (lo más fiel), desde esta carpeta:

```bash
npx serve .        # o: python -m http.server
```

## Editar

Los textos están directamente en el HTML. Nav, menú y footer se repiten en las 9 páginas: si cambiás algo ahí (por ejemplo el mail de contacto), cambialo en todas.

Las páginas se generaron con `recursos/generador/build.mjs` (necesita Node):

```bash
node recursos/generador/build.mjs .
```

Es más cómodo para cambios grandes (todas las páginas de una), pero **reescribe los .html**: si editaste algo a mano, pasalo también al script antes de correrlo.

### Contenido de cada propuesta

Los textos de las propuestas están en la lista `P`, al principio de `build.mjs`. Además del título y la síntesis (que van también a la landing y al PDF), cada propuesta puede tener secciones que **solo salen en su página web**:

- `testo`: `[etiqueta, título, [párrafos]]`. Bloque de texto; el primer párrafo sale más grande.
- `ragioni`: tarjetas con emoji de "Perché puntare sull'Argentina" (solo la 2; también salen en el PDF).
- `programma`: `[título, [[emoji, título, texto], …]]`. Tarjetas con emoji (qué podría incluir, cómo funcionaría, etc.).
- `storia`: `[título, [[etiqueta, texto], …], intro opcional]`. Línea de tiempo; si la etiqueta es *Oggi* o *Domani* el punto sale dorado.

Arriba de cada propuesta hay un comentario con las fuentes que se usaron para investigar ese contenido.

Cada propuesta tiene un `area` (ámbito), definido en `AREE`: istituzioni, giovani, agricoltura y lavoro (*Lavoro e territorio*, color naranja, agregado con la propuesta 8). La cantidad de propuestas ("Proposta 3 di 8", "Otto proposte, quattro ambiti", "/ 08") sale sola del largo de `P`; solo hay que tocar a mano `AMBITI_IT` si cambian los ámbitos.

### Imágenes de vista previa (`assets/img/og/`)

Se arman con `recursos/generador/og.html` (1200×630): fondo = un cuadro del video de la propuesta, logo, *Proposta N di 8*, título y la barra de colores. Se le pasan los datos en el `#` de la URL y se saca una captura con Chrome:

```bash
chrome --headless=new --hide-scrollbars --window-size=1200,630 --screenshot=salida.png "file:///.../recursos/generador/og.html#{\"bg\":\"file:///.../cuadro.png\",\"eb\":\"Proposta 8 di 8\",\"t\":\"Radicamento attivo nel Veneto\"}"
```

El cuadro se saca del video con ffmpeg (`ffmpeg -ss 1 -i video/x.mp4 -frames:v 1 -vf "scale=1200:675,crop=1200:630" cuadro.png`). Si se agrega otra propuesta, hay que regenerar todas (cambia el *di N*) y subir el `?v=` de `image:` en `build.mjs` para que WhatsApp no muestre las viejas.

## Antes de publicar: el dominio

La vista previa al compartir por WhatsApp (imagen + título) necesita la dirección completa de la web. Todos los `.html` usan `https://consulta.comitatocava.org`. Si el dominio cambia, hacé un **buscar y reemplazar** por la nueva dirección (sin barra al final) en `index.html`, en la carpeta `proposte/` y en `recursos/generador/build.mjs` (constante `SITE`).

Los textos de la vista previa son cortos a propósito (WhatsApp corta lo largo): están en la tabla `SHARE` de `build.mjs` (título ≤ 50 caracteres, descripción ≤ 100). Para Google se usa esa descripción más *"Una proposta del CAVA per la Consulta dei Veneti nel Mondo."* (120–160 caracteres).

Después de publicar, se puede probar cómo se ve el link en https://www.opengraph.xyz o en el depurador de Facebook. WhatsApp guarda en caché las vistas previas (también las que fallaron): para probar enseguida, mandá el link con `?v=2` al final.

## Documento PDF

`documento/CAVA-Proposte-Consulta-Veneti-nel-Mondo.pdf` (12 páginas A4) se descarga desde el botón *Scarica il documento*, debajo de las tarjetas de la landing. Tiene portada con índice, una página por propuesta con todo el contenido de su página web (texto, tarjetas, línea de tiempo y rol de las asociaciones), chi siamo, la rete con el mapa y, al final, un QR que lleva a la web. Cada propuesta tiene que entrar en una sola hoja: si le agregás mucho texto, abrí `recursos/documento/documento.html` en el navegador y fijate que no se corte abajo.

Lo genera el mismo `build.mjs`, con los mismos textos que las páginas: arma `recursos/documento/documento.html` y lo imprime con Chrome o Edge (si no encuentra ninguno, explica cómo imprimirlo a mano). El diseño está en `recursos/generador/documento.css`. Si cambia el dominio, regenerá también el QR (`recursos/generador/qr.svg`): el comando está en `build.mjs`, en la sección *Documento PDF*.

## Botón compartir

Cada propuesta tiene, al final, un botón *Condividi la proposta* que abre el menú de compartir del sistema (en el iPhone, el mismo de cualquier app: WhatsApp, Mensajes, Mail, AirDrop…), con el título y la descripción de la vista previa. Si el navegador no tiene ese menú (por ejemplo Firefox en la compu, o al abrir el archivo con doble clic en vez de desde la web publicada), copia el link al portapapeles. No está en el HTML: lo agrega `js/main.js` y comparte la dirección de `<link rel="canonical">` (la publicada, aunque lo pruebes en local).

## Videos de fondo

Están en `video/`, uno por página (`landing.mp4` y `<slug-de-la-propuesta>.mp4`). Si querés cambiar uno, reemplazá el archivo con el mismo nombre (mp4 H.264, sin audio, idealmente < 5 MB). Si un archivo no existe, la página muestra el gradiente. Detalle en `recursos/videosabuscar.txt`.

---

## Pendientes para mañana

**Para que la web funcione bien publicada**
- [x] Dominio configurado en los `.html`: `https://consulta.comitatocava.org`.
- [x] Publicado en Vercel en `consulta.comitatocava.org`.
- [x] Vercel publica los commits nuevos (antes el plan gratis bloqueaba los deploys de quien no es miembro del equipo `federazionecava`). Ojo: `git` no está en el PATH de esta compu (se puede usar GitHub Desktop).
- [x] Probar el link compartido por WhatsApp una vez publicado: anda.
- [ ] Probar en un **iPhone y un Android reales**: videos de fondo, menú, mapa (tocar ciudades) y navegación entre propuestas.

**Datos para confirmar con el CAVA**
- [ ] **Gualeguay o Gualeguaychú**: la presentación dice *Gualeguay*, `tiempos.txt` dice *Gualeguaychú* (son ciudades distintas). Hoy la web usa Gualeguaychú.
- [ ] **18 o 19 località**: "Chi siamo" dice 18 (como la presentación), pero la lista de sedes tiene 19 contando Mar del Plata.
- [ ] **La Pampa = Santa Rosa**: confirmar que la asociación está en Santa Rosa.
- [ ] Comparaciones con Italia que agregué yo (aproximadas): **Rosario ≈ Venezia–Milano (270 km)** y **Mar del Plata ≈ Venezia–Genova (390 km)**. Las de Córdoba y Mendoza vienen de la presentación.

**Contenido ampliado de las propuestas (investigado, parte inventado): confirmar con el CAVA**
- [ ] P1: que no hubo visitas oficiales de la Región a Argentina después de 2006 (no encontré ninguna). Las fechas 1989–2006 salen de la historia del CAVA en miveneto.it.
- [ ] P2: que Mendoza 2006 fue la última Consulta en Argentina. La tarjeta *L'accoglienza del CAVA* compromete al CAVA a poner sedes, contactos y voluntarios.
- [ ] P3: la propuesta dice *riattivare*: ¿qué programa juvenil había antes y cuándo se cortó? Con ese dato el texto queda más firme.
- [ ] P4: las becas de máster de la Región aparecen solo en 2018 y 2019; confirmar si hubo ediciones después.
- [ ] P5: los cuatro pedidos de *Cosa chiede il CAVA alla Regione* son una propuesta mía.
- [ ] P6 y P7: los *abbinamenti* (Conegliano–Mendoza, Rafaela, Pergamino, Marcos Juárez, Villa Regina) y las estaciones del INTA son ideas para mostrar el potencial, no acuerdos existentes.
- [ ] En todas: las tarjetas de *programma* (qué incluiría, cómo funcionaría) son propuestas razonables, no compromisos de nadie.

**Propuesta 8 (*Radicamento attivo nel Veneto*): confirmar con quien la mandó**
- [ ] Que va como propuesta 8 de la web y del PDF, en un ámbito nuevo, *Lavoro e territorio*.
- [ ] El texto habla de **Sudamérica**, no de Argentina como las otras siete. Se dejó así.
- [ ] El original está escrito como reflexión ("¿es posible una política de atracción?"). En la web quedó en la voz de las demás: *Il CAVA propone di studiare seriamente…*
- [ ] Lo único que no sale del documento: el título del rol de las asociaciones (*Capitale umano*, con el texto de "Giovani" de la presentación) y la línea *Domani · Un bando sperimentale pilota* (sale del último párrafo).
- [ ] Revisión del italiano. Ya corregido: *proggeto, esistentii, opportunitá, sará, dovrá, E', linee guide*.

**Textos en italiano para que revise alguien del CAVA**
- [ ] Todo el contenido ampliado de las ocho propuestas (secciones `testo`, `programma` y `storia` en `build.mjs`).
- [ ] Hero corto de la propuesta 2: *Candidatura dell'Argentina a sede della Consulta* + su subtítulo.
- [ ] Footer: *Un ponte tra il Veneto e l'Argentina. / Per sostenere le proposte o collaborare con il CAVA, scriveteci.*
- [ ] La rete: *…per ritrovarsi, ognuno parte da qui.*
- [ ] Vista previa al compartir: los títulos y descripciones cortos de la tabla `SHARE` en `build.mjs` (por ejemplo *Proposta 1 · Le Autorità del Veneto in Argentina*) y el de la landing: *CAVA · Proposte per la Consulta dei Veneti nel Mondo* / *Otto proposte per rafforzare i rapporti tra Veneto e Argentina, su istituzioni, giovani, agricoltura e lavoro.*

**Contenido que falta**
- [ ] Fotos reales (eventos, sedes, socios): es lo que más haría que la web no parezca hecha por IA.
- [x] Más texto por propuesta: cada página tiene ahora texto, tarjetas y línea de tiempo (ver arriba qué confirmar).
- [ ] Opcional: firma y fecha ("Buenos Aires, [fecha] · [Nombre], Presidente del CAVA").

**Ideas que quedaron sueltas**
- [ ] Emojis de las propuestas: quedaron los del sistema (en Windows se ven distintos que en iPhone). Opción: Fluent Emoji 3D como imágenes.
- [ ] Título corto en el hero también para otras propuestas largas (por ejemplo la 1), como se hizo en la 2.
- [ ] Versión más liviana del video de la landing para celulares (hoy pesa 6,6 MB).
