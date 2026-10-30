import assert from 'node:assert/strict'
import { test } from 'node:test'
import { findService } from '../src/booking/config.ts'
import { addDays, zonedDate } from '../src/booking/slots.ts'
import { fetchSlots } from './_booking.ts'
import { POST } from './book.ts'

const service = findService('styling')!

async function openSlot(): Promise<string> {
  const now = new Date()
  for (let offset = 2; offset < 30; offset++) {
    const [start] = await fetchSlots(addDays(zonedDate(now), offset), service, now)
    if (start) return start
  }
  throw new Error('no demo slot in the next month')
}

async function book(fields: Record<string, unknown>): Promise<Response> {
  const body = {
    serviceId: service.id,
    start: await openSlot(),
    name: 'Test Client',
    email: 'client@example.com',
    phone: '(555) 123-4567',
    acceptedPolicy: true,
    ...fields,
  }
  return POST(new Request('http://localhost/api/book', { method: 'POST', body: JSON.stringify(body) }))
}

test('booking without accepting the deposit policy is rejected', async () => {
  const response = await book({ acceptedPolicy: undefined })
  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: 'invalid_request', field: 'acceptedPolicy' })
})

test('preview booking returns a demo deposit of half the service price', async () => {
  const response = await book({})
  assert.equal(response.status, 201)
  const { deposit } = (await response.json()) as { deposit: { amountCents: number; demo: boolean; reference: string } }
  assert.equal(deposit.amountCents, service.priceCents / 2)
  assert.equal(deposit.demo, true)
  assert.match(deposit.reference, /^demo_/)
})

test('production refuses to book until real payments are connected', async (t) => {
  process.env.VERCEL_ENV = 'production'
  t.after(() => delete process.env.VERCEL_ENV)
  const response = await book({})
  assert.equal(response.status, 503)
})
