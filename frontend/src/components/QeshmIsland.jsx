import { useEffect, useRef, useState } from 'react'

/* Stylised silhouette of Qeshm Island with an aerial photograph clipped
   inside the island shape. The silhouette is an SVG path that approximates
   the island's elongated east–west form; the photograph fills it via a
   clipPath. A thin gold outline traces the coast. The whole shape scales
   up gently when it enters the viewport (disabled under reduced motion). */

const ISLAND_PATH =
  'M 50,250 C 70,220 110,200 160,190 C 210,180 260,178 310,172 ' +
  'C 360,166 410,160 470,157 C 530,154 590,154 650,157 ' +
  'C 710,160 770,166 820,174 C 870,182 920,192 960,206 ' +
  'C 1000,220 1030,235 1050,255 C 1045,270 1010,280 960,285 ' +
  'C 900,290 840,290 780,287 C 720,284 660,281 600,278 ' +
  'C 540,275 480,272 420,268 C 360,264 300,258 240,250 ' +
  'C 180,242 120,236 70,240 C 55,242 45,245 50,250 Z'

export default function QeshmIsland({ src, alt = '', className = '' }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

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
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`qeshm-island ${shown ? 'is-shown' : ''} ${className}`.trim()}
      role="img"
      aria-label={alt}
    >
      <svg viewBox="0 0 1100 500" preserveAspectRatio="xMidYMid meet">
        <defs>
          <clipPath id="qeshm-island-clip">
            <path d={ISLAND_PATH} />
          </clipPath>
        </defs>
        <image
          href={src}
          x="0"
          y="0"
          width="1100"
          height="500"
          clipPath="url(#qeshm-island-clip)"
          preserveAspectRatio="xMidYMid slice"
        />
        <path
          d={ISLAND_PATH}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1.4"
          opacity="0.55"
        />
      </svg>
    </div>
  )
}
