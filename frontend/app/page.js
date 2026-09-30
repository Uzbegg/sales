const demo={total_leads:2450,telegram_found:1630,contacted:185,replied:46}
export default function Page(){
  const cards=[['Всего лидов',demo.total_leads],['Telegram найден',demo.telegram_found],['Связались',demo.contacted],['Ответили',demo.replied]]
  return <><div className="pageHead"><div><h1>Dashboard</h1><p className="muted">Infinity Sales — продажи оборудования через единую базу лидов.</p></div><span className="badge">DEMO</span></div>
  <div className="cards">{cards.map(([k,v])=><div className="card" key={k}><div className="label">{k}</div><div className="metric">{v.toLocaleString('ru-RU')}</div></div>)}</div>
  <div className="grid2">
    <div className="panel"><h3>Активная кампания</h3><div className="campaignTitle">Jordi Shape H9 / Tashkent</div><div className="progress"><span style={{width:'62%'}}/></div><div className="rowBetween"><span className="muted">185 отправлено из 300</span><b>62%</b></div></div>
    <div className="panel"><h3>Воронка сегодня</h3><div className="funnel"><span>Новые <b>128</b></span><span>Ответили <b>19</b></span><span>Интерес <b>7</b></span><span>Переговоры <b>3</b></span></div></div>
  </div>
  <div className="panel"><h3>Следующий шаг</h3><p>Загрузить Excel → проверить лиды → выбрать сегмент → подготовить персональные сообщения → запустить контролируемую очередь.</p></div></>
}
