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
 * Envía el aviso de nueva reserva por EmailJS.
 * Nunca lanza: el correo es un aviso adicional y no debe bloquear la reserva.
 */
export const notifyNewBooking = createServerFn({ method: "POST" })
  .inputValidator((data: BookingNotification) => data)
  .handler(async ({ data }) => {
    const serviceId = process.env["EMAILJS_SERVICE_ID"];
    const templateId = process.env["EMAILJS_TEMPLATE_ID"];
    const publicKey = process.env["EMAILJS_PUBLIC_KEY"];
    const privateKey = process.env["EMAILJS_PRIVATE_KEY"];
    const to = process.env["ADMIN_EMAIL"] ?? "aleestylist12@gmail.com";

    if (!serviceId || !templateId || !publicKey) {
      console.error("[booking-email] faltan credenciales de EmailJS");
      return { sent: false, reason: "missing_credentials" as const };
    }

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
      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: "https://aleestylist.lovable.app",
          // EmailJS pasa por Cloudflare y rechaza (403, código 1010) peticiones sin User-Agent de navegador.
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          ...(privateKey ? { accessToken: privateKey } : {}),
          template_params: {
            to_email: to,
            subject,
            message,
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            service: data.serviceName,
            date: data.dateLabel,
            time: data.timeLabel,
          },
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error("[booking-email] EmailJS respondió", res.status, body);
        return { sent: false, reason: "api_error" as const, status: res.status, body };
      }

      console.log("[booking-email] aviso enviado a", to);
      return { sent: true as const };
    } catch (error) {
      console.error("[booking-email] fallo de red", error);
      return { sent: false, reason: "network_error" as const };
    }
  });
