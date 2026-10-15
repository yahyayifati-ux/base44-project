import { useState } from 'react'

import InquiryForm from '../components/InquiryForm.jsx'
import { useSettings } from '../components/settings.jsx'
import { telLink, whatsappLink } from '../format'
import { useSeo } from '../seo.js'

export default function ContactPage() {
  const { settings } = useSettings()
  const [requestKind, setRequestKind] = useState('consultation')

  useSeo({
    title: 'تماس با ما',
    description:
      'راه‌های تماس با املاک جاوید در قشم: تلفن، واتس‌اپ و فرم ثبت درخواست مشاوره یا ثبت ملک.',
  })

  const phone1 = settings?.phone_1 || ''
  const phone2 = settings?.phone_2 || ''
  const whatsapp = settings?.whatsapp || ''
  const email = settings?.email || ''
  const address = settings?.address_fa || ''
  const hours = settings?.hours_fa || ''
  const officeCode = settings?.office_code || ''
  const instagram = settings?.instagram || ''

  const contactRows = [
    ['تلفن دفتر', phone1, phone1 ? telLink(phone1) : ''],
    ['تلفن همراه', phone2, phone2 ? telLink(phone2) : ''],
    ['کد دفتر', officeCode, ''],
    ['نشانی', address, ''],
    ['ساعات کاری', hours, ''],
    ['ایمیل', email, email ? `mailto:${email}` : ''],
  ].filter(([, value]) => value)

  return (
    <>
      <section className="listing-hero">
        <div className="shell shell--wide">
          <p className="eyebrow">Contact</p>
          <h1 className="title-lg" style={{ marginTop: 12 }}>
            تماس با املاک جاوید
          </h1>
          <p className="lede" style={{ marginTop: 12 }}>
            برای دریافت اطلاعات ملک، هماهنگی بازدید یا ثبت ملک خود، از راه‌های زیر با ما در
            ارتباط باشید.
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="shell shell--wide">
          <div className="split">
            <div>
              <div className="panel">
                <p className="eyebrow">Office</p>
                <h2 className="title-md" style={{ margin: '12px 0 18px' }}>
                  اطلاعات تماس
                </h2>
                <table className="spec-table">
                  <tbody>
                    {contactRows.map(([label, value, href]) => (
                      <tr key={label}>
                        <td>{label}</td>
                        <td>{href ? <a href={href}>{value}</a> : value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                  {phone1 ? (
                    <a className="btn btn--emerald btn--sm" href={telLink(phone1)}>
                      تماس تلفنی
                    </a>
                  ) : null}
                  {whatsapp ? (
                    <a
                      className="btn btn--outline btn--sm"
                      href={whatsappLink(whatsapp, 'سلام، برای مشاوره ملک در قشم تماس می‌گیرم.')}
                      target="_blank"
                      rel="noreferrer"
                    >
                      گفت‌وگو در واتس‌اپ
                    </a>
                  ) : null}
                  {instagram ? (
                    <a
                      className="btn btn--outline btn--sm"
                      href={instagram}
                      target="_blank"
                      rel="noreferrer"
                    >
                      اینستاگرام
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="panel" style={{ marginTop: 22 }}>
                <p className="eyebrow">Property Request</p>
                <h2 className="title-md" style={{ margin: '12px 0 8px' }}>
                  درخواست مشاوره یا ثبت ملک
                </h2>
                <p className="field__hint" style={{ marginBottom: 18 }}>
                  مشخص کنید درخواست شما درباره خرید و اجاره است یا می‌خواهید ملک خود را برای
                  فروش معرفی کنید.
                </p>

                <div className="field">
                  <label className="field__label" htmlFor="request-kind">
                    موضوع درخواست
                  </label>
                  <select
                    id="request-kind"
                    className="select"
                    value={requestKind}
                    onChange={(event) => setRequestKind(event.target.value)}
                  >
                    <option value="consultation">درخواست مشاوره خرید یا اجاره</option>
                    <option value="sell">ثبت ملک برای فروش</option>
                  </select>
                </div>

                <InquiryForm
                  kind={requestKind}
                  submitLabel={requestKind === 'sell' ? 'ثبت ملک من' : 'ثبت درخواست مشاوره'}
                  messagePlaceholder={
                    requestKind === 'sell'
                      ? 'مشخصات ملک خود را بنویسید: نوع ملک، محدوده، متراژ و نوع مدارک…'
                      : 'نیاز خود را بنویسید: نوع ملک، محدوده و بودجه مورد نظر…'
                  }
                />
              </div>
            </div>

            <div>
              <div className="panel">
                <p className="eyebrow">Message</p>
                <h2 className="title-md" style={{ margin: '12px 0 18px' }}>
                  پیام به املاک جاوید
                </h2>
                <InquiryForm
                  kind="contact"
                  submitLabel="ارسال پیام"
                  messagePlaceholder="پرسش یا پیام خود را بنویسید…"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
