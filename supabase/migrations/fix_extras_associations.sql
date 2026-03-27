-- ============================================
-- Fix extras associations
-- Vérifier et configurer l'extra "15min massage"
-- ============================================

-- 1. Créer l'extra "15 minutes de massage" s'il n'existe pas
INSERT INTO extras (id, name, description, price, is_active, sort_order)
VALUES (
  'extra-massage-15min',
  '15 minutes de massage supplémentaire',
  'Prolongez votre moment de détente avec 15 minutes de massage crânien',
  15.00,
  true,
  0
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- 2. Associer cet extra à TOUTES les prestations actives
-- (sauf si l'association existe déjà)
INSERT INTO service_extras (service_id, extra_id, sort_order)
SELECT
  s.id,
  'extra-massage-15min',
  0
FROM services s
WHERE s.is_active = true
ON CONFLICT (service_id, extra_id) DO NOTHING;

-- 3. Vérification : lister les associations créées
SELECT
  s.name as service_name,
  e.name as extra_name,
  e.price as extra_price,
  se.sort_order
FROM service_extras se
JOIN services s ON s.id = se.service_id
JOIN extras e ON e.id = se.extra_id
WHERE e.id = 'extra-massage-15min'
ORDER BY s.name;
