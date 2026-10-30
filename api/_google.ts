import type { BusyInterval } from '../src/booking/slots.ts'

const ENV_KEYS = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REFRESH_TOKEN',
  'GOOGLE_CALENDAR_ID',
  'STYLIST_EMAIL',
] as const

type GoogleEnv = Record<(typeof ENV_KEYS)[number], string>

class GoogleApiError extends Error {}

function readEnv(): GoogleEnv {
  const missing = ENV_KEYS.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }
  return Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]])) as GoogleEnv
}

async function googleFetch(label: string, url: string, init: RequestInit): Promise<unknown> {
  const response = await fetch(url, init)
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new GoogleApiError(`${label} failed with ${response.status}: ${detail.slice(0, 500)}`)
  }
  return response.json()
}

async function accessToken(env: GoogleEnv): Promise<string> {
  const body = (await googleFetch('Token refresh', 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })) as { access_token: string }
  return body.access_token
}

async function calendarRequest(label: string, path: string, init: RequestInit): Promise<unknown> {
  const env = readEnv()
  const token = await accessToken(env)
  return googleFetch(label, `https://www.googleapis.com/calendar/v3${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  })
}

export async function freeBusy(timeMin: Date, timeMax: Date): Promise<BusyInterval[]> {
  const calendarId = readEnv().GOOGLE_CALENDAR_ID
  const body = (await calendarRequest('FreeBusy query', '/freeBusy', {
    method: 'POST',
    body: JSON.stringify({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: calendarId }],
    }),
  })) as {
    calendars: Record<string, { busy?: { start: string; end: string }[]; errors?: unknown[] }>
  }

  const calendar = body.calendars[calendarId]
  if (!calendar || calendar.errors?.length) {
    throw new GoogleApiError(`FreeBusy returned errors for the calendar: ${JSON.stringify(calendar?.errors)}`)
  }
  return (calendar.busy ?? []).map((b) => ({ start: new Date(b.start), end: new Date(b.end) }))
}

export type NewEvent = {
  summary: string
  description: string
  start: Date
  end: Date
  timeZone: string
  attendeeEmail: string
}

export async function insertEvent(event: NewEvent): Promise<void> {
  const env = readEnv()
  const calendarId = encodeURIComponent(env.GOOGLE_CALENDAR_ID)
  await calendarRequest('Event insert', `/calendars/${calendarId}/events?sendUpdates=all`, {
    method: 'POST',
    body: JSON.stringify({
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.start.toISOString(), timeZone: event.timeZone },
      end: { dateTime: event.end.toISOString(), timeZone: event.timeZone },
      attendees: [{ email: event.attendeeEmail }, { email: env.STYLIST_EMAIL }],
      reminders: { useDefault: true },
    }),
  })
}

export function json(status: number, body: unknown): Response {
  return Response.json(body, { status })
}

/** Logs the real cause server-side and returns a generic message to the client. */
export function serverError(error: unknown): Response {
  console.error('[booking]', error instanceof Error ? error.message : error)
  return json(error instanceof GoogleApiError ? 502 : 500, { error: 'server_error' })
}
