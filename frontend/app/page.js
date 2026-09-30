'use client'
import {useEffect,useMemo,useState} from 'react'
import {demoLeads,demoCampaigns,demoInbox} from '../lib/demo'

const tabs=[
  ['dashboard','Dashboard'],
  ['leads','Лиды'],
  ['campaigns','Кампании'],
  ['inbox','Inbox'],
  ['templates','Шаблоны'],
  ['products','Продукты'],
  ['telegram','Telegram Accounts']
]

export default function Page(){
  const [tab,setTab]=useState('dashboard')
  const [query,setQuery]=useState('')
  const [city,setCity]=useState('Все')
  const [category,setCategory]=useState('Все')

  useEffect(()=>{
    const sync=()=>setTab((location.hash||'#dashboard').slice(1))
    sync(); window.addEventListener('hashchange',sync)
    return()=>window.removeEventListener('hashchange',sync)
  },[])

  const leads=useMemo(()=>demoLeads.filter(x=>
    (x.company+' '+x.first_name+' '+x.phone+' '+x.city+' '+x.category).toLowerCase().includes(query.toLowerCase()) &&
    (city==='Все'||x.city===city) &&
    (category==='Все'||x.category===category)
  ),[query,city,category])

  function Nav(){
    return <aside className="side"><div className="brand">Infinity <span>Sales</span></div><div className="sideCaption">Equipment sales CRM</div><nav className="nav">{tabs.map(([id,label])=><a key={id} className={tab===id?'active':''} href={'#'+id}>{label}</a>)}</nav><div className="sideBottom"><div className="onlineDot"/> DEMO MODE</div></aside>
  }

  function Dashboard(){
    const cards=[['Всего лидов',2450],['Telegram найден',1630],['Связались',185],['Ответили',46]]
    return <><div className="pageHead"><div><h1>Dashboard</h1><p className="muted">Infinity Sales — продажи оборудования через единую базу лидов.</p></div><span className="badge">DEMO</span></div>
    <div className="cards">{cards.map(([k,v])=><div className="card" key={k}><div className="label">{k}</div><div className="metric">{v.toLocaleString('ru-RU')}</div></div>)}</div>
    <div className="grid2">
      <div className="panel"><h3>Активная кампания</h3><div className="campaignTitle">Jordi Shape H9 / Tashkent</div><div className="progress"><span style={{width:'62%'}}/></div><div className="rowBetween"><span className="muted">185 отправлено из 300</span><b>62%</b></div></div>
      <div className="panel"><h3>Воронка сегодня</h3><div className="funnel"><span>Новые <b>128</b></span><span>Ответили <b>19</b></span><span>Интерес <b>7</b></span><span>Переговоры <b>3</b></span></div></div>
    </div>
    <div className="panel"><h3>Как работает система</h3><p>Excel → база лидов → Telegram-проверка → сегмент → персональное сообщение → очередь → Inbox → сделка.</p></div></>
  }

  function Leads(){
    return <><div className="pageHead"><div><h1>Лиды</h1><p className="muted">Загрузка, очистка, сегментация и история контактов.</p></div><button className="btn">+ Добавить лид</button></div>
    <div className="toolbar">
      <input className="input" placeholder="Поиск по базе..." value={query} onChange={e=>setQuery(e.target.value)}/>
      <select className="input" value={city} onChange={e=>setCity(e.target.value)}><option>Все</option><option>Ташкент</option><option>Самарканд</option><option>Бухара</option></select>
      <select className="input" value={category} onChange={e=>setCategory(e.target.value)}><option>Все</option><option>Косметология</option><option>Медицинская клиника</option><option>Лазерная эпиляция</option><option>Коррекция фигуры</option></select>
      <label className="btn secondary">Импорт Excel<input hidden type="file" accept=".xlsx,.xlsm"/></label>
      <button className="btn">Проверить Telegram</button>
    </div>
    <div className="panel tableWrap"><table className="table"><thead><tr><th>Компания</th><th>Контакт</th><th>Телефон</th><th>Город</th><th>Тип</th><th>Telegram</th><th>Статус</th><th>Продукт</th></tr></thead><tbody>{leads.map(x=><tr key={x.id}><td><b>{x.company}</b></td><td>{x.first_name}</td><td>{x.phone}</td><td>{x.city}</td><td>{x.category}</td><td><span className={'status '+x.telegram_status}>{x.telegram_status==='found'?'Найден':'Не проверен'}</span></td><td><span className={'status '+x.status}>{x.status}</span></td><td>{x.product_interest}</td></tr>)}</tbody></table></div></>
  }

  function Campaigns(){
    return <><div className="pageHead"><div><h1>Кампании</h1><p className="muted">Сегменты, персонализированные сообщения и очередь отправки.</p></div><button className="btn">+ Новая кампания</button></div>
    <div className="campaignGrid">{demoCampaigns.map(x=><div className="panel campaignCard" key={x.id}><div className="rowBetween"><span className={'status '+x.status}>{x.status}</span><span className="muted">{x.recipients} лидов</span></div><h3>{x.name}</h3><p className="muted">{x.product}</p><div className="campaignActions"><button className="btn secondary">Открыть</button><button className="btn">Подготовить сообщения</button></div></div>)}</div>
    <div className="panel"><h3>Предпросмотр сообщения</h3><div className="templateBox">Здравствуйте, Малика! Меня зовут Артём, компания Infinity Tech. Увидел Beauty Concept в Ташкенте. Мы занимаемся профессиональным оборудованием для коррекции фигуры. Могу отправить короткое видео и расчёт окупаемости Jordi Shape H9?</div></div></>
  }

  function Inbox(){
    return <><div className="pageHead"><div><h1>Inbox</h1><p className="muted">Все ответы клиентов в одном месте.</p></div></div><div className="inboxLayout"><div className="panel chatList">{demoInbox.map(x=><div className="chatItem" key={x.id}><div className="avatar">{x.name[0]}</div><div><b>{x.company}</b><div className="muted small">{x.name} · {x.text}</div></div><span className="muted small">{x.time}</span></div>)}</div><div className="panel conversation"><div><h3>Beauty Concept</h3><span className="muted">Малика · Ташкент · Jordi Shape H9</span></div><div className="messages"><div className="bubble mine">Здравствуйте, Малика! Меня зовут Артём, компания Infinity Tech...</div><div className="bubble">Да, отправьте, пожалуйста, информацию и цену.</div></div><div className="compose"><input className="input" placeholder="Написать сообщение..."/><button className="btn">Отправить</button></div></div></div></>
  }

  function Templates(){
    return <><div className="pageHead"><div><h1>Шаблоны</h1><p className="muted">Сценарии первого контакта и follow-up.</p></div><button className="btn">+ Новый шаблон</button></div><div className="panel"><h3>Jordi Shape — первое касание</h3><div className="templateBox">Здравствуйте, {'{{first_name}}'}! Меня зовут {'{{manager_name}}'}, компания Infinity Tech. Увидел {'{{company_name}}'} в {'{{city}}'}. Мы занимаемся профессиональным оборудованием для коррекции фигуры. Могу отправить короткое видео и расчёт окупаемости?</div></div></>
  }

  function Products(){
    const products=['Jordi Shape H8','Jordi Shape H9','Endospheres','XFEST 1600','VisBody M60']
    return <><div className="pageHead"><div><h1>Продукты</h1><p className="muted">Карточки оборудования для быстрых сообщений и коммерческих предложений.</p></div><button className="btn">+ Добавить продукт</button></div><div className="productGrid">{products.map((p,i)=><div className="panel" key={p}><div className="productIcon">{i+1}</div><h3>{p}</h3><p className="muted">Описание, цена, видео, PDF и аргументы продаж.</p><button className="btn secondary">Открыть карточку</button></div>)}</div></>
  }

  function Telegram(){
    return <><div className="pageHead"><div><h1>Telegram Accounts</h1><p className="muted">Подключённые рабочие аккаунты и состояние очереди.</p></div><button className="btn">+ Подключить Telegram</button></div><div className="panel accountCard"><div><b>Sales Account</b><div className="muted">Рабочий Telegram для отдела продаж</div></div><span className="status unchecked">Не подключён</span></div><div className="panel"><h3>Health & Limits</h3><div className="healthGrid"><div><span className="label">Session</span><b>Disconnected</b></div><div><span className="label">Flood wait</span><b>—</b></div><div><span className="label">Queue</span><b>Stopped</b></div></div></div></>
  }

  const views={dashboard:<Dashboard/>,leads:<Leads/>,campaigns:<Campaigns/>,inbox:<Inbox/>,templates:<Templates/>,products:<Products/>,telegram:<Telegram/>}

  return <div className="shell"><Nav/><main className="main">{views[tab]||views.dashboard}</main></div>
}
