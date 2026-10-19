import { createFileRoute, Link } from "@tanstack/react-router";

import { LegalDocument, type LegalSection } from "@/components/LegalDocument";
import { CONTACT_EMAIL, CONTACT_INSTAGRAM_URL } from "@/lib/legal";

const TITLE = "Términos y Condiciones — aleestylist";
const DESCRIPTION =
  "Condiciones de uso del sistema de reservas y de la atención de aleestylist en Yumbel.";

export const Route = createFileRoute("/terminos")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: TermsPage,
});

const SECTIONS: LegalSection[] = [
  {
    title: "Quiénes somos y alcance",
    body: (
      <p>
        aleestylist es un servicio de manicure y esmaltados con atención en Yumbel, Chile. Estos
        términos regulan el uso de este sitio y de su sistema de reservas. Al reservar una hora
        declaras haberlos leído y aceptarlos.
      </p>
    ),
  },
  {
    title: "Reservas",
    body: (
      <>
        <p>
          Reservas eligiendo servicio, día y hora disponibles y entregando tus datos de contacto.
          La reserva queda confirmada al finalizar el proceso y recibirás un correo con el detalle.
        </p>
        <p>
          Debes ser mayor de 18 años o contar con la autorización de tu madre, padre o tutor
          legal. Los datos que entregues deben ser verdaderos y estar actualizados, en especial tu
          teléfono y tu correo electrónico.
        </p>
      </>
    ),
  },
  {
    title: "Precio y pago",
    body: (
      <p>
        El sitio no cobra pagos en línea. El valor del servicio y la forma de pago se coordinan
        directamente contigo antes o durante la atención.
      </p>
    ),
  },
  {
    title: "Cancelaciones y cambios",
    body: (
      <>
        <p>
          Puedes cancelar tu hora en cualquier momento con el enlace personal que recibes en tu
          correo de confirmación. Al cancelar, el horario queda disponible para otra clienta.
        </p>
        <p>
          Te pedimos cancelar con la mayor anticipación posible. Para cambiar el día o la hora,
          cancela y reserva nuevamente, o escríbenos por Instagram.
        </p>
      </>
    ),
  },
  {
    title: "Puntualidad y atrasos",
    body: (
      <p>
        El horario reservado es solo para ti. Si llegas con atraso, el servicio podría acortarse o
        no realizarse para no afectar otras atenciones, y se coordinará contigo una alternativa.
      </p>
    ),
  },
  {
    title: "Salud, alergias y cuidado de tus uñas",
    body: (
      <p>
        Antes del servicio debes avisar si tienes alergias, hongos, heridas, infecciones u otra
        condición en manos o uñas, o si estás en tratamiento médico que pueda afectar el servicio.
        aleestylist podrá negarse a realizar o postergar una atención cuando haya riesgo para tu
        salud o la del servicio. Sigue las indicaciones de cuidado posteriores para la mejor
        duración del resultado.
      </p>
    ),
  },
  {
    title: "Resultados y reclamos",
    body: (
      <p>
        Los diseños y acabados se acuerdan con anticipación y pueden variar levemente según el
        estado natural de tus uñas. Si algo no queda como esperabas, escríbenos lo antes posible
        para buscar una solución. Esto no limita los derechos que te reconoce la Ley N° 19.496 sobre
        Protección de los Derechos de los Consumidores.
      </p>
    ),
  },
  {
    title: "Uso del sitio",
    body: (
      <p>
        No está permitido usar el sistema para hacer reservas falsas, masivas o con datos de
        terceros sin su consentimiento. aleestylist podrá cancelar reservas que no cumplan estas
        condiciones. Los contenidos del sitio (textos, imágenes y marca) pertenecen a aleestylist y
        no pueden usarse sin autorización.
      </p>
    ),
  },
  {
    title: "Datos personales",
    body: (
      <p>
        El tratamiento de tus datos se explica en nuestra{" "}
        <Link to="/privacidad" className="text-foreground underline underline-offset-4">
          Política de Privacidad
        </Link>
        .
      </p>
    ),
  },
  {
    title: "Cambios en estos términos",
    body: (
      <p>
        Podemos actualizar estos términos. La versión vigente es la publicada en esta página y cada
        reserva guarda la versión que aceptaste al momento de reservar.
      </p>
    ),
  },
  {
    title: "Ley aplicable y contacto",
    body: (
      <p>
        Estos términos se rigen por las leyes de Chile. Para consultas o reclamos escríbenos a{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-foreground underline underline-offset-4"
        >
          {CONTACT_EMAIL}
        </a>{" "}
        o por{" "}
        <a
          href={CONTACT_INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline underline-offset-4"
        >
          Instagram
        </a>
        .
      </p>
    ),
  },
];

function TermsPage() {
  return (
    <LegalDocument
      title="Términos y Condiciones"
      intro="Lee estas condiciones antes de reservar tu hora con aleestylist."
      sections={SECTIONS}
    />
  );
}
