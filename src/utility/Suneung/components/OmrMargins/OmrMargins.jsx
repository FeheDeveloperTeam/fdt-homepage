import './OmrMargins.css'

const ROWS = 20
const CHOICES = ['①', '②', '③', '④', '⑤']

// 아주 넓은 화면의 양옆 빈 곳에 OMR 답안지 한 줄씩을 그린다. 들어오면 누군가 답을 하나씩
// 마킹하듯 칸이 차례로 채워진다. 장식이라 스크린리더에서는 숨긴다.
function Sheet({ side, title, start }) {
  return (
    <div className={`omr-sheet omr-sheet--${side}`} aria-hidden="true">
      <p className="omr-sheet-title">{title}</p>
      <ol className="omr-rows">
        {Array.from({ length: ROWS }, (_, row) => {
          const answer = (row * 7 + (side === 'left' ? 1 : 3) + ((row * row) % 3)) % 5
          return (
            <li key={row} className="omr-row">
              <span className="omr-no">{start + row}</span>
              {CHOICES.map((label, choice) => (
                <span
                  key={label}
                  className={`omr-bubble${choice === answer ? ' is-marked' : ''}`}
                  style={choice === answer ? { '--d': `${0.8 + row * 0.22 + (side === 'right' ? 0.11 : 0)}s` } : undefined}
                >
                  {label}
                </span>
              ))}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default function OmrMargins() {
  return (
    <>
      <Sheet side="left" title="국어 영역" start={1} />
      <Sheet side="right" title="수학 영역" start={1} />
    </>
  )
}
