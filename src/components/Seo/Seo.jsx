import { Helmet } from 'react-helmet-async'

const SITE_URL = 'https://www.fehe.dev'
const SITE_NAME = 'FeheDeveloperTeam'

function Seo({ title, description, path = '/' }) {
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`
  const url = `${SITE_URL}${path}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />

      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  )
}

export default Seo
