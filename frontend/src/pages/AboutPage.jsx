import { Link } from 'react-router-dom'

import Reveal from '../components/Reveal.jsx'
import { useSettings } from '../components/settings.jsx'
import { useSeo } from '../seo.js'

const FOCUS = [
  {
    title: 'شناخت محله‌های قشم و درگهان',
    text: 'هر محدوده ویژگی خودش را دارد؛ از بازارهای درگهان تا محله‌های مسکونی و نوار ساحلی.',
  },
  {
    title: 'اطلاعات روشن درباره هر ملک',
    text: 'متراژ، طبقه، تعداد اتاق و نوع مدارک اعلام‌شده را همان‌طور که هست در اختیار شما می‌گذاریم.',
  },
  {
    title: 'بدون وعده‌های غیرواقعی',
    text: 'ما سود یا رشد قیمت تضمین نمی‌کنیم؛ تصمیم را با اطلاعات واقعی به شما می‌سپاریم.',
  },
]

const STEPS = [
  { title: 'درخواست شما ثبت می‌شود', text: 'نیاز، بودجه و محدوده مورد نظر شما را می‌پرسیم.' },
  { title: 'فایل‌های مرتبط بررسی می‌شود', text: 'گزینه‌های موجود را با مشخصات واقعی معرفی می‌کنیم.' },
  { title: 'بازدید هماهنگ می‌شود', text: 'برای دیدن ملک، زمانی مناسب شما هماهنگ می‌کنیم.' },
  { title: 'تصمیم با شماست', text: 'در مذاکره و توافق همراه شما هستیم، بدون فشار.' },
]

export default function AboutPage() {
  const { settings } = useSettings()
  useSeo({
    title: 'درباره ما',
    description: settings?.about_intro_fa,
    image: settings?.about_image,
  })

  const image = settings?.about_image || '/images/about.jpg'

  return (
    <>
      <section className="listing-hero">
        <div className="shell shell--wide">
          <p className="eyebrow">About JAVID</p>
          <h1 className="title-lg" style={{ marginTop: 12 }}>
            درباره املاک جاوید
          </h1>
          <p className="lede" style={{ marginTop: 12 }}>
            {settings?.about_intro_fa ||
              'املاک جاوید در قشم و درگهان فعالیت می‌کند و تمرکز آن بر معرفی شفاف فرصت‌های ملکی این جزیره است.'}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell shell--wide">
          <div className="split">
            <Reveal>
              <p className="eyebrow">Our Approach</p>
              <h2 className="title-lg" style={{ marginTop: 14 }}>
                همراهی در مسیر خرید، فروش، اجاره و سرمایه‌گذاری
              </h2>
              <p className="lede" style={{ marginTop: 20 }}>
                {settings?.about_body_fa ||
                  'ما با شناخت محله‌ها و محدوده‌های قشم به شما کمک می‌کنیم ملک مناسب خود را با اطلاعات روشن انتخاب کنید.'}
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 26, flexWrap: 'wrap' }}>
                <Link className="btn btn--emerald" to="/properties">
                  مشاهده املاک
                </Link>
                <Link className="btn btn--outline" to="/contact">
                  تماس با ما
                </Link>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <img
                src={image}
                alt="نمونه معماری در قشم"
                loading="lazy"
                style={{ border: '1px solid var(--line)', aspectRatio: '4 / 3', objectFit: 'cover', width: '100%' }}
              />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="shell shell--wide">
          <div className="section-header">
            <p className="eyebrow">Focus</p>
            <h2 className="title-lg">تمرکز ما در این جزیره</h2>
          </div>
          <div className="grid-3">
            {FOCUS.map((item, index) => (
              <Reveal key={item.title} delay={index * 80}>
                <div className="panel" style={{ height: '100%' }}>
                  <span className="service-item__index" style={{ color: 'var(--gold)' }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="title-md" style={{ fontSize: '1.1rem', margin: '10px 0 10px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.92rem', lineHeight: 1.95, color: 'var(--smoky)' }}>
                    {item.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell shell--wide">
          <div className="section-header">
            <p className="eyebrow">Process</p>
            <h2 className="title-lg">مسیر دریافت اطلاعات ملک</h2>
          </div>
          <div className="grid-4">
            {STEPS.map((step, index) => (
              <Reveal key={step.title} delay={index * 70}>
                <div className="hairline-top" style={{ height: '100%' }}>
                  <span className="num" style={{ color: 'var(--gold)', fontSize: '0.86rem' }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 style={{ fontSize: '1rem', margin: '10px 0 8px' }}>{step.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--smoky)', lineHeight: 1.9 }}>
                    {step.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight section--emerald">
        <div className="shell shell--wide">
          <div className="section-header__row">
            <div>
              <p className="eyebrow">Consultation</p>
              <h2 className="title-md" style={{ marginTop: 12 }}>
                برای انتخاب بهتر، مشاوره بگیرید
              </h2>
            </div>
            <Link className="btn btn--light" to="/contact">
              ثبت درخواست مشاوره
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
