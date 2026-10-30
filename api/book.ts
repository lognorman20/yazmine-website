import { TIME_ZONE, depositCents, type BookableService } from '../src/booking/config.ts'
import { zonedDate } from '../src/booking/slots.ts'
import { fetchSlots, parseBookableDate, parseService } from './_booking.ts'
import { insertEvent, isGoogleConfigured, json, serverError } from './_google.ts'

type BookingRequest = {
  service: BookableService
  start: Date
  date: string
  name: string
  email: string
  phone: string
  notes: string
}

type Parsed = { kind: 'spam' } | { kind: 'invalid'; field: string } | { kind: 'ok'; booking: BookingRequest }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[\d\s().+-]+$/

function text(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length <= maxLength ? trimmed : null
}

function parseBooking(body: unknown, now: Date): Parsed {
  if (typeof body !== 'object' || body === null) return { kind: 'invalid', field: 'body' }
  const raw = body as Record<string, unknown>

  if (typeof raw.website === 'string' && raw.website.trim() !== '') return { kind: 'spam' }

  const service = parseService(raw.serviceId)
  if (!service) return { kind: 'invalid', field: 'serviceId' }

  const start = typeof raw.start === 'string' ? new Date(raw.start) : null
  if (!start || Number.isNaN(start.getTime()) || start.toISOString() !== raw.start) {
    return { kind: 'invalid', field: 'start' }
  }
  const date = parseBookableDate(zonedDate(start), now)
  if (!date) return { kind: 'invalid', field: 'start' }

  const name = text(raw.name, 100)
  if (!name) return { kind: 'invalid', field: 'name' }

  const email = text(raw.email, 254)
  if (!email || !EMAIL_PATTERN.test(email)) return { kind: 'invalid', field: 'email' }

  const phone = text(raw.phone, 30)
  const phoneDigits = phone?.replace(/\D/g, '').length ?? 0
  if (!phone || !PHONE_PATTERN.test(phone) || phoneDigits < 10 || phoneDigits > 15) {
    return { kind: 'invalid', field: 'phone' }
  }

  const notes = raw.notes === undefined ? '' : text(raw.notes, 1000)
  if (notes === null) return { kind: 'invalid', field: 'notes' }

  if (raw.acceptedPolicy !== true) return { kind: 'invalid', field: 'acceptedPolicy' }

  return { kind: 'ok', booking: { service, start, date, name, email, phone, notes } }
}

type Deposit = { amountCents: number; reference: string; demo: boolean }

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

/**
 * Stand-in for Stripe: records the deposit as paid without charging anything.
 * Real payments will move booking into a Stripe Checkout webhook, so the slot is only booked once the deposit clears.
 */
function demoDeposit(service: BookableService): Deposit {
  return { amountCents: depositCents(service), reference: `demo_${crypto.randomUUID().slice(0, 8)}`, demo: true }
}

function eventDescription(b: BookingRequest, deposit: Deposit): string {
  return [
    `Name: ${b.name}`,
    `Email: ${b.email}`,
    `Phone: ${b.phone}`,
    `Service: ${b.service.name}`,
    `Notes: ${b.notes || 'None'}`,
    `Deposit: ${deposit.reference} (${formatCents(deposit.amountCents)})`,
    '',
    'Booked via lusciousbyyazmine.vercel.app',
  ].join('\n')
}

export async function POST(request: Request): Promise<Response> {
  const now = new Date()
  const body: unknown = await request.json().catch(() => null)
  const parsed = parseBooking(body, now)

  switch (parsed.kind) {
    case 'spam':
      return json(200, { start: null, end: null })
    case 'invalid':
      return json(400, { error: 'invalid_request', field: parsed.field })
    case 'ok':
      break
  }

  const booking = parsed.booking
  const end = new Date(booking.start.getTime() + booking.service.durationMinutes * 60_000)

  try {
    const slots = await fetchSlots(booking.date, booking.service, now)
    if (!slots.includes(booking.start.toISOString())) return json(409, { error: 'slot_taken' })
    // Production must never promise a slot it did not book or take a deposit it did not charge.
    if (process.env.VERCEL_ENV === 'production') return json(503, { error: 'booking_not_connected' })

    const deposit = demoDeposit(booking.service)
    const confirmed = { start: booking.start.toISOString(), end: end.toISOString(), deposit }
    // Previews confirm without booking anything until Google is connected.
    if (!isGoogleConfigured()) return json(201, confirmed)

    await insertEvent({
      summary: `${booking.service.name} · ${booking.name}`,
      description: eventDescription(booking, deposit),
      start: booking.start,
      end,
      timeZone: TIME_ZONE,
      attendeeEmail: booking.email,
    })
    return json(201, confirmed)
  } catch (error) {
    return serverError(error)
  }
}
