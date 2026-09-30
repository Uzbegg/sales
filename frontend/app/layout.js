import './globals.css'

const links=[['/','Dashboard'],['/leads','Лиды'],['/campaigns','Кампании'],['/inbox','Inbox'],['/telegram','Telegram Accounts']]

export default function RootLayout({children}){
  return <html lang="ru"><body><div className="shell">
    <aside className="side"><div className="brand">Infinity Sales</div><nav className="nav">{links.map(([href,label])=><a key={href} href={href}>{label}</a>)}</nav></aside>
    <main className="main">{children}</main>
  </div></body></html>
}
