-- =====================================================================
-- 25 avril 2026 — Sécurisation des doublons côté paiement
-- =====================================================================
--
-- Empêche d'enregistrer deux réservations confirmées avec le même
-- PaymentIntent Stripe (cas du double-clic ou retry du wizard).
--
-- L'index est partiel pour autoriser les bookings sans payment_intent_id
-- (paiement sur place / réservation manuelle).
--

CREATE UNIQUE INDEX IF NOT EXISTS uniq_bookings_payment_intent
  ON bookings (payment_intent_id)
  WHERE payment_intent_id IS NOT NULL;
