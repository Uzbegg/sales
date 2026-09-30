'use client'
import {useEffect,useState} from 'react'
import {demoLeads} from '../../lib/demo'
import {api,backendConfigured} from '../../lib/api'

export default function Leads(){
  const [items,setItems]=useState(demoLeads)
  const [accounts,setAccounts]=useState([])
  const [accountId,setAccountId]=useState('')
  const [selected,setSelected]=useState([])
  const [query,setQuery]=useState('')
  const [message,setMessage]=useState('Здравствуйте! Меня зовут Артём, компания Infinity Tech. Могу отправить короткую информацию по профессиональному оборудованию для вашей студии?')
  const [notice,setNotice]=useState('')
  const [busy,setBusy]=useState(false)

  const load=async()=>{
    if(!backendConfigured)return
    try{
      const [leads,accs]=await Promise.all([api('/leads'),api('/telegram/accounts')])
      setItems(leads);setAccounts(accs)
      const connected=accs.find(x=>x.status==='connected')
      if(connected)setAccountId(String(connected.id))
    }catch(e){setNotice(e.message)}
  }
  useEffect(()=>{load()},[])

  const filtered=items.filter(x=>(x.company+' '+x.first_name+' '+x.phone+' '+x.city+' '+x.category).toLowerCase().includes(query.toLowerCase()))
  const toggle=id=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id])

  const importExcel=async(e)=>{
    const file=e.target.files?.[0];if(!file)return
    setBusy(true);setNotice('')
    try{
      const fd=new FormData();fd.append('file',file)
      const r=await api('/leads/import',{method:'POST',body:fd})
      setNotice('Импортировано: '+r.imported+' · пропущено: '+r.skipped);await load()
    }catch(err){setNotice(err.message)}
    setBusy(false);e.target.value=''
  }

  const checkTelegram=async()=>{
    if(!accountId)return setNotice('Сначала подключите Telegram аккаунт.')
    if(!selected.length)return setNotice('Выберите лиды для проверки.')
    setBusy(true);setNotice('')
    try{
      const r=await api('/telegram/check-leads',{method:'POST',body:JSON.stringify({account_id:Number(accountId),lead_ids:selected})})
      setNotice('Проверено: '+r.checked+' · найдено: '+r.found+' · не определено: '+r.not_detected);await load()
    }catch(e){setNotice(e.message)}
    setBusy(false)
  }

  const sendOne=async()=>{
    if(selected.length!==1)return setNotice('Для тестовой отправки выберите ровно одного лида.')
    if(!accountId)return setNotice('Сначала подключите Telegram аккаунт.')
    if(!confirm('Отправить это сообщение выбранному контакту в Telegram?'))return
    setBusy(true);setNotice('')
    try{
      const r=await api('/telegram/send-one',{method:'POST',body:JSON.stringify({account_id:Number(accountId),lead_id:selected[0],message})})
      setNotice('Сообщение отправлено. Telegram message ID: '+r.message_id);await load()
    }catch(e){setNotice(e.message)}
    setBusy(false)
  }

  return <>
    <div className="pageHead"><div><h1>Лиды</h1><p className="muted">Excel → выбор → проверка Telegram → тестовое сообщение.</p></div><span className={'badge '+(backendConfigured?'':'warning')}>{backendConfigured?'LIVE API':'DEMO DATA'}</span></div>

    <div className="toolbar">
      <input className="input" placeholder="Поиск по базе..." value={query} onChange={e=>setQuery(e.target.value)}/>
      <select className="input" value={accountId} onChange={e=>setAccountId(e.target.value)}>
        <option value="">Telegram аккаунт...</option>
        {accounts.filter(x=>x.status==='connected').map(x=><option key={x.id} value={x.id}>{x.label} · {x.phone}</option>)}
      </select>
      <label className="btn secondary">{busy?'Работаем...':'Импорт Excel'}<input hidden type="file" accept=".xlsx,.xlsm" onChange={importExcel} disabled={!backendConfigured||busy}/></label>
      <button className="btn" onClick={checkTelegram} disabled={!backendConfigured||busy}>Проверить Telegram ({selected.length})</button>
    </div>

    {notice&&<div className="inlineMessage">{notice}</div>}

    <div className="panel tableWrap"><table className="table"><thead><tr><th></th><th>Компания</th><th>Контакт</th><th>Телефон</th><th>Город</th><th>Тип</th><th>Telegram</th><th>Статус</th></tr></thead><tbody>
      {filtered.map(x=><tr key={x.id}><td><input type="checkbox" checked={selected.includes(x.id)} onChange={()=>toggle(x.id)}/></td><td><b>{x.company}</b></td><td>{x.first_name||'—'}</td><td>{x.phone}</td><td>{x.city}</td><td>{x.category}</td><td><span className={'status '+x.telegram_status}>{x.telegram_status==='found'?'Найден':x.telegram_status==='not_detected'?'Не определён':'Не проверен'}</span></td><td><span className={'status '+x.status}>{x.status}</span></td></tr>)}
    </tbody></table></div>

    <div className="panel">
      <h3>Тестовая отправка одному лиду</h3>
      <p className="muted">Для первого теста выберите одного контакта с Telegram = «Найден». Массовую очередь подключим следующим этапом после проверки реального аккаунта.</p>
      <textarea className="textarea" rows="5" value={message} onChange={e=>setMessage(e.target.value)}/>
      <div className="rowBetween" style={{marginTop:12}}><span className="muted">{message.length} символов</span><button className="btn" disabled={!backendConfigured||busy||selected.length!==1} onClick={sendOne}>Отправить тест</button></div>
    </div>
  </>
}
