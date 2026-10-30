export const TIME_ZONE = 'America/New_York'

// Durations are placeholders until Yazmine confirms how long each service takes.
export const BOOKABLE_SERVICES = [
  { id: 'loc-retwist', name: 'Loc Retwist', durationMinutes: 150 },
  { id: 'braids-twists', name: 'Braids & Twists', durationMinutes: 300 },
  { id: 'styling', name: 'Styling', durationMinutes: 120 },
  { id: 'natural-hair-care', name: 'Natural Hair Care', durationMinutes: 90 },
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

export function findService(id: string): BookableService | undefined {
  return BOOKABLE_SERVICES.find((service) => service.id === id)
}
