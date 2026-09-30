# CRM Reformas · Demo · WhiteMoon

Demo navegable de un CRM para empresas de reformas, hecha por
[WhiteMoon](https://whitemoon.es): embudo de leads, presupuestador con vista
del cliente, flujo automático al aceptar, obras, facturas y finanzas.

**Todos los datos son ficticios.** "Reformas Norte", sus clientes, obras,
importes y facturas son de ejemplo. No hay backend: nada se guarda ni se envía,
todo vive en memoria y se reinicia al recargar. Los WhatsApp de la demo se
abren sin teléfono para que elijas tú el contacto.

Web estática (HTML, CSS y JS sin frameworks), sin peticiones externas y sin
indexar (`noindex` + `robots.txt`).

## Probar en local

Cualquier servidor estático sirve. Desde la raíz del repo:

```sh
python -m http.server 8000
```

y abre <http://localhost:8000>. Abrir `index.html` con doble clic también
funciona, pero la fuente local puede no cargar por `file://`.

## Estructura

```
index.html          esqueleto, metas, CSP y franja de contacto
assets/crm.css      estilos
assets/crm.js       lógica y datos de ejemplo
assets/fonts/       Sora (variable, latin)
assets/img/og.jpg   imagen para compartir el enlace
```
