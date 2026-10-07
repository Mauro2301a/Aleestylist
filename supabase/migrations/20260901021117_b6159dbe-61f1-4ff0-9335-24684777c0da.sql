ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancel_code text;
UPDATE public.bookings SET cancel_code = encode(gen_random_bytes(16), 'hex') WHERE cancel_code IS NULL;
ALTER TABLE public.bookings ALTER COLUMN cancel_code SET DEFAULT encode(gen_random_bytes(16), 'hex');
ALTER TABLE public.bookings ALTER COLUMN cancel_code SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS bookings_cancel_code_key ON public.bookings (cancel_code);

UPDATE public.services SET duration_minutes = 120 WHERE slug = 'unas';
UPDATE public.services SET duration_minutes = 360 WHERE slug = 'decoloracion';

DROP FUNCTION IF EXISTS public.create_booking(text, date, integer, text, text, text);

CREATE FUNCTION public.create_booking(p_service_slug text, p_booking_date date, p_start_minute integer, p_first_name text, p_last_name text, p_phone text)
 RETURNS TABLE(id uuid, service_slug text, booking_date date, start_minute integer, end_minute integer, cancel_code text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_duration integer;
  v_end integer;
  v_horizon integer;
  v_id uuid;
BEGIN
  SELECT s.duration_minutes INTO v_duration FROM public.services s WHERE s.slug = p_service_slug;
  IF v_duration IS NULL THEN
    RAISE EXCEPTION 'Servicio no válido';
  END IF;

  IF length(btrim(p_first_name)) = 0 OR length(btrim(p_last_name)) = 0 OR length(btrim(p_phone)) < 6 THEN
    RAISE EXCEPTION 'Datos de la clienta incompletos';
  END IF;

  v_end := p_start_minute + v_duration;

  IF p_start_minute < 600 OR v_end > 1320 THEN
    RAISE EXCEPTION 'Horario fuera del horario de atención';
  END IF;

  IF p_start_minute < 870 AND v_end > 810 THEN
    RAISE EXCEPTION 'El horario se traslapa con la pausa de almuerzo';
  END IF;

  SELECT bs.horizon_weeks INTO v_horizon FROM public.booking_settings bs WHERE bs.id = 1;
  IF p_booking_date < (now() AT TIME ZONE 'America/Santiago')::date
     OR p_booking_date > ((now() AT TIME ZONE 'America/Santiago')::date + (COALESCE(v_horizon, 4) * 7)) THEN
    RAISE EXCEPTION 'Fecha fuera del período habilitado';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('ale_estylist_booking_' || p_booking_date::text));

  IF EXISTS (
    SELECT 1 FROM public.get_busy_intervals(p_booking_date, p_booking_date) b
    WHERE p_start_minute < b.end_minute AND v_end > b.start_minute
  ) THEN
    RAISE EXCEPTION 'Ese horario ya no está disponible';
  END IF;

  INSERT INTO public.bookings (service_slug, booking_date, start_minute, end_minute, first_name, last_name, phone)
  VALUES (p_service_slug, p_booking_date, p_start_minute, v_end, btrim(p_first_name), btrim(p_last_name), btrim(p_phone))
  RETURNING bookings.id INTO v_id;

  RETURN QUERY
  SELECT b.id, b.service_slug, b.booking_date, b.start_minute, b.end_minute, b.cancel_code
  FROM public.bookings b WHERE b.id = v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_booking_by_code(p_code text)
 RETURNS TABLE(service_name text, booking_date date, start_minute integer, end_minute integer, first_name text, status text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT s.name, b.booking_date, b.start_minute, b.end_minute, b.first_name, b.status
  FROM public.bookings b
  JOIN public.services s ON s.slug = b.service_slug
  WHERE length(p_code) >= 16 AND b.cancel_code = p_code
$function$;

CREATE OR REPLACE FUNCTION public.cancel_booking_by_code(p_code text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_id uuid;
BEGIN
  IF length(coalesce(p_code, '')) < 16 THEN
    RETURN false;
  END IF;
  UPDATE public.bookings SET status = 'cancelled'
  WHERE cancel_code = p_code AND status = 'confirmed'
  RETURNING id INTO v_id;
  RETURN v_id IS NOT NULL;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.create_booking(text, date, integer, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_booking_by_code(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_booking_by_code(text) TO anon, authenticated;