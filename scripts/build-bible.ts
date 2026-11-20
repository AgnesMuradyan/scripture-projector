import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {parseBook} from '../electron/parser';
import {BOOK_SHORT_NAMES,DEFAULT_VERSION} from '../src/bible-catalog';
import type {BibleVersion,Book} from '../src/model';
async function main(){
 const books:Book[]=[];const issues:string[]=[];
 for(let index=1;index<=66;index++){
  const source=`Book${index}.html`;
  const raw=await readFile(path.resolve('resources/source/miabanutyun',source),'utf8');
  const result=parseBook(raw,source);issues.push(...result.issues.map(issue=>`${source}: ${issue}`));
  if(!result.book)throw Error(`Cannot bundle ${source}: ${result.issues.join('; ')}`);
  const book=result.book;
  books.push({...book,id:`${DEFAULT_VERSION.id}:${index}`,sourceName:book.name,name:index===25?'Ողբ Երեմիայի':book.name,shortName:BOOK_SHORT_NAMES[index-1],ordinal:index});
 }
 issues.unshift('Book25.html repeats the heading Երեմիա from Book24.html. Catalog label Ողբ Երեմիայի distinguishes its five-chapter lament; source heading and all verse text are preserved.');
 const version:BibleVersion={...DEFAULT_VERSION,books,issues};
 await mkdir('resources/bibles',{recursive:true});await writeFile('resources/bibles/miabanutyun.json',JSON.stringify(version));
 const chapters=books.flatMap(b=>b.chapters);const verses=chapters.flatMap(c=>c.verses);
 await writeFile('resources/bibles/validation.json',JSON.stringify({version:version.name,books:books.length,chapters:chapters.length,verses:verses.length,issues},null,2)+'\n');
 console.log(`Bundled ${version.name}: ${books.length} books, ${chapters.length} chapters, ${verses.length} verses. ${issues.length} source notes; see resources/bibles/validation.json.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
