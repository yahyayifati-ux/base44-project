import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { api } from '../../api'
import { numOrNull, toPropertyPayload } from '../../adminPayload.js'
import { Alert, ErrorState, LoadingState } from '../../components/Feedback.jsx'
import ImageUploader from '../../components/ImageUploader.jsx'
import { TRANSACTION_OPTIONS } from '../../format'
import { useSeo } from '../../seo.js'

const EMPTY_FORM = {
  title_fa: '',
  slug: '',
  description_fa: '',
  category_slug: '',
  transaction_type: 'sale',
  province: 'هرمزگان',
  city: 'قشم',
  neighborhood: '',
  location_note: '',
  area_sqm: '',
  land_area_sqm: '',
  rooms: '',
  floor: '',
  year_built: '',
  documentation: '',
  price: '',
  price_on_request: true,
  deposit: '',
  monthly_rent: '',
  featuresText: '',
  images: [],
  featured_image: '',
  floor_plan_url: '',
  video_url: '',
  virtual_tour_url: '',
  latitude: '',
  longitude: '',
  published: false,
  featured: false,
}

const RESIDENTIAL = ['house-villa', 'residential-unit', 'rent-mortgage']
const LAND = ['land', 'investment-projects']

export default function AdminPropertyFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY_FORM)
  const [categories, setCategories] = useState([])
  const [status, setStatus] = useState(isEdit ? 'loading' : 'ready')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useSeo({ title: isEdit ? 'ویرایش ملک' : 'افزودن ملک' })

  useEffect(() => {
    api
      .getCategories()
      .then((rows) => setCategories(Array.isArray(rows) ? rows : []))
      .catch(() => setCategories([]))
  }, [])

  const load = useCallback(async () => {
    if (!isEdit) return
    setStatus('loading')
    try {
      const property = await api.admin.getProperty(id)
      setForm({
        ...EMPTY_FORM,
        ...property,
        category_slug: property.category?.slug ?? '',
        featuresText: (property.features ?? []).join('\n'),
        images: property.images ?? [],
        featured_image: property.featured_image ?? '',
        price: property.price ?? '',
        deposit: property.deposit ?? '',
        monthly_rent: property.monthly_rent ?? '',
        area_sqm: property.area_sqm ?? '',
        land_area_sqm: property.land_area_sqm ?? '',
        rooms: property.rooms ?? '',
        floor: property.floor ?? '',
        year_built: property.year_built ?? '',
      })
      setError(null)
      setStatus('ready')
    } catch (err) {
      setError(err)
      setStatus('error')
    }
  }, [id, isEdit])

  useEffect(() => {
    load()
  }, [load])

  const update = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  const setImages = ({ images, featured_image }) => {
    setForm((previous) => ({ ...previous, images, featured_image }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setMessage('')

    const errors = {}
    if (form.title_fa.trim().length < 2) errors.title_fa = 'عنوان فارسی ملک را وارد کنید.'
    setFieldErrors(errors)
    if (Object.keys(errors).length) return

    const payload = {
      title_fa: form.title_fa.trim(),
      slug: form.slug?.trim() ? form.slug.trim() : null,
      description_fa: form.description_fa,
      category_slug: form.category_slug || null,
      transaction_type: form.transaction_type,
      province: form.province,
      city: form.city,
      neighborhood: form.neighborhood,
      location_note: form.location_note,
      area_sqm: numOrNull(form.area_sqm),
      land_area_sqm: numOrNull(form.land_area_sqm),
      rooms: numOrNull(form.rooms),
      floor: numOrNull(form.floor),
      year_built: numOrNull(form.year_built),
      documentation: form.documentation,
      price: numOrNull(form.price),
      price_on_request: form.price === '' ? true : Boolean(form.price_on_request),
      deposit: numOrNull(form.deposit),
      monthly_rent: numOrNull(form.monthly_rent),
      features: form.featuresText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      images: form.images,
      featured_image: form.featured_image,
      floor_plan_url: form.floor_plan_url,
      video_url: form.video_url,
      virtual_tour_url: form.virtual_tour_url,
      latitude: form.latitude,
      longitude: form.longitude,
      published: Boolean(form.published),
      featured: Boolean(form.featured),
    }

    setSaving(true)
    try {
      if (isEdit) {
        const updated = await api.admin.updateProperty(id, payload)
        setMessage('تغییرات ذخیره شد.')
        setForm((previous) => ({ ...previous, slug: updated.slug }))
      } else {
        const created = await api.admin.createProperty(payload)
        navigate(`/admin/properties/${created.id}`, { replace: true })
      }
    } catch (err) {
      setMessage(err.message)
    } finally {
      setSaving(false)
    }
  }

  const saveAsDraft = async () => {
    await submit({ preventDefault: () => {} })
  }

  if (status === 'loading') return <LoadingState label="در حال بارگذاری ملک…" />
  if (status === 'error') return <ErrorState message={error?.message} onRetry={load} />

  const showResidential = RESIDENTIAL.includes(form.category_slug)
  const showLand = LAND.includes(form.category_slug)

  return (
    <form onSubmit={submit}>
      <div className="admin-toolbar">
        <div>
          <p className="eyebrow">Property</p>
          <h1 className="title-md" style={{ marginTop: 8 }}>
            {isEdit ? 'ویرایش ملک' : 'افزودن ملک جدید'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn btn--outline btn--sm" to="/admin/properties">
            بازگشت به فهرست
          </Link>
          {isEdit && form.slug ? (
            <a
              className="btn btn--outline btn--sm"
              href={`/properties/${form.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              مشاهده در سایت
            </a>
          ) : null}
          <button type="submit" className="btn btn--emerald btn--sm" disabled={saving}>
            {saving ? 'در حال ذخیره…' : isEdit ? 'ذخیره تغییرات' : 'ثبت ملک'}
          </button>
        </div>
      </div>

      {message ? <Alert kind={message.includes('ذخیره') ? 'success' : 'error'}>{message}</Alert> : null}

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div>
          <div className="panel">
            <p className="eyebrow">Main</p>
            <h2 className="title-md" style={{ fontSize: '1.1rem', margin: '10px 0 18px' }}>
              اطلاعات اصلی
            </h2>

            <div className="field">
              <label className="field__label" htmlFor="title_fa">
                عنوان ملک (فارسی)
              </label>
              <input
                id="title_fa"
                className={`input ${fieldErrors.title_fa ? 'input--error' : ''}`}
                value={form.title_fa}
                onChange={update('title_fa')}
                placeholder="مثلاً آپارتمان ۱۲۰ متری در درگهان"
              />
              {fieldErrors.title_fa ? (
                <span className="field__error">{fieldErrors.title_fa}</span>
              ) : null}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="slug">
                نشانی صفحه (اختیاری)
              </label>
              <input
                id="slug"
                className="input en-sans"
                value={form.slug || ''}
                onChange={update('slug')}
                placeholder="apartment-dargahan-120"
                dir="ltr"
              />
              <span className="field__hint">
                در صورت خالی گذاشتن، به‌صورت خودکار از عنوان ساخته می‌شود.
              </span>
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field__label" htmlFor="category_slug">
                  نوع ملک
                </label>
                <select
                  id="category_slug"
                  className="select"
                  value={form.category_slug}
                  onChange={update('category_slug')}
                >
                  <option value="">انتخاب کنید…</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.title_fa}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="transaction_type">
                  نوع معامله
                </label>
                <select
                  id="transaction_type"
                  className="select"
                  value={form.transaction_type}
                  onChange={update('transaction_type')}
                >
                  {TRANSACTION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="description_fa">
                توضیحات (فارسی)
              </label>
              <textarea
                id="description_fa"
                className="textarea"
                value={form.description_fa}
                onChange={update('description_fa')}
              />
            </div>
          </div>

          <div className="panel" style={{ marginTop: 22 }}>
            <p className="eyebrow">Location</p>
            <h2 className="title-md" style={{ fontSize: '1.1rem', margin: '10px 0 18px' }}>
              موقعیت
            </h2>

            <div className="field-row">
              <div className="field">
                <label className="field__label" htmlFor="city">
                  شهر
                </label>
                <input id="city" className="input" value={form.city} onChange={update('city')} />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="province">
                  استان
                </label>
                <input
                  id="province"
                  className="input"
                  value={form.province}
                  onChange={update('province')}
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field__label" htmlFor="neighborhood">
                  محله یا محدوده
                </label>
                <input
                  id="neighborhood"
                  className="input"
                  value={form.neighborhood}
                  onChange={update('neighborhood')}
                  placeholder="مثلاً درگهان"
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="location_note">
                  توضیح موقعیت
                </label>
                <input
                  id="location_note"
                  className="input"
                  value={form.location_note}
                  onChange={update('location_note')}
                  placeholder="مثلاً نزدیک بازار درگهان"
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field__label" htmlFor="latitude">
                  عرض جغرافیایی
                </label>
                <input
                  id="latitude"
                  className="input en-sans"
                  value={form.latitude}
                  onChange={update('latitude')}
                  placeholder="26.9585"
                  dir="ltr"
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="longitude">
                  طول جغرافیایی
                </label>
                <input
                  id="longitude"
                  className="input en-sans"
                  value={form.longitude}
                  onChange={update('longitude')}
                  placeholder="56.2717"
                  dir="ltr"
                />
              </div>
            </div>
            <span className="field__hint">
              اگر مختصات را وارد کنید، نقشه موقعیت ملک در صفحه ملک نمایش داده می‌شود.
            </span>
          </div>

          <div className="panel" style={{ marginTop: 22 }}>
            <p className="eyebrow">Specifications</p>
            <h2 className="title-md" style={{ fontSize: '1.1rem', margin: '10px 0 18px' }}>
              مشخصات ملک
            </h2>

            <div className="field-row">
              <div className="field">
                <label className="field__label" htmlFor="area_sqm">
                  متراژ (متر مربع)
                </label>
                <input
                  id="area_sqm"
                  className="input en-sans"
                  value={form.area_sqm}
                  onChange={update('area_sqm')}
                  inputMode="numeric"
                  dir="ltr"
                />
              </div>
              {showLand || form.land_area_sqm ? (
                <div className="field">
                  <label className="field__label" htmlFor="land_area_sqm">
                    متراژ زمین (متر مربع)
                  </label>
                  <input
                    id="land_area_sqm"
                    className="input en-sans"
                    value={form.land_area_sqm}
                    onChange={update('land_area_sqm')}
                    inputMode="numeric"
                    dir="ltr"
                  />
                </div>
              ) : null}
            </div>

            {showResidential || form.rooms || form.floor ? (
              <div className="field-row">
                <div className="field">
                  <label className="field__label" htmlFor="rooms">
                    تعداد اتاق
                  </label>
                  <input
                    id="rooms"
                    className="input en-sans"
                    value={form.rooms}
                    onChange={update('rooms')}
                    inputMode="numeric"
                    dir="ltr"
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="floor">
                    طبقه
                  </label>
                  <input
                    id="floor"
                    className="input en-sans"
                    value={form.floor}
                    onChange={update('floor')}
                    inputMode="numeric"
                    dir="ltr"
                  />
                </div>
              </div>
            ) : null}

            <div className="field-row">
              <div className="field">
                <label className="field__label" htmlFor="year_built">
                  سال ساخت
                </label>
                <input
                  id="year_built"
                  className="input en-sans"
                  value={form.year_built}
                  onChange={update('year_built')}
                  inputMode="numeric"
                  dir="ltr"
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="documentation">
                  نوع مدارک
                </label>
                <input
                  id="documentation"
                  className="input"
                  value={form.documentation}
                  onChange={update('documentation')}
                  placeholder="مثلاً سند تک‌برگ"
                />
              </div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="featuresText">
                ویژگی‌ها (هر مورد در یک خط)
              </label>
              <textarea
                id="featuresText"
                className="textarea"
                value={form.featuresText}
                onChange={update('featuresText')}
                placeholder={'استخر مشترک\nآسانسور\nپارکینگ'}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="panel">
            <p className="eyebrow">Price</p>
            <h2 className="title-md" style={{ fontSize: '1.1rem', margin: '10px 0 18px' }}>
              قیمت
            </h2>

            <div className="field">
              <label className="field__label" htmlFor="price">
                قیمت (تومان)
              </label>
              <input
                id="price"
                className="input en-sans"
                value={form.price}
                onChange={update('price')}
                inputMode="numeric"
                dir="ltr"
              />
              <span className="field__hint">
                اگر قیمت را خالی بگذارید، در سایت «تماس برای اطلاع از قیمت» نمایش داده می‌شود.
              </span>
            </div>

            <label className="checkbox" style={{ marginBottom: 18 }}>
              <input
                type="checkbox"
                checked={form.price_on_request}
                onChange={update('price_on_request')}
              />
              نمایش «تماس برای اطلاع از قیمت» در کنار مبلغ
            </label>

            <div className="field-row">
              <div className="field">
                <label className="field__label" htmlFor="deposit">
                  مبلغ رهن (تومان)
                </label>
                <input
                  id="deposit"
                  className="input en-sans"
                  value={form.deposit}
                  onChange={update('deposit')}
                  inputMode="numeric"
                  dir="ltr"
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="monthly_rent">
                  اجاره ماهانه (تومان)
                </label>
                <input
                  id="monthly_rent"
                  className="input en-sans"
                  value={form.monthly_rent}
                  onChange={update('monthly_rent')}
                  inputMode="numeric"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          <div className="panel" style={{ marginTop: 22 }}>
            <p className="eyebrow">Media</p>
            <h2 className="title-md" style={{ fontSize: '1.1rem', margin: '10px 0 18px' }}>
              تصاویر و رسانه
            </h2>

            <ImageUploader
              images={form.images}
              featuredImage={form.featured_image}
              onChange={setImages}
            />

            <div className="field" style={{ marginTop: 18 }}>
              <label className="field__label" htmlFor="virtual_tour_url">
                نشانی تور مجازی (اختیاری)
              </label>
              <input
                id="virtual_tour_url"
                className="input en-sans"
                value={form.virtual_tour_url}
                onChange={update('virtual_tour_url')}
                dir="ltr"
              />
              <span className="field__hint">
                فقط در صورت وجود نشانی واقعی؛ در غیر این صورت دکمه تور مجازی نمایش داده نمی‌شود.
              </span>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="video_url">
                نشانی ویدیو (اختیاری)
              </label>
              <input
                id="video_url"
                className="input en-sans"
                value={form.video_url}
                onChange={update('video_url')}
                dir="ltr"
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="floor_plan_url">
                نشانی تصویر پلان (اختیاری)
              </label>
              <input
                id="floor_plan_url"
                className="input en-sans"
                value={form.floor_plan_url}
                onChange={update('floor_plan_url')}
                dir="ltr"
              />
            </div>
          </div>

          <div className="panel" style={{ marginTop: 22 }}>
            <p className="eyebrow">Publishing</p>
            <h2 className="title-md" style={{ fontSize: '1.1rem', margin: '10px 0 18px' }}>
              انتشار
            </h2>

            <label className="checkbox" style={{ marginBottom: 12 }}>
              <input type="checkbox" checked={form.published} onChange={update('published')} />
              نمایش این ملک در سایت
            </label>

            <label className="checkbox">
              <input type="checkbox" checked={form.featured} onChange={update('featured')} />
              نمایش در بخش املاک منتخب صفحه اصلی
            </label>

            <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn--emerald btn--sm" disabled={saving}>
                {saving ? 'در حال ذخیره…' : isEdit ? 'ذخیره تغییرات' : 'ثبت ملک'}
              </button>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={saveAsDraft}
                disabled={saving}
              >
                ذخیره بدون تغییر وضعیت
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
