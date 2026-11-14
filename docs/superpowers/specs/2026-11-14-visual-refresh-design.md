# Diseño de mejora visual aprobado

El usuario autorizó realizar las seis mejoras enumeradas: portada/búsqueda, jerarquía, tarjetas, estados prudentes, móvil y consistencia entre temas. La implementación se basa en main 4f09649 y conserva los 579 servicios, 18 categorías, 179 marcas, favoritos, comentarios y gráficas actuales.

Se mantiene la identidad y estructura editorial existente en lugar de sustituirla por una marca nueva o la antigua demo de 72 servicios. La demo actual usa el generador estático existente y una capa visual aislada; la aplicación Next recibe navegación móvil, controles y semántica de resumen coherentes. No hay cambios DB o API. Se publicará solo el artefacto estático en gh-pages con historia normal; main requiere revisión independiente.

La comparación usará capturas reales con el mismo catálogo y viewport. Validación: suite existente del catálogo, unitarias, TypeScript, Chromium móvil/escritorio/teclado/favoritos/gráficas, contraste de textos medidos y CSS focalizado de Next. No afirmar conformidad total ni disponibilidad pública si no se pudo comprobar por red.
