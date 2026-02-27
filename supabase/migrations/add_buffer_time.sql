-- Migration : Ajout du temps tampon (buffer_time) pour les services
-- Ce temps sera ajouté après chaque réservation pour éviter l'enchaînement trop rapide

-- Ajouter la colonne buffer_time (en minutes) à la table services
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS buffer_time INTEGER DEFAULT 0;

COMMENT ON COLUMN public.services.buffer_time IS 'Temps tampon en minutes après la prestation (ex: 15 min pour nettoyer/aérer entre deux clients)';

-- Mettre à jour les services existants avec un buffer par défaut de 15 minutes
UPDATE public.services
SET buffer_time = 15
WHERE buffer_time = 0 OR buffer_time IS NULL;
