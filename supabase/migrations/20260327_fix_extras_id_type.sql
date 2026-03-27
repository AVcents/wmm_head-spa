-- ============================================
-- Migration 20260327 — Ajout duration + Fix UUID->TEXT si nécessaire
-- ============================================

-- PARTIE 1 : Fix UUID -> TEXT (pour bases existantes uniquement)
-- Si la table extras a déjà été créée avec UUID, on corrige le type

DO $$
BEGIN
  -- Vérifier si extras.id est de type UUID
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'extras' AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    -- Drop les contraintes de clé étrangère temporairement
    ALTER TABLE IF EXISTS service_extras
      DROP CONSTRAINT IF EXISTS service_extras_extra_id_fkey;

    -- Changer le type de la colonne id dans extras
    ALTER TABLE extras
      ALTER COLUMN id TYPE TEXT USING id::TEXT;

    -- Changer le type dans service_extras aussi
    ALTER TABLE IF EXISTS service_extras
      ALTER COLUMN extra_id TYPE TEXT USING extra_id::TEXT;

    -- Recréer la contrainte de clé étrangère
    ALTER TABLE IF EXISTS service_extras
      ADD CONSTRAINT service_extras_extra_id_fkey
      FOREIGN KEY (extra_id) REFERENCES extras(id) ON DELETE CASCADE;

    RAISE NOTICE 'Conversion UUID -> TEXT effectuée';
  ELSE
    RAISE NOTICE 'La colonne extras.id est déjà de type TEXT, aucune conversion nécessaire';
  END IF;
END $$;

-- PARTIE 2 : Ajout du champ duration
ALTER TABLE extras
  ADD COLUMN IF NOT EXISTS duration INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN extras.duration IS 'Durée supplémentaire en minutes ajoutée à la prestation de base';
