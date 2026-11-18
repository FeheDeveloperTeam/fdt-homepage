import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="suneung-footer">
      <p>
        &copy; {year} <span>수능 카운트다운</span> · Developed by FeheDeveloperTeam
      </p>
    </footer>
  )
}
