import Link from 'next/link'
import {demoLeads} from '../../../lib/demo'

export function generateStaticParams(){
  return demoLeads.map(x=>({id:String(x.id)}))
}

export default function LeadCard({params}){
  const lead=demoLeads.find(x=>String(x.id)===String(params.id)) || demoLeads[0]
  return <>
    <div className="pageHead">
      <div><Link href="/leads" className="muted">← Назад к лидам</Link><h1 style={{marginTop:8}}>{lead.company}</h1><p className="muted">{lead.first_name} · {lead.city} · {lead.category}</p></div>
      <button className="btn">Начать переписку</button>
    </div>
    <div className="grid2">
      <div className="panel">
        <h3>Контакт</h3>
        <div className="detailGrid">
          <div><span className="label">Имя</span><b>{lead.first_name}</b></div>
          <div><span className="label">Телефон</span><b>{lead.phone}</b></div>
          <div><span className="label">Telegram</span><span className={'status '+lead.telegram_status}>{lead.telegram_status==='found'?'Найден':'Не проверен'}</span></div>
          <div><span className="label">Статус</span><span className={'status '+lead.status}>{lead.status}</span></div>
          <div><span className="label">Продукт</span><b>{lead.product_interest}</b></div>
          <div><span className="label">Город</span><b>{lead.city}</b></div>
        </div>
      </div>
      <div className="panel">
        <h3>Следующее действие</h3>
        <p className="muted">Подготовить персональное первое сообщение и отправить после проверки менеджером.</p>
        <button className="btn">Сгенерировать сообщение</button>
      </div>
    </div>
    <div className="panel">
      <h3>История</h3>
      <div className="timeline">
        <div><b>Лид добавлен в базу</b><span className="muted">Сегодня</span></div>
        <div><b>Telegram-проверка</b><span className="muted">{lead.telegram_status==='found'?'Контакт найден':'Ожидает проверки'}</span></div>
      </div>
    </div>
  </>
}
