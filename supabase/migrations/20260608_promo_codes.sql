-- ============================================
-- Migration 20260608 — Codes promo
-- Table promo_codes + colonnes de traçabilité sur bookings
-- ============================================

-- ─── Table promo_codes ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promo_codes (
  id              TEXT PRIMARY KEY,
  code            TEXT NOT NULL UNIQUE,                       -- stocké en MAJUSCULES
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value  NUMERIC(10,2) NOT NULL CHECK (discount_value >= 0),
  min_amount      NUMERIC(10,2) NOT NULL DEFAULT 0,           -- panier minimum requis (€)
  max_uses        INTEGER,                                    -- NULL = illimité
  used_count      INTEGER NOT NULL DEFAULT 0,
  expires_at      TIMESTAMPTZ,                                -- NULL = pas d'expiration
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Recherche rapide par code (la validation fait un lookup sur code)
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);

-- Trigger updated_at (réutilise la fonction existante définie pour les autres tables)
DROP TRIGGER IF EXISTS promo_codes_updated_at ON promo_codes;
CREATE TRIGGER promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS : aucune lecture publique. Toute la validation passe par l'API
-- serveur (service_role) pour empêcher l'énumération/forge de codes côté client.
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
-- (aucune policy : seules les routes service_role accèdent à la table)

-- ─── Traçabilité sur bookings ───────────────────────────────────
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS promo_code      TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0;

COMMENT ON COLUMN bookings.promo_code      IS 'Code promo appliqué à la réservation (NULL si aucun)';
COMMENT ON COLUMN bookings.discount_amount IS 'Montant de la remise appliquée en euros';

-- ─── Incrément atomique du compteur d'utilisation ───────────────
-- Évite les races : incrémente used_count seulement si le code est encore
-- valide (actif + sous le plafond max_uses). Retourne le nombre de lignes
-- mises à jour (1 = succès, 0 = code épuisé/inactif).
CREATE OR REPLACE FUNCTION increment_promo_usage(promo_code_input TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  affected INTEGER;
BEGIN
  UPDATE promo_codes
  SET used_count = used_count + 1
  WHERE code = upper(trim(promo_code_input))
    AND is_active = true
    AND (max_uses IS NULL OR used_count < max_uses);
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;
