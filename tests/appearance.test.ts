import test from 'node:test';
import assert from 'node:assert/strict';
import {appearance} from '../electron/appearance';
import {defaults} from '../src/model';
import {titleStyle} from '../src/layout';

test('presentation validation preserves SHK Aida and every separator option',()=>{
 for(const titleSeparator of ['none','line','fade','double','diamond','cross'] as const){
  const settings={...defaults,titleFont:'SHK Aida',verseFont:'SHK Aida',titleSeparator};
  assert.deepEqual(appearance.parse(settings),settings);
 }
});
test('separator changes preserve the space used to paginate a live passage',()=>{
 const hidden=titleStyle({...defaults,titleSeparator:'none'});
 for(const titleSeparator of ['line','fade','double','diamond','cross'] as const)
  assert.deepEqual(titleStyle({...defaults,titleSeparator}),hidden);
});
test('older saved settings receive the default separator',()=>{
 const {titleSeparator,...legacy}=defaults;
 assert.equal(appearance.parse(legacy).titleSeparator,titleSeparator);
});
