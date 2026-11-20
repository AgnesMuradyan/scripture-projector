import type {Appearance,Background} from './model';
const ratios=new Map<string,Promise<number>>();
export function backgroundRatio(background?:Background):Promise<number|undefined>{
 if(!background)return Promise.resolve(undefined);
 let result=ratios.get(background.data);
 if(!result){result=new Promise<number>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image.naturalWidth/image.naturalHeight);image.onerror=()=>reject(Error('The selected photo could not be decoded. Choose another image.'));image.src=background.data;});ratios.set(background.data,result);}
 return result;
}
// The photo is contained in the screen; text margins are relative to the photo itself.
export function contentBounds(width:number,ratio:number,margin:number|Pick<Appearance,'margin'|'marginTop'|'marginBottom'|'marginLeft'|'marginRight'>,imageRatio?:number){
 const height=width/ratio;
 const photoWidth=imageRatio?Math.min(width,height*imageRatio):width;
 const photoHeight=imageRatio?photoWidth/imageRatio:height;
 const fallback=typeof margin==='number'?margin:margin.margin;
 const top=typeof margin==='number'?margin:margin.marginTop??fallback;
 const bottom=typeof margin==='number'?margin:margin.marginBottom??fallback;
 const left=typeof margin==='number'?margin:margin.marginLeft??fallback;
 const right=typeof margin==='number'?margin:margin.marginRight??fallback;
 return {left:(width-photoWidth)/2+photoWidth*left/100,top:(height-photoHeight)/2+photoHeight*top/100,width:photoWidth*(1-(left+right)/100),height:photoHeight*(1-(top+bottom)/100)};
}
