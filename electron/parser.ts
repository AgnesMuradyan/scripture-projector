import { load } from 'cheerio';
import { createHash } from 'node:crypto';
import type { Book, Chapter, Verse } from '../src/model';
export function parseBook(html:string,source:string):{book:Book|null;issues:string[]}{
 const $=load(html); const issues:string[]=[];
 if($('script,iframe,object,embed,link,img,style').length)issues.push('Active content / resource elements ignored; nothing was executed or loaded.');
 $('script,style,iframe,object,embed,link,img,head,noscript,template').remove();
 const headings=$('h1'); if(headings.length!==1)return {book:null,issues:[...issues,'Expected exactly one h1 book heading. File skipped.']};
 const name=headings.first().text().trim(); if(!name)return {book:null,issues:['Empty book name. File skipped.']};
 const chapters:Chapter[]=[];let chapter:Chapter|undefined;let verse:Verse|undefined;let started=false;let invalid=false;
 const flush=()=>{if(verse){verse.text=verse.text.replace(/\s+/gu,' ').trim();if(!verse.text){issues.push(`Empty verse ${chapter?.number}:${verse.number}.`);invalid=true;}}verse=undefined;};
 const walk=(node:any)=>{
  if(node.type==='text'){if(verse)verse.text+=node.data;else if(started&&node.data.trim()){issues.push(`Unrecognized text outside a verse: ${node.data.trim().slice(0,80)}`);invalid=true;}return;}
  if(node.name==='h1'){started=true;return;}
  if(!started){for(const child of node.children??[])walk(child);return;}
  if(node.name==='strong'||node.name==='sup'){
   flush();const raw=$(node).text().trim();if(!/^[1-9]\d*$/.test(raw)||Number(raw)>1000){issues.push(`Unrecognized ${node.name} marker: ${raw}`);invalid=true;return;}
   const n=Number(raw);
   if(node.name==='strong'){if(chapters.some(c=>c.number===n)){issues.push(`Duplicate chapter ${n}.`);invalid=true;}chapter={number:n,verses:[]};chapters.push(chapter);}
   else if(!chapter){issues.push(`Verse ${n} appears before a chapter.`);invalid=true;}
   else {if(chapter.verses.some(v=>v.number===n)){issues.push(`Duplicate verse ${chapter.number}:${n}.`);invalid=true;}verse={number:n,text:''};chapter.verses.push(verse);}return;
  }
  if(node.name==='br'&&verse)verse.text+=' ';
  for(const child of node.children??[])walk(child);
  if(['p','div','li'].includes(node.name)&&verse)verse.text+=' ';
 };
 walk($('body')[0]);flush();
 const check=(ns:number[],label:string)=>{const sorted=[...ns].sort((a,b)=>a-b);for(let n=1;n<=(sorted.at(-1)??0);n++)if(!ns.includes(n))issues.push(`Missing ${label} ${n}.`);if(ns.some((n,i)=>i>0&&n<ns[i-1]))issues.push(`${label} markers are out of order; sorted numerically.`);};
 check(chapters.map(c=>c.number),'chapter');
 for(const c of chapters){check(c.verses.map(v=>v.number),`verse in chapter ${c.number}:`);if(!c.verses.length){issues.push(`Chapter ${c.number} has no verses.`);invalid=true;}c.verses.sort((a,b)=>a.number-b.number);}
 if(!chapters.length){issues.push('No recognized chapters.');invalid=true;}
 if(invalid)return {book:null,issues:[...issues,'File skipped to avoid silently losing or merging content.']};
 return {book:{id:createHash('sha256').update(name).digest('hex').slice(0,20),name,source,chapters:chapters.sort((a,b)=>a.number-b.number)},issues};
}
