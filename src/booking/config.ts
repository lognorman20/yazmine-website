export const TIME_ZONE = 'America/New_York'

// Durations and prices are placeholders until Yazmine confirms them.
export const BOOKABLE_SERVICES = [
  { id: 'loc-retwist', name: 'Loc Retwist', durationMinutes: 150, priceCents: 12000 },
  { id: 'braids-twists', name: 'Braids & Twists', durationMinutes: 300, priceCents: 22000 },
  { id: 'styling', name: 'Styling', durationMinutes: 120, priceCents: 9000 },
  { id: 'natural-hair-care', name: 'Natural Hair Care', durationMinutes: 90, priceCents: 8000 },
] as const

export type BookableService = (typeof BOOKABLE_SERVICES)[number]
export type ServiceId = BookableService['id']

export type OpeningHours = { open: string; close: string }

/** Keyed by weekday, 0 = Sunday. Mirrors the hours in HoursAndPolicies. */
export const WEEKLY_HOURS: Readonly<Record<0 | 1 | 2 | 3 | 4 | 5 | 6, OpeningHours | null>> = {
  0: null,
  1: null,
  2: { open: '07:00', close: '23:00' },
  3: { open: '07:00', close: '23:00' },
  4: { open: '07:00', close: '23:00' },
  5: { open: '07:00', close: '23:00' },
  6: { open: '07:00', close: '23:00' },
}

export const SLOT_STEP_MINUTES = 30
export const MIN_LEAD_HOURS = 24
export const BOOKING_HORIZON_DAYS = 60

/** The flyer's deposit policy: half the service price, paid at booking and taken off the total. */
export function depositCents(service: BookableService): number {
  return Math.round(service.priceCents / 2)
}

export function findService(id: string): BookableService | undefined {
  return BOOKABLE_SERVICES.find((service) => service.id === id)
}
