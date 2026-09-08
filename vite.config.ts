import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/** Host-header allowlist — never `true`. Tunnels use trycloudflare.com; Pages is static. */
const allowedHosts = ['localhost', '127.0.0.1', '.trycloudflare.com']

/**
 * Production CSP for Pages / dist / Capacitor WebView.
 * Dev server skips this so Vite HMR can run. No unsafe-eval.
 * style-src unsafe-inline covers React `style={{}}` attributes.
 * Google Fonts stay allowlisted until fonts are self-hosted.
 */
export const APP_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  'upgrade-insecure-requests',
].join('; ')

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
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Silver City: Unending Evidence',
        short_name: 'Silver City',
        description:
          'A mountain-town adventure that explores the case for God through games, testimony, and argument.',
        theme_color: '#1a2238',
        background_color: '#0e1424',
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
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
