import {Separator} from './Separator';
import {backgroundRatio,contentBounds} from './image-layout';
import {Fragment,useEffect,useLayoutEffect,useRef,useState} from 'react';
import type {CSSProperties} from 'react';
import type {Appearance,Background,Slide} from './model';
import {WIDTH,textStyle,titleStyle,verseText,verseNumberStyle,verseJoin} from './layout';
export function Stage({slide,appearance:a,ratio,backgrounds,mode='normal'}:{slide?:Slide;appearance:Appearance;ratio:number;backgrounds:Background[];mode?:string}){
 const ref=useRef<HTMLDivElement>(null);const [width,setWidth]=useState(0);
 useLayoutEffect(()=>{const observer=new ResizeObserver(([entry])=>setWidth(entry.contentRect.width));if(ref.current)observer.observe(ref.current);return()=>observer.disconnect();},[]);
 const bg=backgrounds.find(b=>b.id===(mode==='background'?a.idleBackground:a.background));
 const [photo,setPhoto]=useState<{background?:Background;ratio?:number}>({});
 // Keep the current scene visible until its replacement has loaded.
 useEffect(()=>{let active=true;void backgroundRatio(bg).then(r=>{if(active)setPhoto({background:bg,ratio:r});}).catch(()=>{if(active)setPhoto({});});return()=>{active=false;};},[bg]);
 const bounds=contentBounds(WIDTH,ratio,a,photo.ratio);
 return <div className="stage-shell" ref={ref} style={{aspectRatio:ratio}}><div className="stage" style={{width:WIDTH,height:WIDTH/ratio,transform:`scale(${width/WIDTH})`,backgroundColor:'#000'}}>
 {mode!=='blackout'&&<AnimatedBackground background={photo.background}/>}
 <div className="shade" style={{background:'#000',opacity:mode==='normal'&&slide?a.overlay:0}}/>
 {mode!=='blackout'&&<AnimatedText slide={mode==='normal'?slide:undefined} appearance={a} bounds={bounds}/>}

 </div></div>;
}

// A complete opaque scene underneath the incoming fade avoids a black flash,
// including when switching between photos and the default gradient.
function AnimatedBackground({background}:{background?:Background}){
 const key=background?.data??'';
 const [scene,setScene]=useState({key,current:background,previous:undefined as Background|undefined,revision:0});
 if(scene.key!==key)setScene({key,current:background,previous:scene.current,revision:scene.revision+1});
 const [settled,setSettled]=useState(0);
 useEffect(()=>{
  const timer=setTimeout(()=>{setSettled(scene.revision);setScene(value=>({...value,previous:undefined}));},560);
  return()=>clearTimeout(timer);
 },[scene.revision]);
 const layer=(bg:Background|undefined,revision:number,incoming:boolean)=><div key={revision} className={`stage-scene${incoming?' stage-scene-in':''}`} style={{background:bg?'#000':'linear-gradient(135deg, #182d3a, #253c45 45%, #101b2b)'}}>
  {bg&&<img className="stage-background" src={bg.data} alt="" draggable={false}/>}
 </div>;
 return <>{scene.revision>settled&&layer(scene.previous,scene.revision-1,false)}{layer(scene.current,scene.revision,true)}</>;
}

// Retain one outgoing passage while the next one enters; rapid navigation always
// replaces that layer so old passages cannot accumulate or reappear.
function AnimatedText({slide,appearance:a,bounds}:{slide?:Slide;appearance:Appearance;bounds:CSSProperties}){
 const key=JSON.stringify(slide)??'';
 const [transition,setTransition]=useState({key,current:slide,previous:undefined as Slide|undefined,revision:0});
 if(transition.key!==key)setTransition({key,current:slide,previous:transition.current,revision:transition.revision+1});
 useEffect(()=>{
  if(!transition.previous)return;
  const timer=setTimeout(()=>setTransition(value=>({...value,previous:undefined})),340);
  return()=>clearTimeout(timer);
 },[transition.revision]);
 const render=(content:Slide,leaving:boolean)=>{
  const revision=transition.revision-(leaving?1:0);
  const lines=[content.title,...content.verses.map(v=>verseText(v,a))];
  const segments=lines.map(text=>text.match(/\s+|\S+/gu)??[]);
  // Overlapping word fades keep the reveal brisk, even for a full slide.
  const count=segments.reduce((total,line)=>total+line.filter(word=>word.trim()).length,0);
  const step=Math.min(45,1000/Math.max(count-1,1));
  let offset=0;
  const rendered=segments.map((words,line)=>{
    const Tag=line>0&&a.verseNewLine===false?'span':'div';
    return <Tag className="stage-line" key={line} aria-label={lines[line]} style={line===0?{...titleStyle(a) as CSSProperties,color:a.titleColor}:a.verseNewLine===false?undefined:{...textStyle(a) as CSSProperties,marginBottom:14}}>
     {words.map((word,i)=>{
      if(!word.trim())return word;
      const delay=(revision>0?150:0)+offset++*step;
      const style={'--word-delay':`${delay}ms`} as CSSProperties;
      if(line>0&&i===0&&a.numbers)return <sup aria-hidden="true" className="revealed-word" key={i} style={{...verseNumberStyle,...style}}>{word}</sup>;
      return <span aria-hidden="true" className="revealed-word" key={i} style={style}>{word}</span>;
     })}
     {line===0&&a.titleSeparator&&a.titleSeparator!=='none'&&<span aria-hidden="true" className="title-separator" style={{left:a.titleAlign==='left'?0:a.titleAlign==='center'?'50%':undefined,right:a.titleAlign==='right'?0:undefined,transform:a.titleAlign==='center'?'translateX(-50%)':undefined}}><Separator kind={a.titleSeparator}/></span>}
    </Tag>;
   });
  return <div key={revision} aria-hidden={leaving||undefined} className={leaving?'stage-text-out':'stage-text stage-text-in'} style={{...bounds,color:a.verseColor,textShadow:a.shadow?'0 2px 8px #000, 0 1px 2px #000':'none'}}>
   {rendered[0]}
   <div style={textStyle(a) as CSSProperties}>{rendered.slice(1).map((verse,i)=><Fragment key={i}>{a.verseNewLine===false&&i>0?verseJoin(content.verses[i-1],content.verses[i]):null}{verse}</Fragment>)}</div>
  </div>;
 };

 return <>{transition.previous&&render(transition.previous,true)}{transition.current&&render(transition.current,false)}</>;
}
