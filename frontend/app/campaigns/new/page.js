'use client'
import {useMemo,useState} from 'react'
import Link from 'next/link'
import {demoLeads} from '../../../lib/demo'

export default function NewCampaign(){
  const [city,setCity]=useState('Ташкент')
  const [category,setCategory]=useState('Все')
  const [product,setProduct]=useState('Jordi Shape H9')
  const [mode,setMode]=useState('AI персонализация')

  const matches=useMemo(()=>demoLeads.filter(x=>
    (city==='Все'||x.city===city) &&
    (category==='Все'||x.category===category) &&
    x.telegram_status==='found'
  ),[city,category])

  return <>
    <div className="pageHead"><div><Link href="/campaigns" className="muted">← Кампании</Link><h1 style={{marginTop:8}}>Новая кампания</h1><p className="muted">Выберите сегмент и подготовьте персонализированные сообщения.</p></div></div>
    <div className="wizardGrid">
      <div className="panel">
        <h3>1. Сегмент</h3>
        <div className="formGrid">
          <label>Город<select value={city} onChange={e=>setCity(e.target.value)}><option>Все</option><option>Ташкент</option><option>Самарканд</option><option>Бухара</option></select></label>
          <label>Категория<select value={category} onChange={e=>setCategory(e.target.value)}><option>Все</option><option>Косметология</option><option>Медицинская клиника</option><option>Лазерная эпиляция</option><option>Коррекция фигуры</option></select></label>
          <label>Продукт<select value={product} onChange={e=>setProduct(e.target.value)}><option>Jordi Shape H9</option><option>Endospheres</option><option>XFEST 1600</option><option>VisBody M60</option></select></label>
          <label>Режим<select value={mode} onChange={e=>setMode(e.target.value)}><option>AI персонализация</option><option>Обычный шаблон</option><option>Ручной</option></select></label>
        </div>
      </div>
      <div className="panel summaryCard">
        <span className="label">Подходящих лидов</span><div className="metric">{matches.length}</div>
        <p className="muted">Только контакты с найденным Telegram и без opt-out.</p>
        <button className="btn">Подготовить сообщения</button>
      </div>
    </div>
    <div className="panel">
      <h3>Предпросмотр сегмента</h3>
      <table className="table"><thead><tr><th>Компания</th><th>Контакт</th><th>Город</th><th>Категория</th><th>Продукт</th></tr></thead><tbody>
        {matches.map(x=><tr key={x.id}><td><b>{x.company}</b></td><td>{x.first_name}</td><td>{x.city}</td><td>{x.category}</td><td>{product}</td></tr>)}
      </tbody></table>
    </div>
  </>
}
