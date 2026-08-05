import { useEffect } from 'react'

// 서브트리 전체(치유미 등)에 마운트 중일 때만 파비콘을 캐릭터 사진으로 바꾸고,
// 언마운트되면(메인 사이트로 돌아가면) 원래 파비콘으로 복원한다.
export function useFavicon(href) {
  useEffect(() => {
    const link = document.querySelector('link[rel="icon"]')
    if (!link) return

    const original = link.href
    link.href = href

    return () => {
      link.href = original
    }
  }, [href])
}
