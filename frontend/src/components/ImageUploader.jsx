/* Property image manager: upload files, add by URL, choose the featured image. */
import { useRef, useState } from 'react'

import { api } from '../api'

export default function ImageUploader({ images = [], featuredImage = '', onChange }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [urlValue, setUrlValue] = useState('')

  const list = images.filter(Boolean)

  const commit = (nextImages, nextFeatured) => {
    onChange({
      images: nextImages,
      featured_image: nextFeatured || nextImages[0] || '',
    })
  }

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    setBusy(true)
    setError('')
    try {
      const uploaded = []
      for (const file of files) {
        const result = await api.admin.uploadImage(file)
        if (result?.url) uploaded.push(result.url)
      }
      const nextImages = [...list, ...uploaded]
      commit(nextImages, featuredImage)
      if (inputRef.current) inputRef.current.value = ''
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const addByUrl = () => {
    const value = urlValue.trim()
    if (!value) return
    if (!list.includes(value)) commit([...list, value], featuredImage)
    setUrlValue('')
  }

  const remove = (url) => {
    const nextImages = list.filter((item) => item !== url)
    commit(nextImages, featuredImage === url ? nextImages[0] || '' : featuredImage)
  }

  const makeFeatured = (url) => commit(list, url)

  const move = (url, direction) => {
    const index = list.indexOf(url)
    const target = index + direction
    if (index < 0 || target < 0 || target >= list.length) return
    const nextImages = [...list]
    nextImages.splice(index, 1)
    nextImages.splice(target, 0, url)
    commit(nextImages, featuredImage)
  }

  return (
    <div className="uploader">
      <div>
        <label className="field__label" htmlFor="uploader-file">
          افزودن تصویر
        </label>
        <input
          id="uploader-file"
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          disabled={busy}
        />
        <p className="field__hint">
          {busy ? 'در حال بارگذاری…' : 'فرمت‌های مجاز: jpg، png، webp — حداکثر ۸ مگابایت برای هر تصویر.'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="input"
          value={urlValue}
          onChange={(event) => setUrlValue(event.target.value)}
          placeholder="یا نشانی تصویر را وارد کنید"
          aria-label="نشانی تصویر"
        />
        <button type="button" className="btn btn--outline btn--sm" onClick={addByUrl}>
          افزودن
        </button>
      </div>

      {error ? <p className="field__error">{error}</p> : null}

      {list.length ? (
        <div className="uploader__grid">
          {list.map((url) => (
            <div
              key={url}
              className={`uploader__item ${url === featuredImage ? 'is-featured' : ''}`}
            >
              <img src={url} alt="" />
              <div className="uploader__item-actions">
                <button type="button" onClick={() => makeFeatured(url)} title="تصویر شاخص">
                  ★
                </button>
                <button type="button" onClick={() => move(url, -1)} title="جابه‌جایی به سمت راست">
                  ›
                </button>
                <button type="button" onClick={() => move(url, 1)} title="جابه‌جایی به سمت چپ">
                  ‹
                </button>
                <button type="button" onClick={() => remove(url)} title="حذف تصویر">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="field__hint">هنوز تصویری افزوده نشده است.</p>
      )}
    </div>
  )
}
