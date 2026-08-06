import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mcwiki-footer">
      <p>&copy; {year} <span>마인크래프트 위키</span> · Developed by FeheDeveloperTeam</p>
    </footer>
  )
}
