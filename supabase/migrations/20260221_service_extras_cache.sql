-- ============================================
-- Migration : service_extras + slots_cache
-- ============================================

-- Table de liaison extras ↔ prestations
-- Permet d'assigner des extras spécifiques à chaque prestation
CREATE TABLE IF NOT EXISTS service_extras (
  service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  extra_id   TEXT NOT NULL REFERENCES extras(id)   ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (service_id, extra_id)
);

CREATE INDEX IF NOT EXISTS idx_service_extras_service ON service_extras(service_id);
CREATE INDEX IF NOT EXISTS idx_service_extras_extra   ON service_extras(extra_id);

ALTER TABLE service_extras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read service_extras" ON service_extras FOR SELECT USING (true);

-- Cache des créneaux disponibles (économie API Hapio)
-- Clé unique : (service_id, date)
-- TTL recommandé : 30 min — vider à chaque réservation créée/annulée
CREATE TABLE IF NOT EXISTS slots_cache (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id  TEXT NOT NULL,
  date        TEXT NOT NULL,            -- YYYY-MM-DD
  slots       JSONB NOT NULL DEFAULT '[]',
  cached_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (service_id, date)
);

CREATE INDEX IF NOT EXISTS idx_slots_cache_lookup ON slots_cache(service_id, date);
CREATE INDEX IF NOT EXISTS idx_slots_cache_age    ON slots_cache(cached_at);

ALTER TABLE slots_cache ENABLE ROW LEVEL SECURITY;
-- Pas de lecture publique directe — uniquement via API routes serveur
