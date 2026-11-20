import test from 'node:test';
import assert from 'node:assert/strict';
import {searchScripture} from '../src/search';
import type {Book} from '../src/model';
const books:Book[]=[{id:'one',name:'Առաջին',shortName:'Ա',source:'',chapters:[{number:1,verses:[{number:1,text:'Սեր և խաղաղություն'}]}]},{id:'two',name:'Երկրորդ',source:'',chapters:[{number:2,verses:[{number:3,text:'Սեր և լույս'}]}]}];
test('search defaults to the whole Bible and supports a selected book',()=>{
 assert.deepEqual(searchScripture(books,'Սեր').map(r=>r.book.id),['one','two']);
 assert.deepEqual(searchScripture(books,'Սեր','two').map(r=>r.book.id),['two']);
 assert.equal(searchScripture(books,'խաղաղություն','two').length,0);
 assert.equal(searchScripture(books,'Սեր','missing').length,0);
});
test('book filter preserves reference search and normalizes whitespace',()=>{
 assert.equal(searchScripture(books,'  Ա 1:1  ','one').length,1);
 assert.equal(searchScripture(books,'Ա 1:1','two').length,0);
 assert.equal(searchScripture(books,' ').length,0);
});
