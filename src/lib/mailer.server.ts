import nodemailer from "nodemailer";

export type MailInput = { to: string; subject: string; text: string; templateParams?: Record<string, string> };
export type MailResult = { ok: true } | { ok: false; reason: string; status?: number };

/**
 * Envío de correos solo para servidor.
 * 1) Gmail directo (GMAIL_USER + GMAIL_APP_PASSWORD): es el camino principal.
 * 2) Si esas variables no existen, usa EmailJS como respaldo (EMAILJS_*).
 */
export async function sendMail(input: MailInput): Promise<MailResult> {
  const user = process.env["GMAIL_USER"];
  const pass = (process.env["GMAIL_APP_PASSWORD"] ?? "").replace(/\s+/g, "");

  if (user && pass) return sendWithGmail(user, pass, input);
  return sendWithEmailJs(input);
}

async function sendWithGmail(user: string, pass: string, input: MailInput): Promise<MailResult> {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  let lastError: unknown;
  // Un reintento por si hay un fallo pasajero de red.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await transporter.sendMail({
        from: `"aleestylist" <${user}>`,
        to: input.to,
        subject: input.subject,
        text: input.text,
      });
      return { ok: true };
    } catch (error) {
      lastError = error;
      console.error(`[mailer] Gmail falló (intento ${attempt})`, error);
      if (attempt < 2) await new Promise((r) => setTimeout(r, 1500));
    }
  }
  return {
    ok: false,
    reason: lastError instanceof Error ? lastError.message : "gmail_error",
  };
}

async function sendWithEmailJs(input: MailInput): Promise<MailResult> {
  const serviceId = process.env["EMAILJS_SERVICE_ID"];
  const templateId = process.env["EMAILJS_TEMPLATE_ID"];
  const publicKey = process.env["EMAILJS_PUBLIC_KEY"];
  const privateKey = process.env["EMAILJS_PRIVATE_KEY"];

  if (!serviceId || !templateId || !publicKey) {
    console.error("[mailer] faltan credenciales (Gmail y EmailJS)");
    return { ok: false, reason: "missing_credentials" };
  }

  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: "https://aleestylist.lovable.app",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        ...(privateKey ? { accessToken: privateKey } : {}),
        template_params: {
          to_email: input.to,
          subject: input.subject,
          message: input.text,
          ...(input.templateParams ?? {}),
        },
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[mailer] EmailJS respondió", res.status, body.slice(0, 300));
      return { ok: false, reason: "emailjs_error", status: res.status };
    }
    return { ok: true };
  } catch (error) {
    console.error("[mailer] fallo de red con EmailJS", error);
    return { ok: false, reason: "network_error" };
  }
}
