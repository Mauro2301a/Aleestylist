import { createServerFn } from "@tanstack/react-start";

export type BookingNotification = {
  firstName: string;
  lastName: string;
  phone: string;
  serviceName: string;
  dateLabel: string;
  timeLabel: string;
};

/**
 * Envía el aviso de nueva reserva a la dueña (Gmail directo; EmailJS como respaldo).
 * Nunca lanza: el correo es un aviso adicional y no debe bloquear la reserva.
 */
export const notifyNewBooking = createServerFn({ method: "POST" })
  .inputValidator((data: BookingNotification) => data)
  .handler(async ({ data }) => {
    const to = process.env["ADMIN_EMAIL"] ?? "aleestylist12@gmail.com";

    const subject = `Nueva reserva — ${data.serviceName} el ${data.dateLabel} a las ${data.timeLabel.split(" a ")[0]}`;
    const message = [
      `Nueva reserva confirmada en aleestylist.`,
      ``,
      `Clienta: ${data.firstName} ${data.lastName}`,
      `Teléfono: ${data.phone}`,
      `Servicio: ${data.serviceName}`,
      `Fecha: ${data.dateLabel}`,
      `Horario: ${data.timeLabel}`,
    ].join("\n");

    try {
      const { sendMail } = await import("./mailer.server");
      const result = await sendMail({
        to,
        subject,
        text: message,
        templateParams: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          service: data.serviceName,
          date: data.dateLabel,
          time: data.timeLabel,
        },
      });
      if (!result.ok) {
        console.error("[booking-email] no se pudo enviar el aviso", result.reason);
        return { sent: false, reason: "api_error" as const };
      }
      console.log("[booking-email] aviso enviado a", to);
      return { sent: true as const };
    } catch (error) {
      console.error("[booking-email] fallo", error);
      return { sent: false, reason: "network_error" as const };
    }
  });

/**
 * Confirmación para la clienta, con el enlace para cancelar.
 *
 * Seguridad: NO recibe correo ni texto desde el navegador. Solo recibe el código de cancelación
 * (un secreto de 32 caracteres que solo conoce quien reservó); el correo, la fecha y el servicio
 * se leen de la base de datos. Así nadie puede usar esta función para mandar mensajes a terceros.
 * Cada reserva envía su confirmación una sola vez y solo durante los primeros 15 minutos.
 * Nunca lanza: no debe afectar la reserva ya guardada.
 */
export const notifyClientBooking = createServerFn({ method: "POST" })
  .inputValidator((data: { cancelCode: string }) => data)
  .handler(async ({ data }) => {
    const code = typeof data.cancelCode === "string" ? data.cancelCode : "";
    if (!/^[a-f0-9]{32}$/i.test(code)) {
      return { sent: false, reason: "invalid_code" as const };
    }

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { formatLongDate, formatMinute } = await import("./schedule");

      const { data: booking, error } = await supabaseAdmin
        .from("bookings")
        .select(
          "id, service_slug, booking_date, start_minute, end_minute, first_name, email, status, created_at",
        )
        .eq("cancel_code", code)
        .maybeSingle();

      if (error || !booking || !booking.email || booking.status !== "confirmed") {
        return { sent: false, reason: "not_found" as const };
      }

      const ageMs = Date.now() - new Date(booking.created_at).getTime();
      if (ageMs > 15 * 60 * 1000) {
        return { sent: false, reason: "expired" as const };
      }

      // Reserva el envío de forma atómica: si otra llamada ya lo hizo, no se repite.
      const { data: claimed } = await supabaseAdmin
        .from("bookings")
        .update({ confirmation_sent_at: new Date().toISOString() })
        .eq("id", booking.id)
        .is("confirmation_sent_at", null)
        .select("id");
      if (!claimed || claimed.length === 0) {
        return { sent: false, reason: "already_sent" as const };
      }

      const { data: service } = await supabaseAdmin
        .from("services")
        .select("name")
        .eq("slug", booking.service_slug)
        .maybeSingle();
      const serviceName = service?.name ?? "Esmaltados";

      const dateLabel = formatLongDate(booking.booking_date);
      const timeLabel = `${formatMinute(booking.start_minute)} a ${formatMinute(booking.end_minute)}`;
      const siteUrl = process.env["SITE_URL"] ?? "https://aleestylist-reservas.vercel.app";
      const cancelUrl = `${siteUrl}/cancelar/${code}`;

      const subject = `Tu hora en aleestylist — ${dateLabel} a las ${formatMinute(booking.start_minute)}`;
      const message = [
        `Hola ${booking.first_name}, tu hora quedó reservada.`,
        ``,
        `Servicio: ${serviceName}`,
        `Fecha: ${dateLabel}`,
        `Horario: ${timeLabel}`,
        `Lugar: Yumbel`,
        ``,
        `Si necesitas cancelar tu hora, usa este enlace personal:`,
        cancelUrl,
        ``,
        `Guárdalo: es la única forma de cancelar sin llamar. Si quieres cambiar el día o la hora, escríbenos por Instagram (@aleestylist).`,
        ``,
        `¡Te esperamos!`,
        `aleestylist`,
      ].join("\n");

      const { sendMail } = await import("./mailer.server");
      const result = await sendMail({
        to: booking.email,
        subject,
        text: message,
        templateParams: {
          first_name: booking.first_name,
          service: serviceName,
          date: dateLabel,
          time: timeLabel,
          cancel_url: cancelUrl,
        },
      });

      if (!result.ok) {
        console.error("[client-email] no se pudo enviar", result.reason);
        // Libera el envío para poder reintentar dentro de la ventana de 15 minutos.
        await supabaseAdmin
          .from("bookings")
          .update({ confirmation_sent_at: null })
          .eq("id", booking.id);
        return { sent: false, reason: "api_error" as const };
      }

      return { sent: true as const };
    } catch (error) {
      console.error("[client-email] fallo", error);
      return { sent: false, reason: "network_error" as const };
    }
  });
