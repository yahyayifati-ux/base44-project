import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiTarget = process.env.VITE_API_TARGET || 'http://localhost:8000'
const previewMode = process.env.BASE44_PREVIEW_MODE === '1'
const sandboxHostDomain = process.env.BASE44_SANDBOX_HOST_DOMAIN
const publicHostSuffix = process.env.BASE44_PUBLIC_HOST_SUFFIX

// The sandbox id rotates between environments, so allow the whole sandbox
// host domain rather than one exact hostname. Vite also appends the value of
// __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS, which the platform supplies.
const allowedHosts = ['localhost', '127.0.0.1']
if (previewMode && sandboxHostDomain) {
  allowedHosts.push(`.${sandboxHostDomain}`)
}

const server = {
  host: '0.0.0.0',
  port: 3000,
  strictPort: true,
  allowedHosts,
  // The browser reaches the API through this dev-server proxy, so the whole
  // app is served from a single origin and session cookies behave normally.
  proxy: {
    '/api': { target: apiTarget, changeOrigin: true },
    '/media': { target: apiTarget, changeOrigin: true },
  },
  watch: { usePolling: true, interval: 350 },
}

// In the sandbox the page is served over https on port 443 by the preview
// proxy, so the dev-server websocket has to target that origin. Left unset
// everywhere else, where the default (localhost dev port) is correct.
if (previewMode && publicHostSuffix) {
  server.hmr = { protocol: 'wss', clientPort: 443 }
}

export default defineConfig({
  plugins: [react()],
  server,
})
