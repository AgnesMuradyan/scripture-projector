import { BrowserWindow, screen } from 'electron';
import type { EventEmitter } from 'node:events';
import type { OutputStatus } from '../src/model';
export class DisplayManager {
 output:BrowserWindow|null=null; target:number|null=null;private pending:Promise<unknown>=Promise.resolve();
 constructor(private create:()=>BrowserWindow,private notify:(notice?:string)=>void){
  screen.on('display-added',()=>this.notify());
  screen.on('display-metrics-changed',(_event,display)=>{if(this.output?.isFullScreen()&&display.id===this.target)void this.open(this.target).catch(e=>this.notify(String(e)));this.notify();});
  screen.on('display-removed',(_,display)=>{if(this.target===display.id){this.target=null;if(this.output)void this.open(null).then(()=>this.notify('Output screen disconnected. Presentation recovered in a window.')).catch(e=>this.notify(String(e)));else this.notify();}else this.notify();});
 }
 list(){return screen.getAllDisplays().map(d=>({id:d.id,label:d.label||`Display ${d.id}`,width:d.bounds.width,height:d.bounds.height,primary:d.id===screen.getPrimaryDisplay().id,scale:d.scaleFactor}));}
 status(notice?:string):OutputStatus{return {open:!!this.output,fullscreen:this.output?.isFullScreen()??false,displayId:this.target,notice};}
 private enqueue<T>(fn:()=>Promise<T>):Promise<T>{const task=this.pending.catch(()=>{}).then(fn);this.pending=task;return task;}
 private async fullscreen(w:BrowserWindow,value:boolean){if(w.isDestroyed()||w.isFullScreen()===value)return;await new Promise<void>((resolve,reject)=>{const event=value?'enter-full-screen':'leave-full-screen';const events:EventEmitter=w;const finish=()=>{clearTimeout(timer);events.removeListener(event,finish);w.removeListener('closed',finish);resolve();};const timer=setTimeout(()=>{events.removeListener(event,finish);w.removeListener('closed',finish);reject(Error('Fullscreen transition did not complete. Try windowed preview.'));},6000);events.once(event,finish);w.once('closed',finish);w.setFullScreen(value);});}
 open(id:number|null){return this.enqueue(async()=>{
  if(id!==null&&!screen.getAllDisplays().some(d=>d.id===id))throw Error('That screen is no longer connected.');
  if(!this.output){this.output=this.create();this.output.on('closed',()=>{this.output=null;this.notify();});this.output.on('enter-full-screen',()=>this.notify());this.output.on('leave-full-screen',()=>this.notify());}
  const w=this.output;const unchanged=this.target===id&&w.isFullScreen();this.target=id;
  if(!unchanged){await this.fullscreen(w,false);if(w.isDestroyed())return this.status();const display=screen.getAllDisplays().find(d=>d.id===id);if(id!==null&&display){w.setBounds(display.bounds);w.showInactive();await this.fullscreen(w,true);}else{this.target=null;const a=screen.getPrimaryDisplay().workArea;w.setBounds({x:a.x+40,y:a.y+40,width:Math.min(1000,a.width-80),height:Math.min(650,a.height-80)});w.showInactive();}}
  this.notify();return this.status();
 });}
 escape(){return this.enqueue(async()=>{if(this.output)await this.fullscreen(this.output,false);this.notify();});}
}
