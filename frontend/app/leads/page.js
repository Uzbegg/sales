'use client'
import {useEffect,useState} from 'react'

export default function Leads(){
  const [items,setItems]=useState([])
  const [result,setResult]=useState('')
  const api=process.env.NEXT_PUBLIC_API_URL
  async function load(){const r=await fetch(api+'/leads');setItems(await r.json())}
  useEffect(()=>{load()},[])
  async function upload(e){
    const file=e.target.files?.[0]; if(!file)return
    const fd=new FormData();fd.append('file',file)
    const r=await fetch(api+'/leads/import',{method:'POST',body:fd})
    const d=await r.json()
    setResult(r.ok ? ('Импортировано: '+d.imported+', пропущено: '+d.skipped) : (d.detail||'Ошибка'))
    if(r.ok)load()
  }
  return <><h1>Лиды</h1><p className="muted">Загрузка, очистка и сегментация базы потенциальных клиентов.</p>
  <div className="toolbar"><label className="btn">Импорт Excel<input hidden type="file" accept=".xlsx,.xlsm" onChange={upload}/></label><span>{result}</span></div>
  <table className="table"><thead><tr><th>Компания</th><th>Имя</th><th>Телефон</th><th>Город</th><th>Категория</th><th>Telegram</th><th>Статус</th></tr></thead><tbody>
  {items.map(x=><tr key={x.id}><td>{x.company||'—'}</td><td>{x.first_name||'—'}</td><td>{x.phone}</td><td>{x.city||'—'}</td><td>{x.category||'—'}</td><td>{x.telegram_status}</td><td>{x.status}</td></tr>)}
  </tbody></table></>
}
