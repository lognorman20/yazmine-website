import { findService, type BookableService } from '../src/booking/config.ts'
import {
  addDays,
  computeSlots,
  isCalendarDate,
  isWithinHorizon,
  zonedTimeToUtc,
} from '../src/booking/slots.ts'
import { freeBusy, isGoogleConfigured } from './_google.ts'

export function parseService(value: unknown): BookableService | null {
  return typeof value === 'string' ? (findService(value) ?? null) : null
}

export function parseBookableDate(value: unknown, now: Date): string | null {
  return typeof value === 'string' && isCalendarDate(value) && isWithinHorizon(value, now) ? value : null
}

const DEMO_LAST_START_MINUTES = 18 * 60

function seededRandom(seed: string): () => number {
  let state = 2166136261
  for (const char of seed) state = Math.imul(state ^ char.charCodeAt(0), 16777619)
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Stand-in openings until Google is connected: a stable, date-seeded subset of 7 AM to 6 PM starts. */
function demoSlots(date: string, service: BookableService, now: Date): string[] {
  const latest = zonedTimeToUtc(date, DEMO_LAST_START_MINUTES).getTime()
  const random = seededRandom(`${date}:${service.id}`)
  return computeSlots({ date, serviceId: service.id, busy: [], now })
    .filter((start) => Date.parse(start) <= latest)
    .filter(() => random() < 0.45)
}

/** Open start times for a service on a date, minus whatever is already on the calendar. */
export async function fetchSlots(date: string, service: BookableService, now: Date): Promise<string[]> {
  if (!isGoogleConfigured()) return demoSlots(date, service, now)
  const busy = await freeBusy(zonedTimeToUtc(date, 0), zonedTimeToUtc(addDays(date, 1), 0))
  return computeSlots({ date, serviceId: service.id, busy, now })
}
