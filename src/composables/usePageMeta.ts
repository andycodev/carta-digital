/**
 * usePageMeta - Composable ligero para actualizar metadatos SEO / Open Graph / Twitter Cards en runtime.
 *
 * Al compartir un enlace, WhatsApp y Facebook leen el HTML **estático** del servidor (ya configurado
 * en index.html). Este composable complementa esa base: actualiza los tags cuando el usuario navega
 * entre rutas dentro de la SPA, lo que favorece buenas prácticas SEO y mejora la vista previa en
 * crawlers que sí ejecutan JavaScript (GoogleBot, Telegram, Twitter/X).
 *
 * Uso:
 *   import { usePageMeta } from '@/composables/usePageMeta'
 *   usePageMeta({ title, description, image, url, type })
 */

const BASE_DOMAIN = 'https://carta.lasdeliciasrestobar.com'
const DEFAULT_IMAGE = 'https://i.postimg.cc/V6LMwntr/las-delicias-logo.png'
const SITE_NAME = 'Las Delicias Restobar'

export interface PageMetaOptions {
  title: string
  description: string
  image?: string
  url?: string
  type?: 'website' | 'article'
}

function setMeta(selector: string, value: string, attr: 'content' | 'href' = 'content') {
  const el = document.querySelector<HTMLMetaElement | HTMLLinkElement>(selector)
  if (el) {
    if (attr === 'href' && el instanceof HTMLLinkElement) {
      el.href = value
    } else if (el instanceof HTMLMetaElement) {
      el.content = value
    }
  }
}

export function usePageMeta(options: PageMetaOptions) {
  const {
    title,
    description,
    image = DEFAULT_IMAGE,
    url = typeof window !== 'undefined' ? window.location.href : `${BASE_DOMAIN}/`,
    type = 'website'
  } = options

  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`

  // --- document.title ---
  document.title = fullTitle

  // --- SEO básico ---
  setMeta('meta[name="description"]', description)

  // --- Canonical ---
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (canonical) canonical.href = url

  // --- Open Graph ---
  setMeta('meta[property="og:title"]',       fullTitle)
  setMeta('meta[property="og:description"]', description)
  setMeta('meta[property="og:image"]',       image)
  setMeta('meta[property="og:image:alt"]',   `${SITE_NAME} - Carta Digital`)
  setMeta('meta[property="og:url"]',         url)
  setMeta('meta[property="og:type"]',        type)
  setMeta('meta[property="og:site_name"]',   SITE_NAME)

  // --- Twitter / X ---
  setMeta('meta[name="twitter:title"]',       fullTitle)
  setMeta('meta[name="twitter:description"]', description)
  setMeta('meta[name="twitter:image"]',       image)
  setMeta('meta[name="twitter:image:alt"]',   `${SITE_NAME} - Carta Digital`)
}
