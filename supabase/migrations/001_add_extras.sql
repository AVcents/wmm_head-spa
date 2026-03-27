-- ============================================
-- Migration 001 — Ajout de la table extras
-- ============================================

CREATE TABLE IF NOT EXISTS extras (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_extras_sort_order ON extras(sort_order);

CREATE TRIGGER extras_updated_at
  BEFORE UPDATE ON extras
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE extras ENABLE ROW LEVEL SECURITY;

-- Lecture publique (anon key)
CREATE POLICY "Public read active extras" ON extras
  FOR SELECT USING (is_active = true);

-- Écriture via service_role (API admin — bypass RLS)
-- Aucune policy INSERT/UPDATE/DELETE côté client nécessaire
