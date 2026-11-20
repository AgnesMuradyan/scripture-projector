import test from 'node:test';
import assert from 'node:assert/strict';
import {promises as fs} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {loadBundledBackgrounds} from '../electron/backgrounds';

test('bundled photos use stable IDs, offline data and exclude other files',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'bundled-photos-'));
 try{
  await fs.writeFile(path.join(dir,'Ararat.JPG'),Buffer.from([1,2,3]));
  await fs.writeFile(path.join(dir,'credits.txt'),'credit');
  const [photo]=await loadBundledBackgrounds(dir);
  assert.equal((await loadBundledBackgrounds(dir)).length,1);
  assert.equal(photo.name,'Ararat');
  assert.equal(photo.data,'data:image/jpeg;base64,AQID');
  assert.ok(photo.id.length<=100);
  assert.equal((await loadBundledBackgrounds(dir))[0].id,photo.id);
  assert.deepEqual(await loadBundledBackgrounds(path.join(dir,'missing')),[]);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
