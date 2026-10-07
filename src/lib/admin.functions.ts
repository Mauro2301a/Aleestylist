import { createServerFn } from "@tanstack/react-start";

export type AdminBooking = {
  id: string;
  service_slug: string;
  booking_date: string;
  start_minute: number;
  end_minute: number;
  first_name: string;
  last_name: string;
  phone: string;
  status: string;
  created_at: string;
};

export type AdminBlock = {
  id: string;
  block_date: string;
  start_minute: number;
  end_minute: number;
  note: string;
};

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    const { getGateSession, passwordMatches } = await import("./admin-session.server");
    const expected = "mauroale12022025";

    if (typeof data.password !== "string" || !passwordMatches(data.password, expected)) {
      return { ok: false as const };
    }
    const session = await getGateSession();
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { getGateSession } = await import("./admin-session.server");
  const session = await getGateSession();
  await session.clear();
  return { ok: true as const };
});

export const adminOverview = createServerFn({ method: "GET" }).handler(async () => {
  const { getGateSession } = await import("./admin-session.server");
  const session = await getGateSession();
  if (!session.data.unlocked) {
    return { authorized: false as const };
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [bookings, blocks, settings] = await Promise.all([
    supabaseAdmin
      .from("bookings")
      .select(
        "id, service_slug, booking_date, start_minute, end_minute, first_name, last_name, phone, status, created_at",
      )
      .order("booking_date", { ascending: true })
      .order("start_minute", { ascending: true })
      .limit(500),
    supabaseAdmin
      .from("time_blocks")
      .select("id, block_date, start_minute, end_minute, note")
      .order("block_date", { ascending: true })
      .limit(1000),
    supabaseAdmin.from("booking_settings").select("horizon_weeks").eq("id", 1).maybeSingle(),
  ]);

  if (bookings.error) throw new Error(bookings.error.message);
  if (blocks.error) throw new Error(blocks.error.message);

  return {
    authorized: true as const,
    bookings: (bookings.data ?? []) as AdminBooking[],
    blocks: (blocks.data ?? []) as AdminBlock[],
    horizonWeeks: settings.data?.horizon_weeks ?? 4,
  };
});

export const adminBlockRange = createServerFn({ method: "POST" })
  .inputValidator((data: { from: string; to: string; note?: string }) => data)
  .handler(async ({ data }) => {
    const { requireUnlocked } = await import("./admin-session.server");
    await requireUnlocked();
    const { buildDateRange } = await import("./date-range");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const dates = buildDateRange(data.from, data.to);
    if (dates.length === 0) throw new Error("Rango de fechas no válido");
    if (dates.length > 180) throw new Error("El rango es demasiado largo (máximo 180 días)");

    const { error } = await supabaseAdmin.from("time_blocks").insert(
      dates.map((d) => ({
        block_date: d,
        start_minute: 600,
        end_minute: 1320,
        note: (data.note ?? "").slice(0, 120),
      })),
    );
    if (error) throw new Error(error.message);
    return { ok: true as const, days: dates.length };
  });

export const adminUnblock = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { requireUnlocked } = await import("./admin-session.server");
    await requireUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("time_blocks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminSetHorizon = createServerFn({ method: "POST" })
  .inputValidator((data: { weeks: number }) => data)
  .handler(async ({ data }) => {
    const { requireUnlocked } = await import("./admin-session.server");
    await requireUnlocked();
    const weeks = Math.min(26, Math.max(1, Math.round(Number(data.weeks) || 4)));
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("booking_settings")
      .update({ horizon_weeks: weeks })
      .eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true as const, weeks };
  });

export const adminCancelBooking = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { requireUnlocked } = await import("./admin-session.server");
    await requireUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });