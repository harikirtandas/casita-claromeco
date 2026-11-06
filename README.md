# Mi Casita en Claromecó

Landing estática para promocionar el alquiler de la casa. Sin frameworks ni build:
son tres archivos y una carpeta de fotos.

```
index.html     ← la página (arriba de todo están los datos editables)
styles.css     ← los estilos
script.js      ← galería, mapa y animaciones
img/           ← las 17 fotos (.avif + .jpg de respaldo)
docs/          ← propuesta y precios internos (solo local, no está en el repo)
```

Los originales sin procesar quedaron fuera del proyecto, en
`../alquiler-fotos-originales/`, para que no se publiquen.

## Qué hay que completar

Todo lo editable está en un solo lugar: el bloque `window.CASITA` dentro de
`index.html` (buscá **DATOS EDITABLES**, cerca de la línea 30).

| Dato | Qué es |
|---|---|
| `telefono` | WhatsApp en formato internacional, solo números: `5492983590095` |
| `telefonoVisible` | Cómo se ve escrito en la página |
| `precio` | El número grande de la sección Valor |
| `precioDetalle` | La aclaración de abajo (por noche, por semana, etc.) |
| `precioNotas` | Lista de aclaraciones chicas (podés dejarla vacía: `[]`) |
| `direccion` | Lo que se muestra en Ubicación |
| `lat` / `lon` | Coordenadas del mapa |
| `mensajeWsp` | El texto con el que se abre WhatsApp |

Hoy están cargados: **US$ 60 por día**, mínimo 3 días, ingreso y salida a las
11 h, y el mapa apunta a la esquina de **calle 34 y 37** (`-38.849596,
-60.061975`).

### Cómo sacar lat/lon

Abrí Google Maps, clic derecho sobre la casa → el primer renglón del menú son
las coordenadas. Copialas tal cual.

## Probarla en la compu

```sh
python3 -m http.server 8000
```

y entrá a <http://localhost:8000>.

## Publicación

La web está en **Cloudflare Pages**, conectada a este repo de GitHub
(`harikirtandas/casita-claromeco`). Cada push a `main` dispara un deploy
automático: no hay que subir nada a mano.

```sh
git add -A && git commit -m "..." && git push
```

En un minuto el cambio está online. El estado de cada deploy se ve en el panel
de Cloudflare: **Workers & Pages → el proyecto → Deployments**. Como no hay
build, en la configuración del proyecto el *Build command* va vacío y el
*Build output directory* es `/` (la raíz del repo).

Antes estaba en GitHub Pages, que quedó desactivado; el `.nojekyll` es de esa
época y no molesta.

### Lo que no se publica

Cloudflare publica solo lo que está en el repo. La carpeta `docs/` (propuestas
para el cliente y la tabla de precios interna) está en `.gitignore`, así que
queda solo en la compu y nunca llega a la web. **No subas la carpeta a mano**
(arrastrándola al panel o con `wrangler pages deploy`): ese camino ignora el
`.gitignore` y publicaría `docs/`.

## Cambiar o agregar fotos

Las fotos viven en `img/`, cada una en dos formatos: `.avif` (liviana, la que
usa el navegador) y `.jpg` (respaldo). En `index.html` cada foto es un bloque
`<figure class="gal__i">`.

Para convertir una foto nueva desde la Terminal de la Mac:

```sh
sips -s format jpeg -s formatOptions 72 -Z 1600 foto-nueva.heic --out img/nombre.jpg
```

Si solo tenés el `.jpg`, borrá la línea `<source ... type="image/avif">` de ese
bloque y dejá el `<img src="img/nombre.jpg">`.

Las clases sirven para armar la grilla:

- `gal__i--wide` → ocupa dos columnas
- `gal__i--tall` → ocupa dos filas
- `gal__i--mas` → queda escondida detrás del botón **Ver más fotos**

De entrada se ven 8 fotos y las otras 9 aparecen al tocar el botón. Están
pensadas para que la grilla cierre justa, sin huecos: contando cada foto normal
como 1, las `wide` y las `tall` como 2, cada grupo tiene que sumar un múltiplo
de 3. Si agregás o sacás fotos, acordate de actualizar el número que dice el
botón en `index.html`.

En el visor ampliado se pueden recorrer las 17, estén o no desplegadas.
