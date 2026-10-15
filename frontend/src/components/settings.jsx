/* Site settings (brand, contact details, editorial copy and images) are global
   values edited in the admin dashboard, so they are fetched once and shared. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { api } from '../api'

const SettingsContext = createContext({
  settings: null,
  loading: true,
  error: null,
  reload: () => {},
})

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getSettings()
      setSettings(data)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const value = useMemo(() => ({ settings, loading, error, reload: load }), [
    settings,
    loading,
    error,
    load,
  ])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  return useContext(SettingsContext)
}
