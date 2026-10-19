import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { LEGAL_UPDATED_LABEL } from "@/lib/legal";

export type LegalSection = { title: string; body: ReactNode };

export function LegalDocument({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-lg px-5 py-12">
      <div className="rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-card)]">
        <p className="eyebrow">aleestylist</p>
        <h1 className="mt-2 text-3xl">{title}</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Última actualización: {LEGAL_UPDATED_LABEL}
        </p>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{intro}</p>

        <div className="mt-6 space-y-6">
          {sections.map((s, i) => (
            <section key={s.title}>
              <h2 className="text-xl leading-tight">
                {i + 1}. {s.title}
              </h2>
              <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </div>
            </section>
          ))}
        </div>

        <Link
          to="/"
          className="mt-8 block text-center text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
