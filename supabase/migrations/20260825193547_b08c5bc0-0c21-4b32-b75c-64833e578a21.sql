CREATE TABLE public.services (
  slug text PRIMARY KEY,
  name text NOT NULL,
  duration_minutes integer NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_public_read" ON public.services FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.services (slug, name, duration_minutes, description, sort_order) VALUES
  ('unas', 'Uñas', 60, 'Manicure de alta precisión: diseño de autor, manicure combinada y rusa.', 1),
  ('decoloracion', 'Decoloración', 300, 'Balayage y baby highlights con test de mecha previo y tecnología plex.', 2),
  ('coloracion', 'Coloración', 300, 'Color a medida con química responsable y cuidado de la fibra capilar.', 3);

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_slug text NOT NULL REFERENCES public.services(slug),
  booking_date date NOT NULL,
  start_minute integer NOT NULL,
  end_minute integer NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bookings_date_idx ON public.bookings (booking_date);
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.time_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_date date NOT NULL,
  start_minute integer NOT NULL DEFAULT 600,
  end_minute integer NOT NULL DEFAULT 1320,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX time_blocks_date_idx ON public.time_blocks (block_date);
GRANT ALL ON public.time_blocks TO service_role;
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.booking_settings (
  id integer PRIMARY KEY DEFAULT 1,
  horizon_weeks integer NOT NULL DEFAULT 4,
  CONSTRAINT booking_settings_single_row CHECK (id = 1)
);
INSERT INTO public.booking_settings (id, horizon_weeks) VALUES (1, 4);
GRANT SELECT ON public.booking_settings TO anon, authenticated;
GRANT ALL ON public.booking_settings TO service_role;
ALTER TABLE public.booking_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "booking_settings_public_read" ON public.booking_settings FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.get_busy_intervals(p_from date, p_to date)
RETURNS TABLE (busy_date date, start_minute integer, end_minute integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT booking_date, start_minute, end_minute
  FROM public.bookings
  WHERE status = 'confirmed' AND booking_date BETWEEN p_from AND p_to
  UNION ALL
  SELECT block_date, start_minute, end_minute
  FROM public.time_blocks
  WHERE block_date BETWEEN p_from AND p_to
$$;
GRANT EXECUTE ON FUNCTION public.get_busy_intervals(date, date) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_booking(
  p_service_slug text,
  p_booking_date date,
  p_start_minute integer,
  p_first_name text,
  p_last_name text,
  p_phone text
)
RETURNS TABLE (id uuid, service_slug text, booking_date date, start_minute integer, end_minute integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_duration integer;
  v_end integer;
  v_horizon integer;
  v_id uuid;
BEGIN
  SELECT duration_minutes INTO v_duration FROM public.services WHERE slug = p_service_slug;
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

  SELECT horizon_weeks INTO v_horizon FROM public.booking_settings WHERE id = 1;
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
  RETURNING public.bookings.id INTO v_id;

  RETURN QUERY
  SELECT b.id, b.service_slug, b.booking_date, b.start_minute, b.end_minute
  FROM public.bookings b WHERE b.id = v_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_booking(text, date, integer, text, text, text) TO anon, authenticated;