import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { api } from '../api'
import { EmptyState, ErrorState, LoadingState } from '../components/Feedback.jsx'
import FilterBar from '../components/FilterBar.jsx'
import PropertyCard from '../components/PropertyCard.jsx'
import { TRANSACTION_LABELS, faNumber } from '../format'
import { useSeo } from '../seo.js'

const PAGE_SIZE = 9
const QUERY_KEYS = [
  'q',
  'transaction',
  'category',
  'location',
  'documentation',
  'min_price',
  'max_price',
  'min_area',
  'max_area',
  'rooms',
  'floor',
  'sort',
  'page',
]

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const params = useMemo(() => {
    const collected = {}
    QUERY_KEYS.forEach((key) => {
      const value = searchParams.get(key)
      if (value) collected[key] = value
    })
    collected.page_size = PAGE_SIZE
    return collected
  }, [searchParams])

  const filterValues = useMemo(() => {
    const collected = {}
    QUERY_KEYS.filter((key) => key !== 'page' && key !== 'sort').forEach((key) => {
      collected[key] = searchParams.get(key) || ''
    })
    return collected
  }, [searchParams])

  useEffect(() => {
    api
      .getCategories()
      .then((rows) => setCategories(Array.isArray(rows) ? rows : []))
      .catch(() => setCategories([]))
  }, [])

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const result = await api.getProperties(params)
      setData(result)
      setError(null)
      setStatus('ready')
    } catch (err) {
      setError(err)
      setStatus('error')
    }
  }, [params])

  useEffect(() => {
    load()
  }, [load])

  const activeCategory = categories.find((row) => row.slug === searchParams.get('category'))
  const activeTransaction = TRANSACTION_LABELS[searchParams.get('transaction')]

  const heading = activeCategory
    ? activeCategory.title_fa
    : activeTransaction
      ? `املاک ${activeTransaction}`
      : 'همه املاک'

  useSeo({
    title: activeCategory ? `${activeCategory.title_fa} در قشم` : 'مشاهده املاک',
    description: activeCategory?.description_fa,
  })

  const applyFilters = (values) => {
    const next = new URLSearchParams()
    Object.entries(values).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) next.set(key, value)
    })
    next.delete('page')
    const sort = searchParams.get('sort')
    if (sort) next.set('sort', sort)
    setSearchParams(next)
    setFiltersOpen(false)
  }

  const resetFilters = () => {
    setSearchParams(new URLSearchParams())
    setFiltersOpen(false)
  }

  const changeSort = (event) => {
    const next = new URLSearchParams(searchParams)
    next.set('sort', event.target.value)
    next.delete('page')
    setSearchParams(next)
  }

  const goToPage = (page) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page))
    setSearchParams(next)
    window.scrollTo({ top: 0 })
  }

  const totalPages = data?.pages || 0
  const currentPage = Number(searchParams.get('page') || 1)

  return (
    <>
      <section className="listing-hero">
        <div className="shell shell--wide">
          <p className="eyebrow">Properties · Qeshm</p>
          <h1 className="title-lg" style={{ marginTop: 12 }}>
            {heading}
          </h1>
          <p className="lede" style={{ marginTop: 12 }}>
            {activeCategory?.description_fa ||
              'فایل‌های منتشرشده املاک جاوید در قشم و درگهان؛ با فیلترها جست‌وجو را دقیق‌تر کنید.'}
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="shell shell--wide">
          <div className="listing-layout">
            <div>
              <button
                type="button"
                className="btn btn--outline filters-toggle"
                onClick={() => setFiltersOpen((open) => !open)}
                aria-expanded={filtersOpen}
                style={{ marginBottom: 14 }}
              >
                {filtersOpen ? 'بستن فیلترها' : 'فیلترها'}
              </button>
              <FilterBar
                values={filterValues}
                categories={categories}
                onSubmit={applyFilters}
                onReset={resetFilters}
                isOpen={filtersOpen}
              />
            </div>

            <div>
              <div className="results-bar">
                <span className="results-bar__count">
                  {status === 'ready'
                    ? `${faNumber(data?.total || 0)} ملک یافت شد`
                    : 'در حال جست‌وجو…'}
                </span>
                <label className="results-bar__count" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  مرتب‌سازی
                  <select
                    className="sort-select"
                    value={searchParams.get('sort') || 'newest'}
                    onChange={changeSort}
                    aria-label="مرتب‌سازی نتایج"
                  >
                    <option value="newest">جدیدترین</option>
                    <option value="oldest">قدیمی‌ترین</option>
                    <option value="price_asc">ارزان‌ترین</option>
                    <option value="price_desc">گران‌ترین</option>
                    <option value="area_desc">بزرگ‌ترین متراژ</option>
                  </select>
                </label>
              </div>

              {status === 'loading' ? (
                <LoadingState label="در حال بارگذاری فایل‌ها…" />
              ) : status === 'error' ? (
                <ErrorState message={error?.message} onRetry={load} />
              ) : data?.items?.length ? (
                <>
                  <div className="grid-3">
                    {data.items.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>

                  {totalPages > 1 ? (
                    <nav className="pagination" aria-label="صفحه‌بندی">
                      <button
                        type="button"
                        className="pagination__btn"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                      >
                        قبلی
                      </button>
                      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                        (page) => (
                          <button
                            key={page}
                            type="button"
                            className={`pagination__btn ${page === currentPage ? 'is-active' : ''}`}
                            onClick={() => goToPage(page)}
                            aria-current={page === currentPage}
                          >
                            {faNumber(page)}
                          </button>
                        )
                      )}
                      <button
                        type="button"
                        className="pagination__btn"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                      >
                        بعدی
                      </button>
                    </nav>
                  ) : null}
                </>
              ) : (
                <EmptyState
                  title="ملکی با این مشخصات پیدا نشد"
                  text="فیلترها را تغییر دهید یا درخواست خود را ثبت کنید تا در صورت وجود فایل مناسب با شما تماس بگیریم."
                  actionLabel="ثبت درخواست مشاوره"
                  actionTo="/contact"
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
