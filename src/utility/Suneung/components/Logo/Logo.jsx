// 수능 D-Day 타이머 로고: OMR 답안지의 마킹 칸이 시계처럼 4분의 3까지 차오른 모양.
// 「답을 마킹하는 칸」과 「줄어드는 시간」을 한 그림에 담았다. public/suneung-icon.svg(탭 아이콘)와 같은 그림이다.
export default function Logo({ size = 28, className, title }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <rect width="64" height="64" rx="15" fill="var(--logo-bg, #c2334b)" />
      <ellipse cx="32" cy="32" rx="15" ry="21" fill="none" stroke="var(--logo-fg, #fbfaf6)" strokeWidth="4.5" />
      <path className="logo-fill" d="M32 32 L32 17.5 A8.6 14.5 0 1 1 23.4 32 Z" fill="var(--logo-fg, #fbfaf6)" />
    </svg>
  )
}
