import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarOff, Loader2, LogOut, Lock, Phone, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adminBlockRange,
  adminCancelBooking,
  adminLogin,
  adminLogout,
  adminOverview,
  adminSetHorizon,
  adminUnblock,
} from "@/lib/admin.functions";
import { formatLongDate, formatMinute, salonNow } from "@/lib/schedule";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Panel de reservas — aleestylist" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Panel privado de gestión de reservas de aleestylist." },
      { property: "og:title", content: "Panel de reservas — aleestylist" },
      { property: "og:description", content: "Acceso privado para la administración de la agenda." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const queryClient = useQueryClient();
  const overview = useServerFn(adminOverview);
  const login = useServerFn(adminLogin);
  const logout = useServerFn(adminLogout);

  const [password, setPassword] = useState("");

  const dataQuery = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => overview(),
    retry: false,
    refetchInterval: 30_000,
  });

  const loginMutation = useMutation({
    mutationFn: (value: string) => login({ data: { password: value } }),
    onSuccess: (result) => {
      if (result.ok) {
        setPassword("");
        queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      } else {
        toast.error("Contraseña incorrecta");
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
  });

  if (dataQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (dataQuery.isError || !dataQuery.data || !dataQuery.data.authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <form
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
          onSubmit={(e) => {
            e.preventDefault();
            loginMutation.mutate(password);
          }}
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full gold-surface">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-center text-2xl">Panel de aleestylist</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Ingresa tu contraseña para ver la agenda.
          </p>
          <div className="mt-5 space-y-2">
            <Label htmlFor="pass">Contraseña</Label>
            <Input
              id="pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="h-12 text-base"
              required
            />
          </div>
          <Button type="submit" size="lg" className="mt-4 w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Panel privado</p>
          <h1 className="mt-1 text-3xl">Agenda de aleestylist</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => logoutMutation.mutate()}>
          <LogOut className="mr-1.5 h-4 w-4" /> Salir
        </Button>
      </header>

      <HorizonCard weeks={dataQuery.data.horizonWeeks ?? 4} />
      <BlockCard blocks={dataQuery.data.blocks ?? []} />
      <BookingsCard bookings={dataQuery.data.bookings ?? []} />
    </main>
  );
}

function HorizonCard({ weeks }: { weeks: number }) {
  const queryClient = useQueryClient();
  const setHorizon = useServerFn(adminSetHorizon);
  const [value, setValue] = useState(String(weeks));

  const mutation = useMutation({
    mutationFn: () => setHorizon({ data: { weeks: Number(value) } }),
    onSuccess: () => {
      toast.success("Horizonte de reservas actualizado");
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-xl">Semanas visibles para las clientas</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Cuántas semanas hacia adelante se pueden reservar.
      </p>
      <div className="mt-4 flex items-end gap-3">
        <div className="w-28 space-y-2">
          <Label htmlFor="weeks">Semanas</Label>
          <Input
            id="weeks"
            type="number"
            min={1}
            max={26}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-11"
          />
        </div>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          Guardar
        </Button>
      </div>
    </section>
  );
}

function BlockCard({
  blocks,
}: {
  blocks: { id: string; block_date: string; start_minute: number; end_minute: number; note: string }[];
}) {
  const queryClient = useQueryClient();
  const blockRange = useServerFn(adminBlockRange);
  const unblock = useServerFn(adminUnblock);
  const today = salonNow().dateKey;

  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [note, setNote] = useState("");

  const create = useMutation({
    mutationFn: () => blockRange({ data: { from, to, note } }),
    onSuccess: (r) => {
      toast.success(`${r.days} día(s) bloqueado(s)`);
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => unblock({ data: { id } }),
    onSuccess: () => {
      toast.success("Bloqueo liberado");
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const upcoming = blocks.filter((b) => b.block_date >= today);

  return (
    <section className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-xl">Bloquear días</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Marca un rango de fechas como no disponible. No es un cierre permanente: puedes liberarlo
        cuando quieras.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="from">Desde</Label>
          <Input
            id="from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="to">Hasta</Label>
          <Input
            id="to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="note">Nota (opcional)</Label>
          <Input
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Descanso, viaje, etc."
            className="h-11"
          />
        </div>
      </div>
      <Button className="mt-4" onClick={() => create.mutate()} disabled={create.isPending}>
        <CalendarOff className="mr-1.5 h-4 w-4" /> Bloquear rango
      </Button>

      <h3 className="mt-6 text-base font-semibold">Bloqueos activos</h3>
      {upcoming.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No hay días bloqueados.</p>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {upcoming.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="capitalize">
                {formatLongDate(b.block_date)}
                <span className="ml-2 text-xs text-muted-foreground">
                  {formatMinute(b.start_minute)}–{formatMinute(b.end_minute)}
                  {b.note ? ` · ${b.note}` : ""}
                </span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove.mutate(b.id)}
                disabled={remove.isPending}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Liberar</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const SERVICE_NAMES: Record<string, string> = {
  unas: "Esmaltados",
  decoloracion: "Decoloración",
  coloracion: "Coloración",
};

type BookingRow = {
  id: string;
  service_slug: string;
  booking_date: string;
  start_minute: number;
  end_minute: number;
  first_name: string;
  last_name: string;
  phone: string;
  status?: string;
};

function BookingsCard({ bookings }: { bookings: BookingRow[] }) {
  const today = salonNow().dateKey;
  const [showCancelled, setShowCancelled] = useState(false);

  const active = bookings.filter((b) => (b.status ?? "confirmed") !== "cancelled");
  const cancelled = bookings.filter((b) => b.status === "cancelled").reverse();
  const upcoming = active.filter((b) => b.booking_date >= today).reverse();
  const past = active.filter((b) => b.booking_date < today);

  return (
    <section className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl">Reservas</h2>
        <Button variant="outline" size="sm" onClick={() => setShowCancelled((v) => !v)}>
          {showCancelled ? "Ocultar canceladas" : `Ver canceladas (${cancelled.length})`}
        </Button>
      </div>

      {showCancelled ? (
        <>
          <h3 className="mt-4 text-base font-semibold">Canceladas ({cancelled.length})</h3>
          <BookingList items={cancelled} />
        </>
      ) : (
        <>
          <h3 className="mt-4 text-base font-semibold">Próximas ({upcoming.length})</h3>
          <BookingList items={upcoming} />
          <h3 className="mt-6 text-base font-semibold">Pasadas ({past.length})</h3>
          <BookingList items={past} />
        </>
      )}
    </section>
  );
}

function BookingList({ items }: { items: BookingRow[] }) {
  if (items.length === 0) {
    return <p className="mt-2 text-sm text-muted-foreground">Sin reservas.</p>;
  }
  return (
    <ul className="mt-2 divide-y divide-border">
      {items.map((b) => {
        const isCancelled = b.status === "cancelled";
        return (
          <li key={b.id} className={`py-3 ${isCancelled ? "opacity-60" : ""}`}>
            <div className="flex items-baseline justify-between gap-3">
              <p className={`font-display text-lg ${isCancelled ? "line-through" : ""}`}>
                {b.first_name} {b.last_name}
              </p>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                {SERVICE_NAMES[b.service_slug] ?? b.service_slug}
              </span>
            </div>
            <p className="mt-0.5 text-sm capitalize text-muted-foreground">
              {formatLongDate(b.booking_date)} · {formatMinute(b.start_minute)}–
              {formatMinute(b.end_minute)}
            </p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <a
                href={`tel:${b.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 text-sm text-primary"
              >
                <Phone className="h-3.5 w-3.5" /> {b.phone}
              </a>
              {isCancelled ? (
                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                  Cancelada
                </span>
              ) : (
                <CancelBookingButton booking={b} />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function CancelBookingButton({ booking }: { booking: BookingRow }) {
  const queryClient = useQueryClient();
  const cancelBooking = useServerFn(adminCancelBooking);

  const mutation = useMutation({
    mutationFn: () => cancelBooking({ data: { id: booking.id } }),
    onSuccess: () => {
      toast.success("Reserva cancelada y horario liberado");
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          <XCircle className="mr-1.5 h-4 w-4" /> Cancelar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cancelar esta reserva?</AlertDialogTitle>
          <AlertDialogDescription className="capitalize">
            {booking.first_name} {booking.last_name} ·{" "}
            {SERVICE_NAMES[booking.service_slug] ?? booking.service_slug} ·{" "}
            {formatLongDate(booking.booking_date)} a las {formatMinute(booking.start_minute)}. El
            horario quedará disponible nuevamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Volver</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            Sí, cancelar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
