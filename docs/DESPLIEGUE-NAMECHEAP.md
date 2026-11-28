# Despliegue controlado: Namecheap Stellar Plus (cPanel)

**Decisión (14/11/2026):** usar Namecheap Stellar Plus y dominio propio, sin Vercel. **Este procedimiento aún no se ha ejecutado en la cuenta real**.

## Arquitectura comprobable y restricciones

- PulsoVE usa Next.js 16, Node.js 22+, PostgreSQL 16+ y salida `standalone` ya habilitada en `next.config.mjs`.
- Namecheap documenta Node.js 22 mediante **Setup Node.js App**; comprobar versión disponible en la cuenta.
- Hosting compartido: cron no más frecuente que cada 5 minutos; límites sobre procesos independientes persistentes y actividades de rastreo. No desplegar un motor de sondeos sin cumplir las restricciones.
- La BD PostgreSQL local ofrecida en el hosting no está confirmada como 16+. Conseguir una instancia 16+ accesible de forma segura, con backups probados. No activar recursos no identificados de terceros.
- Dominio, rutas de aplicación y SSH, TLS, entorno Passenger, PostgreSQL, colas, correo, permisos y rollback: **sin verificar** en producción.

## Empaquetado, sin ejecutar cambios en hosting

1. En ambiente Linux equivalente al servidor con **Node.js 22**, ejecutar `npm ci` con lockfile.
2. Usar una **base PostgreSQL temporal de compilación** con datos no sensibles y las variables necesarias. Ejecutar `npm run build:cpanel`. Este comando ejecuta `next build`, verifica el servidor standalone generado por Next y copia `public/` y `.next/static/` al paquete.
3. Verificar manualmente que no existen credenciales, claves ni bases con datos reales en los archivos incluidos. La herramienta impide copiar archivos `.env*` desde las rutas del proyecto, pero no detecta todos los posibles secretos en bundles.
4. Archivar en ZIP **el contenido de** `.next/standalone/`. Es la raíz a utilizar en el panel; `server.js` ya está generado por Next.js, no es un servidor personalizado.
5. CI realiza las pruebas de empaquetado y arranque con PostgreSQL **efímero**. Un CI verde no valida la instancia Namecheap.

## Obtener ZIP de staging desde GitHub (sin instalar Git en cPanel)

1. Abrir el repositorio GitHub **medinacaj/web-pulso-ve** → pestaña **Actions** → workflow **Namecheap cPanel — paquete staging descargable**. Un paquete se publica automáticamente cuando una nueva revisión entra en la rama `main` (no solo al modificar el workflow); también puedes obtener uno actualizado mediante ejecución manual. Los procesos de compilación obsoletos se cancelan para ahorrar recursos de CI.
2. Si quieres recompilar la versión actual: en **Run workflow**, seleccionar la rama **main** y ejecutar. Si ya existe una ejecución `push` exitosa de la versión requerida, puedes usar su artefacto sin repetir la compilación. El proceso compila Next.js 16 con Node.js 22, PostgreSQL 16 **efímero**, realiza pruebas y busca secretos conocidos en el paquete.
3. Al finalizar exitosamente, abrir esa ejecución y descargar en **Artifacts** el ZIP llamado **pulsove-namecheap-staging-[SHA]**. La descarga manual de GitHub requiere acceso autorizado a la cuenta. El artefacto expira tras siete días.
4. Extraer el ZIP localmente. Su contenido raíz debe incluir **server.js**, **preflight-namecheap.mjs**, **INSTALACION-NAMECHEAP.md**, **BUILD_COMMIT.txt**, **.next/**, **node_modules/** y **public/** (cuando el proyecto contiene activos públicos). No copiar el directorio de origen ni sustituirlo por una demo estática.
5. Comprobar `BUILD_COMMIT.txt` contra el SHA de GitHub Actions que generó el ZIP. Revisar la guía incluida `INSTALACION-NAMECHEAP.md` antes de configurar la aplicación. Subir el **contenido extraído** al directorio privado que será Application root en cPanel, nunca directamente a **public_html**. Configurar **Setup Node.js App** y variables sensibles en el servidor conforme a la sección siguiente.
6. El ZIP es únicamente un **artefacto de staging**: no incluye una base de datos productiva, credenciales, programación de sondeos, panel administrativo, SMTP ni certificados. Hasta que se cumplan #109 y las pruebas reales en Namecheap, **no ponerlo frente a tráfico público**.

**Nota de compatibilidad:** GitHub compila en Linux Ubuntu; la cuenta Namecheap puede tener otra versión de bibliotecas del sistema, Passenger o estructura de procesos. Verificar compatibilidad al arrancar el paquete en cPanel antes de declarar una instalación exitosa.

## cPanel: pasos previstos, pendientes de inspección y ejecución

1. Crear un **subdominio de staging** sobre HTTPS sin indexación. No reemplazar el dominio público actual.
2. Subir/descomprimir los archivos mediante File Manager/SFTP/SSH en un **directorio privado fuera de `public_html`**, por ejemplo `~/pulsove-staging`.
3. Ir a **Setup Node.js App** → **Create Application**. Configurar **Node.js 22**, **Production**, **Application root** con el directorio recién creado, **Application URL** con el subdominio y **Application startup file: `server.js`**.
4. Introducir las variables sensibles **solo mediante el panel del servidor**, nunca en ZIP, GitHub ni directorio público: `NODE_ENV=production`, `DATABASE_URL` para PostgreSQL 16+ con TLS validado, `ANONYMIZATION_SALT` aleatorio, `SITE_URL`. Añadir otras claves cuando las funciones que dependen de ellas estén implementadas. Mantener `PUBLIC_INDEXABLE=false` y `ENABLE_TECHNICAL_CHECKS=false`. Establecer `TRUSTED_CLIENT_IP_HEADER` solo cuando proxy/encabezados sean verificados.
5. Confirmar compatibilidad del arranque/puerto/sockets **Passenger** del hosting con el `server.js` generado. No asumir que las pruebas de Node local reproducen el proceso de cPanel.
6. En PostgreSQL de **staging** ejecutar migraciones versionadas y semillas con rol restringido. No aplicar migraciones ni semillas en la base productiva sin respaldo, revisión de impacto y plan de reversión.
7. En la raíz privada de la aplicación, con las variables reales del servidor cargadas y acceso seguro a PostgreSQL, ejecutar `node preflight-namecheap.mjs`. Solo consulta configuración, versión de PostgreSQL y presencia de tablas; devuelve errores y advertencias **sin imprimir contraseñas, host interno ni secretos**. Debe pasar Node 22+, HTTPS, `DATABASE_URL` para PostgreSQL 16+ y migraciones. Un resultado favorable **no certifica** dominio/SSL, SMTP, monitoreo, sesiones ni producción.
8. Probar HTTPS, archivos estáticos, `/api/health`, reportes reales, fallas de BD, límites, cookies, cabeceras, logs, privacidad, permisos, reinicios y recuperación. Mantener indexación desactivada hasta aprobación.
9. Guardar el artefacto anterior para **rollback**, y respaldo de BD restituible. Cambiar DNS o dominio público solo cuando los criterios de [Issue #109](https://github.com/medinacaj/web-pulso-ve/issues/109) estén cumplidos.

## Pendientes independientes del empaquetado

- **Monitoreo real:** no hay un trabajador aprobado y permanente; definir fuentes oficiales verificadas y programador compatible, posiblemente fuera del hosting web.
- **Autenticación/Centro de Control:** no están operativos; no activar acceso público administrativo.
- **Correo y alerta:** deben probarse con proveedor y dominio reales.
- **Motor de incidentes:** necesita una tarea cron de cPanel que ejecute `npm run aggregate:run` (sin `--at`) cada 5 o 15 minutos, desde un entorno con el código y sus dependencias (como el runner de `docs/MONITOREO-REAL.md`; no forma parte del ZIP standalone). Procesa solo ventanas cerradas y recupera hasta 8 pendientes, así que un retraso o una ejecución perdida no deja huecos; repetirlo no duplica nada. Sin esa tarea no se abren ni cierran incidentes, y las páginas avisan «Datos desactualizados». **Sin configurar ni probar en Namecheap.**
- **Observabilidad:** `/api/health` solo comprueba la conexión a PostgreSQL; no garantiza monitoreo, correo ni permisos. `/api/health/engine` responde 200 solo si el motor se ejecutó en los últimos `ENGINE_FRESHNESS_SECONDS` (3600 por defecto), y 503 si nunca se ejecutó o se detuvo.
- **Privacidad:** identificar jurisdicciones, datos personales, tratamiento y retención; documentar controles antes de habilitar usuarios reales.

## Referencias oficiales

- Namecheap, [Setup Node.js App](https://www.namecheap.com/support/knowledgebase/article.aspx/10047/2182/how-to-work-with-nodejs-app/)
- Namecheap, [Next.js en cPanel](https://www.namecheap.com/support/knowledgebase/article.aspx/10686/29/how-to-deploy-reactjs-vitejs-react-native-and-nextjs-applications-in-cpanel/)
- Next.js, [standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)
- Namecheap, [limitaciones de hosting compartido](https://www.namecheap.com/support/knowledgebase/article.aspx/157/22/do-you-have-any-server-resource-restrictions/)
