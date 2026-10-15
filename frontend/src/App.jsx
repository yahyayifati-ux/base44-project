import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import SiteLayout from './components/SiteLayout.jsx'
import AdminLayout from './components/AdminLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import ListingsPage from './pages/ListingsPage.jsx'
import PropertyDetailPage from './pages/PropertyDetailPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx'
import AdminPropertiesPage from './pages/admin/AdminPropertiesPage.jsx'
import AdminPropertyFormPage from './pages/admin/AdminPropertyFormPage.jsx'
import AdminInquiriesPage from './pages/admin/AdminInquiriesPage.jsx'
import AdminSettingsPage from './pages/admin/AdminSettingsPage.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<ListingsPage />} />
          <Route path="/properties/:slug" element={<PropertyDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="properties" element={<AdminPropertiesPage />} />
          <Route path="properties/new" element={<AdminPropertyFormPage />} />
          <Route path="properties/:id" element={<AdminPropertyFormPage />} />
          <Route path="inquiries" element={<AdminInquiriesPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </>
  )
}
