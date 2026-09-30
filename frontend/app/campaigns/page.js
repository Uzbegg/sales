import Link from 'next/link'
import {demoCampaigns} from '../../lib/demo'

export default function Campaigns(){
 return <><div className="pageHead"><div><h1>Кампании</h1><p className="muted">Сегменты, персонализированные сообщения и очередь отправки.</p></div><Link className="btn" href="/campaigns/new">+ Новая кампания</Link></div>
 <div className="campaignGrid">{demoCampaigns.map(x=><div className="panel campaignCard" key={x.id}><div className="rowBetween"><span className={'status '+x.status}>{x.status}</span><span className="muted">{x.recipients} лидов</span></div><h3>{x.name}</h3><p className="muted">{x.product}</p><div className="campaignActions"><button className="btn secondary">Открыть</button><button className="btn">Подготовить сообщения</button></div></div>)}</div></>
}
