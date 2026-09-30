import './globals.css'
import Link from 'next/link'

const links=[
  ['/','Dashboard'],
  ['/leads','Лиды'],
  ['/campaigns','Кампании'],
  ['/inbox','Inbox'],
  ['/templates','Шаблоны'],
  ['/products','Продукты'],
  ['/telegram','Telegram Accounts']
]

export default function RootLayout({children}){
  return <html lang="ru"><body><div className="shell">
    <aside className="side">
      <div className="brand">Infinity <span>Sales</span></div>
      <div className="sideCaption">Equipment sales CRM</div>
      <nav className="nav">
        {links.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}
      </nav>
      <div className="sideBottom"><div className="onlineDot"/> DEMO MODE</div>
    </aside>
    <main className="main">{children}</main>
  </div></body></html>
}
