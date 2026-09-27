const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'../assets/js/appearance.js'),'utf8');
function setup(stored, dark=false, blocked=false, reduced=false) {
    const attrs={},listeners={},windowListeners={},classes=new Set();
    const media={matches:dark,addEventListener:(_,fn)=>media.change=fn};
    const buttons=Array.from({length:2},()=>({setAttribute(k,v){this[k]=v;},addEventListener(_,fn){this.click=()=>fn({stopPropagation(){}});}}));
    const controls=buttons.map(button=>{const tip={};const c={querySelector:s=>s==='button'?button:tip,classList:{add(){},remove(){}}};button.parentElement=c;return c;});
    const root={style:{},setAttribute:(k,v)=>attrs[k]=v,classList:{add:v=>classes.add(v),remove:v=>classes.delete(v)}};
    const doc={documentElement:root,querySelectorAll:s=>s==='.appearance-control'?controls:buttons,addEventListener:(k,f)=>listeners[k]=f,createElement:()=>({setAttribute(){}}),body:{appendChild(){}}};
    const storage={getItem(){if(blocked)throw Error('blocked');return stored;},setItem(_,value){if(blocked)throw Error('blocked');stored=value;}};
    vm.runInNewContext(source,{document:doc,window:{matchMedia:s=>s.includes('reduced')?{matches:reduced}:media,addEventListener:(k,f)=>windowListeners[k]=f},localStorage:storage,setTimeout:()=>1,clearTimeout(){}});
    listeners.DOMContentLoaded();
    return {attrs,root,buttons,media,classes,stored:()=>stored,storageEvent:windowListeners.storage};
}
test('default light, two-mode cycling, two headers and early canvas',()=>{
    const s=setup(null,true);assert.equal(s.attrs['data-appearance'],'light');assert.equal(s.attrs['data-color-mode'],'light');assert.equal(s.root.style.backgroundColor,'#f3f3f6');
    for(const mode of ['dark','light','dark','light']){s.buttons[0].click();assert.equal(s.attrs['data-appearance'],mode);assert.equal(s.stored(),mode);assert.equal(s.buttons[0]['aria-label'],s.buttons[1]['aria-label']);}
});
test('saved preferences, invalid values and blocked storage',()=>{
    assert.equal(setup('dark').attrs['data-color-mode'],'dark');assert.equal(setup('bad').attrs['data-appearance'],'light');
    const s=setup(null,false,true);s.buttons[0].click();assert.equal(s.attrs['data-color-mode'],'dark');s.buttons[0].click();assert.equal(s.attrs['data-color-mode'],'light');
});
test('legacy system migrates once with no system listener',()=>{
    for(const dark of [false,true]){const s=setup('system',dark);const mode=dark?'dark':'light';assert.equal(s.attrs['data-color-mode'],mode);assert.equal(s.stored(),mode);assert.equal(s.media.change,undefined);s.media.matches=!dark;assert.equal(s.attrs['data-color-mode'],mode);}
});
test('other tabs, removal, unrelated key and reduced motion',()=>{
    const s=setup('light',true,false,true);s.storageEvent({key:'unrelated',newValue:'dark'});assert.equal(s.attrs['data-appearance'],'light');
    s.storageEvent({key:'law100.blog.appearance',newValue:'dark'});assert.equal(s.attrs['data-color-mode'],'dark');assert.equal(s.classes.size,0);
    s.storageEvent({key:'law100.blog.appearance',newValue:null});assert.equal(s.attrs['data-appearance'],'light');
    s.storageEvent({key:'law100.blog.appearance',newValue:'system'});assert.equal(s.attrs['data-appearance'],'dark');assert.equal(s.stored(),'dark');
});
