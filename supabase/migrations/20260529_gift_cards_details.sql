-- ============================================
-- Bons cadeaux — enrichissement (B-05)
-- ============================================
-- Stocke acheteur, destinataire, livraison, adresse, extras et message
-- directement en base, pour ne plus dépendre uniquement des emails Resend
-- et des metadata Stripe. Permet aussi le suivi d'expédition (B-06).

ALTER TABLE gift_cards
  ADD COLUMN IF NOT EXISTS service_name        TEXT,
  ADD COLUMN IF NOT EXISTS hair_length_label   TEXT,
  ADD COLUMN IF NOT EXISTS delivery_fee        NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_amount        NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS delivery_method     TEXT NOT NULL DEFAULT 'digital'
    CHECK (delivery_method IN ('digital', 'physical')),
  -- Acheteur
  ADD COLUMN IF NOT EXISTS buyer_email         TEXT,
  ADD COLUMN IF NOT EXISTS buyer_first_name    TEXT,
  ADD COLUMN IF NOT EXISTS buyer_last_name     TEXT,
  ADD COLUMN IF NOT EXISTS buyer_phone         TEXT,
  -- Destinataire
  ADD COLUMN IF NOT EXISTS recipient_email     TEXT,
  ADD COLUMN IF NOT EXISTS recipient_first_name TEXT,
  ADD COLUMN IF NOT EXISTS recipient_last_name TEXT,
  ADD COLUMN IF NOT EXISTS recipient_phone     TEXT,
  -- Extras + message
  ADD COLUMN IF NOT EXISTS extras              JSONB,
  ADD COLUMN IF NOT EXISTS sender_name         TEXT,
  ADD COLUMN IF NOT EXISTS personal_message    TEXT,
  -- Livraison papier
  ADD COLUMN IF NOT EXISTS shipping_to         TEXT CHECK (shipping_to IN ('recipient', 'buyer')),
  ADD COLUMN IF NOT EXISTS shipping_street     TEXT,
  ADD COLUMN IF NOT EXISTS shipping_city       TEXT,
  ADD COLUMN IF NOT EXISTS shipping_postal_code TEXT,
  ADD COLUMN IF NOT EXISTS shipping_country    TEXT,
  -- Suivi d'expédition (bons papier)
  ADD COLUMN IF NOT EXISTS shipped_at          TIMESTAMPTZ;

-- Index pour le tri / filtrage côté admin
CREATE INDEX IF NOT EXISTS idx_gift_cards_created_at ON gift_cards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gift_cards_delivery_method ON gift_cards(delivery_method);
