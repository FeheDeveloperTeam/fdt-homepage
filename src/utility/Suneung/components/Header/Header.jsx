import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../Logo/Logo'
import './Header.css'

const SECTIONS = [
  { href: '#practice', label: '실전 타이머' },
  { href: '#timetable', label: '시간표' },
  { href: '#upcoming', label: '수능 날짜' },
  { href: '#cheer', label: '응원 문구' },
]

// 모바일(760px 이하)에서는 아래로 스크롤하면 헤더를 숨겨 화면을 넓게 쓰고, 위로 올리면 다시 보여 준다.
function useHideOnScroll() {
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    let lastY = window.scrollY
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const y = window.scrollY
        const mobile = window.matchMedia('(max-width: 760px)').matches
        if (!mobile || y < 80) setHidden(false)
        else if (Math.abs(y - lastY) > 6) setHidden(y > lastY)
        lastY = y
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
  return hidden
}

export default function Header() {
  const hidden = useHideOnScroll()
  return (
    <header className={`suneung-header${hidden ? ' is-hidden' : ''}`}>
      <div className="suneung-header-inner">
        <Link className="suneung-back" to="/projects/general">
          ← FDT
        </Link>
        <span className="suneung-header-divider" aria-hidden="true" />
        <Link className="suneung-logo" to="/utility/suneung">
          <Logo size={26} className="suneung-logo-mark" />
          <span>
            수능 <b>D-Day</b> 타이머
          </span>
        </Link>
        <nav className="suneung-header-nav" aria-label="페이지 안 바로가기">
          {SECTIONS.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <span className="suneung-header-tz">KST</span>
      </div>
    </header>
  )
}
