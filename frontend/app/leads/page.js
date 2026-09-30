'use client'
import {useState} from 'react'
import {demoLeads} from '../../lib/demo'

export default function Leads(){
  const [items,setItems]=useState(demoLeads)
  const [query,setQuery]=useState('')
  const filtered=items.filter(x=>(x.company+' '+x.first_name+' '+x.phone+' '+x.city+' '+x.category).toLowerCase().includes(query.toLowerCase()))
  return <><div className="pageHead"><div><h1>Лиды</h1><p className="muted">Загрузка, очистка, сегментация и история контактов.</p></div><button className="btn">+ Добавить лид</button></div>
  <div className="toolbar"><input className="input" placeholder="Поиск по базе..." value={query} onChange={e=>setQuery(e.target.value)}/><label className="btn secondary">Импорт Excel<input hidden type="file" accept=".xlsx,.xlsm"/></label><button className="btn secondary">Фильтры</button><button className="btn">Проверить Telegram</button></div>
  <div className="panel tableWrap"><table className="table"><thead><tr><th>Компания</th><th>Контакт</th><th>Телефон</th><th>Город</th><th>Тип</th><th>Telegram</th><th>Статус</th><th>Продукт</th></tr></thead><tbody>
  {filtered.map(x=><tr key={x.id}><td><b>{x.company}</b></td><td>{x.first_name||'—'}</td><td>{x.phone}</td><td>{x.city}</td><td>{x.category}</td><td><span className={'status '+x.telegram_status}>{x.telegram_status==='found'?'Найден':'Не проверен'}</span></td><td><span className={'status '+x.status}>{x.status}</span></td><td>{x.product_interest}</td></tr>)}
  </tbody></table></div></>
}
