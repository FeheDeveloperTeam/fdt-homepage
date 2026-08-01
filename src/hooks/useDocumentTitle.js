import { useEffect } from 'react'
import { getFullTitle } from '../seoData'

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = getFullTitle(title)
  }, [title])
}
