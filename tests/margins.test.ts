import test from 'node:test';
import assert from 'node:assert/strict';
import {contentBounds} from '../src/image-layout';
import {defaults} from '../src/model';
import {appearance} from '../electron/appearance';

test('independent margins position and size the safe area within a contained photo',()=>{
 const a={...defaults,marginTop:10,marginBottom:20,marginLeft:5,marginRight:15};
 const bounds=contentBounds(1000,2,a,1);
 assert.deepEqual(bounds,{left:275,top:50,width:400,height:350});
 assert.deepEqual(appearance.parse(a),a);
});
test('old uniform margins remain unchanged until each side is customized',()=>{
 const a={...defaults,margin:12};
 assert.deepEqual(contentBounds(1000,2,a),contentBounds(1000,2,12));
 assert.deepEqual(contentBounds(1000,2,{...a,marginLeft:0}),{left:0,top:60,width:880,height:380});
});
test('invalid margins are rejected',()=>{
 assert.equal(appearance.safeParse({...defaults,marginRight:31}).success,false);
 assert.equal(appearance.safeParse({...defaults,marginTop:-1}).success,false);
});
