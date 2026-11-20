import {contentBounds} from './image-layout';
import { passageTitle, type Appearance, type Passage, type Slide, type Verse } from './model';
export const WIDTH=1280;
export function textStyle(a:Appearance):Partial<CSSStyleDeclaration>{return {fontFamily:`"${a.verseFont}", "Noto Sans Armenian", sans-serif`,fontSize:`${a.verseSize}px`,lineHeight:String(a.lineHeight),whiteSpace:'pre-wrap',overflowWrap:'anywhere',textAlign:a.verseAlign};}
export function titleStyle(a:Appearance):Partial<CSSStyleDeclaration>{return {fontFamily:`"${a.titleFont}", "Noto Sans Armenian", sans-serif`,fontSize:`${a.titleSize}px`,lineHeight:'1.25',overflowWrap:'anywhere',textAlign:a.titleAlign,fontWeight:'600',position:'relative',margin:'0 0 52px'};}
export const verseNumberStyle={fontSize:'0.62em',lineHeight:'0',position:'relative',top:'-0.5em',verticalAlign:'baseline'} as const;
export const verseText=(v:Verse,a:Appearance)=>(a.numbers?`${v.number}  `:'')+v.text;
// Preserve a paragraph for consecutive verses (and fragments of the same verse).
export function verseJoin(previous:Verse,current:Verse):' '|'\n'{
 return current.number===previous.number||current.number===previous.number+1?' ':'\n';
}
// Measure the same CSS at a fixed logical width, then scale the entire canvas uniformly.
// No font shrinking; oversized verses are split by whitespace, then grapheme boundaries.
export function paginate(p:Passage,a:Appearance,ratio:number,imageRatio?:number):Slide[]{
 const bounds=contentBounds(WIDTH,ratio,a,imageRatio);
 const title=passageTitle(p);const box=document.createElement('div');Object.assign(box.style,{position:'fixed',left:'-20000px',top:'0',width:`${bounds.width}px`,visibility:'hidden'});document.body.appendChild(box);
 const height=bounds.height-4;
 const fits=(verses:Verse[])=>{
  box.replaceChildren();const h=document.createElement('div');Object.assign(h.style,titleStyle(a));h.textContent=title;box.append(h);
  const paragraph=document.createElement('div');Object.assign(paragraph.style,textStyle(a));box.append(paragraph);
  for(const [i,v] of verses.entries()){
   const inline=a.verseNewLine===false;
   const e=document.createElement(inline?'span':'div');
   if(!inline)Object.assign(e.style,textStyle(a),{marginBottom:'14px'});
   if(inline&&i>0)paragraph.append(document.createTextNode(verseJoin(verses[i-1],v)));
   if(a.numbers){const number=document.createElement('sup');Object.assign(number.style,verseNumberStyle);number.textContent=String(v.number);e.append(number,document.createTextNode('  '));}
   e.append(document.createTextNode(v.text));paragraph.append(e);
  }
  return box.getBoundingClientRect().height<=height;
 };

 try{
 if(!fits([{number:1,text:'Ա'}]))throw Error('Text cannot fit this screen with these settings. Reduce font size or margins, or select a taller output.');
 const slides:Slide[]=[];let current:Verse[]=[];
 for(const v of p.verses){if(fits([...current,v])){current.push(v);continue;}if(current.length){slides.push({title,verses:current});current=[];}if(fits([v])){current=[v];continue;}
 let remaining=v.text;
 while(remaining.length){const segments=Array.from(new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(remaining),s=>s.segment);let lo=1,hi=segments.length,best=0;
 while(lo<=hi){const mid=Math.floor((lo+hi)/2);if(fits([{number:v.number,text:segments.slice(0,mid).join('')}])){best=mid;lo=mid+1;}else hi=mid-1;}
 if(!best)throw Error('A character cannot fit with these appearance settings.');let count=segments.slice(0,best).join('').length;
 if(count<remaining.length){const prefix=remaining.slice(0,count);const boundary=[...prefix.matchAll(/[\s։.!?;,:]+/gu)].at(-1);if(boundary&&boundary.index!>count*0.45)count=boundary.index!+boundary[0].length;}
 const part={number:v.number,text:remaining.slice(0,count)};remaining=remaining.slice(count);if(remaining)slides.push({title,verses:[part]});else current=[part];
 }
 }
 if(current.length)slides.push({title,verses:current});return slides;
 }finally{box.remove();}
}
