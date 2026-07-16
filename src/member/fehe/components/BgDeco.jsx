const STARS = [
  { top: '8%',  left: '12%', delay: '0s' },
  { top: '15%', left: '82%', delay: '1.2s', size: 8 },
  { top: '35%', left: '5%',  delay: '2.4s', size: 5 },
  { top: '55%', left: '90%', delay: '0.7s' },
  { top: '72%', left: '75%', delay: '3.1s', size: 7 },
  { top: '85%', left: '18%', delay: '1.8s' },
  { top: '25%', left: '55%', delay: '4s',  size: 5 },
  { top: '65%', left: '40%', delay: '2s',  size: 8 },
]

export default function BgDeco() {
  return (
    <>
      <div className="bg-deco">
        <span /><span /><span />
      </div>
      <div className="stars">
        {STARS.map((s, i) => (
          <div
            key={i}
            className="star"
            style={{
              top: s.top,
              left: s.left,
              animationDelay: s.delay,
              ...(s.size ? { width: s.size, height: s.size } : {}),
            }}
          />
        ))}
      </div>
    </>
  )
}
