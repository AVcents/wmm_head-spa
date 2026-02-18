// ============================================
// Avis Google — Kalm Headspa
// Server Component — fetch Places API (New)
// Revalidation automatique toutes les heures
// ============================================

import { Star } from 'lucide-react'

// Interfaces Places API (New) — v1
interface PlaceReviewNew {
  authorAttribution: {
    displayName: string
    photoUri?: string
  }
  rating: number
  text?: { text: string }
  relativePublishTimeDescription: string
}

interface PlaceDetailsNew {
  rating?: number
  userRatingCount?: number
  reviews?: PlaceReviewNew[]
}

// Interface normalisée pour le rendu
interface GoogleReview {
  author_name: string
  profile_photo_url: string
  rating: number
  text: string
  relative_time_description: string
}

interface PlaceResult {
  rating?: number
  user_ratings_total?: number
  reviews?: GoogleReview[]
}

async function fetchGoogleReviews(): Promise<PlaceResult | null> {
  const apiKey = process.env['GOOGLE_PLACES_API_KEY']
  const placeId = process.env['GOOGLE_PLACE_ID']

  if (!apiKey || !placeId) {
    console.warn('[GoogleReviews] GOOGLE_PLACES_API_KEY ou GOOGLE_PLACE_ID manquant')
    return null
  }

  try {
    const url = `https://places.googleapis.com/v1/places/${placeId}?languageCode=fr`
    const res = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'rating,userRatingCount,reviews',
      },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      console.error('[GoogleReviews] Erreur HTTP:', res.status, await res.text())
      return null
    }

    const data: PlaceDetailsNew = await res.json()

    // Normaliser vers l'ancienne interface pour ne pas changer le rendu
    // (spread conditionnel requis par exactOptionalPropertyTypes: true)
    const result: PlaceResult = {
      reviews: (data.reviews ?? []).map((r) => ({
        author_name: r.authorAttribution.displayName,
        profile_photo_url: r.authorAttribution.photoUri ?? '',
        rating: r.rating,
        text: r.text?.text ?? '',
        relative_time_description: r.relativePublishTimeDescription,
      })),
    }
    if (data.rating !== undefined) result.rating = data.rating
    if (data.userRatingCount !== undefined) result.user_ratings_total = data.userRatingCount
    return result
  } catch (err) {
    console.error('[GoogleReviews] Fetch error:', err)
    return null
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )
}

export async function GoogleReviews() {
  const place = await fetchGoogleReviews()

  // Si pas de données ou moins de 3 avis 4+, on n'affiche pas la section
  const reviews = (place?.reviews ?? []).filter((r) => r.rating >= 4).slice(0, 3)
  if (!reviews.length) return null

  const globalRating = place?.rating ?? 0
  const totalRatings = place?.user_ratings_total ?? 0

  return (
    <section className="py-20 md:py-28 bg-surface">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* En-tête */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium tracking-widest uppercase mb-3 text-primary-600 dark:text-primary-400">
            Avis clients
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Ce qu&rsquo;ils disent
          </h2>

          {/* Note globale */}
          <div className="inline-flex items-center gap-3 mt-4 px-6 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <span className="text-3xl font-bold text-amber-500">
              {globalRating.toFixed(1)}
            </span>
            <div className="text-left">
              <StarRating rating={Math.round(globalRating)} />
              <p className="text-xs text-foreground-secondary mt-0.5">
                {totalRatings} avis Google
              </p>
            </div>
          </div>
        </div>

        {/* Cards avis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-background border border-border rounded-2xl p-6 flex flex-col gap-4"
            >
              {/* Auteur + note */}
              <div className="flex items-center gap-3">
                {/* Avatar initiale si pas de photo */}
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {review.profile_photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={review.profile_photo_url}
                      alt={review.author_name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                      {review.author_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {review.author_name}
                  </p>
                  <p className="text-xs text-foreground-secondary">
                    {review.relative_time_description}
                  </p>
                </div>
                <div className="ml-auto">
                  <StarRating rating={review.rating} />
                </div>
              </div>

              {/* Texte de l'avis */}
              <p className="text-sm text-foreground-secondary leading-relaxed flex-1 line-clamp-5">
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Logo Google */}
              <div className="flex items-center gap-1.5 text-xs text-foreground-secondary/60 mt-auto pt-3 border-t border-border">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Avis Google vérifié</span>
              </div>
            </div>
          ))}
        </div>

        {/* Lien voir tous les avis */}
        <div className="text-center mt-10">
          <a
            href={`https://search.google.com/local/reviews?placeid=${process.env['GOOGLE_PLACE_ID']}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            Voir tous les avis sur Google
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  )
}
