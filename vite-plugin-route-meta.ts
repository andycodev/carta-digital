/**
 * vite-plugin-route-meta.ts
 *
 * Plugin Vite que genera un HTML estático por cada ruta pública,
 * inyectando los metadatos Open Graph / Twitter correctos en cada uno.
 *
 * Esto garantiza que los crawlers de WhatsApp, Facebook, Telegram, etc.
 * (que NO ejecutan JavaScript) lean correctamente el título, descripción e imagen
 * de cada carta pública al compartir el enlace.
 *
 * Las rutas generadas:
 *   /           → dist/index.html          → Carta Principal (Restaurante)
 *   /bar        → dist/bar/index.html      → Carta del Bar & Coctelería
 */

import type { Plugin } from 'vite'
import * as fs from 'node:fs'
import * as path from 'node:path'

interface RouteMetaConfig {
  route: string        // Ruta SPA (ej. '/bar')
  outDir: string       // Subdirectorio de salida relativo a dist (ej. 'bar')
  title: string
  description: string
  image: string
  url: string
}

const SITE_NAME = 'Las Delicias Restobar'
const DEFAULT_IMAGE = 'https://i.postimg.cc/V6LMwntr/las-delicias-logo.png'
const BASE_URL = 'https://carta.lasdeliciasrestobar.com'

const ROUTE_CONFIGS: RouteMetaConfig[] = [
  {
    route: '/bar',
    outDir: 'bar',
    title: `Bar & Coctelería | ${SITE_NAME}`,
    description: '🍹 Descubre nuestra carta de tragos, cocteles y bebidas artesanales. Ambiente, música y los mejores sabores de Las Delicias Restobar.',
    image: DEFAULT_IMAGE,
    url: `${BASE_URL}/bar`
  }
]

export function routeMetaPlugin(): Plugin {
  return {
    name: 'vite-plugin-route-meta',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve(process.cwd(), 'dist')
      const baseIndexPath = path.join(distDir, 'index.html')

      if (!fs.existsSync(baseIndexPath)) {
        console.warn('[route-meta] dist/index.html not found — skipping route-specific HTML generation.')
        return
      }

      const baseHtml = fs.readFileSync(baseIndexPath, 'utf-8')

      for (const config of ROUTE_CONFIGS) {
        // Remove the base title/meta tags and replace with route-specific ones
        let html = baseHtml

        // Replace <title>…</title> with route-specific title
        html = html.replace(/<title>[^<]*<\/title>/, `<title>${config.title}</title>`)

        // Replace og:title
        html = html.replace(
          /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
          `$1${config.title}$2`
        )
        // Replace og:description
        html = html.replace(
          /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
          `$1${config.description}$2`
        )
        // Replace og:url
        html = html.replace(
          /(<meta\s+property="og:url"\s+content=")[^"]*(")/,
          `$1${config.url}$2`
        )
        // Replace canonical
        html = html.replace(
          /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
          `$1${config.url}$2`
        )
        // Replace twitter:title
        html = html.replace(
          /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,
          `$1${config.title}$2`
        )
        // Replace twitter:description
        html = html.replace(
          /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,
          `$1${config.description}$2`
        )
        // Replace meta description
        html = html.replace(
          /(<meta\s+name="description"\s+content=")[^"]*(")/,
          `$1${config.description}$2`
        )

        // Write to dist/<outDir>/index.html
        const outPath = path.join(distDir, config.outDir, 'index.html')
        fs.mkdirSync(path.dirname(outPath), { recursive: true })
        fs.writeFileSync(outPath, html, 'utf-8')

        console.log(`[route-meta] Generated: dist/${config.outDir}/index.html → ${config.title}`)
      }
    }
  }
}
