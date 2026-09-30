'use client'
import {useEffect,useState} from 'react'
import {api,backendConfigured} from '../lib/api'

export default function Page(){
  const [data,setData]=useState({total_leads:0,telegram_found:0,contacted:0,replied:0})
  const [status,setStatus]=useState(backendConfigured?'Проверяем backend...':'Frontend работает · backend подключим к VPS')

  useEffect(()=>{
    if(!backendConfigured)return
    api('/health').then(h=>{
      setStatus('Backend online · Telegram '+(h.telegram_configured?'настроен':'требует API ID/HASH'))
      return api('/dashboard')
    }).then(setData).catch(e=>setStatus(e.message))
  },[])

  const cards=[['Всего лидов',data.total_leads],['Telegram найден',data.telegram_found],['Связались',data.contacted],['Ответили',data.replied]]
  return <>
    <div className="pageHead"><div><h1>Dashboard</h1><p className="muted">Infinity Sales — CRM для продаж оборудования.</p></div><span className={'badge '+(backendConfigured?'':'warning')}>{status}</span></div>
    <div className="cards">{cards.map(([k,v])=><div className="card" key={k}><div className="label">{k}</div><div className="metric">{v.toLocaleString('ru-RU')}</div></div>)}</div>
    <div className="grid2">
      <div className="panel"><h3>Рабочая схема</h3><p>Excel → лиды → проверка Telegram → персональное сообщение → контролируемая отправка → ответы → сделка.</p></div>
      <div className="panel"><h3>Состояние</h3><p className="muted">Фронтенд на Vercel. Для реальной авторизации Telegram и отправки сообщений нужен backend с PostgreSQL на VPS.</p></div>
    </div>
  </>
}
