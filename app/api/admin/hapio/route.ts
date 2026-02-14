import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import {
  getLocations,
  createLocation,
  getHapioServices,
  createHapioService,
  updateHapioService,
  deleteHapioService,
  getResources,
  createResource,
  updateResource,
  getResourceServices,
  linkResourceToService,
  getRecurringSchedules,
  createRecurringSchedule,
  deleteRecurringSchedule,
  getScheduleBlocks,
  createScheduleBlock,
  deleteScheduleBlock,
  getBookings,
  cancelBooking,
} from '@/lib/hapio'
import type { HapioScheduleBlock } from '@/lib/hapio'
import { getActiveScheduleForHapio } from '@/lib/data'

async function checkAuth() {
  const auth = await isAuthenticated()
  if (!auth) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  return null
}

/** Collect all schedule blocks for a resource (across all recurring schedules) */
async function getAllScheduleBlocks(
  resourceId: string
): Promise<(HapioScheduleBlock & { recurring_schedule_id: string })[]> {
  const recurringSchedules = await getRecurringSchedules(resourceId)
  const allBlocks: (HapioScheduleBlock & { recurring_schedule_id: string })[] = []

  for (const rs of recurringSchedules) {
    const blocks = await getScheduleBlocks(resourceId, rs.id)
    for (const block of blocks) {
      allBlocks.push({ ...block, recurring_schedule_id: rs.id })
    }
  }

  return allBlocks
}

/** Find the first recurring schedule for a resource, or create one */
async function getOrCreateRecurringSchedule(
  resourceId: string,
  locationId: string
): Promise<string> {
  const existing = await getRecurringSchedules(resourceId)
  if (existing[0]) return existing[0].id

  const startDate = new Date().toISOString().split('T')[0]! // today YYYY-MM-DD
  const created = await createRecurringSchedule(resourceId, {
    location_id: locationId,
    start_date: startDate,
  })
  return created.id
}

// GET /api/admin/hapio?action=status|bookings
export async function GET(req: NextRequest) {
  const authError = await checkAuth()
  if (authError) return authError

  try {
    const { searchParams } = req.nextUrl
    const action = searchParams.get('action')

    switch (action) {
      case 'status': {
        const locations = await getLocations()
        const location = locations[0] ?? null

        let services: Awaited<ReturnType<typeof getHapioServices>> = []
        let resources: Awaited<ReturnType<typeof getResources>> = []
        let schedules: (HapioScheduleBlock & { recurring_schedule_id: string })[] = []
        let linkedServices: Awaited<ReturnType<typeof getResourceServices>> = []

        if (location) {
          services = await getHapioServices(location.id)
          resources = await getResources(location.id)
          if (resources[0]) {
            schedules = await getAllScheduleBlocks(resources[0].id)
            linkedServices = await getResourceServices(resources[0].id)
          }
        }

        return NextResponse.json({
          location,
          services,
          resources,
          schedules,
          linkedServices,
          configured: !!location && resources.length > 0 && services.length > 0,
        })
      }

      case 'bookings': {
        const from = searchParams.get('from') ?? undefined
        const to = searchParams.get('to') ?? undefined
        const locations = await getLocations()
        const locationId = locations[0]?.id

        const bookings = await getBookings({
          ...(locationId !== undefined ? { locationId } : {}),
          ...(from !== undefined ? { from } : {}),
          ...(to !== undefined ? { to } : {}),
        })
        return NextResponse.json(bookings)
      }

      default:
        return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
    }
  } catch (error) {
    console.error('Admin Hapio GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST /api/admin/hapio — Créer location, service, resource, schedule
export async function POST(req: NextRequest) {
  const authError = await checkAuth()
  if (authError) return authError

  try {
    const body = await req.json()
    const { action } = body

    switch (action) {
      case 'setup': {
        const {
          locationName,
          locationAddress,
          locationCity,
          locationPostalCode,
          resourceName,
          services: servicesToCreate,
          schedules: schedulesToCreate,
        } = body

        // 1. Réutiliser une location existante ou en créer une
        const existingLocations = await getLocations()
        let location = existingLocations[0] ?? null

        if (!location) {
          console.log('[Setup] Creating location...')
          location = await createLocation({
            name: locationName,
            address: locationAddress,
            city: locationCity,
            postal_code: locationPostalCode,
            country: 'FR',
            time_zone: 'Europe/Paris',
            resource_selection_strategy: 'equalize',
          })
          console.log('[Setup] Location created:', JSON.stringify(location))
        } else {
          console.log('[Setup] Reusing existing location:', location.id)
        }

        if (!location?.id) {
          return NextResponse.json(
            { error: 'Impossible de créer/récupérer la location Hapio' },
            { status: 500 }
          )
        }

        // 2. Réutiliser une resource existante ou en créer une
        const existingResources = await getResources(location.id)
        let resource = existingResources[0] ?? null

        if (!resource) {
          console.log('[Setup] Creating resource...')
          resource = await createResource({
            name: resourceName,
            location_id: location.id,
          })
          console.log('[Setup] Resource created:', JSON.stringify(resource))
        } else {
          console.log('[Setup] Reusing existing resource:', resource.id)
        }

        if (!resource?.id) {
          return NextResponse.json(
            { error: 'Impossible de créer/récupérer la ressource Hapio' },
            { status: 500 }
          )
        }

        // 3. Créer les services et les lier à la ressource
        const existingServices = await getHapioServices(location.id)
        const createdServices = []

        for (const svc of servicesToCreate) {
          const existing = existingServices.find((s) => s.name === svc.name)
          if (existing) {
            console.log(`[Setup] Service "${svc.name}" already exists, skipping`)
            createdServices.push(existing)
            continue
          }

          console.log(`[Setup] Creating service "${svc.name}"...`)
          const hapioService = await createHapioService({
            name: svc.name,
            description: svc.description,
            duration: svc.duration,
            location_id: location.id,
          })
          console.log('[Setup] Service created:', JSON.stringify(hapioService))

          if (hapioService?.id) {
            createdServices.push(hapioService)
            // Lier le service à la ressource
            try {
              await linkResourceToService(resource.id, hapioService.id)
              console.log(`[Setup] Linked service ${hapioService.id} to resource ${resource.id}`)
            } catch (err) {
              console.warn(`[Setup] Could not link service to resource:`, err)
              // Non-bloquant : certaines configurations Hapio n'exigent pas ce lien
            }
          }
        }

        // 4. Créer le recurring schedule et les blocs horaires (seulement si aucun n'existe)
        const existingBlocks = await getAllScheduleBlocks(resource.id)
        if (existingBlocks.length === 0) {
          console.log('[Setup] Creating recurring schedule...')
          const recurringScheduleId = await getOrCreateRecurringSchedule(resource.id, location.id)

          for (const schedule of schedulesToCreate) {
            console.log(`[Setup] Creating schedule block weekday=${schedule.day_of_week}...`)
            await createScheduleBlock(resource.id, recurringScheduleId, {
              weekday: schedule.day_of_week,
              start_time: schedule.start_time,
              end_time: schedule.end_time,
            })
          }
        } else {
          console.log(`[Setup] ${existingBlocks.length} schedule blocks already exist, skipping`)
        }

        return NextResponse.json({
          success: true,
          location,
          resource,
          services: createdServices,
        })
      }

      case 'add-service': {
        const locations = await getLocations()
        const location = locations[0]
        if (!location) {
          return NextResponse.json(
            { error: 'Aucune location configurée' },
            { status: 400 }
          )
        }

        const service = await createHapioService({
          name: body.name,
          description: body.description,
          duration: body.duration,
          location_id: location.id,
        })

        // Lier à la ressource si elle existe
        const resources = await getResources(location.id)
        const resource = resources[0]
        if (resource && service?.id) {
          try {
            await linkResourceToService(resource.id, service.id)
          } catch (err) {
            console.warn('[add-service] Could not link service to resource:', err)
          }
        }

        return NextResponse.json({ success: true, service })
      }

      case 'create-schedules': {
        // Recrée les blocs horaires par défaut pour la ressource principale
        const locations = await getLocations()
        const location = locations[0]
        if (!location) {
          return NextResponse.json({ error: 'Aucune location configurée' }, { status: 400 })
        }
        const resources = await getResources(location.id)
        const resource = resources[0]
        if (!resource) {
          return NextResponse.json({ error: 'Aucune ressource configurée' }, { status: 400 })
        }

        const schedulesToCreate: { day_of_week: number; start_time: string; end_time: string }[] =
          body.schedules ?? [
            { day_of_week: 1, start_time: '09:00', end_time: '12:00' },
            { day_of_week: 1, start_time: '13:00', end_time: '19:00' },
            { day_of_week: 2, start_time: '09:00', end_time: '12:00' },
            { day_of_week: 2, start_time: '13:00', end_time: '19:00' },
            { day_of_week: 3, start_time: '09:00', end_time: '12:00' },
            { day_of_week: 3, start_time: '13:00', end_time: '19:00' },
            { day_of_week: 4, start_time: '09:00', end_time: '12:00' },
            { day_of_week: 4, start_time: '13:00', end_time: '19:00' },
            { day_of_week: 5, start_time: '09:00', end_time: '12:00' },
            { day_of_week: 5, start_time: '13:00', end_time: '19:00' },
          ]

        const recurringScheduleId = await getOrCreateRecurringSchedule(resource.id, location.id)
        const created = []
        for (const s of schedulesToCreate) {
          const block = await createScheduleBlock(resource.id, recurringScheduleId, {
            weekday: s.day_of_week,
            start_time: s.start_time,
            end_time: s.end_time,
          })
          created.push(block)
        }
        return NextResponse.json({ success: true, blocks: created })
      }

      case 'link-services': {
        // Lie tous les services de la location à la ressource principale
        const locations = await getLocations()
        const location = locations[0]
        if (!location) {
          return NextResponse.json({ error: 'Aucune location configurée' }, { status: 400 })
        }
        const resources = await getResources(location.id)
        const resource = resources[0]
        if (!resource) {
          return NextResponse.json({ error: 'Aucune ressource configurée' }, { status: 400 })
        }

        const allServices = await getHapioServices(location.id)
        const linkedServices = await getResourceServices(resource.id)
        const linkedServiceIds = new Set(linkedServices.map((s) => s.service_id))

        const results = []
        for (const svc of allServices) {
          if (linkedServiceIds.has(svc.id)) {
            results.push({ id: svc.id, name: svc.name, status: 'already_linked' })
            continue
          }
          try {
            await linkResourceToService(resource.id, svc.id)
            results.push({ id: svc.id, name: svc.name, status: 'linked' })
            console.log(`[link-services] Linked service ${svc.name}`)
          } catch (err) {
            console.error(`[link-services] Error linking service ${svc.name}:`, err)
            results.push({ id: svc.id, name: svc.name, status: 'error', error: String(err) })
          }
        }

        return NextResponse.json({ success: true, results })
      }

      case 'sync-variants': {
        // Crée un service Hapio pour chaque variant passé en body
        // body.variants: { name: string; duration: number; description?: string }[]
        const variantsToSync: { name: string; duration: number; description?: string }[] = body.variants ?? []

        const locations = await getLocations()
        const location = locations[0]
        if (!location) {
          return NextResponse.json({ error: 'Aucune location configurée' }, { status: 400 })
        }
        const resources = await getResources(location.id)
        const resource = resources[0]
        if (!resource) {
          return NextResponse.json({ error: 'Aucune ressource configurée' }, { status: 400 })
        }

        const existingServices = await getHapioServices(location.id)

        // Normalise un nom pour la comparaison
        const norm = (s: string) =>
          s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

        const existingNames = new Set(existingServices.map((s) => norm(s.name)))

        const results: { name: string; status: string; id?: string; error?: string }[] = []

        for (const v of variantsToSync) {
          if (existingNames.has(norm(v.name))) {
            results.push({ name: v.name, status: 'already_exists' })
            continue
          }
          try {
            const hapioService = await createHapioService({
              name: v.name,
              ...(v.description ? { description: v.description } : {}),
              duration: v.duration,
              location_id: location.id,
            })
            // Lier à la ressource principale
            if (hapioService?.id) {
              try {
                await linkResourceToService(resource.id, hapioService.id)
              } catch {
                // Non bloquant
              }
            }
            results.push({ name: v.name, status: 'created', id: hapioService.id })
            existingNames.add(norm(v.name)) // Évite les doublons dans la boucle
          } catch (err) {
            results.push({ name: v.name, status: 'error', error: String(err) })
          }
        }

        return NextResponse.json({ success: true, results })
      }

      case 'add-schedule': {
        // Body: { resourceId, locationId, day_of_week, start_time, end_time }
        const { resourceId, locationId, day_of_week, start_time, end_time } = body
        const resolvedLocationId: string = locationId ?? (await getLocations())[0]?.id
        const recurringScheduleId = await getOrCreateRecurringSchedule(resourceId, resolvedLocationId)
        const block = await createScheduleBlock(resourceId, recurringScheduleId, {
          weekday: day_of_week,
          start_time,
          end_time,
        })
        return NextResponse.json({ success: true, schedule: block })
      }

      case 'fix-intervals': {
        // Met bookable_interval = duration pour tous les services qui ont interval null
        const locations = await getLocations()
        const location = locations[0]
        if (!location) {
          return NextResponse.json({ error: 'Aucune location configurée' }, { status: 400 })
        }

        const allServices = await getHapioServices(location.id)
        const results: { id: string; name: string; status: string }[] = []

        for (const svc of allServices) {
          if (svc.duration && !svc.bookable_interval) {
            try {
              // Convertir duration (minutes) en ISO 8601 (ex: 30 → "PT30M")
              const minutes = svc.duration
              const hours = Math.floor(minutes / 60)
              const mins = minutes % 60
              const isoDuration = hours > 0
                ? `PT${hours}H${mins > 0 ? `${mins}M` : ''}`
                : `PT${mins}M`

              await updateHapioService(svc.id, { bookable_interval: isoDuration })
              results.push({ id: svc.id, name: svc.name, status: 'fixed' })
            } catch {
              results.push({ id: svc.id, name: svc.name, status: 'error' })
            }
          } else {
            results.push({ id: svc.id, name: svc.name, status: 'ok' })
          }
        }

        return NextResponse.json({ success: true, results })
      }

      case 'fix-resource-limits': {
        // Définit max_simultaneous_bookings à 1 pour toutes les ressources
        const locations = await getLocations()
        const location = locations[0]
        if (!location) {
          return NextResponse.json({ error: 'Aucune location configurée' }, { status: 400 })
        }

        const allResources = await getResources(location.id)
        const results: { id: string; name: string; status: string }[] = []

        for (const resource of allResources) {
          try {
            await updateResource(resource.id, { max_simultaneous_bookings: 1 })
            results.push({ id: resource.id, name: resource.name, status: 'fixed' })
          } catch {
            results.push({ id: resource.id, name: resource.name, status: 'error' })
          }
        }

        return NextResponse.json({ success: true, results })
      }

      case 'sync-schedule': {
        // Synchronise les horaires du template actif Supabase → Hapio
        console.log('[sync-schedule] Starting schedule sync...')

        // 1. Récupérer la location et la ressource Hapio
        const locations = await getLocations()
        const location = locations[0]
        if (!location) {
          return NextResponse.json({ error: 'Aucune location configurée' }, { status: 400 })
        }

        const resources = await getResources(location.id)
        const resource = resources[0]
        if (!resource) {
          return NextResponse.json({ error: 'Aucune ressource configurée' }, { status: 400 })
        }

        // 2. Récupérer les horaires actifs depuis Supabase
        const scheduleBlocks = await getActiveScheduleForHapio()
        console.log(`[sync-schedule] Found ${scheduleBlocks.length} schedule blocks from Supabase`)

        // 3. Supprimer tous les schedule blocks existants dans Hapio
        const existingBlocks = await getAllScheduleBlocks(resource.id)
        console.log(`[sync-schedule] Deleting ${existingBlocks.length} existing Hapio blocks...`)

        for (const block of existingBlocks) {
          try {
            await deleteScheduleBlock(resource.id, block.recurring_schedule_id, block.id)
            console.log(`[sync-schedule] Deleted block ${block.id}`)
          } catch (err) {
            console.warn(`[sync-schedule] Failed to delete block ${block.id}:`, err)
          }
        }

        // 4. Créer ou récupérer le recurring schedule
        const recurringScheduleId = await getOrCreateRecurringSchedule(resource.id, location.id)
        console.log(`[sync-schedule] Using recurring schedule: ${recurringScheduleId}`)

        // 5. Créer les nouveaux schedule blocks
        const created: HapioScheduleBlock[] = []
        for (const block of scheduleBlocks) {
          try {
            const newBlock = await createScheduleBlock(resource.id, recurringScheduleId, {
              weekday: block.day_of_week,
              start_time: block.start_time,
              end_time: block.end_time,
            })
            created.push(newBlock)
            console.log(`[sync-schedule] Created block: ${block.day_of_week} ${block.start_time}-${block.end_time}`)
          } catch (err) {
            console.error(`[sync-schedule] Failed to create block:`, err)
          }
        }

        return NextResponse.json({
          success: true,
          deleted: existingBlocks.length,
          created: created.length,
          blocks: created,
        })
      }

      default:
        return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
    }
  } catch (error) {
    console.error('Admin Hapio POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/hapio
export async function DELETE(req: NextRequest) {
  const authError = await checkAuth()
  if (authError) return authError

  try {
    const body = await req.json()
    const { action } = body

    switch (action) {
      case 'delete-service':
        await deleteHapioService(body.serviceId)
        return NextResponse.json({ success: true })

      case 'delete-schedule': {
        // Body: { resourceId, recurringScheduleId, blockId }
        // OR: { resourceId, blockId } — auto-find recurring schedule
        const { resourceId, blockId } = body
        let { recurringScheduleId } = body

        if (!recurringScheduleId) {
          // Auto-discover which recurring schedule contains this block
          const recurringSchedules = await getRecurringSchedules(resourceId)
          for (const rs of recurringSchedules) {
            const blocks = await getScheduleBlocks(resourceId, rs.id)
            if (blocks.some((b) => b.id === blockId)) {
              recurringScheduleId = rs.id
              break
            }
          }
        }

        if (!recurringScheduleId) {
          return NextResponse.json(
            { error: 'Recurring schedule introuvable pour ce bloc' },
            { status: 404 }
          )
        }

        await deleteScheduleBlock(resourceId, recurringScheduleId, blockId)
        return NextResponse.json({ success: true })
      }

      case 'delete-recurring-schedule': {
        // Body: { resourceId, recurringScheduleId }
        await deleteRecurringSchedule(body.resourceId, body.recurringScheduleId)
        return NextResponse.json({ success: true })
      }

      case 'cancel-booking':
        await cancelBooking(body.bookingId)
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
    }
  } catch (error) {
    console.error('Admin Hapio DELETE error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
