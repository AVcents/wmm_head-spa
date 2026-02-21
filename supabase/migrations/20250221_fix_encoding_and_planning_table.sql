-- ============================================================
-- ÉTAPE 1 : Créer la table planning_overrides (si pas encore fait)
-- ============================================================
-- Si la table existe déjà, cette requête ne fait rien (IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS planning_overrides (
  id           uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start   date    NOT NULL UNIQUE,  -- Lundi de la semaine (YYYY-MM-DD)
  type         text    NOT NULL CHECK (type IN ('closed', 'template', 'custom')),
  template_id  text    REFERENCES schedule_templates(id) ON DELETE SET NULL,
  custom_hours jsonb,  -- [{day_label, hours, sort_order}] si type='custom'
  label        text,   -- ex: "Vacances d'été", "Fermeture exceptionnelle"
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_planning_overrides_week_start ON planning_overrides(week_start);

ALTER TABLE planning_overrides ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- ÉTAPE 2 : Corriger l'encodage des données existantes
-- ============================================================
-- Problème : certaines valeurs ont été insérées avec un mauvais encodage
-- (ex: "Fermé" stocké en "FermÃ©", em-dash stocké en "â€"")

-- 2a. Corriger les heures "FermÃ©" → "Fermé" dans schedule_hours
UPDATE schedule_hours
SET hours = 'Fermé'
WHERE hours LIKE 'Ferm%'
  AND hours <> 'Fermé';

-- 2b. Vérification — doit retourner 0 lignes après la correction :
-- SELECT * FROM schedule_hours WHERE hours LIKE 'Ferm%' AND hours <> 'Fermé';


-- ============================================================
-- ÉTAPE 3 : Corriger les labels de templates si besoin
-- ============================================================
-- Vérifier d'abord les labels actuels :
-- SELECT id, label FROM schedule_templates;
--
-- Si un label contient "â€"" au lieu de "–", corriger manuellement :
-- UPDATE schedule_templates SET label = 'Vacances scolaires – Semaine impaire' WHERE id = 'vacances-impaire';
-- UPDATE schedule_templates SET label = 'Vacances scolaires – Semaine paire' WHERE id = 'vacances-paire';
-- (adapter selon les valeurs réelles dans votre base)
