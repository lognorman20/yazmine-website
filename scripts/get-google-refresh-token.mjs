// One-time helper: prints a Google refresh token for the booking API.
// Usage: GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node scripts/get-google-refresh-token.mjs
// The OAuth client must list http://localhost:53682/oauth2callback as an authorized redirect URI.
import { createServer } from 'node:http'

const PORT = 53682
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.freebusy',
]

const { GOOGLE_CLIENT_ID: clientId, GOOGLE_CLIENT_SECRET: clientSecret } = process.env
if (!clientId || !clientSecret) {
  console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the environment first.')
  process.exit(1)
}

const consentUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
consentUrl.search = new URLSearchParams({
  client_id: clientId,
  redirect_uri: REDIRECT_URI,
  response_type: 'code',
  scope: SCOPES.join(' '),
  access_type: 'offline',
  prompt: 'consent',
}).toString()

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', REDIRECT_URI)
  if (url.pathname !== '/oauth2callback') {
    res.writeHead(404).end()
    return
  }

  const code = url.searchParams.get('code')
  if (!code) {
    res.writeHead(400).end(`No code in callback: ${url.searchParams.get('error') ?? 'unknown error'}`)
    return
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })
  const body = await response.json()

  if (!response.ok || !body.refresh_token) {
    console.error('Token exchange failed:', body.error, body.error_description ?? '')
    res.writeHead(500).end('Token exchange failed. See the terminal.')
  } else {
    console.log('\nGOOGLE_REFRESH_TOKEN=' + body.refresh_token + '\n')
    console.log('Add it to the Vercel project environment variables. Do not commit it.')
    res.writeHead(200, { 'Content-Type': 'text/plain' }).end('Done. You can close this tab.')
  }
  server.close()
})

server.listen(PORT, () => {
  console.log('Open this URL while signed in to the calendar owner account:\n')
  console.log(consentUrl.toString())
})
