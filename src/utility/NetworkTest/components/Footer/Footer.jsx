import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="nettest-footer">
      <p>&copy; {year} <span>네트워크 테스트</span> · Developed by FeheDeveloperTeam</p>
    </footer>
  )
}
