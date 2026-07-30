import { useEffect, useState } from 'react'

export function useDiscordUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setUser(data.user)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { user, loading }
}
