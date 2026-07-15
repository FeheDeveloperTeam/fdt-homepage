import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

/* ── 매트릭스 비 이펙트 ── */
function MatrixRain({ onDone }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const fontSize = 14
    const cols = Math.floor(canvas.width / fontSize)
    const drops = Array(cols).fill(1)
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノFEHEフェヘ0123456789ABCDEF'

    const interval = setInterval(() => {
      ctx.fillStyle = 'rgba(0,0,0,0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#6bbde0'
      ctx.font = `${fontSize}px monospace`

      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillText(char, i * fontSize, y * fontSize)
        if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      })
    }, 40)

    const timer = setTimeout(() => {
      clearInterval(interval)
      onDone()
    }, 4500)

    return () => { clearInterval(interval); clearTimeout(timer) }
  }, [onDone])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none' }}
    />
  )
}

/* ── VR 비주얼 노벨 대화 트리 ── */
const VR_STORY = {
  intro: {
    speaker: '???',
    text: '...처음 보는 분이시네요. 이 카페에 자주 오세요?',
    choices: [
      { label: '아, 네. 자주 와요.', next: 'a1' },
      { label: '처음이에요.', next: 'b1' },
      { label: '(말없이 주위를 둘러본다)', next: 'c1' },
    ],
  },

  // 경로 A
  a1: { speaker: '???', text: '그렇군요. 저는 매일 오는데 한 번도 못 봤네요.', next: 'a2' },
  a2: {
    speaker: '???',
    text: '...혹시 다른 시간대에 오시는 건가요?',
    choices: [
      { label: '네, 주로 밤에 와요.', next: 'merge' },
      { label: '아, 사실 오늘 처음이에요.', next: 'a3' },
    ],
  },
  a3: { speaker: '???', text: '어머. 거짓말을 하셨군요.', next: 'a4' },
  a4: { speaker: '???', text: '...귀엽네요.', next: 'merge' },

  // 경로 B
  b1: { speaker: '???', text: '처음이시구나. 잘 오셨어요.', next: 'b2' },
  b2: {
    speaker: '???',
    text: '여기 분위기, 마음에 드세요?',
    choices: [
      { label: '네, 좋은 것 같아요.', next: 'b3a' },
      { label: '아직 잘 모르겠어요.', next: 'b3b' },
    ],
  },
  b3a: { speaker: '???', text: '그죠? 저는 현실이 답답할 때 여기 와요.', next: 'merge' },
  b3b: { speaker: '???', text: '괜찮아요. 여기는 그냥 있어도 되는 곳이에요.', next: 'merge' },

  // 경로 C
  c1: { speaker: '???', text: '...', next: 'c2' },
  c2: { speaker: '???', text: '말이 없는 분이시네요. 그것도 좋아요.', next: 'c3' },
  c3: { speaker: '???', text: '여긴 조용한 사람이 어울리는 곳이거든요.', next: 'merge' },

  // 합류
  merge: { speaker: '???', text: '이상하게 들릴 수도 있는데...', next: 'merge2' },
  merge2: {
    speaker: '???',
    text: '여기 오면 현실이 조금 멀어지는 것 같아서 좋아요.',
    choices: [
      { label: '저도요.', next: 'end_a' },
      { label: '현실에서 도망치는 건가요?', next: 'end_b' },
      { label: '(아무 말도 하지 않는다)', next: 'end_c' },
    ],
  },

  // 엔딩 분기
  end_a:  { speaker: '???', text: '...그렇군요.', next: 'end_wave' },
  end_b:  { speaker: '???', text: '도망이라기보다... 숨 고르기, 라고 하면 될까요.', next: 'end_wave' },
  end_c:  { speaker: '???', text: '...', next: 'end_c2' },
  end_c2: { speaker: '???', text: '(아바타가 조용히 고개를 끄덕인다)', action: true, next: 'end_wave' },

  end_wave: { speaker: '???', text: '(아바타가 손을 흔든다)', action: true, next: 'end_final' },
  end_final: { speaker: '???', text: '또 봐요.', next: null },
}

/* ── VR 비주얼 노벨 컴포넌트 ── */
function VRNovel({ onEnd }) {
  const [key, setKey] = useState('intro')
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  const node = VR_STORY[key]

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const text = node.text
    const speed = text === '...' ? 200 : 28
    const timer = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(timer); setDone(true) }
    }, speed)
    return () => clearInterval(timer)
  }, [key])

  function skip() {
    if (!done) { setDisplayed(node.text); setDone(true) }
  }

  function advance() {
    if (!done) { skip(); return }
    if (node.next) setKey(node.next)
    else onEnd()
  }

  function choose(next) { setKey(next) }

  return (
    <div className="vr-novel" onClick={(!done || (!node.choices && node.next !== null)) ? advance : undefined}>
      {/* 위쪽 장소 표시 */}
      <div className="vr-novel-location">📍 어느 조용한 카페</div>

      {/* 하단 대화창 */}
      <div className="vr-novel-box" onClick={e => { e.stopPropagation(); if (e.target.tagName !== 'BUTTON') advance() }}>
        <div className="vr-novel-name">{node.speaker}</div>
        <p className={`vr-novel-text${node.action ? ' action' : ''}`}>
          {displayed}
          {!done && <span className="vr-cursor">▌</span>}
        </p>

        {done && node.choices && (
          <div className="vr-choices">
            {node.choices.map((c, i) => (
              <button key={i} className="vr-choice" onClick={() => choose(c.next)}>
                {c.label}
              </button>
            ))}
          </div>
        )}

        {done && !node.choices && node.next !== null && (
          <div className="vr-advance" onClick={advance}>▼</div>
        )}

        {done && node.next === null && (
          <div className="vr-choices">
            <button className="vr-choice vr-end" onClick={onEnd}>[ 접속 종료 ]</button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── 시크릿 접근 모달 ── */
function SecretModal({ onClose, onSuccess }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    const answer = input.trim()
    if (answer === '어느 조용한 카페') {
      onSuccess()
    } else {
      setError(true)
      setShake(true)
      setInput('')
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="ee-secret-overlay" onClick={onClose}>
      <div
        className={`ee-secret-modal${shake ? ' shake' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <p className="ee-secret-label">[ ACCESS CODE REQUIRED ]</p>
        <p className="ee-secret-question">페헤가 매일 찾아가는 그 세계의 이름은?</p>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className={`ee-secret-input${error ? ' error' : ''}`}
            value={input}
            onChange={e => { setInput(e.target.value); setError(false) }}
            placeholder="_ _ _ _ _ _ _ _ _ _"
            spellCheck={false}
            autoComplete="off"
          />
          {error && <p className="ee-secret-error">접근이 거부되었습니다.</p>}
          <div className="ee-secret-btns">
            <button type="button" className="ee-secret-cancel" onClick={onClose}>취소</button>
            <button type="submit" className="ee-secret-confirm">접속</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── 메인 컴포넌트 ── */
export default function EasterEgg() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [lines, setLines] = useState([
    { type: 'system', text: '페헤 터미널 v1.0.0  ·  백틱(`) 또는 ESC로 닫기' },
    { type: 'system', text: '"help" 를 입력하면 명령어 목록을 볼 수 있습니다.' },
    { type: 'system', text: '' },
  ])
  const [cmdHistory, setCmdHistory] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const [matrix, setMatrix] = useState(false)
  const [secretModal, setSecretModal] = useState(false)
  const [vrNovel, setVrNovel] = useState(false)
  const [vimMode, setVimMode] = useState(false)
  const [vimInput, setVimInput] = useState('')
  const [vimMsg, setVimMsg] = useState('')
  const inputRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    function onKey(e) {
      if (e.key === '`') { e.preventDefault(); setOpen(o => !o) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  function addLines(newLines) {
    setLines(prev => [...prev, ...newLines])
  }

  function handleSecretSuccess() {
    setSecretModal(false)
    addLines([{ type: 'accent', text: '접속 중...' }])
    setTimeout(() => {
      setOpen(false)
      sessionStorage.setItem('secret_auth', '1')
      navigate('/fehe/secret')
    }, 800)
  }

  function processCommand(raw) {
    const cmd = raw.trim().toLowerCase()

    setCmdHistory(h => [raw, ...h])
    setHistIdx(-1)

    const out = []
    out.push({ type: 'input', text: `fehe@site ~ % ${raw}` })

    // ── 인자 포함 명령어 처리 ──
    if (cmd.startsWith('echo ')) {
      out.push({ type: 'output', text: raw.trim().slice(5) })
      addLines(out); return
    }
    if (cmd.startsWith('cat ')) {
      const f = cmd.slice(4).trim()
      if (f === '.bash_history' || f === '~/.bash_history') {
        out.push(
          { type: 'output', text: '    1  cd /home/fehe' },
          { type: 'output', text: '    2  ls -la 인생' },
          { type: 'output', text: '    3  rm -rf 걱정' },
          { type: 'output', text: '    4  git commit -m "오늘도 살아있음"' },
          { type: 'output', text: '    5  ssh 현실  # Connection refused' },
          { type: 'output', text: '    6  cd /vr && ./vrchat' },
          { type: 'output', text: '    7  sleep 99999  # 항상 부족함' },
        )
      } else if (f === 'readme.md' || f === 'readme' || f === './readme.md') {
        out.push(
          { type: 'accent', text: '# 페헤 (Fehe)' },
          { type: 'output', text: '' },
          { type: 'output', text: '2014년부터 인터넷에 존재해온 개발자.' },
          { type: 'output', text: '현실보다 가상에 더 자주 접속합니다.' },
          { type: 'output', text: '' },
          { type: 'output', text: '## 연락처' },
          { type: 'output', text: '이 터미널이 유일한 연락 수단입니다.' },
        )
      } else if (f === '/etc/passwd') {
        out.push(
          { type: 'output', text: 'root:x:0:0:전지전능:/root:/bin/bash' },
          { type: 'output', text: 'fehe:x:1234:1234:페헤,VRChat,개발자:/home/fehe:/bin/zsh' },
          { type: 'output', text: 'visitor:x:9999:9999:당신:/tmp:/bin/false' },
        )
      } else {
        out.push({ type: 'error', text: `cat: ${f}: No such file or directory` })
      }
      addLines(out); return
    }
    if (cmd.startsWith('ssh')) {
      out.push(
        { type: 'error', text: 'ssh: connect to host 현실 port 22: Connection refused' },
        { type: 'output', text: '현실은 이 방향으로 접근할 수 없습니다.' },
      )
      addLines(out); return
    }
    if (cmd.startsWith('curl') || cmd.startsWith('wget')) {
      out.push(
        { type: 'error', text: `${cmd.split(' ')[0]}: (6) Could not resolve host: 현실` },
        { type: 'output', text: '현실 서버가 응답하지 않습니다.' },
      )
      addLines(out); return
    }
    if (cmd.startsWith('chmod')) {
      out.push(
        { type: 'error', text: 'chmod: Operation not permitted' },
        { type: 'output', text: '이 세계의 권한 설정은 변경할 수 없습니다.' },
      )
      addLines(out); return
    }
    if (cmd.startsWith('mkdir')) {
      const name = raw.trim().slice(6).trim() || '폴더'
      const msgs = { '꿈': `mkdir: ${name}: File exists`, '미래': `mkdir: ${name}: Permission denied` }
      out.push({ type: msgs[name] ? 'error' : 'output', text: msgs[name] ?? `mkdir: ${name}: 생성됨 (곧 사라질 수 있음)` })
      addLines(out); return
    }
    if (cmd.startsWith('touch')) {
      const name = raw.trim().slice(6).trim() || '파일'
      out.push({ type: 'output', text: `touch: '${name}' 은 이미 당신의 마음속에 있습니다.` })
      addLines(out); return
    }
    if (cmd.startsWith('git')) {
      if (cmd === 'git log' || cmd === 'git log --oneline') {
        out.push(
          { type: 'accent', text: 'commit 3f4a8b2 (HEAD -> main, origin/main)' },
          { type: 'output', text: 'Author: 페헤 <fehe@internet.life>' },
          { type: 'output', text: 'Date:   오늘' },
          { type: 'output', text: '' },
          { type: 'output', text: '    feat: 오늘도 살아있음' },
          { type: 'output', text: '' },
          { type: 'accent', text: 'commit a1b2c3d' },
          { type: 'output', text: 'Author: 페헤 <fehe@internet.life>' },
          { type: 'output', text: 'Date:   며칠 전' },
          { type: 'output', text: '' },
          { type: 'output', text: '    fix: 현실 버그 수정 시도 (실패)' },
          { type: 'output', text: '' },
          { type: 'accent', text: 'commit f76baa6' },
          { type: 'output', text: 'Author: 페헤 <fehe@internet.life>' },
          { type: 'output', text: 'Date:   2014' },
          { type: 'output', text: '' },
          { type: 'output', text: '    init: 페헤라는 이름으로 인터넷 시작' },
        )
      } else if (cmd === 'git status') {
        out.push(
          { type: 'accent', text: 'On branch main' },
          { type: 'output', text: "Your branch is ahead of '현실' by 3,650 commits." },
          { type: 'output', text: '' },
          { type: 'output', text: 'Changes not staged for commit:' },
          { type: 'error',  text: '        modified:   삶.txt' },
          { type: 'error',  text: '        modified:   꿈.md' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Untracked files:' },
          { type: 'info',   text: '        미래.unknown' },
        )
      } else if (cmd === 'git diff') {
        out.push(
          { type: 'info',   text: 'diff --git a/삶.txt b/삶.txt' },
          { type: 'output', text: '--- a/삶.txt' },
          { type: 'output', text: '+++ b/삶.txt' },
          { type: 'output', text: '@@ -1,2 +1,3 @@' },
          { type: 'error',  text: '-현실이 가끔 힘들다' },
          { type: 'accent', text: '+현실이 가끔 힘들지만' },
          { type: 'accent', text: '+VRChat이 있다' },
        )
      } else if (cmd.startsWith('git push')) {
        out.push(
          { type: 'output', text: 'Enumerating objects: 3, done.' },
          { type: 'output', text: 'Counting objects: 100% (3/3), done.' },
          { type: 'error',  text: '! [rejected]  main -> 현실 (non-fast-forward)' },
          { type: 'output', text: 'hint: 마음은 fast-forward 되지 않습니다.' },
        )
      } else {
        out.push(
          { type: 'output', text: 'usage: git <command> [<args>]' },
          { type: 'output', text: '' },
          { type: 'output', text: '자주 쓰는 명령어:' },
          { type: 'accent', text: '  git log      인생 로그 확인' },
          { type: 'accent', text: '  git status   현재 상태 확인' },
          { type: 'accent', text: '  git diff      달라진 것들' },
          { type: 'accent', text: '  git push      마음 전달 (실패율 높음)' },
        )
      }
      addLines(out); return
    }
    if (cmd.startsWith('npm')) {
      if (cmd === 'npm start') {
        out.push(
          { type: 'accent', text: '> fehe@2014 start' },
          { type: 'output', text: '삶 시작됨  (경고: 불확실성 및 랜덤 이벤트 포함)' },
        )
      } else if (cmd.startsWith('npm install')) {
        const pkg = raw.trim().slice(12).trim() || '패키지'
        out.push(
          { type: 'output', text: `npm warn ERESOLVE could not resolve '${pkg}'` },
          { type: 'error',  text: `npm error 404 Not Found - '${pkg}' is not in this registry` },
          { type: 'output', text: '행복 패키지는 npm에 없습니다. 직접 만드세요.' },
        )
      } else if (cmd === 'npm run build') {
        out.push(
          { type: 'output', text: '> fehe@2014 build' },
          { type: 'output', text: 'Building 미래...' },
          { type: 'error',  text: "error TS2304: Cannot find name '확신'" },
          { type: 'output', text: '미래는 여전히 undefined 입니다.' },
        )
      } else {
        out.push({ type: 'output', text: 'npm <command>' },
          { type: 'accent', text: '  start    삶 시작' },
          { type: 'accent', text: '  install  패키지 설치 (행복 없음)' },
          { type: 'accent', text: '  build    미래 빌드 (항상 실패)' },
        )
      }
      addLines(out); return
    }
    if (cmd.startsWith('man ')) {
      const topic = cmd.slice(4).trim()
      if (topic === 'fehe') {
        out.push(
          { type: 'info',   text: 'FEHE(1)               사용자 매뉴얼               FEHE(1)' },
          { type: 'output', text: '' },
          { type: 'output', text: 'NAME' },
          { type: 'output', text: '       fehe - 인터넷에 사는 개발자' },
          { type: 'output', text: '' },
          { type: 'output', text: 'SYNOPSIS' },
          { type: 'output', text: '       fehe [--vr] [--code] [--sleep NEVER]' },
          { type: 'output', text: '' },
          { type: 'output', text: 'DESCRIPTION' },
          { type: 'output', text: '       2014년부터 인터넷에서 활동하는 개발자.' },
          { type: 'output', text: '       현실보다 가상에서 더 잘 작동함.' },
          { type: 'output', text: '' },
          { type: 'output', text: 'BUGS' },
          { type: 'output', text: '       가끔 현실을 잊음. 의도된 동작일 수 있음.' },
        )
      } else {
        out.push({ type: 'error', text: `No manual entry for ${topic}` })
      }
      addLines(out); return
    }
    if (cmd.startsWith('sudo ') && !cmd.includes('rm -rf')) {
      out.push(
        { type: 'error', text: `sudo: 페헤만 sudo 권한이 있습니다.` },
        { type: 'error', text: '이 사건은 기록되었습니다.' },
      )
      addLines(out); return
    }

    switch (cmd) {
      case 'help':
        out.push(
          { type: 'info', text: '┌─ 사용 가능한 명령어 ─────────────────────┐' },
          { type: 'info', text: '│  help      명령어 목록                    │' },
          { type: 'info', text: '│  whoami    이게 누구 터미널이죠?           │' },
          { type: 'info', text: '│  fehe      페헤에 대해                    │' },
          { type: 'info', text: '│  pwd       현재 경로                      │' },
          { type: 'info', text: '│  ls        페이지 목록                    │' },
          { type: 'info', text: '│  cat       파일 읽기                      │' },
          { type: 'info', text: '│  echo      텍스트 출력                    │' },
          { type: 'info', text: '│  mkdir     디렉터리 생성                  │' },
          { type: 'info', text: '│  touch     파일 생성                      │' },
          { type: 'info', text: '│  chmod     권한 변경                      │' },
          { type: 'info', text: '│  ps        프로세스 목록                  │' },
          { type: 'info', text: '│  top       시스템 모니터                  │' },
          { type: 'info', text: '│  uname     시스템 정보                    │' },
          { type: 'info', text: '│  uptime    가동 시간                      │' },
          { type: 'info', text: '│  neofetch  시스템 요약                    │' },
          { type: 'info', text: '│  env       환경 변수                      │' },
          { type: 'info', text: '│  alias     단축 명령어 목록               │' },
          { type: 'info', text: '│  history   명령어 기록                    │' },
          { type: 'info', text: '│  git       버전 관리                      │' },
          { type: 'info', text: '│  npm       패키지 관리자                  │' },
          { type: 'info', text: '│  vim       텍스트 에디터 (탈출 주의)      │' },
          { type: 'info', text: '│  ssh       원격 접속                      │' },
          { type: 'info', text: '│  curl      HTTP 요청                      │' },
          { type: 'info', text: '│  man       매뉴얼                         │' },
          { type: 'info', text: '│  vr        VRChat 이야기                  │' },
          { type: 'info', text: '│  music     현재 재생 중인 곡              │' },
          { type: 'info', text: '│  date      현재 시각                      │' },
          { type: 'info', text: '│  ping      연결 테스트                    │' },
          { type: 'info', text: '│  matrix    ???                            │' },
          { type: 'info', text: '│  clear     화면 지우기                    │' },
          { type: 'info', text: '│  exit      터미널 닫기                    │' },
          { type: 'info', text: '└───────────────────────────────────────────┘' },
        )
        break

      case 'whoami':
        out.push(
          { type: 'output', text: '페헤 (Fehe)' },
          { type: 'output', text: '개발자 · 인플루언서 · 커뮤니티 빌더' },
          { type: 'output', text: 'uid=1234(fehe) gid=1234(fehe) groups=developer,creator' },
        )
        break

      case 'fehe':
        out.push(
          { type: 'output', text: '안녕하세요! 저는 페헤입니다.' },
          { type: 'output', text: '2014년부터 인터넷 활동을 해온 개발자입니다.' },
          { type: 'output', text: '' },
          { type: 'output', text: '현실이 답답할 때, 그 사람이 매일 찾아가는 세계가 있다.' },
        )
        break

      case 'vr': {
        out.length = 0
        const steps = [
          [0,    [{ type: 'input',  text: `fehe@site ~ % ${raw}` },
                  { type: 'output', text: '[SYS] VRChat 클라이언트 초기화 중...' }]],
          [400,  [{ type: 'accent', text: '[OK]  Steam 연결됨' },
                  { type: 'accent', text: '[OK]  헤드셋 감지: Meta Quest 2  ↔  USB 3.0' },
                  { type: 'accent', text: '[OK]  컨트롤러 페어링: L ✔  R ✔' }]],
          [900,  [{ type: 'error',  text: '[!!]  경고: 현실 감각이 일시적으로 차단됩니다.' },
                  { type: 'output', text: '' },
                  { type: 'output', text: '      월드 불러오는 중...' },
                  { type: 'progress', duration: 2.8 }]],
          [3900, [{ type: 'accent', text: '[OK]  로드 완료  ✔' },
                  { type: 'output', text: '' },
                  { type: 'output', text: '      월드: 어느 조용한 카페  ·  5 / 10명  ·  ping 9ms' },
                  { type: 'output', text: '' },
                  { type: 'output', text: '      아바타 스폰 중...' }]],
          [4600, [{ type: 'accent', text: '[OK]  페헤 v4.2 로드됨  (물리 연산: ON)' },
                  { type: 'output', text: '' },
                  { type: 'info',   text: '      ── 입 장 완 료 ──' },
                  { type: 'output', text: '' }]],
          [5300, [{ type: 'output', text: '      > 누군가 손을 흔들며 인사한다.' }]],
        ]
        steps.forEach(([delay, ls]) => setTimeout(() => addLines(ls), delay))
        setTimeout(() => setVrNovel(true), 6400)
        addLines(out)
        return
      }

      case 'ls':
        out.push(
          { type: 'output', text: 'total 3' },
          { type: 'output', text: 'drwxr-xr-x  /           →  홈' },
          { type: 'output', text: 'drwxr-xr-x  /youtube    →  YouTube 영상' },
          { type: 'output', text: 'drwxr-xr-x  /hobby      →  취미' },
        )
        break

      case 'music':
        out.push(
          { type: 'output', text: '♪ Now Playing ──────────────────' },
          { type: 'accent', text: '  ray (超かぐや姫！ Version) — Ray' },
          { type: 'output', text: '  우하단 플레이어에서 볼륨 조절 가능' },
        )
        break

      case 'date':
        out.push({ type: 'output', text: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) + ' (KST)' })
        break

      case 'ping': {
        out.push(
          { type: 'output', text: 'PING fehe-self-introduction.vercel.app' },
          { type: 'output', text: '접속 정보 확인 중...' },
        )
        addLines(out)

        fetch('https://api.ipify.org?format=json')
          .then(r => r.json())
          .then(data => {
            const ua = navigator.userAgent
            let browser = '알 수 없음'
            if (ua.includes('Edg/'))     browser = 'Microsoft Edge'
            else if (ua.includes('OPR/') || ua.includes('Opera/')) browser = 'Opera'
            else if (ua.includes('Chrome/'))  browser = 'Chrome'
            else if (ua.includes('Firefox/')) browser = 'Firefox'
            else if (ua.includes('Safari/'))  browser = 'Safari'

            let os = '알 수 없음'
            if (ua.includes('Windows NT'))        os = 'Windows'
            else if (ua.includes('Mac OS X'))     os = 'macOS'
            else if (ua.includes('Android'))      os = 'Android'
            else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
            else if (ua.includes('Linux'))        os = 'Linux'

            const t1 = Math.floor(Math.random() * 20 + 1)
            const t2 = Math.floor(Math.random() * 20 + 1)
            addLines([
              { type: 'accent', text: `64 bytes from ${data.ip}: icmp_seq=1 ttl=64 time=${t1}ms` },
              { type: 'accent', text: `64 bytes from ${data.ip}: icmp_seq=2 ttl=64 time=${t2}ms` },
              { type: 'output', text: '--- ping statistics ---' },
              { type: 'output', text: `2 packets transmitted, 2 received, avg ${Math.round((t1+t2)/2)}ms` },
              { type: 'output', text: '' },
              { type: 'info',   text: `접속 IP  :  ${data.ip}` },
              { type: 'info',   text: `브라우저 :  ${browser}` },
              { type: 'info',   text: `운영체제 :  ${os}` },
            ])
          })
          .catch(() => {
            const t1 = Math.floor(Math.random() * 20 + 1)
            const t2 = Math.floor(Math.random() * 20 + 1)
            addLines([
              { type: 'accent', text: `64 bytes: icmp_seq=1 ttl=64 time=${t1}ms` },
              { type: 'accent', text: `64 bytes: icmp_seq=2 ttl=64 time=${t2}ms` },
              { type: 'output', text: '--- ping statistics ---' },
              { type: 'output', text: '2 packets transmitted, 2 received, 0% packet loss' },
              { type: 'error',  text: 'IP 주소를 가져올 수 없습니다. (네트워크 오류)' },
            ])
          })
        return
      }

      case 'matrix':
        out.push({ type: 'accent', text: '빨간 약을 먹으시겠습니까? (y/n) ... y' })
        out.push({ type: 'output', text: '현실에 오신 것을 환영합니다.' })
        setMatrix(true)
        break

      case 'secret':
        addLines(out)
        setSecretModal(true)
        return

      case 'pwd':
        out.push({ type: 'output', text: '/home/fehe/internet/2014–present' })
        break

      case 'uname':
      case 'uname -a':
        out.push({ type: 'output', text: 'FehOS 2.14.0 페헤-PC #1 SMP 2014 x86_64 GNU/감성' })
        break

      case 'uptime':
        out.push(
          { type: 'output', text: `up 10 years, 3 months  load average: 0.42, 0.37, 0.41` },
          { type: 'output', text: '현재 접속자: 1명 (당신)' },
        )
        break

      case 'neofetch': {
        const art = [
          '      .  *  .    ',
          '   *    .    *   ',
          '  .  *    .  .   ',
          '    .  *  .   *  ',
          '  *  .  .   .  . ',
          '  .   *    *  .  ',
          '    .   .  .  *  ',
          '  *  .   .   .   ',
          '    .  *  .  .   ',
        ]
        const info = [
          '\x1b페헤@terminal',
          '─────────────────────',
          'OS: FehOS 2026 (감성 에디션)',
          'Host: 인터넷 어딘가',
          'Uptime: 2014년부터 현재까지',
          'Shell: zsh 5.9 (감성 모드)',
          'Terminal: 페헤 v1.0.0',
          'CPU: 감성 코어 × 4  @3.14GHz',
          'Memory: 추억 12.8GB / ∞ GB',
        ]
        art.forEach((a, i) => {
          const label = info[i] ?? ''
          out.push({ type: i < 2 ? 'accent' : 'output', text: `${a}  ${label}` })
        })
        break
      }

      case 'ps':
      case 'ps aux':
      case 'ps -aux':
        out.push(
          { type: 'info',   text: '  PID  TTY        TIME  CMD' },
          { type: 'output', text: '    1  ?       00:00:01  init (페헤의 일상)' },
          { type: 'output', text: '   42  ?       01:23:07  vrchat (현실 탈출 중)' },
          { type: 'output', text: '  314  pts/0   03:14:15  coding (프로젝트 n개)' },
          { type: 'error',  text: '  404  ?       ??:??:??  sleep (항상 부족함)' },
          { type: 'accent', text: ' 1337  pts/1   00:00:00  terminal (지금 이거)' },
        )
        break

      case 'top':
      case 'htop':
        out.push(
          { type: 'info',   text: '  페헤@terminal  ─  Tasks: 4 total  ─  load: 0.42' },
          { type: 'output', text: '' },
          { type: 'output', text: '  PID   %CPU  %MEM  CMD' },
          { type: 'accent', text: '   42   78.3   3.2  vrchat' },
          { type: 'output', text: '  314   12.1   1.8  coding' },
          { type: 'error',  text: '  404    0.0   9.9  생각 (백그라운드)' },
          { type: 'output', text: ' 1337    0.1   0.1  terminal' },
        )
        break

      case 'history':
        if (cmdHistory.length === 0) {
          out.push({ type: 'output', text: '(이번 세션에 입력한 명령어가 없습니다.)' })
        } else {
          cmdHistory.slice().reverse().forEach((c, i) =>
            out.push({ type: 'output', text: `  ${String(i + 1).padStart(3)}  ${c}` })
          )
        }
        break

      case 'alias':
        out.push(
          { type: 'output', text: "alias ll='ls -alF'" },
          { type: 'output', text: "alias vr='접속 --현실탈출'" },
          { type: 'output', text: "alias gs='git status'" },
          { type: 'output', text: "alias ..='cd ..  # 과거로는 돌아갈 수 없음'" },
          { type: 'output', text: "alias 꿈='sleep 99999'" },
        )
        break

      case 'env':
      case 'export':
        out.push(
          { type: 'output', text: 'USER=페헤' },
          { type: 'output', text: 'HOME=/home/fehe/internet' },
          { type: 'output', text: 'SHELL=/bin/zsh' },
          { type: 'output', text: 'LANG=ko_KR.UTF-8' },
          { type: 'output', text: 'TERM=xterm-256감성' },
          { type: 'output', text: 'MOOD=오늘도_괜찮음' },
          { type: 'output', text: 'REALITY=선택사항' },
          { type: 'output', text: 'VR=필수' },
        )
        break

      case 'vim':
      case 'vi':
      case 'nano':
        addLines(out)
        setVimMode(true)
        setVimInput('')
        setVimMsg('')
        return

      case 'sudo rm -rf /':
      case 'sudo rm -rf':
      case 'rm -rf /':
        out.push(
          { type: 'error', text: 'rm: /: Operation not permitted' },
          { type: 'error', text: '이 사이트는 파괴되지 않습니다. 😤' },
        )
        break

      case 'clear':
        setLines([
          { type: 'system', text: '페헤 터미널 v1.0.0' },
          { type: 'system', text: '' },
        ])
        return

      case 'exit':
      case 'close':
      case 'quit':
        setOpen(false)
        return

      case '':
        setLines(prev => [...prev, { type: 'input', text: 'fehe@site ~ %' }])
        return

      default:
        out.push({ type: 'error', text: `zsh: command not found: ${raw}` })
        out.push({ type: 'error', text: `'help'를 입력해 명령어 목록을 확인하세요.` })
    }

    addLines(out)
  }

  function handleVimKeyDown(e) {
    if (e.key === 'Enter') {
      const v = vimInput.trim()
      if (v === ':q!' || v === ':q' || v === ':qa') {
        setVimMode(false)
        setVimInput('')
        addLines([
          { type: 'input',  text: 'fehe@site ~ % vim' },
          { type: 'output', text: 'vim 종료됨. 수정 사항은 저장되지 않았습니다.' },
          { type: 'output', text: '(삶도 가끔 이렇게 닫힙니다.)' },
        ])
      } else if (v === ':wq' || v === ':x') {
        setVimMode(false)
        setVimInput('')
        addLines([
          { type: 'input',  text: 'fehe@site ~ % vim' },
          { type: 'accent', text: '저장 완료. 하지만 파일을 찾을 수 없습니다.' },
          { type: 'output', text: '(어쩌면 저장된 건 마음속 어딘가일 수도.)' },
        ])
      } else if (v === ':help' || v === ':h') {
        setVimMsg(':q! 로 나갈 수 있습니다. (처음엔 다들 모릅니다.)')
        setVimInput('')
      } else if (v.startsWith(':')) {
        setVimMsg(`E492: Not an editor command: ${v}`)
        setVimInput('')
      } else {
        setVimInput('')
      }
    } else if (e.key === 'Escape') {
      setVimInput('')
      setVimMsg('-- NORMAL --  (나가려면 :q! + Enter)')
    } else if (e.key === '`') {
      e.preventDefault()
    }
  }

  function handleKeyDown(e) {
    if (vimMode) { handleVimKeyDown(e); return }
    if (e.key === 'Enter') {
      processCommand(input)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHistIdx(i => {
        const next = Math.min(i + 1, cmdHistory.length - 1)
        setInput(cmdHistory[next] ?? '')
        return next
      })
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHistIdx(i => {
        const next = Math.max(i - 1, -1)
        setInput(next === -1 ? '' : (cmdHistory[next] ?? ''))
        return next
      })
    } else if (e.key === 'Escape') {
      if (vrNovel) { setVrNovel(false); return }
      if (secretModal) { setSecretModal(false); return }
      setOpen(false)
    } else if (e.key === '`') {
      e.preventDefault()
      setOpen(false)
    }
  }

  return (
    <>
      {matrix && <MatrixRain onDone={() => setMatrix(false)} />}

      {open && (
        <div className="ee-backdrop" onClick={() => setOpen(false)}>
          <div className="ee-terminal" onClick={e => e.stopPropagation()}>

            <div className="ee-titlebar">
              <div className="ee-dots">
                <span className="ee-dot red" onClick={() => setOpen(false)} title="닫기" />
                <span className="ee-dot yellow" />
                <span className="ee-dot green" />
              </div>
              <span className="ee-title">fehe@terminal — zsh</span>
              <span style={{ width: 52 }} />
            </div>

            <div className="ee-body" onClick={() => inputRef.current?.focus()}>
              {lines.map((line, i) => (
                line.type === 'progress' ? (
                  <div key={i} className="ee-progress-wrap">
                    <div className="ee-progress-fill" style={{ animationDuration: `${line.duration}s` }} />
                  </div>
                ) : (
                  <div key={i} className={`ee-line ee-line-${line.type}`}>
                    {line.text || '\u00A0'}
                  </div>
                )
              ))}
              <div ref={bottomRef} />
            </div>

            {vimMode ? (
              <div className="ee-vim">
                <div className="ee-vim-body">
                  <div className="ee-vim-titlebar">[No Name]                                        0,0-1   All</div>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="ee-vim-tilde">~</div>
                  ))}
                </div>
                <div className="ee-vim-statusbar">-- INSERT --</div>
                <div className="ee-vim-cmdline">
                  <input
                    ref={inputRef}
                    className="ee-vim-input"
                    value={vimInput}
                    onChange={e => { setVimInput(e.target.value); setVimMsg('') }}
                    onKeyDown={handleKeyDown}
                    placeholder={vimMsg || '명령 모드: ESC  /  저장 후 종료: :wq  /  강제 종료: :q!'}
                    spellCheck={false}
                    autoComplete="off"
                  />
                </div>
              </div>
            ) : (
            <div className="ee-input-row">
              <span className="ee-prompt">fehe@site ~ %</span>
              <input
                ref={inputRef}
                className="ee-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
              />
            </div>
            )}

            {vrNovel && (
              <VRNovel onEnd={() => {
                setVrNovel(false)
                addLines([
                  { type: 'output', text: '' },
                  { type: 'output', text: '      > 접속이 종료됩니다.' },
                  { type: 'output', text: '' },
                ])
              }} />
            )}

            {secretModal && (
              <SecretModal
                onClose={() => setSecretModal(false)}
                onSuccess={handleSecretSuccess}
              />
            )}

          </div>
        </div>
      )}
    </>
  )
}
