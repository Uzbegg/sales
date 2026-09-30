async function getData(){
  try{
    const r=await fetch(process.env.NEXT_PUBLIC_API_URL+'/dashboard',{cache:'no-store'})
    return await r.json()
  }catch(e){return {total_leads:0,telegram_found:0,contacted:0,replied:0}}
}
export default async function Page(){
  const d=await getData()
  const cards=[['Всего лидов',d.total_leads],['Telegram найден',d.telegram_found],['Связались',d.contacted],['Ответили',d.replied]]
  return <><h1>Dashboard</h1><p className="muted">Продажи оборудования — база лидов, кампании и переписки.</p><div className="cards">{cards.map(([k,v])=><div className="card" key={k}><div className="label">{k}</div><div className="metric">{v}</div></div>)}</div><div className="panel"><h3>MVP 0.1</h3><p>Импортируйте Excel, проверьте базу, создайте кампанию и подготовьте персонализированные сообщения.</p></div></>
}
