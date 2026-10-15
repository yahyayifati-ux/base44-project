import { Outlet } from 'react-router-dom'

import SiteFooter from './SiteFooter.jsx'
import SiteHeader from './SiteHeader.jsx'
import { SettingsProvider } from './settings.jsx'

export default function SiteLayout() {
  return (
    <SettingsProvider>
      <SiteHeader />
      <main id="main">
        <Outlet />
      </main>
      <SiteFooter />
    </SettingsProvider>
  )
}
