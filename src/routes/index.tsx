import { createFileRoute } from "@tanstack/react-router";
import {
  Instagram,
  MapPin,
  ShieldCheck,
  Sparkles,
  Clock3,
  HeartHandshake,
  MessageCircle,
  CalendarCheck2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { BookingWizard } from "@/components/BookingWizard";

const TITLE = "aleestylist — Manicure & Esmaltados en Yumbel y Concepción";
const DESCRIPTION =
  "Esmaltados de alta precisión, manicure combinada, nivelación y diseño de autor cuidando la salud de tus uñas. Reserva tu hora online en Yumbel y Concepción.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Home,
});

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Diagnóstico personalizado",
    text: "Evaluación minuciosa del estado y tipo de lámina ungueal antes de cada aplicación para garantizar adherencia y cero daños.",
  },
  {
    icon: Sparkles,
    title: "Técnicas de precisión",
    text: "Manicure combinada, técnica rusa, nivelación con base rubber, esmaltado permanente y nail art de autor en tendencia.",
  },
  {
    icon: HeartHandshake,
    title: "Química y productos responsables",
    text: "Bases niveladoras de alta adhesión, esmaltes de larga duración y fórmulas respetuosas con la estructura natural de tus uñas.",
  },
  {
    icon: Clock3,
    title: "Atención dedicada",
    text: "Servicio prolijo y sin prisas, enfocado en el detalle milimétrico, la esterilización y tu comodidad en cada cita.",
  },
];

const SERVICES = [
  {
    name: "Esmaltados",
    duration: "2 horas",
    text: "Manicure de alta precisión: nivelación, esmaltado permanente, técnica combinada/rusa y diseño de autor.",
    image: "/esmaltados.png",
  },
];

const TRUST = [
  { icon: MapPin, text: "Yumbel y Concepción" },
  { icon: Clock3, text: "Reserva en menos de 1 minuto" },
  { icon: MessageCircle, text: "Contacto directo por WhatsApp" },
  { icon: Sparkles, text: "Resultados reales, sin filtros" },
];

const WHY = [
  {
    icon: HeartHandshake,
    title: "Atención personalizada",
    text: "Cada servicio se adapta a ti: sin protocolos genéricos, con tiempo real dedicado a la salud y estética de tus manos.",
  },
  {
    icon: CalendarCheck2,
    title: "Reserva sin complicaciones",
    text: "Elige el servicio, el día y la hora disponible. Sin llamadas, sin esperar respuesta, sin pagos por adelantado.",
  },
  {
    icon: MapPin,
    title: "Especialista local",
    text: "Atención en Yumbel con proyección a Concepción. Esmaltados y diseño de uñas con foco absoluto en la prolijidad.",
  },
];

function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-sand/80 px-5 py-3 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="font-display text-lg text-gold transition-opacity hover:opacity-80"
            aria-label="Volver al inicio"
          >
            aleestylist
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-surface px-5 pb-12 pt-12 sm:pb-16 sm:pt-16">
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <p className="eyebrow">Studio de Uñas en Yumbel y Concepción</p>
            <h1 className="mt-4 text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
              Reserva tu manicure perfecta en 1 minuto, sin llamadas ni esperas
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground lg:mx-0">
              Esmaltados con diseño de autor, nivelación y cuidado ungueal dedicado. Elige el día y la hora que
              más te acomoden, directo desde tu celular.
            </p>
            <Button asChild size="lg" className="mt-7 h-14 w-full text-base sm:w-auto sm:px-10">
              <a href="#reservar">Reservar mi hora ahora</a>
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Sin pagos en línea · Confirmas al instante
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <img
              src="/esmaltados.png"
              alt="Manicure combinada y esmaltado de alta precisión realizado por aleestylist"
              className="aspect-[3/4] w-full rounded-2xl object-cover shadow-[var(--shadow-soft)] lg:mt-8"
            />
            <img
              src="/Portada 2.jpg"
              alt="Esmaltado permanente con diseño de autor y acabado profesional por aleestylist"
              className="aspect-[3/4] w-full rounded-2xl object-cover shadow-[var(--shadow-soft)] lg:-mt-8"
            />
          </div>
        </div>
      </section>

      {/* Franja de confianza */}
      <section className="border-y border-border bg-card px-5 py-4">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {TRUST.map(({ icon: Icon, text }) => (
            <span key={text} className="inline-flex items-center gap-1.5 text-sm">
              <Icon className="h-4 w-4 shrink-0 text-primary" />
              {text}
            </span>
          ))}
        </div>
      </section>

      {/* Por qué reservar */}
      <section className="px-5 py-14">
        <div className="mx-auto max-w-xl">
          <span className="gold-rule block" />
          <h2 className="mt-4 text-3xl sm:text-4xl">¿Por qué reservar con aleestylist?</h2>
          <div className="mt-8 space-y-3">
            {WHY.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="flex gap-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="text-lg leading-tight">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section className="px-5 py-14">
        <div className="mx-auto max-w-xl">
          <span className="gold-rule block" />
          <h2 className="mt-4 text-3xl sm:text-4xl">Sobre aleestylist</h2>
          <p className="mt-4 font-display text-2xl leading-snug">
            Tu versión más auténtica, cuidando siempre la belleza y salud de tus uñas.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Especialista en manicure de alta precisión, técnica combinada o rusa, nivelación con bases estructuradas y esmaltado permanente. Cada servicio se realiza con una evaluación exhaustiva de la lámina ungueal, garantizando acabados limpios, duraderos y respetuosos con el crecimiento natural de tus uñas.
          </p>

          <div className="mt-8 space-y-3">
            {PILLARS.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="flex gap-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="text-lg leading-tight">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="bg-secondary/50 px-5 py-14">
        <div className="mx-auto max-w-xl">
          <span className="gold-rule block" />
          <h2 className="mt-4 text-3xl sm:text-4xl">Servicios</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            La duración es informativa y se reserva completa para ti.
          </p>
          <div className="mt-6 space-y-4">
            {SERVICES.map((s) => (
              <article
                key={s.name}
                className="flex gap-4 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]"
              >
                <img
                  src={s.image}
                  alt={`Servicio de ${s.name} en aleestylist`}
                  loading="lazy"
                  className="h-auto w-28 shrink-0 object-cover sm:w-36"
                />
                <div className="py-4 pr-4">
                  <h3 className="text-2xl leading-none">{s.name}</h3>
                  <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                    <Clock3 className="h-3.5 w-3.5" /> {s.duration}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Reserva */}
      <section id="reservar" className="scroll-mt-4 px-5 py-14">
        <div className="mx-auto max-w-xl">
          <span className="gold-rule block" />
          <h2 className="mt-4 text-3xl sm:text-4xl">Reserva tu hora</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Cinco pasos simples. Sin pagos en línea: la atención se coordina directamente contigo.
          </p>
          <div className="mt-6">
            <BookingWizard />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="hero-surface px-5 py-12 text-center">
        <p className="font-display text-3xl">aleestylist</p>
        <p className="mt-2 font-display text-xl text-muted-foreground">Belleza que habla por ti.</p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm">
          <MapPin className="h-4 w-4 text-primary" /> Yumbel · Concepción, Chile
        </p>
        <div className="mt-5">
          <a
            href="https://www.instagram.com/aleestylist/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary"
          >
            <Instagram className="h-4 w-4 text-primary" /> @aleestylist
          </a>
        </div>
      </footer>
    </main>
  );
}