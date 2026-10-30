import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const API_ROUTES: Record<string, 'GET' | 'POST'> = {
  '/api/availability': 'GET',
  '/api/book': 'POST',
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

        const handlers = await server.ssrLoadModule(`${url.pathname}.ts`)
        const response: Response = await handlers[method](request)
        res.statusCode = response.status
        res.setHeader('Content-Type', 'application/json')
        res.end(await response.text())
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiRoutes()],
})
