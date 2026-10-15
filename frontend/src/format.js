/* Persian formatting helpers: numerals, prices, areas, dates, labels. */

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export function toFa(value) {
  return String(value ?? '').replace(/\d/g, (digit) => FA_DIGITS[Number(digit)])
}

export function faNumber(value) {
  if (value === null || value === undefined || value === '') return ''
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return ''
  return toFa(new Intl.NumberFormat('en-US').format(numeric))
}

export function faArea(value) {
  return value ? `${faNumber(value)} متر` : ''
}

export function faLandArea(value) {
  return value ? `${faNumber(value)} متر زمین` : ''
}

export function faDate(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  try {
    const formatted = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
    return toFa(formatted)
  } catch {
    return toFa(date.toLocaleDateString('en-GB'))
  }
}

export const TRANSACTION_LABELS = {
  sale: 'فروش',
  rent: 'اجاره',
  mortgage: 'رهن',
  investment: 'سرمایه‌گذاری',
}

export const TRANSACTION_OPTIONS = [
  { value: 'sale', label: 'خرید و فروش' },
  { value: 'rent', label: 'اجاره' },
  { value: 'mortgage', label: 'رهن' },
  { value: 'investment', label: 'سرمایه‌گذاری' },
]

export const INQUIRY_KIND_LABELS = {
  property: 'استعلام ملک',
  consultation: 'درخواست مشاوره',
  sell: 'ثبت ملک برای فروش',
  contact: 'پیام تماس',
}

export const INQUIRY_STATUS_LABELS = {
  new: 'جدید',
  read: 'خوانده‌شده',
  done: 'پاسخ داده‌شده',
}

/** Price text for a listing. Never invents a number. */
export function priceLabel(property) {
  if (!property) return ''
  if (property.price) return `${faNumber(property.price)} تومان`
  const parts = []
  if (property.deposit) parts.push(`رهن ${faNumber(property.deposit)} تومان`)
  if (property.monthly_rent) parts.push(`اجاره ${faNumber(property.monthly_rent)} تومان`)
  if (parts.length) return parts.join(' + ')
  return 'تماس برای اطلاع از قیمت'
}

export function priceIsPublished(property) {
  if (!property) return false
  return Boolean(property.price || property.deposit || property.monthly_rent)
}

export function locationLabel(property) {
  if (!property) return ''
  return [property.neighborhood, property.city].filter(Boolean).join('، ')
}

export function whatsappLink(number, text) {
  if (!number) return ''
  const digits = String(number).replace(/[^\d]/g, '')
  if (!digits) return ''
  const query = text ? `?text=${encodeURIComponent(text)}` : ''
  return `https://wa.me/${digits}${query}`
}

export function telLink(number) {
  if (!number) return ''
  return `tel:${String(number).replace(/[^\d+]/g, '')}`
}
