# CLAUDE.md — Kalm Headspa

> **Fichier de maintenance. À lire AVANT toute modification du code.**
> Site de réservation et de bons cadeaux en production, avec encaissement réel.
> Les règles ci-dessous ne sont pas des préférences de style : chacune vient
> d'un bug qui a coûté de l'argent au salon ou faussé son agenda.

---

## ⚠️ Règle d'or

**Le navigateur n'est jamais une source de vérité sur un montant, une durée ou un droit.**

Tout ce qui a une conséquence financière ou sur le planning est recalculé côté
serveur depuis Supabase, puis comparé à ce que le client prétend. En cas d'écart :
**on refuse**, on ne réconcilie pas en silence.

---

## Les 5 invariants (ne jamais casser)

### 1. Le prix d'une réservation vient de la base
`lib/pricing.ts` → `computeBookingTotal()`
Utilisé par `/api/booking/create-intent` et `/api/booking/confirm`.
`confirm` vérifie en plus que `paymentIntent.amount` correspond au total recalculé.

### 2. Le prix d'un bon cadeau vient de la base
`lib/pricing.ts` → `computeGiftCardTotal()`
Utilisé par `/api/gift-card/create-payment-intent`.
Un soin à variantes **exige** un `variantId` — sans lui on ne peut pas connaître
le tarif, et accepter le montant du client rouvre la faille.
Le `amount` envoyé par le navigateur n'est qu'un **contrôle** : écart > 1 ct → 400.

### 3. La durée d'une réservation vient de la base
`lib/pricing.ts` → `computeBookingDuration()`
`/api/booking/confirm` refuse toute réservation dont le créneau
(`endsAt − startsAt`) ne correspond pas à `prestation + extras`.
C'est volontairement **bloquant**. Si un jour ça gêne, logger sans bloquer
signifie réaccepter des réservations silencieusement fausses — c'est un choix
produit, pas une simplification technique.

### 4. La clé du cache de créneaux inclut la durée totale
`lib/slots.ts` → `generateSlots()` construit `cacheId = "<variantId>:<durée totale>"`.
`lib/data.ts` → `invalidateSlotsCache()` purge **toutes** les durées d'un service
(`.like('service_id', '<id>:%')` + l'entrée historique sans suffixe).
Ne jamais remettre une clé de cache sans la durée : les créneaux sont calculés
extras inclus, la clé doit l'être aussi.

### 5. Un bon cadeau est revérifié à la confirmation
`/api/booking/confirm`, branche `gift_card` : expiration, prestation autorisée,
**le bon couvre bien le total**, et le complément CB encaissé vaut exactement le
reste à charge. `create-intent` seul ne suffit pas — il n'est qu'un garde-fou
d'interface, contournable par appel API direct.

**Corollaire pour les extras** : `computeBookingTotal()` et `computeBookingDuration()`
lèvent une erreur si un extra sélectionné est introuvable ou désactivé. Ne jamais
le remplacer par un filtre silencieux : le client recevrait la prestation sans la payer.

---

## Historique des bugs — ne pas les réintroduire

| Découvert | Symptôme constaté en prod | Cause | Verrou posé |
|---|---|---|---|
| 06/08/2026 | Bon « Relaxante 60 » vendu 70 € au lieu de 78 € | `gift-card-wizard` calculait les étapes visibles depuis le `serviceId` encore en state, puis naviguait avec → l'étape « Longueur » était sautée et le prix du soin précédent survivait | Étapes recalculées depuis le soin qu'on vient de choisir + reset `amount`/`variantId`/`hairLength`/`extras` au changement de prestation |
| 06/08/2026 | Montant du bon cadeau dicté par le navigateur | `/api/gift-card/create-payment-intent` faisait confiance à `body.amount` | Invariant 2 |
| 06/08/2026 | `confirm` acceptait un bon ne couvrant pas la prestation | Contrôle présent dans `create-intent` seulement | Invariant 5 |
| 07/08/2026 | Réservation « Denis » du 12/08 : créneau de 75 min, 15 min de massage non facturées (78 € au lieu de 88 €) | Cache de créneaux indexé sur `variantId` sans la durée → les créneaux d'un client ayant pris l'extra étaient resservis à un client sans extra | Invariants 3 et 4 |

**Symptôme à surveiller** : une réservation où
`duration ≠ durée_variante + durée_extras` alors que `extras_json` est vide.
Requête d'audit dans la section suivante.

---

## Requêtes d'audit (lecture seule)

Réservations dont le créneau ne colle pas à la sélection :

```sql
select b.client_name,
       b.starts_at at time zone 'Europe/Paris' as debut,
       b.service_name, b.variant_name,
       b.duration                                    as duree_reservee,
       coalesce(v.duration, s.duration)              as duree_theorique,
       b.duration - coalesce(v.duration, s.duration) as ecart,
       b.extras_total, b.extras_json
from bookings b
left join service_variants v on v.id = b.variant_id
left join services        s on s.id = b.service_id
where b.starts_at >= now() - interval '3 months'
order by b.starts_at;
```

Un `ecart` non nul **sans** extra dans `extras_json` = anomalie.

Bons cadeaux au mauvais tarif :

```sql
select g.code, g.created_at::date, g.service_name, g.hair_length_label, g.amount,
       (select min(v.price) from service_variants v where v.service_id = g.service_id) as tarif_mini,
       g.used
from gift_cards g
where g.service_id is not null
  and exists (select 1 from service_variants v where v.service_id = g.service_id)
  and (coalesce(g.hair_length_label, '') = ''
       or g.amount < (select min(v.price) from service_variants v where v.service_id = g.service_id))
order by g.created_at desc;
```

⚠️ Les bons créés **avant le 30/05/2026** n'ont ni `service_name` ni
`hair_length_label` (colonnes non renseignées à l'époque) : ils ressortent en
faux positifs sur le critère du libellé. Ne juger que sur le montant pour eux.

---

## Avant de toucher au paiement ou aux créneaux

1. `npx tsc --noEmit` puis `pnpm build` — les deux doivent passer.
2. Rejouer à la main le tunnel bon cadeau **avec un retour en arrière** :
   soin sans variantes → retour → soin avec variantes. L'étape « Longueur »
   doit s'afficher et le prix se mettre à jour.
3. Rejouer le tunnel réservation en **ajoutant puis retirant un extra** :
   la durée du créneau réservé doit suivre.
4. Vérifier qu'aucun `body.amount` / `body.price` / `endsAt` client ne sert
   à autre chose qu'un contrôle.

---

## Points ouverts (à mettre à jour)

- **Avis Google** : la clé `GOOGLE_PLACES_API_KEY` renvoie `403 PERMISSION_DENIED`
  au build. Le bloc avis est probablement vide en prod. Non traité.
- **Synchro cloud** : le dossier projet est synchronisé (iCloud/Dropbox) et
  duplique les artefacts de build (`routes.d 2.ts`, `chunks 2/`, `app 2/`…).
  Ça pollue `tsc` avec des « Duplicate identifier » — erreurs à ignorer si elles
  ne concernent que `.next/`. Correctif propre : exclure `.next` et
  `node_modules` de la synchro. Non fait (touche la config machine).
- **Bon cadeau à montant libre** : pas encore implémenté. `computeGiftCardTotal()`
  refuse un `serviceId` vide — c'est là qu'il faudra brancher une validation de
  fourchette. Voir `RAPPORT_ABONNEMENT_ET_BON_LIBRE.md`.

---

## Maintenance de ce fichier

**Obligation** : toute session qui corrige un bug de paiement, de tarif, de
créneau ou de bon cadeau sur ce projet **met ce fichier à jour** avant de finir :

- nouvel invariant → section « Les 5 invariants » (renommer le compte)
- bug corrigé → une ligne dans « Historique des bugs », avec la cause réelle
  et le verrou posé (pas seulement « corrigé »)
- point ouvert résolu ou découvert → section « Points ouverts »

Un invariant retiré ou assoupli doit être justifié ici, avec la raison.
Sans ça, le prochain qui « simplifie » le code réintroduira le bug.

*Dernière mise à jour : 7 août 2026*
