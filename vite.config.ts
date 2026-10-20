import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { APP_VERSION } from './src/config/app'

/** Host-header allowlist — never `true`. Tunnels use trycloudflare.com; Pages is static. */
const allowedHosts = ['localhost', '127.0.0.1', '.trycloudflare.com']

/**
 * Production CSP for Pages / dist / Capacitor WebView.
 * Dev server skips this so Vite HMR can run. No unsafe-eval.
 * style-src unsafe-inline covers React `style={{}}` attributes.
 * Fraunces and Outfit are self-hosted under public/fonts.
 * frame-ancestors is header-only. A meta tag ignores it and logs a console error.
 */
export const APP_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  'upgrade-insecure-requests',
].join('; ')

function appVersionJson(): Plugin {
  const source = `${JSON.stringify({ version: APP_VERSION })}\n`
  return {
    name: 'app-version-json',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split('?')[0] ?? ''
        if (!path.endsWith('/app-version.json')) {
          next()
          return
        }
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-store')
        res.end(source)
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'app-version.json', source })
    },
  }
}

function htmlSecurityHeaders(): Plugin {
  return {
    name: 'html-security-headers',
    transformIndexHtml(html, ctx) {
      if (ctx.server) return html
      if (html.includes('Content-Security-Policy')) return html
      return html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${APP_CSP}" />\n    <meta name="referrer" content="strict-origin-when-cross-origin" />`,
      )
    },
  }
}

export default defineConfig({
  // Relative base so the same build works at
  // https://cphillippe.github.io/Silver-dollar-city/, vite preview, and Capacitor.
  base: './',
  server: {
    host: '127.0.0.1',
    allowedHosts,
  },
  preview: {
    host: '127.0.0.1',
    allowedHosts,
  },
  plugins: [
    react(),
    htmlSecurityHeaders(),
    appVersionJson(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.png',
        'apple-touch-icon.png',
        'icon-192.png',
        'icon-512.png',
        'icon-maskable-512.png',
      ],
      workbox: {
        // The new worker takes the next open. The page reloads on Home, not mid-lesson.
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // Box QA opens docs/qa-seed.html after the app SW is installed.
        // Without this, navigation fallback serves index.html and the seed never runs.
        // app-version.json stays on the network so a new deploy is visible without a hard reload.
        navigateFallbackDenylist: [/\/qa-seed\.html/, /\/night-run\//, /\/app-version\.json/],
        globIgnores: ['**/app-version.json'],
        runtimeCaching: [
          {
            urlPattern: /app-version\.json/,
            handler: 'NetworkOnly',
          },
        ],
        // The app chunk is past the 2 MiB precache default.
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
      manifest: {
        name: 'Silver City: Unending Evidence',
        short_name: 'Silver City',
        description:
          'A mountain-town adventure that explores the case for God through games, testimony, and argument.',
        theme_color: '#3a1480',
        background_color: '#2a0d58',
        display: 'standalone',
        start_url: './',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
