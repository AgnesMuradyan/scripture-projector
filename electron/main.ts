import { app, BrowserWindow, dialog, ipcMain, session } from 'electron';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { Storage } from './storage';
import { DisplayManager } from './displays';
import type { BibleVersion, Live } from '../src/model';
const dev=process.argv.includes('--dev');let control:BrowserWindow;let storage:Storage;let displays:DisplayManager;let live:Live|null=null;
import {appearance} from './appearance';
import {loadBundledBackgrounds} from './backgrounds';
const verse=z.object({number:z.number().int().positive(),text:z.string().max(200000)});const passage=z.object({id:z.string(),bookId:z.string(),book:z.string().max(1000),chapter:z.number().int().positive(),verses:z.array(verse).max(10000)});
const snapshot=z.object({slides:z.array(z.object({title:z.string().max(2000),verses:z.array(verse)})).min(1).max(20000),index:z.number().int().min(0),appearance,ratio:z.number().min(0.2).max(8),mode:z.enum(['normal','blackout','background']),passageTitle:z.string().max(2000)});
function broadcast(channel:string,data:unknown){for(const w of BrowserWindow.getAllWindows())if(!w.isDestroyed())w.webContents.send(channel,data);}
function backgroundOnly(){if(live)live={...live,mode:'background'};else live={slides:[],index:0,appearance:{...storage.state.appearance},ratio:16/9,mode:'background',passageTitle:''};broadcast('live',live);return live;}
function windowFor(output=false){const w=new BrowserWindow({width:output?1000:1500,height:output?650:950,minWidth:output?320:1080,minHeight:output?240:720,title:output?'Scripture • Presentation':'Scripture Projector',backgroundColor:output?'#000000':'#f4eee4',show:!output,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true,backgroundThrottling:false}});
 w.setMenuBarVisibility(false);w.webContents.setWindowOpenHandler(()=>({action:'deny'}));w.webContents.on('will-navigate',e=>e.preventDefault());
 w.webContents.on('before-input-event',(e,input)=>{if(!output||input.type!=='keyDown'||input.isAutoRepeat)return;if(input.key==='Escape'){e.preventDefault();backgroundOnly();}else if(input.key==='Enter'&&!input.control&&!input.meta&&!input.alt){e.preventDefault();control.webContents.send('request-present');}});
 if(dev)void w.loadURL(`http://127.0.0.1:5173/${output?'?output=1':''}`);else void w.loadFile(path.join(__dirname,'../dist/index.html'),{query:output?{output:'1'}:{}});return w;
}
function handle(name:string,fn:(...args:any[])=>unknown,outputAllowed=false){ipcMain.handle(name,(event,...args)=>{if(event.sender!==control.webContents&&!(outputAllowed&&event.sender===displays.output?.webContents))throw Error('Unauthorized window');return fn(...args);});}
app.whenReady().then(async()=>{
 session.defaultSession.setPermissionRequestHandler((_wc,_permission,cb)=>cb(false));
 session.defaultSession.webRequest.onBeforeRequest((details,cb)=>{const u=new URL(details.url);cb({cancel:!(['file:','data:','devtools:'].includes(u.protocol)||(dev&&u.hostname==='127.0.0.1'&&u.port==='5173'))});});
 const version:BibleVersion=JSON.parse(await fs.readFile(path.join(__dirname,'../resources/bibles/miabanutyun.json'),'utf8'));
 storage=new Storage(app.getPath('userData'),version);try{await storage.load();}catch(e:any){dialog.showErrorBox('Library could not be opened',e.message);app.quit();return;}
 const bundledPhotos=await loadBundledBackgrounds(path.join(__dirname,'../resources/backgrounds'));
 storage.state.backgrounds=[...bundledPhotos,...storage.state.backgrounds.filter(bg=>!bg.id.startsWith('bundled-photo:'))];
 control=windowFor();displays=new DisplayManager(()=>windowFor(true),(notice)=>{broadcast('displays',displays.list());broadcast('output-status',displays.status(notice));});
 handle('load',()=>({library:storage.state,version:{id:version.id,name:version.name,issues:version.issues},displays:displays.list(),live,status:displays.status()}),true);
 handle('import-background',async()=>{const result=await dialog.showOpenDialog(control,{properties:['openFile'],filters:[{name:'Background image',extensions:['png','jpg','jpeg','webp']}]});if(result.canceled)return null;const file=result.filePaths[0];if((await fs.stat(file)).size>20*1024*1024)throw Error('Choose an image under 20 MB.');const bytes=await fs.readFile(file);const ext=path.extname(file).toLowerCase();const mime=ext==='.png'?'image/png':ext==='.webp'?'image/webp':'image/jpeg';const bg={id:randomUUID(),name:path.basename(file),data:`data:${mime};base64,${bytes.toString('base64')}`};storage.state.backgrounds.push(bg);await storage.save();broadcast('backgrounds',storage.state.backgrounds);return bg;});
 handle('save-preferences',async(value:unknown)=>{storage.state.appearance={...appearance.parse(value),fit:'contain'};await storage.save();displays.output?.webContents.send('appearance',storage.state.appearance);if(live){live={...live,appearance:{...live.appearance,titleSeparator:storage.state.appearance.titleSeparator}};broadcast('live',live);}});
 handle('save-queue',async(value:unknown)=>{storage.state.queue=z.array(passage).max(1000).parse(value);await storage.save();});
 handle('open-output',(id:unknown)=>{if(!live)backgroundOnly();return displays.open(z.number().int().nullable().parse(id));});
 handle('present',async(value:unknown,selected:unknown)=>{const next=snapshot.parse(value);const p=passage.parse(selected);if(next.index>=next.slides.length)throw Error('Invalid slide index');const source=storage.state.books.find(b=>b.id===p.bookId)?.chapters.find(c=>c.number===p.chapter);if(!p.verses.length||!source||p.verses.some(v=>!source.verses.some(s=>s.number===v.number&&s.text===v.text)))throw Error('Passage does not match this Bible version.');const entry={id:randomUUID(),passage:p,presentedAt:new Date().toISOString()};storage.state.history.unshift(entry);try{await storage.save();}catch(e){storage.state.history=storage.state.history.filter(h=>h.id!==entry.id);throw e;}live=next;broadcast('live',live);broadcast('history',storage.state.history);return live;});
 handle('live-command',(command:unknown)=>{const c=z.enum(['previous','next','blackout','background','restore']).parse(command);if(c==='background')return backgroundOnly();if(!live)return null;if(c==='previous')live.index=Math.max(0,live.index-1);else if(c==='next')live.index=Math.max(0,Math.min(live.slides.length-1,live.index+1));else live.mode=c==='restore'?(live.slides.length?'normal':'background'):'blackout';broadcast('live',live);return live;},true);
 handle('escape',()=>{backgroundOnly();},true);
 handle('exit-fullscreen',()=>displays.escape());
 control.on('closed',()=>app.quit());
}).catch(e=>{dialog.showErrorBox('Startup error',String(e));app.quit();});
app.on('window-all-closed',()=>app.quit());
