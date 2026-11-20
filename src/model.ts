export interface Verse { number:number; text:string }
export interface Chapter { number:number; verses:Verse[] }
export interface Book { id:string; name:string; source:string; sourceName?:string; shortName?:string; ordinal?:number; chapters:Chapter[] }
export interface Passage { id:string; bookId:string; book:string; chapter:number; verses:Verse[] }
export type TitleSeparator = 'none'|'line'|'fade'|'double'|'diamond'|'cross';
export interface Appearance { titleSeparator:TitleSeparator; titleFont:string; verseFont:string; titleSize:number; verseSize:number; titleColor:string; verseColor:string; titleAlign:'left'|'center'|'right'; verseAlign:'left'|'center'|'right'; lineHeight:number; margin:number; marginTop?:number; marginBottom?:number; marginLeft?:number; marginRight?:number; overlay:number; fit:'cover'|'contain'; shadow:boolean; numbers:boolean; verseNewLine:boolean; background:string|null; idleBackground:string|null }
export interface Slide { title:string; verses:Verse[] }
export interface Live { slides:Slide[]; index:number; appearance:Appearance; ratio:number; mode:'normal'|'blackout'|'background'; passageTitle:string }
export interface Display { id:number; label:string; width:number; height:number; primary:boolean; scale:number }
export interface Background { id:string; name:string; data:string }
export interface HistoryEntry { id:string; passage:Passage; presentedAt:string }
export interface BibleVersion { id:string; name:string; books:Book[]; issues:string[] }
export interface Library { books:Book[]; backgrounds:Background[]; appearance:Appearance; queue:Passage[]; history:HistoryEntry[]; versionId?:string }
export interface OutputStatus { open:boolean; fullscreen:boolean; displayId:number|null; notice?:string }
export const defaults:Appearance={titleSeparator:'fade',titleFont:'Noto Sans Armenian',verseFont:'Noto Sans Armenian',titleSize:44,verseSize:42,titleColor:'#f3d7a1',verseColor:'#ffffff',titleAlign:'center',verseAlign:'center',lineHeight:1.5,margin:7,overlay:0.48,fit:'contain',shadow:true,numbers:true,verseNewLine:true,background:null,idleBackground:null};
export function passageTitle(p:Passage){
 const ns=[...new Set(p.verses.map(v=>v.number))].sort((a,b)=>a-b); const parts:string[]=[];
 for(let i=0;i<ns.length;i++){let end=i;while(ns[end+1]===ns[end]+1)end++;parts.push(end>i?`${ns[i]}–${ns[end]}`:`${ns[i]}`);i=end;}
 return `${p.book} ${p.chapter}:${parts.join(',')}`;
}
export function selectNumbers(value:string,available:Verse[]):number[]{
 if(!/^\s*\d+(?:\s*[-–]\s*\d+)?(?:\s*,\s*\d+(?:\s*[-–]\s*\d+)?)*\s*$/.test(value))throw Error('Use verse numbers such as 16, 16–18, or 16,18,21.');
 const chosen=new Set<number>();
 for(const part of value.split(',')){const [a,b=a]=part.trim().split(/[-–]/).map(Number);if(a<1||b<a||b-a>10000)throw Error('Invalid verse range.');for(let n=a;n<=b;n++){if(!available.some(v=>v.number===n))throw Error(`Verse ${n} is missing from this chapter.`);chosen.add(n);}}
 return [...chosen].sort((a,b)=>a-b);
}
