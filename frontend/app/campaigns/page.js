'use client'
import {useEffect,useState} from 'react'
export default function Campaigns(){
 const api=process.env.NEXT_PUBLIC_API_URL; const [items,setItems]=useState([]); const [name,setName]=useState('Jordi Shape H9 / Tashkent')
 async function load(){const r=await fetch(api+'/campaigns');setItems(await r.json())}
 useEffect(()=>{load()},[])
 async function create(){await fetch(api+'/campaigns',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,product:'Jordi Shape H9',template:'Здравствуйте, {{first_name}}! Меня зовут {{manager_name}}...'})});load()}
 return <><h1>Кампании</h1><div className="panel"><input value={name} onChange={e=>setName(e.target.value)} style={{padding:10,width:'60%'}}/><button className="btn" onClick={create} style={{marginLeft:10}}>Создать кампанию</button></div>
 <div className="panel">{items.length?items.map(x=><div key={x.id} style={{padding:'10px 0',borderBottom:'1px solid #eee'}}><b>{x.name}</b> — {x.status}</div>):'Кампаний пока нет'}</div></>
}
