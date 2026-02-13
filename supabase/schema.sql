-- ============================================
-- Kalm Headspa — Schéma Supabase
-- ============================================

-- Table des prestations
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('headspa-japonais', 'headspa-holistique', 'massage')),
  description TEXT NOT NULL,
  has_variants BOOLEAN NOT NULL DEFAULT false,
  duration INTEGER,
  price NUMERIC(10,2),
  hair_length TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des variantes de prestations
CREATE TABLE IF NOT EXISTS service_variants (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hair_length TEXT NOT NULL CHECK (hair_length IN ('courts', 'mi-longs', 'longs', 'rases', 'enfant', 'body')),
  hair_length_label TEXT NOT NULL,
  duration INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table de configuration des horaires
CREATE TABLE IF NOT EXISTS schedule_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- singleton row
  active_template TEXT NOT NULL DEFAULT 'semaine-impaire',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des templates d'horaires
CREATE TABLE IF NOT EXISTS schedule_templates (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Table des créneaux horaires par template
CREATE TABLE IF NOT EXISTS schedule_hours (
  id SERIAL PRIMARY KEY,
  template_id TEXT NOT NULL REFERENCES schedule_templates(id) ON DELETE CASCADE,
  day_label TEXT NOT NULL,
  hours TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Index
CREATE INDEX IF NOT EXISTS idx_service_variants_service_id ON service_variants(service_id);
CREATE INDEX IF NOT EXISTS idx_schedule_hours_template_id ON schedule_hours(template_id);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER schedule_config_updated_at
  BEFORE UPDATE ON schedule_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED DATA
-- ============================================

-- Templates d'horaires
INSERT INTO schedule_templates (id, label, sort_order) VALUES
  ('semaine-impaire', 'Semaine impaire', 1),
  ('semaine-paire', 'Semaine paire', 2),
  ('vacances-impaire', 'Vacances scolaires — Semaine impaire', 3),
  ('vacances-paire', 'Vacances scolaires — Semaine paire', 4);

-- Créneaux horaires
INSERT INTO schedule_hours (template_id, day_label, hours, sort_order) VALUES
  -- Semaine impaire
  ('semaine-impaire', 'Lundi - Vendredi', '9h00 - 12h00 / 13h00 - 19h00', 1),
  ('semaine-impaire', 'Samedi', 'Fermé', 2),
  ('semaine-impaire', 'Dimanche', 'Fermé', 3),
  -- Semaine paire
  ('semaine-paire', 'Lundi - Vendredi', '9h00 - 12h00 / 13h00 - 17h00', 1),
  ('semaine-paire', 'Samedi', 'Fermé', 2),
  ('semaine-paire', 'Dimanche', 'Fermé', 3),
  -- Vacances impaire
  ('vacances-impaire', 'Lundi - Vendredi', '14h00 - 18h00', 1),
  ('vacances-impaire', 'Samedi', 'Fermé', 2),
  ('vacances-impaire', 'Dimanche', 'Fermé', 3),
  -- Vacances paire
  ('vacances-paire', 'Lundi - Vendredi', '9h00 - 12h00', 1),
  ('vacances-paire', 'Samedi', 'Fermé', 2),
  ('vacances-paire', 'Dimanche', 'Fermé', 3);

-- Config initiale
INSERT INTO schedule_config (id, active_template) VALUES (1, 'semaine-impaire');

-- Prestations
INSERT INTO services (id, name, category, description, has_variants, duration, price, hair_length, sort_order) VALUES
  ('serenite', 'Sérénité', 'headspa-japonais', 'Un moment de détente spécialement conçu pour les enfants', false, 30, 24, 'Enfant', 1),
  ('paisible', 'Paisible 45 minutes', 'headspa-japonais', 'Soin relaxant du cuir chevelu pour retrouver calme et sérénité', true, NULL, NULL, NULL, 2),
  ('relaxante', 'Relaxante 60 minutes', 'headspa-japonais', 'Soin profond pour une relaxation complète du cuir chevelu', true, NULL, NULL, NULL, 3),
  ('decontractante', 'Décontractante 75 minutes', 'headspa-japonais', 'Soin intensif pour dénouer les tensions et revitaliser le cuir chevelu', true, NULL, NULL, NULL, 4),
  ('eclat', 'Eclat 45 minutes', 'headspa-japonais', 'Soin spécifique pour cuir chevelu chauve, rasé ou très court', false, 45, 40, 'Chauve, rasés ou très courts', 5),
  ('revitalisant', 'Revitalisant 105 minutes', 'headspa-holistique', 'Soin premium complet pour une régénération profonde', true, NULL, NULL, NULL, 6),
  ('liberateur', 'Libérateur 60 minutes (Body)', 'massage', 'Massage complet du corps pour libérer les tensions musculaires', false, 60, 70, 'Massage corps', 7);

-- Variantes
INSERT INTO service_variants (id, service_id, name, hair_length, hair_length_label, duration, price, sort_order) VALUES
  -- Paisible
  ('paisible-courts', 'paisible', 'Paisible 45 minutes - Courts', 'courts', 'Cheveux courts (au dessus d''épaule)', 45, 63, 1),
  ('paisible-mi-longs', 'paisible', 'Paisible - Mi-Longs', 'mi-longs', 'Cheveux mi-longs (en dessous d''épaule)', 60, 70, 2),
  ('paisible-longs', 'paisible', 'Paisible 45 minutes - Longs', 'longs', 'Cheveux longs (milieu du dos)', 45, 80, 3),
  -- Relaxante
  ('relaxante-courts', 'relaxante', 'Relaxante 60 minutes - Courts', 'courts', 'Cheveux courts (au dessus d''épaule)', 60, 78, 1),
  ('relaxante-mi-longs', 'relaxante', 'Relaxante 60 minutes - Mi-Longs', 'mi-longs', 'Cheveux mi-longs (en dessous d''épaule)', 45, 85, 2),
  ('relaxante-longs', 'relaxante', 'Relaxante 60 minutes - Longs', 'longs', 'Cheveux longs (milieu du dos)', 60, 95, 3),
  -- Décontractante
  ('decontractante-courts', 'decontractante', 'Décontractante 75 minutes - Courts', 'courts', 'Cheveux courts (au dessus d''épaule)', 75, 93, 1),
  ('decontractante-mi-longs', 'decontractante', 'Décontractante 75 minutes - Mi-Longs', 'mi-longs', 'Cheveux mi-longs (en dessous d''épaule)', 75, 100, 2),
  ('decontractante-longs', 'decontractante', 'Décontractante 75 minutes - Longs', 'longs', 'Cheveux longs (milieu du dos)', 75, 110, 3),
  -- Revitalisant
  ('revitalisant-courts', 'revitalisant', 'Revitalisant 105 minutes - Courts', 'courts', 'Cheveux courts (au dessus d''épaule)', 105, 150, 1),
  ('revitalisant-mi-longs', 'revitalisant', 'Revitalisant 105 minutes - Mi-Longs', 'mi-longs', 'Cheveux mi-longs (en dessous d''épaule)', 105, 170, 2),
  ('revitalisant-longs', 'revitalisant', 'Revitalisant 105 minutes - Longs', 'longs', 'Cheveux longs (milieu du dos)', 105, 180, 3);

-- RLS (Row Level Security)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_hours ENABLE ROW LEVEL SECURITY;

-- Politique lecture publique (tout le monde peut lire)
CREATE POLICY "Public read services" ON services FOR SELECT USING (true);
CREATE POLICY "Public read variants" ON service_variants FOR SELECT USING (true);
CREATE POLICY "Public read schedule_config" ON schedule_config FOR SELECT USING (true);
CREATE POLICY "Public read schedule_templates" ON schedule_templates FOR SELECT USING (true);
CREATE POLICY "Public read schedule_hours" ON schedule_hours FOR SELECT USING (true);

-- Politique écriture (via service_role key côté API, bypass RLS)
-- L'admin utilise la service_role key dans les API routes serveur
