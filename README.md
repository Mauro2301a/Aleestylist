# Ale's Booking Studio

Sitio de reservas online "Ale Estylist"

0. Rol y objetivo

Actúa como desarrollador full-stack. Construye una landing page de una sola ruta principal + panel de administración, cuyo único objetivo funcional es permitir que una clienta reserve una hora de atención sin pago online, y que la dueña del negocio reciba y gestione esas reservas.

No es un sitio informativo de scroll largo: es una herramienta de reserva con identidad de marca elegante. La estética debe transmitir confianza y cuidado; la funcionalidad debe ser a prueba de confusión para un público adulto (20+) que puede no ser experto en tecnología.

1. Contexto de marca

Nombre de marca: Ale Estylist

Nombre de perfil / búsqueda: Ale | Uñas & Colorista Yumbel

Slogan oficial (usar en el hero y en el footer): "Belleza que habla por ti."

Rubro: estética femenina — uñas, coloración y decoloración capilar.

Zona de atención: Yumbel, con proyección a Concepción, Chile.

Personalidad de marca: cercana, profesional, femenina, moderna.

Propuesta de valor: no se vende solo el servicio técnico, sino una experiencia donde la clienta se sienta más segura, cuidada y auténtica, con resultados delicados y profesionales.

2. Objetivos de campaña (deben reflejarse en el copy y en las decisiones de diseño, no solo en el backend)

Conseguir clientas nuevas, mujeres de 20 años en adelante.

Posicionar a Ale Estylist como especialista en su zona de atención (Yumbel y Concepción).

Construir una marca reconocida en Yumbel, no solo un canal de reservas anónimo.

Esto implica: el sitio debe nombrar explícitamente la zona de atención en el hero, reforzar el slogan como elemento recurrente, y evitar un diseño genérico de "formulario de agenda" — debe sentirse como el sitio de una marca, no como una herramienta suelta.

3. Público objetivo

Mujeres de 20 años en adelante, residentes principalmente en Yumbel y Concepción, que buscan servicios de uñas, coloración y tratamientos capilares. Valoran la estética, la confianza y la atención personalizada. Diseñar para claridad ante todo: pasos grandes, un solo foco de atención por pantalla, sin jerga técnica, sin menús ocultos que dificulten encontrar el botón de reservar.

4. Identidad visual

Paleta de color: tonos elegantes — dorado como color de acento (botones, detalles, íconos activos) combinado con paleta pastel/neutra: beige claro, blanco, rosa empolvado y negro suave para texto. Evitar colores saturados o infantiles; el resultado debe leerse como salón de belleza premium, no como app genérica.

Tipografía: una serif elegante para títulos (evocando el mundo editorial/beauty) combinada con una sans-serif limpia y muy legible para el cuerpo de texto y los formularios — la legibilidad del formulario de reserva es prioritaria sobre la estética tipográfica.

Estilo fotográfico esperado (placeholders si no hay fotos reales): fondos limpios, luz natural, primeros planos de uñas y cabello, edición uniforme. Usar fotos adjuntadas en los espacios de imagen si no se proveen archivos.

Mobile-first obligatorio: la mayoría de las clientas reservará desde el celular, probablemente llegando desde el link en la bio de Instagram.

5. Estructura del sitio (una sola página pública + panel admin protegido)

5.1 Página pública (/)

Hero: nombre de marca, slogan, mención de zona de atención (Yumbel y Concepción), botón principal "Reservar mi hora".

Sección breve "Sobre Ale Estylist": 2-3 líneas con la propuesta de valor. Tu versión más auténtica, sin comprometer la salud de tu cabello ni de tus uñas."
Ofrezco transformaciones de color, decoloración y manicure de alta precisión mediante técnicas de vanguardia y un enfoque prioritario en la salud capilar y ungueal. Un servicio personalizado, actualizado en tendencias y adaptado a tu estilo de vida.
Pilares Fundamentales del Servicio


Diagnóstico Personalizado: Evaluación detallada previa a cada proceso químico (test de mecha para decoloración y análisis de estado ungueal) para garantizar la viabilidad del trabajo sin daños.


Técnicas Modernas y Actualizadas: Formación reciente en las últimas tendencias (balayage, baby highlights, diseño de autor en uñas y manicure combinada/rusa).


Química Responsable: Uso de productos que priorizan la integridad de la fibra capilar (tecnología plex) y fórmulas respetuosas con la estructura natural de las uñas.


Experiencia de Atención Dedicada: Servicio sin prisa, enfocado en el detalle y la comodidad durante todo el proceso.

Sección de servicios: tarjetas para Uñas, Decoloración y Coloración, cada una con nombre, duración (informativa, no editable por la clienta) 

Módulo de reserva (ver sección 6) — es el corazón funcional del sitio.

Footer: slogan repetido, zona de atención, y un ícono/enlace a Instagram https://www.instagram.com/aleestylist/

5.2 Panel de administración (/admin, protegido con login simple)

Ver sección 7.

6. Flujo de reserva (paso a paso, un paso visible a la vez tipo wizard)

Paso 1 — Selección de servicio La clienta elige uno de los tres servicios: Uñas, Decoloración o Coloración. Mostrar la duración de cada uno para que sepa qué implica ("Uñas — 1 hora", "Decoloración — 5 horas", "Coloración — 5 horas").

Paso 2 — Selección de día Calendario visual (no un <select> de texto) mostrando solo los días dentro del horizonte de reservas habilitado. Los días sin ningún horario disponible para el servicio elegido deben verse deshabilitados/atenuados, no simplemente omitidos, para que la clienta entienda que no hay hora ese día.

Paso 3 — Selección de horario Mostrar únicamente los bloques horarios realmente disponibles para ese servicio y ese día, ya aplicando toda la lógica de la sección 8 (horario de atención, almuerzo, bloqueos cruzados entre servicios y bloqueos manuales del admin). No mostrar horarios que luego resulten inválidos al confirmar.

Paso 4 — Datos de la clienta Formulario con: Nombre, Apellido, Número de teléfono. Sin campos de pago, sin selección de método de pago, sin captura de correo obligatorio 

Paso 5 — Confirmación Resumen claro: servicio, fecha, hora de inicio y término, nombre de la clienta. Botón "Confirmar reserva". Tras confirmar, mostrar una pantalla de éxito ("¡Tu hora quedó reservada!") con el resumen, sin generar ninguna acción de pago.

Aviso a la dueña: al confirmarse una reserva, debe generarse una notificación para que la dueña se entere. El mecanismo exacto de aviso (correo electrónico, WhatsApp automático, o simplemente que la reserva aparezca de inmediato en el panel admin en tiempo real) es notificar por Correo . Como mínimo indispensable, toda reserva nueva debe aparecer inmediatamente en el panel de administración.

7. Panel de administración

Acceso protegido por login (usuario/contraseña simple; no requiere roles múltiples, es una sola administradora).

Debe permitir:

Ver todas las reservas (pasadas y futuras) en una lista o calendario, con servicio, fecha, hora, nombre y teléfono de la clienta.

Bloquear horarios manualmente por rango: la administradora debe poder seleccionar un rango de fechas (ej. lunes a miércoles de una semana específica) y marcar todas las horas de ese rango como no disponibles, sin que esto se interprete como un cierre permanente de esos días de la semana. Esto es clave: hoy solo se atiende viernes-domingo, pero el sistema no debe asumir que lunes-jueves están cerrados para siempre — deben quedar disponibles por defecto y ser la administradora quien los bloquee o libere según su semana real.

Liberar bloqueos manuales previamente creados, para cuando se abra un día que antes estaba bloqueado.

Configurar el horizonte de reservas visible para las clientas (ej. cuántas semanas hacia adelante se pueden reservar) — por defecto sugerir 4

8. Reglas de negocio de la agenda (lógica obligatoria, no aproximada)

Esta es la parte más sensible del sistema — impleméntala exactamente así:

8.1 Horario general de atención

Todos los días habilitados: de 10:00 a 22:00.

Pausa de almuerzo fija: 13:30 a 14:30, todos los días. Ningún horario puede ofrecerse si su rango se traslapa con esta pausa.

8.2 Duración por servicio

Servicio Duración Uñas 1 hora Decoloración 5 horas Coloración 5 horas

8.3 Generación de horarios disponibles por servicio

Uñas (bloques de 1 hora, empezando en punto): Generar candidatos cada 1 hora desde las 10:00 hasta que el bloque de 1 hora termine como máximo a las 22:00 (es decir, el último inicio posible es 21:00–22:00). Descartar cualquier candidato cuyo rango se traslape con la pausa de almuerzo (13:30–14:30) — en la práctica esto excluye los bloques 13:00–14:00 y 14:00–15:00.

Decoloración / Coloración (bloques de 5 horas): Generar candidatos cada 5 horas desde las 10:00, exigiendo que el bloque completo termine a más tardar a las 22:00. Con el horario dado, los únicos inicios válidos son 10:00 (termina 15:00) y 15:00 (termina 20:00). Un inicio a las 20:00 terminaría a la 01:00 del día siguiente y por lo tanto no debe ofrecerse nunca, aunque matemáticamente respete el intervalo de 5 en 5 horas.

8.4 Regla de recurso único (la más importante)

Ale Estylist es una sola persona atendiendo. Ningún horario puede quedar disponible si se traslapa, aunque sea parcialmente, con otra reserva ya confirmada o con un bloqueo manual del admin — sin importar si son del mismo servicio o de servicios distintos.

Esto significa en concreto:

Si se reserva una Decoloración o Coloración de 10:00 a 15:00, el sistema debe marcar automáticamente como no disponibles todos los bloques de Uñas que caen dentro de ese rango (10:00, 11:00, 12:00 — los de 13:00 y 14:00 ya estaban excluidos por el almuerzo).

De igual manera, si ya existe una reserva de Uñas confirmada, por ejemplo a las 11:00–12:00, el bloque de Coloración/Decoloración 10:00–15:00 deja de estar disponible ese día, porque se traslapa con una hora ya ocupada.

Los bloqueos manuales del admin (sección 7, punto 2) deben tratarse con la misma regla de traslape: si la administradora bloquea, por ejemplo, el lunes completo, ningún servicio debe mostrar horarios disponibles ese día, sin importar duración.

Implementación sugerida: modelar el día como una sola línea de tiempo continua por franjas de negocio (no una tabla separada por servicio). Antes de mostrar cualquier horario como disponible, verificar que ningún minuto de ese candidato se traslape con: (a) otra reserva confirmada, (b) la pausa de almuerzo, (c) un bloqueo manual del admin, (d) el cierre fuera de 10:00–22:00.

8.5 Días de atención actuales

Actualmente solo se atiende viernes, sábado y domingo. Esto no debe programarse como una regla fija del sistema (no hardcodear "cerrado lunes a jueves"), sino lograrse mediante bloqueos manuales por defecto que la administradora pueda levantar cuando decida abrir más días — tal como se especifica en la sección 7, punto 2. El sistema en sí debe tratar los 7 días de la semana como potencialmente disponibles.

9. Restricciones explícitas (no hacer)

No incluir pasarela de pago, ni simulación de pago, ni campos de tarjeta.

No pedir correo electrónico como campo obligatorio si no se ha confirmado que se usará para notificaciones.

No ocultar el botón de reservar detrás de scroll largo o menús — debe ser accesible desde el primer scroll del hero.

No mostrar un horario como "disponible" si la lógica de la sección 8 determina que está ocupado, aunque sea por un segundo de traslape.

construir un sitio de una página, mobile-first, con paleta dorado + pastel elegante, cuyo flujo central es un wizard de reserva (servicio → día → hora → datos de la clienta → confirmación) que respeta un horario de 10:00 a 22:00 con pausa de almuerzo 13:30–14:30, trata a todos los servicios como un único recurso compartido para evitar traslapes, y ofrece un panel de administración donde la dueña puede bloquear y liberar horarios manualmente por rango de fechas.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/32418ebe-f778-41f4-9a71-8523a825da69).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
