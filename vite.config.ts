import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const API_ROUTES: Record<string, 'GET' | 'POST'> = {
  '/api/availability': 'GET',
  '/api/book': 'POST',
}

// Vite only prints HMR and errors; this prints every dev request so the terminal shows all traffic.
function requestLog(): Plugin {
  return {
    name: 'request-log',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const start = performance.now()
        res.on('finish', () => {
          const ms = Math.round(performance.now() - start)
          server.config.logger.info(`${req.method} ${req.url} ${res.statusCode} ${ms}ms`, { timestamp: true })
        })
        next()
      })
    },
  }
}

// Vercel serves api/ in production; this runs the same handlers under `vite` so the booking flow works in dev.
function apiRoutes(): Plugin {
  return {
    name: 'api-routes',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const method = API_ROUTES[url.pathname]
        if (!method || req.method !== method) return next()

        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)
        const request = new Request(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: method === 'POST' ? Buffer.concat(chunks) : undefined,
        })

        const { logger } = server.config
        if (method === 'POST') logger.info(`  -> ${Buffer.concat(chunks).toString()}`, { timestamp: true })

        try {
          const handlers = await server.ssrLoadModule(`${url.pathname}.ts`)
          const response: Response = await handlers[method](request)
          const body = await response.text()
          logger.info(`  <- ${response.status} ${body}`, { timestamp: true })
          res.statusCode = response.status
          res.setHeader('Content-Type', 'application/json')
          res.end(body)
        } catch (error) {
          logger.error(`  !! ${url.pathname} threw: ${error instanceof Error ? error.stack : String(error)}`, { timestamp: true })
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Internal error' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), requestLog(), apiRoutes()],
})
