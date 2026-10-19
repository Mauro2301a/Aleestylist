import { createFileRoute, Link } from "@tanstack/react-router";

import { LegalDocument, type LegalSection } from "@/components/LegalDocument";
import { CONTACT_EMAIL } from "@/lib/legal";

const TITLE = "Política de Privacidad — aleestylist";
const DESCRIPTION =
  "Cómo aleestylist recolecta, usa y protege los datos personales que entregas al reservar tu hora.";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: PrivacyPage,
});

const SECTIONS: LegalSection[] = [
  {
    title: "Responsable de tus datos",
    body: (
      <p>
        El responsable del tratamiento es aleestylist (Yumbel, Chile). Puedes contactarnos en{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-foreground underline underline-offset-4"
        >
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    ),
  },
  {
    title: "Qué datos recolectamos",
    body: (
      <>
        <p>Al reservar te pedimos solo lo necesario:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Nombre y apellido.</li>
          <li>Teléfono.</li>
          <li>Correo electrónico.</li>
          <li>Servicio, día y hora reservados.</li>
          <li>Fecha y versión de los términos y la política que aceptaste.</li>
        </ul>
        <p>No pedimos datos de pago ni datos bancarios.</p>
      </>
    ),
  },
  {
    title: "Para qué los usamos",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Gestionar y confirmar tu reserva y evitar horas duplicadas.</li>
        <li>Enviarte por correo la confirmación y el enlace para cancelar tu hora.</li>
        <li>Contactarte por teléfono o mensaje si hay que coordinar o cambiar tu atención.</li>
        <li>Avisar a aleestylist que se reservó una hora y mostrarla en su agenda.</li>
        <li>Dejar constancia de que aceptaste los términos y esta política.</li>
      </ul>
    ),
  },
  {
    title: "Base de la autorización",
    body: (
      <p>
        Tratamos tus datos porque nos los entregas voluntariamente al reservar y marcas la casilla
        de aceptación, y porque son necesarios para prestarte el servicio que solicitas. No
        usamos tus datos para enviarte publicidad ni los vendemos.
      </p>
    ),
  },
  {
    title: "Con quién se comparten",
    body: (
      <>
        <p>
          Solo usamos proveedores técnicos necesarios para operar el sitio, que procesan los datos
          por encargo nuestro:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Supabase: almacenamiento de las reservas.</li>
          <li>Vercel: alojamiento del sitio.</li>
          <li>EmailJS y servicios de correo: envío de los correos de aviso y confirmación.</li>
        </ul>
        <p>
          Algunos de estos proveedores operan servidores fuera de Chile, por lo que tus datos
          pueden ser procesados en el extranjero. No entregamos tus datos a terceros para fines
          comerciales, salvo obligación legal.
        </p>
      </>
    ),
  },
  {
    title: "Cuánto tiempo los conservamos",
    body: (
      <p>
        Conservamos los datos de cada reserva por el tiempo necesario para atenderte y para
        resolver eventuales reclamos, y luego los eliminamos o anonimizamos. Puedes pedir antes su
        eliminación.
      </p>
    ),
  },
  {
    title: "Seguridad",
    body: (
      <p>
        Las reservas se guardan en una base de datos con acceso restringido y conexiones cifradas.
        Tu enlace de cancelación es personal: no lo compartas con otras personas.
      </p>
    ),
  },
  {
    title: "Tus derechos",
    body: (
      <>
        <p>
          Según la normativa chilena de protección de datos personales, puedes pedirnos acceso,
          rectificación, supresión u oposición respecto de tus datos, y retirar tu autorización
          cuando corresponda.
        </p>
        <p>
          Para ejercerlos escribe a{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-foreground underline underline-offset-4"
          >
            {CONTACT_EMAIL}
          </a>{" "}
          indicando el nombre y correo con que reservaste. Si cancelas tu hora con tu enlace, la
          reserva queda anulada, y puedes pedir además que borremos tus datos.
        </p>
      </>
    ),
  },
  {
    title: "Cookies",
    body: (
      <p>
        Este sitio no usa cookies de publicidad ni de seguimiento. Puede usar almacenamiento
        técnico del navegador estrictamente necesario para su funcionamiento.
      </p>
    ),
  },
  {
    title: "Cambios en esta política",
    body: (
      <p>
        Si cambia esta política publicaremos la nueva versión en esta página. Consulta también los{" "}
        <Link to="/terminos" className="text-foreground underline underline-offset-4">
          Términos y Condiciones
        </Link>
        .
      </p>
    ),
  },
];

function PrivacyPage() {
  return (
    <LegalDocument
      title="Política de Privacidad"
      intro="Explicamos qué datos pedimos al reservar, para qué los usamos y cómo ejercer tus derechos."
      sections={SECTIONS}
    />
  );
}
