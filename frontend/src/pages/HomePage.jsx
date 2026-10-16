import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '../api'
import { EmptyState, ErrorState, LoadingState } from '../components/Feedback.jsx'
import HomeHero from '../components/HomeHero.jsx'
import PropertyCard from '../components/PropertyCard.jsx'
import QeshmIsland from '../components/QeshmIsland.jsx'
import Reveal from '../components/Reveal.jsx'
import { useSettings } from '../components/settings.jsx'
import { faNumber } from '../format'
import { useSeo } from '../seo.js'

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

  const qeshmImage = settings?.qeshm_image || '/images/qeshm.jpg'

  return (
    <>
      <HomeHero settings={settings} />

      {/* ---------- editorial Qeshm overview ---------- */}
      <section className="section section--cream" id="about">
        <div className="shell shell--wide">
          <div className="overview">
            <Reveal>
              <h2 className="overview__word">Qeshm</h2>
              <p className="overview__kicker">overview</p>
              <p className="lede">
                {settings?.qeshm_text_fa ||
                  'قشم بزرگ‌ترین جزیره خلیج فارس است؛ از بازارها و مجتمع‌های تجاری درگهان تا محله‌های مسکونی و نوار ساحلی.'}
              </p>
              <Link className="link-arrow" to="/about" style={{ marginTop: 26 }}>
                درباره املاک جاوید
                <span className="link-arrow__mark">←</span>
              </Link>
            </Reveal>

            <Reveal delay={120}>
              <QeshmIsland
                className="overview__island"
                src={qeshmImage}
                alt="نقشه جزیره قشم"
              />
            </Reveal>
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
    </>
  )
}
