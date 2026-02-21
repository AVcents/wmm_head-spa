-- ============================================================
-- Migration : planning_overrides
-- Permet de définir des overrides semaine par semaine pour le
-- planning (vacances, fermetures, horaires différents, etc.)
-- ============================================================

CREATE TABLE planning_overrides (
  id           uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start   date    NOT NULL UNIQUE,  -- Lundi de la semaine (YYYY-MM-DD)
  type         text    NOT NULL CHECK (type IN ('closed', 'template', 'custom')),
  template_id  text    REFERENCES schedule_templates(id) ON DELETE SET NULL,
  custom_hours jsonb,  -- [{day_label, hours, sort_order}] si type='custom'
  label        text,   -- ex: "Vacances d'été", "Fermeture exceptionnelle"
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- Index pour les requêtes par plage de dates
CREATE INDEX idx_planning_overrides_week_start ON planning_overrides(week_start);

-- RLS activé — le client admin (service_role) bypass automatiquement
ALTER TABLE planning_overrides ENABLE ROW LEVEL SECURITY;
