import Seo from '../../components/Seo/Seo'
import Hero from '../../components/Hero/Hero'
import TeamValues from '../../components/TeamValues/TeamValues'

function Home() {
  return (
    <>
      <Seo
        title="FeheDeveloperTeam"
        description="디스코드 봇 개발과 웹 개발을 중심으로 하는 프리랜서 개발팀 FDT입니다."
        path="/"
      />
      <Hero />
      <TeamValues />
    </>
  )
}

export default Home
