import assert from 'node:assert/strict'
import { test } from 'node:test'
import { computeSlots, isWithinHorizon, openDates } from './slots.ts'

const longAgo = new Date('2026-01-01T00:00:00Z')

test('closed weekday has no slots', () => {
  // 2026-11-01 is a Sunday, 2026-11-02 a Monday.
  assert.deepEqual(computeSlots({ date: '2026-11-01', serviceId: 'styling', busy: [], now: longAgo }), [])
  assert.deepEqual(computeSlots({ date: '2026-11-02', serviceId: 'styling', busy: [], now: longAgo }), [])
})

test('first slot starts at open and last slot ends exactly at close (EDT)', () => {
  const slots = computeSlots({ date: '2026-10-20', serviceId: 'styling', busy: [], now: longAgo })
  // 07:00 EDT = 11:00Z; 21:00 EDT start + 2h = 23:00 EDT close = 03:00Z next day.
  assert.equal(slots[0], '2026-10-20T11:00:00.000Z')
  assert.equal(slots.at(-1), '2026-10-21T01:00:00.000Z')
  assert.equal(slots.length, 29)
})

test('long service stops offering starts that would run past close', () => {
  const slots = computeSlots({ date: '2026-10-20', serviceId: 'braids-twists', busy: [], now: longAgo })
  // 5h service: last start 18:00 EDT = 22:00Z.
  assert.equal(slots.at(-1), '2026-10-20T22:00:00.000Z')
})

test('slots overlapping a busy interval are removed, adjacent ones kept', () => {
  const busy = [{ start: new Date('2026-10-20T15:00:00Z'), end: new Date('2026-10-20T16:00:00Z') }]
  const slots = computeSlots({ date: '2026-10-20', serviceId: 'natural-hair-care', busy, now: longAgo })
  // 90 min service. 13:30Z ends 15:00Z (adjacent, kept). 14:00Z..15:30Z all overlap. 16:00Z starts at busy end (kept).
  assert.ok(slots.includes('2026-10-20T13:30:00.000Z'))
  for (const blocked of ['14:00', '14:30', '15:00', '15:30']) {
    assert.ok(!slots.includes(`2026-10-20T${blocked}:00.000Z`), `${blocked}Z should be blocked`)
  }
  assert.ok(slots.includes('2026-10-20T16:00:00.000Z'))
})

test('slots inside the minimum lead time are not offered', () => {
  const now = new Date('2026-10-19T14:10:00Z')
  const slots = computeSlots({ date: '2026-10-20', serviceId: 'styling', busy: [], now })
  assert.equal(slots[0], '2026-10-20T14:30:00.000Z')
})

test('after fall-back (EST, UTC-5) open is 12:00Z', () => {
  const slots = computeSlots({ date: '2026-11-03', serviceId: 'styling', busy: [], now: longAgo })
  assert.equal(slots[0], '2026-11-03T12:00:00.000Z')
  assert.equal(slots.at(-1), '2026-11-04T02:00:00.000Z')
})

test('after spring-forward (EDT, UTC-4) open is 11:00Z', () => {
  const slots = computeSlots({ date: '2027-03-16', serviceId: 'styling', busy: [], now: longAgo })
  assert.equal(slots[0], '2027-03-16T11:00:00.000Z')
  assert.equal(slots.at(-1), '2027-03-17T01:00:00.000Z')
})

test('horizon starts tomorrow in New York time and skips closed days', () => {
  // 03:00Z on Oct 21 is still Oct 20 in New York.
  const now = new Date('2026-10-21T03:00:00Z')
  assert.equal(isWithinHorizon('2026-10-20', now), false)
  assert.equal(isWithinHorizon('2026-10-21', now), true)
  assert.equal(isWithinHorizon('2026-12-19', now), true)
  assert.equal(isWithinHorizon('2026-12-20', now), false)
  const dates = openDates(now)
  assert.equal(dates[0], '2026-10-21')
  assert.ok(!dates.includes('2026-10-25'), 'Sunday is closed')
})
