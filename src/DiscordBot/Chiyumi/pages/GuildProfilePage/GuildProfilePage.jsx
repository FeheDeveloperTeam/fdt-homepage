import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { callGuildApi } from '../guildApi'
import { fileToDataUri } from './imageData'
import '../AdminForm.css'
import '../../components/GuildSettings/GuildSettings.css'
import './GuildProfilePage.css'

// 유료: 이 서버에서만 보이는 치유미 프로필(이름·프로필 사진·배너·소개글)을 바꾼다.
// 이용권은 운영자가 구글 시트 「유료이용권」 탭에 적고, 여기서는 읽기만 한다(api/_lib/premiumSheets.js).
const NICK_MAX = 32
const BIO_MAX = 190

function SubscriptionBox({ subscription }) {
  if (subscription.active) {
    return (
      <p className="gp-sub gp-sub--on">
        ✅ 이용 중 · 만료일 <strong>{subscription.endDate}</strong>
        {subscription.daysLeft === 0 ? ' (오늘까지)' : ` (${subscription.daysLeft}일 남음)`}
      </p>
    )
  }
  return (
    <div className="gp-sub gp-sub--off">
      <p>
        <strong>이 서버에는 이용권이 없어요.</strong>
        {subscription.endDate ? ` (${subscription.endDate}에 끝났어요)` : ''}
      </p>
      <p>
        봇 프로필 꾸미기는 서버마다 한 달 단위로 쓰는 유료 기능이에요. 이용 신청과 문의는{' '}
        <a href="mailto:help@fehe.dev">help@fehe.dev</a>로 보내주세요.
      </p>
    </div>
  )
}

function Preview({ profile, nick, bio }) {
  const banner = profile.bannerUrl || profile.defaultBannerUrl
  return (
    <div className="gp-card" aria-label="미리보기">
      <div className="gp-card-banner" style={banner ? { backgroundImage: `url(${banner})` } : undefined} />
      <img className="gp-card-avatar" src={profile.avatarUrl || profile.defaultAvatarUrl} alt="" />
      <div className="gp-card-body">
        <p className="gp-card-name">
          {nick || profile.defaultName} <span className="gp-card-tag">APP</span>
        </p>
        <p className="gp-card-bio">{bio || '소개글 없음'}</p>
      </div>
    </div>
  )
}

function ImagePicker({ label, desc, kind, currentUrl, disabled, onSave }) {
  const [pending, setPending] = useState(null)
  const [error, setError] = useState(null)

  async function pick(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError(null)
    try {
      setPending(await fileToDataUri(file, kind))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="guild-section">
      <p className="guild-section-title">{label}</p>
      <p className="guild-section-desc">{desc}</p>
      <div className={`gp-image gp-image--${kind}`}>
        {pending || currentUrl ? <img src={pending || currentUrl} alt="" /> : <span>기본 이미지 사용 중</span>}
      </div>
      {error && <p className="admin-status admin-status--error">{error}</p>}
      <div className="admin-actions">
        <label className={`admin-btn admin-btn--neutral gp-file${disabled ? ' is-disabled' : ''}`}>
          이미지 고르기
          <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={pick} disabled={disabled} hidden />
        </label>
        <button
          type="button"
          className="admin-btn admin-btn--accent"
          disabled={disabled || !pending}
          onClick={async () => {
            if (await onSave(pending)) setPending(null)
          }}
        >
          적용
        </button>
        {currentUrl && (
          <button type="button" className="admin-btn admin-btn--neutral" disabled={disabled} onClick={() => onSave(null)}>
            기본으로
          </button>
        )}
      </div>
    </div>
  )
}

export default function GuildProfilePage() {
  useDocumentTitle('봇 프로필', 'Chiyumi')
  const { guildId } = useOutletContext()

  const [state, setState] = useState(null)
  const [nick, setNick] = useState('')
  const [bio, setBio] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)
  const [loadError, setLoadError] = useState(null)

  function apply(data) {
    setState(data)
    setNick(data.profile.nick)
    setBio(data.profile.bio)
  }

  useEffect(() => {
    callGuildApi(`/api/guild?resource=profile&guildId=${guildId}`)
      .then(apply)
      .catch((err) => setLoadError(err.message))
  }, [guildId])

  async function send(action, value, doneText) {
    setBusy(true)
    setStatus(null)
    try {
      const data = await callGuildApi(`/api/guild?resource=profile&guildId=${guildId}`, {
        method: 'POST',
        body: JSON.stringify({ action, value }),
      })
      apply(data)
      setStatus({ type: 'success', text: doneText })
      return true
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
      return false
    } finally {
      setBusy(false)
    }
  }

  if (loadError) return <p className="admin-status admin-status--error">{loadError}</p>
  if (!state) return <p className="admin-page-desc">불러오는 중…</p>

  const { subscription, profile } = state
  const locked = busy || !subscription.active
  const hasCustom = Boolean(profile.nick || profile.bio || profile.avatarUrl || profile.bannerUrl)

  return (
    <div>
      <p className="eyebrow">Premium</p>
      <h1 className="admin-page-title">봇 프로필 꾸미기</h1>
      <p className="admin-page-desc">
        이 서버에서만 보이는 치유미의 이름, 프로필 사진, 배너, 소개글을 바꿔요. 다른 서버의 치유미는 그대로예요.
        디스코드·다른 사람을 사칭하거나 부적절한 이미지는 쓸 수 없고, 운영자가 해제할 수 있어요(
        <Link to="/DiscordBot/Chiyumi/terms">이용약관</Link>).
      </p>

      <SubscriptionBox subscription={subscription} />
      {status && <p className={`admin-status admin-status--${status.type}`}>{status.text}</p>}

      <div className="gp-layout">
        <div className="gp-preview">
          <p className="guild-section-title">미리보기</p>
          <Preview profile={profile} nick={nick} bio={bio} />
          {hasCustom && (
            <button
              type="button"
              className="admin-btn admin-btn--danger gp-reset"
              disabled={busy}
              onClick={() => send('reset', null, '기본 치유미로 되돌렸어요.')}
            >
              기본 치유미로 모두 되돌리기
            </button>
          )}
        </div>

        <div className="gp-forms">
          <div className="guild-section">
            <p className="guild-section-title">이름</p>
            <p className="guild-section-desc">서버 멤버 목록과 채팅에 보이는 이름이에요. 비우면 기본 이름(치유미)으로 돌아가요.</p>
            <label className="admin-field">
              <span>이름 ({nick.length}/{NICK_MAX})</span>
              <input value={nick} maxLength={NICK_MAX} disabled={locked} onChange={(e) => setNick(e.target.value)} placeholder={profile.defaultName} />
            </label>
            <div className="admin-actions">
              <button type="button" className="admin-btn admin-btn--accent" disabled={locked || nick === profile.nick} onClick={() => send('nick', nick, '이름을 바꿨어요.')}>
                적용
              </button>
            </div>
          </div>

          <div className="guild-section">
            <p className="guild-section-title">소개글</p>
            <p className="guild-section-desc">프로필을 눌렀을 때 보이는 글이에요.</p>
            <label className="admin-field">
              <span>소개글 ({bio.length}/{BIO_MAX})</span>
              <textarea rows={4} value={bio} maxLength={BIO_MAX} disabled={locked} onChange={(e) => setBio(e.target.value)} />
            </label>
            <div className="admin-actions">
              <button type="button" className="admin-btn admin-btn--accent" disabled={locked || bio === profile.bio} onClick={() => send('bio', bio, '소개글을 바꿨어요.')}>
                적용
              </button>
            </div>
          </div>

          <ImagePicker
            label="프로필 사진"
            desc="정사각형으로 잘라 512×512로 올려요. 움직이는 GIF는 3MB까지 그대로 올라가요."
            kind="avatar"
            currentUrl={profile.avatarUrl}
            disabled={locked}
            onSave={(value) => send('avatar', value, value ? '프로필 사진을 바꿨어요.' : '프로필 사진을 기본으로 되돌렸어요.')}
          />
          <ImagePicker
            label="배너"
            desc="프로필 위쪽 배경이에요. 5:2 비율(960×384)로 잘라 올려요. 움직이는 GIF는 3MB까지 그대로 올라가요."
            kind="banner"
            currentUrl={profile.bannerUrl}
            disabled={locked}
            onSave={(value) => send('banner', value, value ? '배너를 바꿨어요.' : '배너를 기본으로 되돌렸어요.')}
          />
        </div>
      </div>

      <p className="admin-page-desc gp-note">
        디스코드에 반영되기까지 몇 초 걸릴 수 있어요. 짧은 시간에 여러 번 바꾸면 디스코드가 잠시 막을 수 있어요. 이용권 기간이 끝나면
        치유미가 자동으로 기본 프로필로 돌아가요.
      </p>
    </div>
  )
}
