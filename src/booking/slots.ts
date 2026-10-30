import {
  BOOKING_HORIZON_DAYS,
  MIN_LEAD_HOURS,
  SLOT_STEP_MINUTES,
  TIME_ZONE,
  WEEKLY_HOURS,
  findService,
  type ServiceId,
} from './config.ts'

export type BusyInterval = { start: Date; end: Date }

const MINUTE_MS = 60_000
const DAY_MS = 24 * 60 * MINUTE_MS

const zoneParts = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

function partsInZone(instant: number) {
  const parts: Record<string, number> = {}
  for (const part of zoneParts.formatToParts(instant)) {
    if (part.type !== 'literal') parts[part.type] = Number(part.value)
  }
  return parts as Record<'year' | 'month' | 'day' | 'hour' | 'minute' | 'second', number>
}

/** Minutes the zone's wall clock is ahead of UTC at this instant (negative west of UTC). */
function zoneOffsetMinutes(instant: number): number {
  const p = partsInZone(instant)
  const wallAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return Math.round((wallAsUtc - Math.floor(instant / 1000) * 1000) / MINUTE_MS)
}

function parseDateParts(date: string): [number, number, number] {
  const [y, m, d] = date.split('-').map(Number)
  return [y, m, d]
}

/** UTC instant for a wall-clock time (minutes after midnight) on a calendar date in TIME_ZONE. */
export function zonedTimeToUtc(date: string, minutesAfterMidnight: number): Date {
  const [y, m, d] = parseDateParts(date)
  const wallAsUtc = Date.UTC(y, m - 1, d, 0, minutesAfterMidnight)
  const firstGuess = wallAsUtc - zoneOffsetMinutes(wallAsUtc) * MINUTE_MS
  return new Date(wallAsUtc - zoneOffsetMinutes(firstGuess) * MINUTE_MS)
}

/** Calendar date (YYYY-MM-DD) of an instant, as seen in TIME_ZONE. */
export function zonedDate(instant: Date): string {
  const p = partsInZone(instant.getTime())
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = parseDateParts(date)
  return new Date(Date.UTC(y, m - 1, d) + days * DAY_MS).toISOString().slice(0, 10)
}

export function weekdayOf(date: string): keyof typeof WEEKLY_HOURS {
  const [y, m, d] = parseDateParts(date)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay() as keyof typeof WEEKLY_HOURS
}

/** Accepts only real calendar dates written as YYYY-MM-DD. */
export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = parseDateParts(value)
  return new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10) === value
}

/** Tomorrow through BOOKING_HORIZON_DAYS from today, in TIME_ZONE. */
export function isWithinHorizon(date: string, now: Date): boolean {
  const today = zonedDate(now)
  return date > today && date <= addDays(today, BOOKING_HORIZON_DAYS)
}

/** Dates within the horizon that have opening hours. */
export function openDates(now: Date): string[] {
  const today = zonedDate(now)
  const dates: string[] = []
  for (let offset = 1; offset <= BOOKING_HORIZON_DAYS; offset++) {
    const date = addDays(today, offset)
    if (WEEKLY_HOURS[weekdayOf(date)]) dates.push(date)
  }
  return dates
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function computeSlots({
  date,
  serviceId,
  busy,
  now,
}: {
  date: string
  serviceId: ServiceId
  busy: BusyInterval[]
  now: Date
}): string[] {
  const hours = WEEKLY_HOURS[weekdayOf(date)]
  const service = findService(serviceId)
  if (!hours || !service) return []

  const durationMs = service.durationMinutes * MINUTE_MS
  const earliest = now.getTime() + MIN_LEAD_HOURS * 60 * MINUTE_MS
  const closeMinutes = toMinutes(hours.close)
  const slots: string[] = []

  for (
    let minutes = toMinutes(hours.open);
    minutes + service.durationMinutes <= closeMinutes;
    minutes += SLOT_STEP_MINUTES
  ) {
    const start = zonedTimeToUtc(date, minutes).getTime()
    const end = start + durationMs
    if (start < earliest) continue
    if (busy.some((b) => start < b.end.getTime() && end > b.start.getTime())) continue
    slots.push(new Date(start).toISOString())
  }
  return slots
}
