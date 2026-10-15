import { useEffect, useState } from 'react'

export default function Gallery({ images = [], alt = '' }) {
  const [index, setIndex] = useState(0)
  const list = images.filter(Boolean)

  useEffect(() => {
    setIndex(0)
  }, [images])

  if (!list.length) {
    return (
      <div className="state" style={{ aspectRatio: '16 / 10' }}>
        <p className="state__title">تصویری برای این ملک ثبت نشده است</p>
        <p className="state__text">
          برای مشاهده تصاویر و بازدید حضوری، با املاک جاوید تماس بگیرید.
        </p>
      </div>
    )
  }

  const current = list[Math.min(index, list.length - 1)]

  return (
    <div>
      <div className="gallery__main">
        <img src={current} alt={alt} />
      </div>

      {list.length > 1 ? (
        <div className="gallery__thumbs">
          {list.map((image, position) => (
            <button
              key={`${image}-${position}`}
              type="button"
              className={`gallery__thumb ${position === index ? 'is-active' : ''}`}
              onClick={() => setIndex(position)}
              aria-label={`تصویر ${position + 1}`}
              aria-current={position === index}
            >
              <img src={image} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
