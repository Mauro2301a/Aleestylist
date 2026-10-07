import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronLeft, Clock, Copy, KeyRound, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  createBooking,
  fetchBusy,
  fetchHorizonWeeks,
  fetchServices,
  type Service,
} from "@/lib/booking-api";
import {
  addDaysKey,
  availableStarts,
  formatDuration,
  formatLongDate,
  formatMinute,
  groupBusyByDate,
  salonNow,
} from "@/lib/schedule";
import { notifyNewBooking } from "@/lib/notify.functions";

type Step = 1 | 2 | 3 | 4 | 5;

const STEP_LABELS = ["Servicio", "Día", "Hora", "Tus datos", "Confirmar"];

export function BookingWizard() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>(1);
  const [service, setService] = useState<Service | null>(null);
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [startMinute, setStartMinute] = useState<number | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);
  const [cancelCode, setCancelCode] = useState<string | null>(null);

  const today = useMemo(() => salonNow(), []);

  const servicesQuery = useQuery({ queryKey: ["services"], queryFn: fetchServices });
  const horizonQuery = useQuery({ queryKey: ["horizon"], queryFn: fetchHorizonWeeks });

  const horizonWeeks = horizonQuery.data ?? 4;
  const lastKey = addDaysKey(today.dateKey, horizonWeeks * 7);

  const busyQuery = useQuery({
    queryKey: ["busy", today.dateKey, lastKey],
    queryFn: () => fetchBusy(today.dateKey, lastKey),
  });

  const busyByDate = useMemo(() => groupBusyByDate(busyQuery.data ?? []), [busyQuery.data]);

  const days = useMemo(() => {
    const list: { key: string; slots: number[] }[] = [];
    if (!service) return list;
    for (let i = 0; i <= horizonWeeks * 7; i++) {
      const key = addDaysKey(today.dateKey, i);
      const minStart = key === today.dateKey ? today.minute + 30 : 0;
      list.push({
        key,
        slots: availableStarts(service.duration_minutes, busyByDate[key] ?? [], minStart),
      });
    }
    return list;
  }, [service, busyByDate, horizonWeeks, today]);

  const selectedDay = days.find((d) => d.key === dateKey);

  const booking = useMutation({
    mutationFn: () =>
      createBooking({
        serviceSlug: service!.slug,
        date: dateKey!,
        startMinute: startMinute!,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      }),
    onSuccess: (created) => {
      setDone(true);
      setCancelCode((created as { cancel_code?: string } | null)?.cancel_code ?? null);
      queryClient.invalidateQueries({ queryKey: ["busy"] });
      // Aviso por correo: nunca debe bloquear ni afectar la reserva ya guardada.
      void notifyNewBooking({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          serviceName: service!.name,
          dateLabel: formatLongDate(dateKey!),
          timeLabel: `${formatMinute(startMinute!)} a ${formatMinute(startMinute! + service!.duration_minutes)}`,
        },
      }).catch((error) => {
        console.error("[booking-email] no se pudo enviar el aviso", error);
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "No pudimos guardar tu reserva. Intenta otra hora.");
      queryClient.invalidateQueries({ queryKey: ["busy"] });
    },
  });

  function reset() {
    setDone(false);
    setCancelCode(null);
    setStep(1);
    setService(null);
    setDateKey(null);
    setStartMinute(null);
    setFirstName("");
    setLastName("");
    setPhone("");
  }

  const cancelUrl = cancelCode
    ? `${typeof window === "undefined" ? "" : window.location.origin}/cancelar/${cancelCode}`
    : "";

  if (done && service && dateKey && startMinute !== null) {
    return (
      <div className="rounded-2xl border border-border bg-card p-7 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full gold-surface">
          <Check className="h-7 w-7" />
        </div>
        <h3 className="mt-5 text-3xl">¡Tu hora quedó reservada!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Te esperamos. Si necesitas cambiarla, escríbenos por Instagram.
        </p>
        <dl className="mx-auto mt-6 max-w-sm space-y-2 rounded-xl bg-secondary/70 p-4 text-left text-sm">
          <Row label="Servicio" value={service.name} />
          <Row label="Día" value={formatLongDate(dateKey)} />
          <Row
            label="Horario"
            value={`${formatMinute(startMinute)} a ${formatMinute(startMinute + service.duration_minutes)}`}
          />
          <Row label="A nombre de" value={`${firstName} ${lastName}`} />
        </dl>
        {cancelCode && (
          <div className="mt-6 rounded-xl border border-primary/40 bg-accent/50 p-4 text-left">
            <p className="flex items-center gap-2 font-display text-lg">
              <KeyRound className="h-4 w-4" /> No pierdas este enlace
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Es tu llave personal para cancelar la hora sin llamadas ni contraseñas. Guárdalo o
              cópialo ahora mismo.
            </p>
            <p className="mt-3 break-all rounded-lg bg-card px-3 py-2 text-xs">{cancelUrl}</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  navigator.clipboard
                    .writeText(cancelUrl)
                    .then(() => toast.success("Enlace copiado"))
                    .catch(() => toast.error("No pudimos copiar el enlace"));
                }}
              >
                <Copy className="mr-2 h-4 w-4" /> Copiar enlace
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href={cancelUrl}>Abrir mi reserva</a>
              </Button>
            </div>
          </div>
        )}
        <Button variant="outline" className="mt-6" onClick={reset}>
          Reservar otra hora
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">
          Paso {step} de 5 · {STEP_LABELS[step - 1]}
        </p>
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => (s - 1) as Step)}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> Volver
          </button>
        )}
      </div>
      <div className="mt-3 flex gap-1.5">
        {STEP_LABELS.map((label, i) => (
          <span
            key={label}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i < step ? "bg-primary" : "bg-secondary",
            )}
          />
        ))}
      </div>

      <div className="mt-6">
        {step === 1 && (
          <div className="space-y-3">
            <h3 className="text-2xl">¿Qué servicio quieres?</h3>
            {servicesQuery.isLoading && <p className="text-sm text-muted-foreground">Cargando…</p>}
            {(servicesQuery.data ?? []).map((s) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => {
                  setService(s);
                  setDateKey(null);
                  setStartMinute(null);
                  setStep(2);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-background px-4 py-4 text-left transition-colors hover:border-primary",
                  service?.slug === s.slug && "border-primary bg-secondary/60",
                )}
              >
                <span>
                  <span className="block font-display text-xl">{s.name}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{s.description}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(s.duration_minutes)}
                </span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && service && (
          <div>
            <h3 className="text-2xl">Elige el día</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Los días atenuados no tienen horas disponibles para {service.name.toLowerCase()}.
            </p>
            {busyQuery.isLoading ? (
              <p className="mt-4 text-sm text-muted-foreground">Cargando disponibilidad…</p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {days.map((day) => {
                  const disabled = day.slots.length === 0;
                  return (
                    <button
                      key={day.key}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        setDateKey(day.key);
                        setStartMinute(null);
                        setStep(3);
                      }}
                      className={cn(
                        "rounded-xl border border-border px-3 py-3 text-left transition-colors",
                        disabled
                          ? "cursor-not-allowed bg-muted/60 text-muted-foreground/60 line-through"
                          : "bg-background hover:border-primary",
                        dateKey === day.key && "border-primary bg-secondary/60",
                      )}
                    >
                      <span className="block text-[0.7rem] uppercase tracking-wider text-muted-foreground">
                        {formatLongDate(day.key).split(",")[0]}
                      </span>
                      <span className="block font-display text-lg capitalize">
                        {formatLongDate(day.key).replace(/^[^,]*,\s*/, "")}
                      </span>
                      <span className="mt-1 block text-[0.7rem] text-muted-foreground">
                        {disabled ? "Sin horas" : `${day.slots.length} hora(s)`}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {step === 3 && service && dateKey && (
          <div>
            <h3 className="text-2xl">Elige la hora</h3>
            <p className="mt-1 text-sm capitalize text-muted-foreground">
              {formatLongDate(dateKey)} · {service.name}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(selectedDay?.slots ?? []).map((minute) => (
                <button
                  key={minute}
                  type="button"
                  onClick={() => {
                    setStartMinute(minute);
                    setStep(4);
                  }}
                  className={cn(
                    "rounded-xl border border-border bg-background px-3 py-4 text-center transition-colors hover:border-primary",
                    startMinute === minute && "border-primary bg-secondary/60",
                  )}
                >
                  <span className="block font-display text-xl">{formatMinute(minute)}</span>
                  <span className="block text-[0.7rem] text-muted-foreground">
                    hasta {formatMinute(minute + service.duration_minutes)}
                  </span>
                </button>
              ))}
              {(selectedDay?.slots ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Ya no quedan horas ese día. Vuelve atrás y elige otro.
                </p>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setStep(5);
            }}
          >
            <h3 className="text-2xl">Tus datos</h3>
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={60}
                required
                autoComplete="given-name"
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                maxLength={60}
                required
                autoComplete="family-name"
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Número de teléfono</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                minLength={8}
                maxLength={20}
                required
                autoComplete="tel"
                placeholder="+56 9 1234 5678"
                className="h-12 text-base"
              />
            </div>
            <Button type="submit" size="lg" className="w-full">
              Continuar
            </Button>
          </form>
        )}

        {step === 5 && service && dateKey && startMinute !== null && (
          <div>
            <h3 className="text-2xl">Revisa tu reserva</h3>
            <dl className="mt-4 space-y-2 rounded-xl bg-secondary/70 p-4 text-sm">
              <Row label="Servicio" value={service.name} />
              <Row label="Día" value={formatLongDate(dateKey)} />
              <Row
                label="Horario"
                value={`${formatMinute(startMinute)} a ${formatMinute(startMinute + service.duration_minutes)}`}
              />
              <Row label="Nombre" value={`${firstName} ${lastName}`} />
              <Row label="Teléfono" value={phone} />
            </dl>
            <Button
              size="lg"
              className="mt-5 w-full"
              disabled={booking.isPending}
              onClick={() => booking.mutate()}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {booking.isPending ? "Guardando…" : "Confirmar reserva"}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              No se solicita ningún pago en línea.
            </p>
          </div>
        )}
      </div>
    </div>
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
