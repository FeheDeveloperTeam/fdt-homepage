import { Link } from 'react-router-dom'
import Seo from '../../components/Seo/Seo'
import styles from './NotFound.module.css'

function NotFound() {
  return (
    <section className={styles.notFound}>
      <Seo
        title="페이지를 찾을 수 없음"
        description="요청하신 페이지를 찾을 수 없습니다."
        path="/404"
        noindex
      />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>404</p>
        <h1 className={styles.title}>페이지를 찾을 수 없어요</h1>
        <p className={styles.description}>
          주소가 잘못됐거나, 페이지가 이동 또는 삭제되었을 수 있어요.
        </p>

        <div className={styles.actions}>
          <Link to="/" className={styles.primaryButton}>
            홈으로 가기
          </Link>
          <Link to="/contact" className={styles.secondaryButton}>
            문의하기
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NotFound
