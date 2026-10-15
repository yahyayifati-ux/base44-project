import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '../api'
import { EmptyState, ErrorState, LoadingState } from '../components/Feedback.jsx'
import HomeHero from '../components/HomeHero.jsx'
import ParallaxImage from '../components/ParallaxImage.jsx'
import PropertyCard from '../components/PropertyCard.jsx'
import Reveal from '../components/Reveal.jsx'
import { useSettings } from '../components/settings.jsx'
import { faNumber } from '../format'
import { useSeo } from '../seo.js'

const SERVICES = [
  {
    title: 'راهنمایی برای انتخاب ملک',
    text: 'نیاز، بودجه و محدوده مورد نظر شما را بررسی می‌کنیم تا گزینه‌های واقعی موجود را ببینید.',
  },
  {
    title: 'بررسی موقعیت ملک',
    text: 'محله، دسترسی‌ها و موقعیت هر ملک را با شناخت محلی برایتان توضیح می‌دهیم.',
  },
  {
    title: 'معرفی فرصت‌های خرید',
    text: 'فایل‌های موجود را با مشخصات اعلام‌شده و تصاویر واقعی در اختیار شما می‌گذاریم.',
  },
  {
    title: 'بررسی مشخصات و مدارک اعلام‌شده',
    text: 'متراژ، طبقه، تعداد اتاق و نوع مدارک اعلام‌شده را روشن و بدون اغراق منتقل می‌کنیم.',
  },
  {
    title: 'مشاوره برای سرمایه‌گذاری',
    text: 'تفاوت کاربری زمین، واحد تجاری و واحد مسکونی در قشم را برای تصمیم بهتر توضیح می‌دهیم.',
  },
  {
    title: 'همراهی در مسیر خرید یا فروش',
    text: 'از بازدید و مذاکره تا توافق نهایی، در کنار شما هستیم.',
  },
]

const AREAS = [
  { label: 'درگهان', value: 'درگهان' },
  { label: 'مرکز قشم', value: 'قشم' },
  { label: 'رمچاه', value: 'رمچاه' },
  { label: 'سوزا', value: 'سوزا' },
]

export default function HomePage() {
  const { settings } = useSettings()
  const [categories, setCategories] = useState([])
  const [featured, setFeatured] = useState({ items: [], isFeatured: true })
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useSeo({
    title: null,
    description: settings?.hero_sub_fa,
    image: settings?.hero_image,
  })

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const [categoryData, featuredData] = await Promise.all([
        api.getCategories(),
        api.getProperties({ featured: true, page_size: 3 }),
      ])
      setCategories(Array.isArray(categoryData) ? categoryData : [])

      if (featuredData?.items?.length) {
        setFeatured({ items: featuredData.items, isFeatured: true })
      } else {
        const latest = await api.getProperties({ page_size: 3 })
        setFeatured({ items: latest?.items ?? [], isFeatured: false })
      }
      setStatus('ready')
      setError(null)
    } catch (err) {
      setError(err)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const aboutImage = settings?.about_image || '/images/about.jpg'
  const qeshmImage = settings?.qeshm_image || '/images/qeshm.jpg'

  return (
    <>
      <HomeHero settings={settings} />

      {/* ---------- project overview ---------- */}
      <section className="section section--cream" id="about">
        <div className="shell shell--wide">
          <div className="overview">
            <Reveal>
              <p className="overview__marker">
                <strong className="overview__marker-strong">Project</strong>
                <em className="overview__marker-em">overview</em>
              </p>
              <h2 className="title-lg">
                املاک جاوید
                <br />
                در یک نگاه
              </h2>
              <div className="overview__meta">
                <span>
                  حوزه فعالیت: <strong>املاک و مستغلات</strong>
                </span>
                <span>
                  محدوده: <strong>قشم و درگهان</strong>
                </span>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <p className="lede">
                {settings?.about_intro_fa ||
                  'املاک جاوید در قشم و درگهان فعالیت می‌کند و تمرکز آن بر معرفی شفاف فرصت‌های ملکی این جزیره است.'}
              </p>
              <p className="lede" style={{ marginTop: 18 }}>
                {settings?.about_body_fa ||
                  'ما با شناخت محله‌ها و محدوده‌های قشم به شما کمک می‌کنیم ملک مناسب خود را با اطلاعات روشن انتخاب کنید.'}
              </p>
              <Link className="link-arrow" to="/about" style={{ marginTop: 22 }}>
                درباره املاک جاوید
                <span className="link-arrow__mark">←</span>
              </Link>
            </Reveal>

            <ParallaxImage
              className="overview__image"
              src={aboutImage}
              alt="معماری مسکونی مدرن"
            />
          </div>
        </div>
      </section>

      {/* ---------- categories ---------- */}
      <section className="section section--paper">
        <div className="shell shell--wide">
          <div className="section-header">
            <p className="eyebrow">Property Categories</p>
            <div className="section-header__row">
              <h2 className="title-lg">دسته‌بندی املاک</h2>
              <Link className="link-arrow" to="/properties">
                مشاهده همه املاک
                <span className="link-arrow__mark">←</span>
              </Link>
            </div>
          </div>

          {status === 'loading' ? (
            <LoadingState label="در حال بارگذاری دسته‌بندی‌ها…" />
          ) : status === 'error' ? (
            <ErrorState message={error?.message} onRetry={load} />
          ) : (
            <div className="category-grid">
              {categories.map((category, index) => (
                <Reveal key={category.slug} delay={index * 60}>
                  <Link
                    to={`/properties?category=${category.slug}`}
                    className={`category-panel ${
                      index < 2 ? 'category-panel--tall' : ''
                    }`}
                  >
                    {category.image_url ? (
                      <img src={category.image_url} alt="" loading="lazy" />
                    ) : null}
                    <span className="category-panel__body">
                      {category.count ? (
                        <span className="category-panel__count">
                          {faNumber(category.count)} فایل فعال
                        </span>
                      ) : null}
                      <span className="category-panel__title">{category.title_fa}</span>
                      {category.description_fa ? (
                        <span className="category-panel__text">{category.description_fa}</span>
                      ) : null}
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- featured properties ---------- */}
      <section className="section">
        <div className="shell shell--wide">
          <div className="section-header">
            <p className="eyebrow">{featured.isFeatured ? 'Featured' : 'Latest'}</p>
            <div className="section-header__row">
              <h2 className="title-lg">
                {featured.isFeatured ? 'املاک منتخب' : 'جدیدترین فایل‌ها'}
              </h2>
              <Link className="link-arrow" to="/properties">
                فهرست کامل املاک
                <span className="link-arrow__mark">←</span>
              </Link>
            </div>
          </div>

          {status === 'loading' ? (
            <LoadingState label="در حال بارگذاری املاک…" />
          ) : status === 'error' ? (
            <ErrorState message={error?.message} onRetry={load} />
          ) : featured.items.length ? (
            <div className="grid-3">
              {featured.items.map((property, index) => (
                <Reveal key={property.id} delay={index * 80}>
                  <PropertyCard property={property} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              title="هنوز ملکی منتشر نشده است"
              text="به‌زودی فایل‌های تأییدشده املاک جاوید در این بخش نمایش داده می‌شود. برای اطلاع از فایل‌های موجود تماس بگیرید یا درخواست مشاوره ثبت کنید."
              actionLabel="ثبت درخواست مشاوره"
              actionTo="/contact"
            />
          )}
        </div>
      </section>

      {/* ---------- services ---------- */}
      <section className="section section--dark">
        <div className="shell shell--wide">
          <div className="split">
            <Reveal>
              <p className="eyebrow">Services</p>
              <h2 className="title-lg" style={{ marginTop: 16 }}>
                خدمات املاک جاوید
              </h2>
              <p className="lede" style={{ marginTop: 18 }}>
                ما ملک را برای شما «می‌فروشیم» نیستیم؛ اطلاعات روشن می‌دهیم تا خودتان با
                اطمینان تصمیم بگیرید.
              </p>
              <Link className="btn btn--light" to="/contact" style={{ marginTop: 26 }}>
                برای انتخاب بهتر، مشاوره بگیرید
              </Link>
            </Reveal>

            <Reveal delay={90}>
              <div className="service-list">
                {SERVICES.map((service, index) => (
                  <div className="service-item" key={service.title}>
                    <span className="service-item__index">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>
                      <span className="service-item__title">{service.title}</span>
                      <span className="service-item__text">{service.text}</span>
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- qeshm editorial ---------- */}
      <section className="qeshm">
        <div className="qeshm__media" aria-hidden="true">
          <img src={qeshmImage} alt="" loading="lazy" />
        </div>
        <div className="qeshm__scrim" aria-hidden="true" />
        <div className="shell shell--wide">
          <div className="qeshm__inner">
            <Reveal>
              <p className="eyebrow">Local Knowledge</p>
              <h2 className="qeshm__word">QESHM</h2>
              <p className="lede" style={{ marginTop: 22 }}>
                {settings?.qeshm_text_fa ||
                  'قشم بزرگ‌ترین جزیره خلیج فارس است؛ از بازارها و مجتمع‌های تجاری درگهان تا محله‌های مسکونی و نوار ساحلی.'}
              </p>
            </Reveal>

            <Reveal delay={90}>
              <p className="eyebrow">Popular Areas</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 18 }}>
                {AREAS.map((area) => (
                  <Link
                    key={area.value}
                    className="badge"
                    to={`/properties?location=${encodeURIComponent(area.value)}`}
                    style={{ background: 'rgba(255,255,255,.08)', color: 'var(--ivory)', borderColor: 'var(--line-inverse)' }}
                  >
                    {area.label}
                  </Link>
                ))}
              </div>
              <p className="field__hint" style={{ marginTop: 22, color: 'rgba(245,241,234,.6)' }}>
                برای مشاهده فایل‌های هر محدوده روی نام آن بزنید.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- closing cta ---------- */}
      <section className="section section--tight section--cream">
        <div className="shell shell--wide">
          <div className="section-header__row">
            <div>
              <p className="eyebrow">Next Step</p>
              <h2 className="title-md" style={{ marginTop: 12 }}>
                ملک مورد نظرتان را پیدا نکردید؟
              </h2>
              <p className="lede" style={{ marginTop: 10 }}>
                نیاز خود را برای ما ثبت کنید تا فایل‌های موجود و فرصت‌های تازه را با شما
                بررسی کنیم.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link className="btn btn--emerald" to="/properties">
                مشاهده املاک
              </Link>
              <Link className="btn btn--outline" to="/contact">
                ثبت درخواست
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
