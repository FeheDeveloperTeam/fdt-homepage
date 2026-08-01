import { useEffect } from 'react'
import { getFullTitle } from '../seoData'

// siteName을 넘기면 "{title} | {siteName}" 형식으로, 안 넘기면 메인 FDT
// 사이트 규칙(getFullTitle → "{title} | FeheDeveloperTeam")을 그대로 쓴다.
export function useDocumentTitle(title, siteName) {
  useEffect(() => {
    document.title = siteName
      ? (title === siteName ? title : `${title} | ${siteName}`)
      : getFullTitle(title)
  }, [title, siteName])
}
