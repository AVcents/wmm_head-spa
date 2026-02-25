-- ============================================
-- Migration : table bookings
-- Remplace les réservations stockées dans Hapio
-- ============================================

CREATE TABLE IF NOT EXISTS bookings (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id       TEXT        NOT NULL REFERENCES services(id),
  variant_id       TEXT        REFERENCES service_variants(id),
  starts_at        TIMESTAMPTZ NOT NULL,
  ends_at          TIMESTAMPTZ NOT NULL,
  duration         INTEGER     NOT NULL,                         -- minutes
  status           TEXT        NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'cancelled', 'no_show')),
  cancelled_at     TIMESTAMPTZ,
  client_name      TEXT        NOT NULL,
  client_email     TEXT        NOT NULL,
  client_phone     TEXT        NOT NULL DEFAULT '',
  client_message   TEXT,
  payment_mode     TEXT        NOT NULL DEFAULT 'in_person'
    CHECK (payment_mode IN ('hold', 'direct', 'gift_card', 'in_person')),
  payment_intent_id TEXT,
  gift_card_code   TEXT        REFERENCES gift_cards(code),
  price            NUMERIC(10,2),
  extras_json      JSONB,
  extras_total     NUMERIC(10,2),
  booked_by        TEXT        NOT NULL DEFAULT 'client'
    CHECK (booked_by IN ('client', 'admin')),
  note             TEXT,
  service_name     TEXT        NOT NULL DEFAULT '',              -- dénormalisé pour affichage rapide
  variant_name     TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour les requêtes courantes
CREATE INDEX IF NOT EXISTS idx_bookings_starts_at
  ON bookings(starts_at);

CREATE INDEX IF NOT EXISTS idx_bookings_status
  ON bookings(status);

CREATE INDEX IF NOT EXISTS idx_bookings_date_paris
  ON bookings(DATE(starts_at AT TIME ZONE 'Europe/Paris'));

CREATE INDEX IF NOT EXISTS idx_bookings_email
  ON bookings(client_email);

CREATE INDEX IF NOT EXISTS idx_bookings_status_starts
  ON bookings(status, starts_at)
  WHERE status = 'confirmed';

-- Trigger updated_at
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Lecture admin uniquement (service_role bypass RLS côté serveur)
-- Pas de lecture publique pour les réservations
