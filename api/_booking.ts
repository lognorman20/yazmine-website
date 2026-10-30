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

/** Open start times for a service on a date, minus whatever is already on the calendar. */
export async function fetchSlots(date: string, service: BookableService, now: Date): Promise<string[]> {
  const busy = isGoogleConfigured()
    ? await freeBusy(zonedTimeToUtc(date, 0), zonedTimeToUtc(addDays(date, 1), 0))
    : []
  return computeSlots({ date, serviceId: service.id, busy, now })
}
