/* Listing filters. Every control maps to a real backend query parameter. */
import { useEffect, useState } from 'react'

import { TRANSACTION_OPTIONS } from '../format'

const EMPTY = {
  q: '',
  transaction: '',
  category: '',
  location: '',
  min_price: '',
  max_price: '',
  min_area: '',
  max_area: '',
  rooms: '',
  floor: '',
  documentation: '',
}

export default function FilterBar({ values, categories, onSubmit, onReset, isOpen }) {
  const [draft, setDraft] = useState({ ...EMPTY, ...values })

  useEffect(() => {
    setDraft({ ...EMPTY, ...values })
  }, [values])

  const update = (field) => (event) => {
    setDraft((previous) => ({ ...previous, [field]: event.target.value }))
  }

  const submit = (event) => {
    event.preventDefault()
    onSubmit(draft)
  }

  const reset = () => {
    setDraft({ ...EMPTY })
    onReset()
  }

  return (
    <form className={`filters ${isOpen ? 'is-open' : ''}`} onSubmit={submit}>
      <div className="filters__head">
        <span className="filters__title">جست‌وجو و فیلترها</span>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="filter-q">
          جست‌وجو
        </label>
        <input
          id="filter-q"
          className="input"
          value={draft.q}
          onChange={update('q')}
          placeholder="عنوان، محله یا محدوده"
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="filter-transaction">
          نوع معامله
        </label>
        <select
          id="filter-transaction"
          className="select"
          value={draft.transaction}
          onChange={update('transaction')}
        >
          <option value="">همه</option>
          {TRANSACTION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="filter-category">
          نوع ملک
        </label>
        <select
          id="filter-category"
          className="select"
          value={draft.category}
          onChange={update('category')}
        >
          <option value="">همه</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.title_fa}
            </option>
          ))}
        </select>
      </div>

      <div className="filters__group">
        <div className="field">
          <label className="field__label" htmlFor="filter-location">
            محله یا محدوده
          </label>
          <input
            id="filter-location"
            className="input"
            value={draft.location}
            onChange={update('location')}
            placeholder="مثلاً درگهان"
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="filter-documentation">
            نوع سند
          </label>
          <input
            id="filter-documentation"
            className="input"
            value={draft.documentation}
            onChange={update('documentation')}
            placeholder="مثلاً سند تک‌برگ"
          />
        </div>
      </div>

      <div className="filters__group">
        <div className="field-row">
          <div className="field">
            <label className="field__label" htmlFor="filter-min-price">
              حداقل قیمت (تومان)
            </label>
            <input
              id="filter-min-price"
              className="input en-sans"
              value={draft.min_price}
              onChange={update('min_price')}
              inputMode="numeric"
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="filter-max-price">
              حداکثر قیمت (تومان)
            </label>
            <input
              id="filter-max-price"
              className="input en-sans"
              value={draft.max_price}
              onChange={update('max_price')}
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label className="field__label" htmlFor="filter-min-area">
              حداقل متراژ
            </label>
            <input
              id="filter-min-area"
              className="input en-sans"
              value={draft.min_area}
              onChange={update('min_area')}
              inputMode="numeric"
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="filter-max-area">
              حداکثر متراژ
            </label>
            <input
              id="filter-max-area"
              className="input en-sans"
              value={draft.max_area}
              onChange={update('max_area')}
              inputMode="numeric"
            />
          </div>
        </div>
      </div>

      <div className="filters__group">
        <div className="field-row">
          <div className="field">
            <label className="field__label" htmlFor="filter-rooms">
              تعداد اتاق
            </label>
            <select id="filter-rooms" className="select" value={draft.rooms} onChange={update('rooms')}>
              <option value="">همه</option>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value} و بیشتر
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="filter-floor">
              طبقه
            </label>
            <select id="filter-floor" className="select" value={draft.floor} onChange={update('floor')}>
              <option value="">همه</option>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
        <button type="submit" className="btn btn--emerald btn--sm" style={{ flex: 1 }}>
          اعمال فیلترها
        </button>
        <button type="button" className="btn btn--outline btn--sm" onClick={reset}>
          پاک کردن
        </button>
      </div>
    </form>
  )
}
