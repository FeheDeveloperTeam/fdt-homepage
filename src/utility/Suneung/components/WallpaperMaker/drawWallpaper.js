import { dLabel, daysUntil, formatLongDate } from '../../suneungDates'

export const FORMATS = {
  phone: { label: '휴대폰 (1080×1920)', w: 1080, h: 1920 },
  desktop: { label: 'PC (1920×1080)', w: 1920, h: 1080 },
}

const THEMES = {
  light: { bg: '#f4f1e8', card: '#fbfaf6', ink: '#1d1c1a', soft: '#45423b', muted: '#67625a', rule: '#ddd6c6', accent: '#c2334b', onAccent: '#fbfaf6' },
  dark: { bg: '#121316', card: '#1a1c20', ink: '#ece9e1', soft: '#c4bfb4', muted: '#969186', rule: '#2c2f35', accent: '#ff7a8a', onAccent: '#121316' },
}

const SANS = '"Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", "Segoe UI", sans-serif'
const SERIF = '"Noto Serif KR", "Nanum Myeongjo", "AppleMyungjo", "Batang", serif'

function drawLogo(ctx, x, y, size, t) {
  const s = size / 64
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(s, s)
  ctx.fillStyle = t.accent
  ctx.beginPath()
  ctx.roundRect(0, 0, 64, 64, 15)
  ctx.fill()
  ctx.strokeStyle = t.onAccent
  ctx.lineWidth = 4.5
  ctx.beginPath()
  ctx.ellipse(32, 32, 15, 21, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = t.onAccent
  ctx.fill(new Path2D('M32 32 L32 17.5 A8.6 14.5 0 1 1 23.4 32 Z'))
  ctx.restore()
}

// 한국어는 띄어쓰기 단위로 줄을 바꾸고, 한 단어가 너무 길면 글자 단위로 자른다.
function wrapLines(ctx, text, maxWidth) {
  const lines = []
  let line = ''
  for (const word of text.split(' ')) {
    const tryLine = line ? `${line} ${word}` : word
    if (ctx.measureText(tryLine).width <= maxWidth) {
      line = tryLine
      continue
    }
    if (line) lines.push(line)
    if (ctx.measureText(word).width <= maxWidth) {
      line = word
    } else {
      line = ''
      for (const ch of word) {
        if (ctx.measureText(line + ch).width > maxWidth) {
          lines.push(line)
          line = ch
        } else line += ch
      }
    }
  }
  if (line) lines.push(line)
  return lines
}

function fitFont(ctx, text, weight, family, maxSize, maxWidth) {
  let size = maxSize
  ctx.font = `${weight} ${size}px ${family}`
  while (ctx.measureText(text).width > maxWidth && size > 40) {
    size -= 6
    ctx.font = `${weight} ${size}px ${family}`
  }
  return size
}

// accent: 화면 설정에서 고른 강조색({ light, dark }). 없으면 기본 OMR 빨강.
export function drawWallpaper(canvas, { exam, now, format, theme, message, accent }) {
  const { w, h } = FORMATS[format]
  const t = accent ? { ...THEMES[theme], accent: accent[theme] } : THEMES[theme]
  const phone = format === 'phone'
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')

  // 바탕: 종이색 + 아주 옅은 줄
  ctx.fillStyle = t.bg
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = t.rule
  ctx.globalAlpha = 0.35
  ctx.lineWidth = 1
  for (let y = 0; y < h; y += 48) {
    ctx.beginPath()
    ctx.moveTo(0, y + 0.5)
    ctx.lineTo(w, y + 0.5)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  ctx.fillStyle = t.accent
  ctx.fillRect(0, 0, w, 14)

  const pad = phone ? 96 : 130
  const days = daysUntil(exam, now)
  const dText = dLabel(days)

  // 브랜드
  drawLogo(ctx, pad, pad, phone ? 84 : 72, t)
  ctx.fillStyle = t.ink
  ctx.textBaseline = 'middle'
  ctx.font = `800 ${phone ? 40 : 34}px ${SANS}`
  ctx.fillText('수능 D-Day 타이머', pad + (phone ? 108 : 94), pad + (phone ? 42 : 36))
  ctx.textBaseline = 'alphabetic'

  const leftW = phone ? w - pad * 2 : w * 0.5 - pad
  const baseY = phone ? 620 : 420

  ctx.fillStyle = t.accent
  ctx.font = `800 ${phone ? 50 : 44}px ${SANS}`
  ctx.fillText(`${exam.academicYear}학년도`, pad, baseY)
  ctx.fillStyle = t.ink
  ctx.font = `700 ${phone ? 76 : 64}px ${SERIF}`
  ctx.fillText('대학수학능력시험', pad, baseY + (phone ? 96 : 80))

  const dSize = fitFont(ctx, dText, 900, SANS, phone ? 330 : 280, leftW)
  ctx.fillStyle = t.accent
  ctx.fillText(dText, pad - dSize * 0.03, baseY + (phone ? 96 : 80) + dSize * 0.95)

  ctx.fillStyle = t.soft
  ctx.font = `600 ${phone ? 46 : 40}px ${SANS}`
  ctx.fillText(`${formatLongDate(exam)} · 1교시 08:40`, pad, baseY + (phone ? 96 : 80) + dSize * 0.95 + (phone ? 90 : 76))

  // 응원 문구 카드
  const cardX = phone ? pad : w * 0.55
  const cardY = phone ? 1290 : 300
  const cardW = phone ? w - pad * 2 : w * 0.45 - pad
  ctx.font = `700 ${phone ? 52 : 50}px ${SERIF}`
  const lines = wrapLines(ctx, message, cardW - 120)
  const lineH = phone ? 82 : 78
  const cardH = 150 + lines.length * lineH
  ctx.fillStyle = t.card
  ctx.strokeStyle = t.rule
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(cardX, cardY, cardW, cardH, 28)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = t.accent
  ctx.fillRect(cardX + 40, cardY + 40, 4, cardH - 80)
  ctx.font = `800 ${phone ? 30 : 28}px ${SANS}`
  ctx.fillText('오늘의 응원', cardX + 72, cardY + 78)
  ctx.fillStyle = t.ink
  ctx.font = `700 ${phone ? 52 : 50}px ${SERIF}`
  lines.forEach((line, i) => ctx.fillText(line, cardX + 72, cardY + 150 + i * lineH))

  // 출처
  ctx.fillStyle = t.muted
  ctx.font = `600 ${phone ? 32 : 28}px ${SANS}`
  ctx.textAlign = phone ? 'center' : 'right'
  ctx.fillText('fehe.dev/utility/suneung', phone ? w / 2 : w - pad, h - (phone ? 90 : 70))
  ctx.textAlign = 'left'
}
