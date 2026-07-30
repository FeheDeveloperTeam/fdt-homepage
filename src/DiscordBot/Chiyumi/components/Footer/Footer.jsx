import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="chiyumi-footer">
      <p>&copy; {year} <span>치유미 (Chiyumi)</span> · Developed by FeheDeveloperTeam</p>
    </footer>
  )
}
