# COOL ANIMAL

Sitio de tienda estático, mobile-first, hecho con HTML, CSS y JavaScript sin frameworks.

## Publicar

Publica esta carpeta completa en cualquier hosting estático (por ejemplo, GitHub Pages, Netlify o un servidor web). Abre `index.html` para previsualizar. No requiere compilación ni dependencias.

## Configuración antes de publicar

Edita `config.js` con los datos confirmados del negocio:

- `whatsappNumber`: número internacional solo con dígitos, por ejemplo el prefijo de país seguido del número.
- `instagramUsername`: usuario sin `@`.
- `deliveryFee`: domicilio en COP. Si se deja en `null`, el cliente puede escribir el valor confirmado en el carrito; sin ese dato el total queda “Por confirmar”.
- `paymentMethods`: opciones visibles en checkout. No incluir datos o cuentas de pago que no hayan sido confirmados.

No se han configurado números, usuarios ni tarifas ficticios. El pedido se abre en WhatsApp cuando se proporciona un número; si no, el sitio genera el mensaje y permite copiarlo.

## Reemplazar visuales

El logotipo oficial provisto está en `assets/cool-animal-logo.png`; se usa sin recolorear. El hero utiliza `assets/cool-animal-product-mockup.png`, un mockup visual del proyecto, no una fotografía del producto final. Las ilustraciones de producto en `assets/paleta-fresa.svg` y `assets/paleta-banano.svg` son temporales. Las imágenes ilustradas de perros y fruta se muestran desde `assets/placeholder-dog.svg` y `assets/placeholder-fruit.svg`. Reemplaza los visuales temporales por fotografía cuando esté disponible, conservando las referencias o actualizándolas en `index.html` y `styles.css`.

Los precios y descripciones del catálogo se encuentran en `app.js`.
