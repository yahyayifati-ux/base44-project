import { useEffect, useRef, useState } from 'react'

/* Editorial image treatment: the frame opens with a mask as it enters the
   viewport while the photograph drifts a few pixels against the scroll.
   Under `prefers-reduced-motion` it renders as a plain, fully visible image. */
export default function ParallaxImage({
  src,
  alt = '',
  className = '',
  strength = 26,
  children,
}) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  const [shift, setShift] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    let frame = 0
    const update = () => {
      frame = 0
      const node = ref.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const viewport = window.innerHeight || 1
      const centre = rect.top + rect.height / 2
      // -1 when the frame sits below the fold, +1 once it has scrolled past it.
      const progress = Math.max(-1, Math.min(1, (viewport / 2 - centre) / viewport))
      setShift(progress * strength)
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [strength])

  return (
    <figure ref={ref} className={`parallax ${shown ? 'is-shown' : ''} ${className}`.trim()}>
      {/* Loaded with the section rather than lazily: the mask reveal is only
          convincing when the photograph is already there to be uncovered. */}
      <img
        src={src}
        alt={alt}
        style={{ transform: `translate3d(0, ${shift}px, 0) scale(1.12)` }}
      />
      {children}
    </figure>
  )
}
