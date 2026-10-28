'use client';
import { useEffect, useState } from 'react';
import { request } from '../../lib/api';
type Message={id:string;authorType:string;content:string};type Conv={id:string;messages:Message[]};
export default function Chat(){
 const [conv,setConv]=useState<Conv>(); const [text,setText]=useState('Meu notebook não conecta na VPN. Erro 809.'); const [error,setError]=useState('');
 async function load(){try{await request('/auth/me');setConv(await request<Conv>('/conversations/seed-ana-conversation'))}catch{location.href='/login'}}
 useEffect(()=>{void load()},[]);
 async function send(e:React.FormEvent){e.preventDefault();if(!conv)return;try{await request(`/conversations/${conv.id}/messages`,{method:'POST',body:JSON.stringify({content:text})});setText('');setTimeout(()=>void load(),500)}catch(e){setError(e instanceof Error?e.message:'Erro de rede')}}
 return <div className="shell"><aside className="side"><div className="brand">Nexo Assist</div><div className="nav">Atendimento</div></aside><main className="main"><small>Service desk de TI</small><h1>Atendimento</h1><section className="card chat"><div className="messages">{conv?.messages.map((m)=><div key={m.id} className={'bubble '+(m.authorType==='EMPLOYEE'?'mine':'')}><b>{m.authorType==='EMPLOYEE'?'Você':'Nexo Assist'}</b><br/>{m.content}</div>)}</div><form className="composer" onSubmit={send}><input value={text} onChange={(e)=>setText(e.target.value)} /><button>Enviar</button></form>{error&&<p role="alert">{error}</p>}</section></main></div>
}
