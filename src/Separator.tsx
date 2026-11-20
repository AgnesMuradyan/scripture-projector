import {useId} from 'react';
import type {TitleSeparator} from './model';

export const separatorOptions:readonly [TitleSeparator,string][]=[['none','None'],['line','Fine line'],['fade','Soft fade'],['double','Double line'],['diamond','Diamond'],['cross','Cross']];

export function Separator({kind}:{kind:TitleSeparator}){
 const gradient=useId();
 return <svg viewBox="0 0 240 20" width="100%" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.2">
  {kind==='fade'?<><defs><linearGradient id={gradient}><stop stopColor="currentColor" stopOpacity="0"/><stop offset=".5" stopColor="currentColor"/><stop offset="1" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs><path d="M0 10H240" stroke={`url(#${gradient})`}/></>:null}
  {kind==='line'&&<path d="M0 10H240"/>}
  {kind==='double'&&<><path d="M0 7H240"/><path d="M30 13H210" opacity=".5"/></>}
  {(kind==='diamond'||kind==='cross')&&<><path d="M0 10H101M139 10H240" opacity=".65"/>{kind==='diamond'?<path d="m120 4 6 6-6 6-6-6Z"/>:<path d="M120 2V18M114 8H126" strokeWidth="1.8" strokeLinecap="round"/>}</>}
 </svg>;
}
