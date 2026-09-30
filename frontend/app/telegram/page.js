'use client'
import {useEffect,useState} from 'react'
import {api,backendConfigured} from '../../lib/api'

export default function Telegram(){
  const [accounts,setAccounts]=useState([])
  const [phone,setPhone]=useState('+998')
  const [label,setLabel]=useState('Sales Account')
  const [accountId,setAccountId]=useState(null)
  const [code,setCode]=useState('')
  const [password,setPassword]=useState('')
  const [step,setStep]=useState('phone')
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)

  const refresh=async()=>{
    if(!backendConfigured)return
    try{setAccounts(await api('/telegram/accounts'))}catch(e){setMessage(e.message)}
  }
  useEffect(()=>{refresh()},[])

  const start=async()=>{
    setBusy(true);setMessage('')
    try{
      const r=await api('/telegram/login/start',{method:'POST',body:JSON.stringify({phone,label})})
      setAccountId(r.account_id);setStep('code')
      setMessage('Код отправлен Telegram. Введите его ниже.')
    }catch(e){setMessage(e.message)}
    setBusy(false)
  }

  const confirm=async()=>{
    setBusy(true);setMessage('')
    try{
      const r=await api('/telegram/login/confirm',{method:'POST',body:JSON.stringify({account_id:accountId,code,password:password||null})})
      if(r.needs_password){setStep('password');setMessage('На аккаунте включена 2FA. Введите пароль и повторите подтверждение.')}
      else{setStep('phone');setCode('');setPassword('');setMessage('Telegram подключён.');await refresh()}
    }catch(e){setMessage(e.message)}
    setBusy(false)
  }

  return <>
    <div className="pageHead"><div><h1>Telegram Accounts</h1><p className="muted">Подключение рабочего Telegram через официальный user API.</p></div><span className={'badge '+(backendConfigured?'':'warning')}>{backendConfigured?'Backend подключён':'Ожидает VPS backend'}</span></div>

    {!backendConfigured&&<div className="panel notice"><b>Интерфейс уже готов.</b><p className="muted">Для реального входа нужен backend. После запуска VPS достаточно указать <code>NEXT_PUBLIC_API_URL</code> в Vercel — эта форма начнёт работать без переделки.</p></div>}

    <div className="grid2">
      <div className="panel">
        <h3>Подключить аккаунт</h3>
        <div className="formStack">
          <label>Название аккаунта<input className="input" value={label} onChange={e=>setLabel(e.target.value)} placeholder="Sales Account"/></label>
          <label>Номер телефона<input className="input" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+998901234567"/></label>
          {step!=='phone'&&<label>Код Telegram<input className="input" value={code} onChange={e=>setCode(e.target.value)} placeholder="12345"/></label>}
          {step==='password'&&<label>Пароль 2FA<input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Пароль Telegram"/></label>}
          {step==='phone'
            ?<button className="btn" disabled={busy||!backendConfigured} onClick={start}>{busy?'Отправляем код...':'Получить код'}</button>
            :<button className="btn" disabled={busy||!backendConfigured} onClick={confirm}>{busy?'Проверяем...':'Подтвердить вход'}</button>}
          {message&&<div className="inlineMessage">{message}</div>}
        </div>
      </div>

      <div className="panel">
        <h3>Что нужно на сервере</h3>
        <div className="detailGrid">
          <div><span className="label">TELEGRAM_API_ID</span><b>server secret</b></div>
          <div><span className="label">TELEGRAM_API_HASH</span><b>server secret</b></div>
          <div><span className="label">APP_SECRET</span><b>шифрует session</b></div>
          <div><span className="label">Session</span><b>не хранится в браузере</b></div>
        </div>
      </div>
    </div>

    <div className="panel">
      <div className="rowBetween"><h3>Подключённые аккаунты</h3><button className="btn secondary" onClick={refresh} disabled={!backendConfigured}>Обновить</button></div>
      {accounts.length===0?<p className="muted">Пока нет подключённых аккаунтов.</p>:
      <table className="table"><thead><tr><th>Название</th><th>Телефон</th><th>Статус</th><th>Username</th><th>Flood wait</th></tr></thead><tbody>
        {accounts.map(x=><tr key={x.id}><td><b>{x.label}</b></td><td>{x.phone}</td><td><span className={'status '+x.status}>{x.status}</span></td><td>{x.telegram_username?'@'+x.telegram_username:'—'}</td><td>{x.flood_wait_until||'—'}</td></tr>)}
      </tbody></table>}
    </div>

    <div className="panel notice">
      <h3>Важно</h3>
      <p className="muted">Система не будет обходить ограничения Telegram. При FLOOD_WAIT очередь останавливается на указанное Telegram время. Если аккаунт получает ограничение на новые диалоги, отправка также блокируется.</p>
    </div>
  </>
}
