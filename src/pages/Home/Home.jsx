import Seo from '../../components/Seo/Seo'
import Hero from '../../components/Hero/Hero'
import TeamValues from '../../components/TeamValues/TeamValues'
import { SEO_DATA } from '../../seoData'

function Home() {
  return (
    <>
      <Seo {...SEO_DATA['/']} path="/" />
      <Hero />
      <TeamValues />
    </>
  )
}

export default Home
