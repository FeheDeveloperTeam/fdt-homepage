import { Link } from 'react-router-dom'
import Seo from '../../components/Seo/Seo'
import styles from './YukihaPage.module.css'

function YukihaPage() {
  return (
    <section className={styles.page}>
      <Seo
        title="유키하"
        description="유키하의 자기소개 페이지는 아직 준비 중입니다."
        path="/member/yukiha"
        noindex
      />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>유키하</p>
        <h1 className={styles.title}>아직 자기소개서를 만들지 않았어요</h1>
        <p className={styles.description}>
          유키하의 소개 페이지는 아직 준비 중입니다. 완성되면 이 자리에서 만나보실 수 있어요.
        </p>

        <Link to="/about" className={styles.backButton}>
          ← 팀 소개로 돌아가기
        </Link>
      </div>
    </section>
  )
}

export default YukihaPage
