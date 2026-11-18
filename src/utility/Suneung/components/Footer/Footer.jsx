import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="suneung-footer">
      <p>
        &copy; {year} <span>수능 D-Day 타이머</span> · Developed by FeheDeveloperTeam
      </p>
    </footer>
  )
}
