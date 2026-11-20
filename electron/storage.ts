import { promises as fs } from 'node:fs';
import path from 'node:path';
import { defaults, type BibleVersion, type Library, type Passage } from '../src/model';
export class Storage {
 state:Library={books:[],backgrounds:[],appearance:{...defaults},queue:[],history:[]}; private pending=Promise.resolve();
 constructor(readonly directory:string,private bundled?:BibleVersion){}
 async load(){
  await fs.mkdir(this.directory,{recursive:true});let original:string|undefined;
  try{original=await fs.readFile(path.join(this.directory,'library.json'),'utf8');const data=JSON.parse(original);if(!Array.isArray(data.books)||!Array.isArray(data.queue)||!Array.isArray(data.backgrounds)||(data.history!==undefined&&!Array.isArray(data.history)))throw Error('Invalid saved library');this.state={...data,history:data.history??[],appearance:{...defaults,...data.appearance,idleBackground:data.appearance?.idleBackground===undefined?(data.appearance?.background??null):data.appearance.idleBackground,fit:'contain'}};}
  catch(e:any){if(e.code!=='ENOENT')throw Error(`Cannot read saved library. Original file preserved: ${e.message}`);}
  if(this.bundled){
   if(original&&this.state.versionId!==this.bundled.id){
    try{await fs.writeFile(path.join(this.directory,'library-before-bundled.json'),original,{flag:'wx'});}catch(e:any){if(e.code!=='EEXIST')throw e;}
    const oldBooks=this.state.books;
    const migrate=(p:Passage):Passage=>{const old=oldBooks.find(b=>b.id===p.bookId);const match=this.bundled!.books.find(b=>b.id===p.bookId||(old&&b.source===old.source&&b.sourceName===old.name));return match?{...p,bookId:match.id,book:match.name}:p;};
    this.state.queue=this.state.queue.map(migrate);this.state.history=this.state.history.map(h=>({...h,passage:migrate(h.passage)}));
   }
   this.state.books=this.bundled.books;this.state.versionId=this.bundled.id;await this.save();
  }
  return this.state;
 }
 save(){const json=JSON.stringify(this.state);this.pending=this.pending.catch(()=>{}).then(async()=>{const dest=path.join(this.directory,'library.json');await fs.writeFile(dest+'.tmp',json,'utf8');await fs.rename(dest+'.tmp',dest);});return this.pending;}
}
