import { useEffect, useMemo, useReducer, useRef, useState, type FormEvent } from 'react'
import { BOOKABLE_SERVICES, TIME_ZONE, depositCents, type BookableService } from '../booking/config'
import { BOOKING_WEEK_COUNT, bookingWeek } from '../booking/slots'
import { formatPrice } from '../data/products'
import styles from './Booking.module.css'

type Details = { name: string; email: string; phone: string; notes: string; website: string }

type FailureReason = 'failed' | 'notConnected'

type Deposit = { amountCents: number; reference: string; demo: boolean }

type Slots = { status: 'loading' } | { status: 'ready'; starts: string[] } | { status: 'failed' }

type State =
  | { step: 'service' }
  | { step: 'date'; service: BookableService }
  | { step: 'time'; service: BookableService; date: string; slots: Slots; notice?: string }
  | { step: 'details'; service: BookableService; date: string; start: string; details?: Details }
  | { step: 'deposit'; service: BookableService; date: string; start: string; details: Details }
  | { step: 'submitting'; service: BookableService; date: string; start: string; details: Details }
  | { step: 'confirmed'; service: BookableService; date: string; start: string; deposit: Deposit | null }
  | { step: 'error'; service: BookableService; date: string; start: string; details: Details; reason: FailureReason }

type Action =
  | { type: 'chooseService'; service: BookableService }
  | { type: 'chooseDate'; date: string }
  | { type: 'slotsLoaded'; starts: string[] }
  | { type: 'slotsFailed' }
  | { type: 'chooseTime'; start: string }
  | { type: 'submit'; details: Details }
  | { type: 'pay' }
  | { type: 'booked'; deposit: Deposit | null }
  | { type: 'slotTaken' }
  | { type: 'bookingFailed'; reason: FailureReason }
  | { type: 'retry' }
  | { type: 'back' }
  | { type: 'restart' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'chooseService':
      return state.step === 'service' ? { step: 'date', service: action.service } : state
    case 'chooseDate':
      return state.step === 'date'
        ? { step: 'time', service: state.service, date: action.date, slots: { status: 'loading' } }
        : state
    case 'slotsLoaded':
      return state.step === 'time' ? { ...state, slots: { status: 'ready', starts: action.starts } } : state
    case 'slotsFailed':
      return state.step === 'time' ? { ...state, slots: { status: 'failed' } } : state
    case 'chooseTime':
      return state.step === 'time'
        ? { step: 'details', service: state.service, date: state.date, start: action.start }
        : state
    case 'submit':
      return state.step === 'details' ? { ...state, step: 'deposit', details: action.details } : state
    case 'pay':
      return state.step === 'deposit' ? { ...state, step: 'submitting' } : state
    case 'booked':
      return state.step === 'submitting'
        ? { step: 'confirmed', service: state.service, date: state.date, start: state.start, deposit: action.deposit }
        : state
    case 'slotTaken':
      return state.step === 'submitting'
        ? {
            step: 'time',
            service: state.service,
            date: state.date,
            slots: { status: 'loading' },
            notice: `Someone just booked ${formatTime(state.start)}. Pick another time.`,
          }
        : state
    case 'bookingFailed':
      return state.step === 'submitting' ? { ...state, step: 'error', reason: action.reason } : state
    case 'retry':
      return state.step === 'error' ? { ...state, step: 'deposit' } : state
    case 'back':
      switch (state.step) {
        case 'date':
          return { step: 'service' }
        case 'time':
          return { step: 'date', service: state.service }
        case 'details':
          return { step: 'time', service: state.service, date: state.date, slots: { status: 'loading' } }
        case 'deposit':
          return { ...state, step: 'details' }
        default:
          return state
      }
    case 'restart':
      return { step: 'service' }
  }
}

const dateFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})
const chipFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})
const rangeFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  month: 'short',
  day: 'numeric',
})
const timeFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  hour: 'numeric',
  minute: '2-digit',
})

function calendarDate(date: string): Date {
  return new Date(`${date}T12:00:00Z`)
}

function formatDate(date: string): string {
  return dateFormat.format(calendarDate(date))
}

function formatTime(iso: string): string {
  return timeFormat.format(new Date(iso))
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return [hours && `${hours} hr`, rest && `${rest} min`].filter(Boolean).join(' ')
}

function chipParts(date: string): { weekday: string; month: string; day: string } {
  const parts = Object.fromEntries(
    chipFormat.formatToParts(calendarDate(date)).map((part) => [part.type, part.value]),
  )
  return { weekday: parts.weekday, month: parts.month, day: parts.day }
}

async function postBooking(body: Record<string, string | boolean>): Promise<Action> {
  try {
    const response = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (response.ok) {
      const body = (await response.json()) as { deposit?: Deposit }
      return { type: 'booked', deposit: body.deposit ?? null }
    }
    if (response.status === 409) return { type: 'slotTaken' }
    if (response.status === 503) return { type: 'bookingFailed', reason: 'notConnected' }
    return { type: 'bookingFailed', reason: 'failed' }
  } catch {
    return { type: 'bookingFailed', reason: 'failed' }
  }
}

function statusMessage(state: State): string {
  if (state.step === 'submitting') return 'Paying your deposit and booking your appointment…'
  if (state.step !== 'time') return ''
  if (state.notice) return state.notice
  switch (state.slots.status) {
    case 'loading':
      return 'Checking openings…'
    case 'failed':
      return 'Could not load openings. Try again in a moment.'
    case 'ready':
      return state.slots.starts.length === 0 ? 'No openings this day. Try another date.' : ''
  }
}

const STEP_TITLES: Record<State['step'], string> = {
  service: 'Choose a service',
  date: 'Pick a date',
  time: 'Pick a time',
  details: 'Your details',
  deposit: 'Pay your deposit',
  submitting: 'Pay your deposit',
  confirmed: 'You are booked',
  error: 'Booking did not go through',
}

export default function Booking() {
  const [state, dispatch] = useReducer(reducer, { step: 'service' })
  const [week, setWeek] = useState(0)
  const days = useMemo(() => bookingWeek(new Date(), week), [week])
  const headingRef = useRef<HTMLHeadingElement>(null)
  const focusedStep = useRef(state.step)

  useEffect(() => {
    if (focusedStep.current === state.step) return
    focusedStep.current = state.step
    headingRef.current?.focus()
  }, [state.step])

  const slotQuery =
    state.step === 'time' && state.slots.status === 'loading'
      ? new URLSearchParams({ service: state.service.id, date: state.date }).toString()
      : null

  useEffect(() => {
    if (!slotQuery) return
    const controller = new AbortController()
    fetch(`/api/availability?${slotQuery}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`availability ${response.status}`)
        const body = (await response.json()) as { slots: string[] }
        dispatch({ type: 'slotsLoaded', starts: body.slots })
      })
      .catch(() => {
        if (!controller.signal.aborted) dispatch({ type: 'slotsFailed' })
      })
    return () => controller.abort()
  }, [slotQuery])

  const handleDetails = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (state.step !== 'details') return
    const form = new FormData(event.currentTarget)
    const field = (name: string) => String(form.get(name) ?? '').trim()
    const details: Details = {
      name: field('name'),
      email: field('email'),
      phone: field('phone'),
      notes: field('notes'),
      website: field('website'),
    }
    dispatch({ type: 'submit', details })
  }

  const handleDeposit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (state.step !== 'deposit') return
    dispatch({ type: 'pay' })
    dispatch(
      await postBooking({ serviceId: state.service.id, start: state.start, ...state.details, acceptedPolicy: true }),
    )
  }

  const summary =
    state.step === 'service' || state.step === 'confirmed'
      ? []
      : [
          state.service.name,
          'date' in state ? formatDate(state.date) : null,
          'start' in state ? formatTime(state.start) : null,
        ].filter(Boolean)

  const status = statusMessage(state)

  return (
    <section id="book" className={styles.section} aria-labelledby="book-heading">
      <div className={styles.inner}>
        <h2 id="book-heading" className={styles.heading}>
          Book an Appointment
        </h2>

        {summary.length > 0 && (
          <p className={styles.summary}>{summary.join(' · ')}</p>
        )}

        <div className={styles.stepHeader}>
          <h3 ref={headingRef} tabIndex={-1} className={styles.stepTitle}>
            {STEP_TITLES[state.step]}
          </h3>
          {(state.step === 'date' || state.step === 'time' || state.step === 'details' || state.step === 'deposit') && (
            <button type="button" className={styles.back} onClick={() => dispatch({ type: 'back' })}>
              Back
            </button>
          )}
        </div>

        <p className={styles.status} role="status" aria-live="polite">
          {status}
        </p>

        {state.step === 'service' && (
          <ul className={styles.services}>
            {BOOKABLE_SERVICES.map((service) => (
              <li key={service.id}>
                <button
                  type="button"
                  className={styles.serviceOption}
                  onClick={() => dispatch({ type: 'chooseService', service })}
                >
                  <span className={styles.serviceText}>
                    <span className={styles.serviceName}>{service.name}</span>
                    <span className={styles.serviceMeta}>
                      {formatDuration(service.durationMinutes)} · {formatPrice(service.priceCents)}
                    </span>
                  </span>
                  <span className={styles.selectLabel} aria-hidden="true">
                    Select
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {state.step === 'date' && (
          <div>
            <div className={styles.weekNav}>
              <button
                type="button"
                className={styles.weekArrow}
                aria-label="Previous week"
                disabled={week === 0}
                onClick={() => setWeek(week - 1)}
              >
                ‹
              </button>
              <p className={styles.weekRange}>
                {rangeFormat.formatRange(calendarDate(days[0].date), calendarDate(days[6].date))}
              </p>
              <button
                type="button"
                className={styles.weekArrow}
                aria-label="Next week"
                disabled={week === BOOKING_WEEK_COUNT - 1}
                onClick={() => setWeek(week + 1)}
              >
                ›
              </button>
            </div>
            <ul className={styles.dates} aria-label="Dates this week">
              {days.map(({ date, open }) => {
                const parts = chipParts(date)
                return (
                  <li key={date}>
                    <button
                      type="button"
                      className={styles.dateChip}
                      aria-label={open ? formatDate(date) : `${formatDate(date)}, closed`}
                      disabled={!open}
                      onClick={() => dispatch({ type: 'chooseDate', date })}
                    >
                      <span className={styles.chipWeekday}>{parts.weekday}</span>
                      <span className={styles.chipDay}>{parts.day}</span>
                      <span className={styles.chipMonth}>{parts.month}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {state.step === 'time' && state.slots.status === 'ready' && (
          <ul className={styles.times} aria-label={`Openings on ${formatDate(state.date)}`}>
            {state.slots.starts.map((start) => (
              <li key={start}>
                <button
                  type="button"
                  className={styles.timeOption}
                  onClick={() => dispatch({ type: 'chooseTime', start })}
                >
                  {formatTime(start)}
                </button>
              </li>
            ))}
          </ul>
        )}

        {state.step === 'details' && (
          <form className={styles.form} onSubmit={handleDetails}>
            <fieldset className={styles.fieldset}>
              <label className={styles.field}>
                <span className={styles.label}>Name</span>
                <input name="name" autoComplete="name" required maxLength={100} defaultValue={state.details?.name} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Email</span>
                <input name="email" type="email" autoComplete="email" required maxLength={254} defaultValue={state.details?.email} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Phone</span>
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  maxLength={30}
                  pattern="[0-9 \(\)+.\-]{10,30}"
                  title="Phone number with area code"
                  defaultValue={state.details?.phone}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Notes (optional)</span>
                <textarea
                  name="notes"
                  rows={4}
                  maxLength={1000}
                  placeholder="Your hair type, length, and current style help me plan your appointment."
                  defaultValue={state.details?.notes}
                />
              </label>
              <label className={styles.honeypot} aria-hidden="true">
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
              <button type="submit" className={styles.primary}>
                Continue to deposit
              </button>
            </fieldset>
          </form>
        )}

        {(state.step === 'deposit' || state.step === 'submitting') && (
          <form className={styles.form} onSubmit={handleDeposit}>
            <fieldset className={styles.fieldset} disabled={state.step === 'submitting'}>
              <dl className={styles.priceList}>
                <div>
                  <dt>{state.service.name}</dt>
                  <dd>{formatPrice(state.service.priceCents)}</dd>
                </div>
                <div className={styles.priceDue}>
                  <dt>Deposit due now (50%)</dt>
                  <dd>{formatPrice(depositCents(state.service))}</dd>
                </div>
                <div>
                  <dt>Balance at your appointment</dt>
                  <dd>{formatPrice(state.service.priceCents - depositCents(state.service))}</dd>
                </div>
              </dl>
              <label className={styles.check}>
                <input name="acceptedPolicy" type="checkbox" required />
                <span>
                  I understand the deposit is non-refundable and comes off my service total. I have read the{' '}
                  <a href="#info">lateness and rescheduling policies</a>.
                </span>
              </label>
              <p className={styles.demoNote}>
                Demo payment: card payments are not connected yet, so no card is charged.
              </p>
              <button type="submit" className={styles.primary}>
                {state.step === 'submitting'
                  ? 'Paying…'
                  : `Pay ${formatPrice(depositCents(state.service))} deposit`}
              </button>
            </fieldset>
          </form>
        )}

        {state.step === 'confirmed' && (
          <div className={styles.confirmation}>
            <dl className={styles.confirmList}>
              <div>
                <dt>Service</dt>
                <dd>{state.service.name}</dd>
              </div>
              <div>
                <dt>When</dt>
                <dd>
                  {formatDate(state.date)} at {formatTime(state.start)}
                </dd>
              </div>
              {state.deposit && (
                <div>
                  <dt>{state.deposit.demo ? 'Deposit (demo, not charged)' : 'Deposit paid'}</dt>
                  <dd>
                    {formatPrice(state.deposit.amountCents)} · {formatPrice(state.service.priceCents - state.deposit.amountCents)}{' '}
                    due at your appointment
                  </dd>
                </div>
              )}
            </dl>
            <p className={styles.confirmNote}>Check your email for the calendar invite.</p>
            <button type="button" className={styles.secondary} onClick={() => dispatch({ type: 'restart' })}>
              Book another appointment
            </button>
          </div>
        )}

        {state.step === 'error' && (
          <div className={styles.confirmation}>
            <p className={styles.confirmNote}>
              {state.reason === 'notConnected'
                ? 'Online booking is not live yet, so this appointment was not booked. Call or text (551) 257-5820, or email info@lusciousbyyazmine.com to book.'
                : 'Your appointment was not booked and no deposit was taken. Try again, or call or email using the contact details below.'}
            </p>
            {state.reason === 'failed' && (
              <button type="button" className={styles.primary} onClick={() => dispatch({ type: 'retry' })}>
                Try again
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
