import './RollingNumber.css'

// 숫자 한 자리씩 따로 그려, 바뀐 자리만 위에서 굴러 내려오게 한다.
// key가 「오른쪽에서 몇 번째 자리 + 글자」라서 그 자리 글자가 바뀔 때만 다시 마운트되어 애니메이션이 돈다.
export default function RollingNumber({ text, className }) {
  return (
    <span className={`roll${className ? ` ${className}` : ''}`} aria-hidden="true">
      {String(text)
        .split('')
        .map((ch, i, all) => (
          <span key={`${all.length - i}-${ch}`} className="roll-ch">
            {ch}
          </span>
        ))}
    </span>
  )
}
