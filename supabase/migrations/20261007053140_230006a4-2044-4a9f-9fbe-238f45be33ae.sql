CREATE TABLE public.students (
  id uuid PRIMARY KEY,
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 3 AND 120),
  grade smallint NOT NULL CHECK (grade BETWEEN 1 AND 11),
  progress jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Student reads own row" ON public.students FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Student creates own row" ON public.students FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Student updates own row" ON public.students FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE OR REPLACE FUNCTION public.students_touch() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER students_touch BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.students_touch();