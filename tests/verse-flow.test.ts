import test from 'node:test';
import assert from 'node:assert/strict';
import {verseJoin} from '../src/layout';
const joins=(numbers:number[])=>numbers.slice(1).map((number,i)=>verseJoin({number:numbers[i],text:''},{number,text:''}));
test('consecutive verses flow together, while gaps start a new line',()=>{
 assert.deepEqual(joins([2,3,4]),[' ',' ']);
 assert.deepEqual(joins([2,3,9]),[' ','\n']);
 assert.deepEqual(joins([2,3,9,10,14]),[' ','\n',' ','\n']);
});
test('continued fragments of a verse stay in the same paragraph',()=>{
 assert.deepEqual(joins([2,2,3]),[' ',' ']);
});
