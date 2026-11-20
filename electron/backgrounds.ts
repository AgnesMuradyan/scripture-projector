import {promises as fs} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import type {Background} from '../src/model';

export async function loadBundledBackgrounds(directory:string):Promise<Background[]>{
 let entries;
 try{entries=await fs.readdir(directory,{withFileTypes:true});}
 catch(error:any){if(error.code==='ENOENT')return [];throw error;}
 const mime:Record<string,string>={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp'};
 const photos:Background[]=[];
 for(const entry of entries.sort((a,b)=>a.name.localeCompare(b.name))){
  const type=mime[path.extname(entry.name).toLowerCase()];
  if(!entry.isFile()||!type)continue;
  const data=await fs.readFile(path.join(directory,entry.name));
  photos.push({id:`bundled-photo:${createHash('sha256').update(entry.name).digest('hex')}`,name:path.parse(entry.name).name,data:`data:${type};base64,${data.toString('base64')}`});
 }
 return photos;
}
