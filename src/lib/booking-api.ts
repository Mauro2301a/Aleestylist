import { supabase } from "@/integrations/supabase/client";
import type { BusyInterval } from "./schedule";

export type Service = {
  slug: string;
  name: string;
  duration_minutes: number;
  description: string;
  sort_order: number;
};

/**
 * Servicios visibles al público. Para reactivar Decoloración/Coloración,
 * agrega "decoloracion" y "coloracion" a esta lista.
 */
export const ACTIVE_SERVICE_SLUGS = ["unas"];

export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("slug, name, duration_minutes, description, sort_order")
    .order("sort_order");
  if (error) throw error;
  return ((data ?? []) as Service[]).filter((s) => ACTIVE_SERVICE_SLUGS.includes(s.slug));
}

export async function fetchHorizonWeeks(): Promise<number> {
  const { data, error } = await supabase
    .from("booking_settings")
    .select("horizon_weeks")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return data?.horizon_weeks ?? 4;
}

export async function fetchBusy(from: string, to: string): Promise<BusyInterval[]> {
  const { data, error } = await supabase.rpc("get_busy_intervals", { p_from: from, p_to: to });
  if (error) throw error;
  return (data ?? []) as BusyInterval[];
}

export type CreateBookingInput = {
  serviceSlug: string;
  date: string;
  startMinute: number;
  firstName: string;
  lastName: string;
  phone: string;
};

export async function createBooking(input: CreateBookingInput) {
  const { data, error } = await supabase.rpc("create_booking", {
    p_service_slug: input.serviceSlug,
    p_booking_date: input.date,
    p_start_minute: input.startMinute,
    p_first_name: input.firstName,
    p_last_name: input.lastName,
    p_phone: input.phone,
  });
  if (error) throw new Error(error.message);
  return Array.isArray(data) ? data[0] : data;
}

export type BookingByCode = {
  service_name: string;
  booking_date: string;
  start_minute: number;
  end_minute: number;
  first_name: string;
  status: string;
};

export async function fetchBookingByCode(code: string): Promise<BookingByCode | null> {
  const { data, error } = await supabase.rpc("get_booking_by_code", { p_code: code });
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  return (row as BookingByCode) ?? null;
}

export async function cancelBookingByCode(code: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("cancel_booking_by_code", { p_code: code });
  if (error) throw new Error(error.message);
  return Boolean(data);
}
