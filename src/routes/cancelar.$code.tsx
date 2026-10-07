import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarX2, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cancelBookingByCode, fetchBookingByCode } from "@/lib/booking-api";
import { formatLongDate, formatMinute } from "@/lib/schedule";

const TITLE = "Cancelar tu hora — aleestylist";
const DESCRIPTION =
  "Cancela o revisa tu hora reservada en aleestylist con tu enlace personal, sin necesidad de crear una cuenta.";

export const Route = createFileRoute("/cancelar/$code")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CancelPage,
});

function CancelPage() {
  const { code } = Route.useParams();
  const queryClient = useQueryClient();

  const bookingQuery = useQuery({
    queryKey: ["booking-by-code", code],
    queryFn: () => fetchBookingByCode(code),
    retry: false,
  });

  const cancelation = useMutation({
    mutationFn: () => cancelBookingByCode(code),
    onSuccess: (ok) => {
      if (!ok) {
        toast.error("No pudimos cancelar esta hora. Escríbenos por Instagram.");
        return;
      }
      toast.success("Tu hora fue cancelada.");
      queryClient.invalidateQueries({ queryKey: ["booking-by-code", code] });
      queryClient.invalidateQueries({ queryKey: ["busy"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const booking = bookingQuery.data;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-5 py-16">
      <div className="rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-card)]">
        <p className="eyebrow">aleestylist</p>
        <h1 className="mt-2 text-3xl">Tu reserva</h1>

        {bookingQuery.isLoading && (
          <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Buscando tu reserva…
          </p>
        )}

        {!bookingQuery.isLoading && !booking && (
          <p className="mt-6 text-sm text-muted-foreground">
            No encontramos ninguna reserva con este enlace. Es posible que ya haya sido cancelada o
            que el enlace esté incompleto.
          </p>
        )}

        {booking && (
          <>
            <dl className="mt-6 space-y-2 rounded-xl bg-secondary/70 p-4 text-sm">
              <Row label="Servicio" value={booking.service_name} />
              <Row label="Día" value={formatLongDate(booking.booking_date)} />
              <Row
                label="Horario"
                value={`${formatMinute(booking.start_minute)} a ${formatMinute(booking.end_minute)}`}
              />
              <Row label="A nombre de" value={booking.first_name} />
              <Row
                label="Estado"
                value={booking.status === "cancelled" ? "Cancelada" : "Confirmada"}
              />
            </dl>

            {booking.status === "cancelled" ? (
              <p className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-accent/60 px-4 py-3 text-sm">
                <Check className="h-4 w-4" /> Esta hora ya está cancelada y quedó liberada.
              </p>
            ) : (
              <>
                <Button
                  variant="destructive"
                  size="lg"
                  className="mt-5 w-full"
                  disabled={cancelation.isPending}
                  onClick={() => {
                    if (window.confirm("¿Seguro que quieres cancelar esta hora?")) {
                      cancelation.mutate();
                    }
                  }}
                >
                  <CalendarX2 className="mr-2 h-4 w-4" />
                  {cancelation.isPending ? "Cancelando…" : "Cancelar mi hora"}
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Al cancelar, el horario queda disponible para otra clienta.
                </p>
              </>
            )}
          </>
        )}

        <Link
          to="/"
          className="mt-6 block text-center text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium capitalize">{value}</dd>
    </div>
  );
}
