/* Per-route document metadata (Persian titles, descriptions, share cards).
   The canonical URL is always derived from the live origin, never hardcoded. */
import { useEffect } from 'react'

const DEFAULT_TITLE = 'املاک جاوید | JAVID REAL ESTATE — قشم'
const DEFAULT_DESCRIPTION =
  'املاک جاوید، مشاور املاک در قشم و درگهان: خرید، فروش، اجاره، زمین، مغازه و واحد تجاری و فرصت‌های سرمایه‌گذاری.'

function setMeta(attribute, name, content) {
  if (!content) return
  let tag = document.head.querySelector(`meta[${attribute}="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

export function useSeo({ title, description, image, type = 'website' } = {}) {
  useEffect(() => {
    const finalTitle = title ? `${title} | املاک جاوید` : DEFAULT_TITLE
    const finalDescription = description || DEFAULT_DESCRIPTION
    const url = `${window.location.origin}${window.location.pathname}`
    const finalImage = image
      ? new URL(image, window.location.origin).toString()
      : undefined

    document.title = finalTitle
    document.documentElement.lang = 'fa'
    document.documentElement.dir = 'rtl'

    setMeta('name', 'description', finalDescription)
    setMeta('property', 'og:title', finalTitle)
    setMeta('property', 'og:description', finalDescription)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:site_name', 'JAVID REAL ESTATE')
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', finalTitle)
    setMeta('name', 'twitter:description', finalDescription)
    if (finalImage) {
      setMeta('property', 'og:image', finalImage)
      setMeta('name', 'twitter:image', finalImage)
    }

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)
  }, [title, description, image, type])
}
