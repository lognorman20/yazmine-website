import { fetchSlots, parseBookableDate, parseService } from './_booking.ts'
import { json, serverError } from './_google.ts'

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams
  const now = new Date()
  const service = parseService(params.get('service'))
  if (!service) return json(400, { error: 'invalid_service' })
  const date = parseBookableDate(params.get('date'), now)
  if (!date) return json(400, { error: 'invalid_date' })

  try {
    const slots = await fetchSlots(date, service, now)
    return Response.json({ slots }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return serverError(error)
  }
}
