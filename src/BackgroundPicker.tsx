import {useEffect,useRef} from 'react';
import type {Background} from './model';

export function BackgroundPicker({label,value,backgrounds,onChange}:{label:string;value:string|null;backgrounds:Background[];onChange:(id:string|null)=>void}){
 const grid=useRef<HTMLDivElement>(null);
 const options=[{id:null,name:'Quiet blue',data:''},...backgrounds.slice().sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}))];
 useEffect(()=>{
  const selected=grid.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
  if(selected&&grid.current)grid.current.scrollTop=selected.offsetTop-grid.current.offsetTop-8;
 },[value]);
 return <section className="background-picker" aria-label={label}>
  <div className="background-picker-heading"><span>{label}</span><span>{options.find(option=>option.id===value)?.name??'Choose a photo'}</span></div>
  <div className="background-grid" ref={grid} role="group" aria-label={`${label} choices`}>
   {options.map(option=><button type="button" key={option.id??'built-in'} className="background-choice" aria-label={option.name} aria-pressed={value===option.id} title={option.name} onClick={()=>onChange(option.id)}>
    <span className={`background-thumbnail${option.id===null?' background-thumbnail-default':''}`}>
     {option.data&&<img src={option.data} alt="" loading="lazy" decoding="async"/>}
     {value===option.id&&<span className="background-check" aria-hidden="true">✓</span>}
    </span>
    <span className="background-name">{option.name}</span>
   </button>)}
  </div>
 </section>;
}
