import Seo from '../../components/Seo/Seo'
import Hero from '../../components/Hero/Hero'
import TeamValues from '../../components/TeamValues/TeamValues'

function Home() {
  return (
    <>
      <Seo
        title="FeheDeveloperTeam"
        description="디스코드 봇 개발과 웹 개발을 중심으로, 직접 기획한 프로젝트를 만들어가는 개발팀 FDT입니다."
        path="/"
      />
      <Hero />
      <TeamValues />
    </>
  )
}

export default Home
