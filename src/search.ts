import type {Book} from './model';

export function searchScripture(books:Book[],query:string,bookId=''){
 const q=query.trim().toLocaleLowerCase();
 if(q.length<2)return [];
 return books.filter(b=>!bookId||b.id===bookId).flatMap(b=>b.chapters.flatMap(c=>c.verses.filter(v=>v.text.toLocaleLowerCase().includes(q)||`${b.name} ${c.number}:${v.number}`.toLocaleLowerCase().includes(q)||`${b.shortName??b.name} ${c.number}:${v.number}`.toLocaleLowerCase().includes(q)).map(v=>({book:b,chapter:c.number,verse:v}))));
}
