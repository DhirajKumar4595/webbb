// A lightweight DOM simulation, not a rendered browser test.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');const root=path.resolve(__dirname,'..');
let checks=0;const ok=(condition,label)=>{assert.ok(condition,label);checks++;};
class Element{
 constructor(tag,attrs={},ancestors=[]){this.tagName=tag;this.attrs=attrs;this.ancestors=ancestors;this.hidden='hidden'in attrs;this.dataset={};this.listeners={};this.children=[];this.style={};this.open=false;this.value=attrs.id?.startsWith('schedule-')&&attrs.id!=='schedule-search'?'all':'';this.src=attrs.src;this.href=attrs.href;this.textContent='';Object.entries(attrs).filter(([k])=>k.startsWith('data-')).forEach(([k,v])=>this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=v);}
 setAttribute(k,v){this.attrs[k]=String(v)}getAttribute(k){return this.attrs[k]}addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)}
 append(...els){this.children.push(...els)}replaceChildren(...els){this.children=[...els]}focus(){document.activeElement=this}click(){if(this.disabled)return;this.dispatch('click',{target:this});}dispatch(type,event={}){for(const f of this.listeners[type]||[])f({preventDefault(){},...event});}
 closest(sel){return [this,...this.ancestors.slice().reverse().map(i=>nodes[i])].find(n=>matches(n,sel))||null;}
 get hash(){return this.href?.startsWith('#')?this.href:'';}
}
const raw=JSON.parse(fs.readFileSync(path.join(root,'tests/dom-nodes.json'))),nodes=raw.map(n=>new Element(n.tag,n.attrs,n.ancestors));
function matches(n,sel){if(sel[0]==='#')return n.attrs.id===sel.slice(1);if(sel[0]==='.')return (n.attrs.class||'').split(' ').includes(sel.slice(1));const att=sel.match(/^\[([^\]]+)\]$/);if(att)return att[1] in n.attrs;if(sel==='a[href^="#"]')return n.tagName==='a'&&n.href?.startsWith('#');return n.tagName===sel;}
function query(sel){if(sel.includes(' ')){const [parent,child]=sel.split(' ');return nodes.find(n=>matches(n,child)&&n.ancestors.some(i=>matches(nodes[i],parent)));}return nodes.find(n=>matches(n,sel))||null;}
const document={querySelector:query,querySelectorAll:sel=>nodes.filter(n=>matches(n,sel)),getElementById:id=>query('#'+id),createElement:t=>new Element(t),listeners:{},activeElement:null,addEventListener(t,f){(this.listeners[t]??=[]).push(f)}};
let welcomeTimer,networkCalls=0;const win={listeners:{},addEventListener(t,f){(this.listeners[t]??=[]).push(f)}};
const ctx={document,window:win,location:{hash:''},Intl,Date,console,Blob,URL,fetch(){networkCalls++;throw Error('Network disabled');},setTimeout(fn,delay){if(delay===1800){welcomeTimer=fn;return;}return setTimeout(fn,0);}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'script.js'),'utf8'),ctx,{timeout:5000});
const run=s=>vm.runInContext(s,ctx),get=id=>query('#'+id),textTree=e=>(e.textContent||'')+e.children.map(textTree).join('');
(async()=>{
 ok(get('calendar-days').children.length===42,'42 calendar cells render');
 ok(get('schedule-count').textContent.includes('183 matching records'),'all records visible with reset filters');
 ok(textTree(get('info-about')).includes('English-medium'),'school introduction is rendered from central facts');
 ok(textTree(get('info-facilities')).includes('laboratories'),'facilities use central facts');
 get('menu-toggle').click();ok(!get('navigation').hidden,'navigation opens');get('menu-toggle').click();ok(get('navigation').hidden,'navigation closes');
 get('schedule-class').value='9';get('schedule-month').value='2026-10';get('schedule-class').dispatch('change');ok(get('activity-records').innerHTML.includes('Abhigyan'),'class/month filters');ok(!get('activity-records').innerHTML.includes('Spell Bee'),'other classes excluded');
 get('schedule-reset').click();ok(get('schedule-count').textContent.includes('183 matching'),'reset restores data');
 get('calendar-class').value='UKG';get('calendar-class').dispatch('change');ok(get('schedule-class').value==='UKG','shared class filter');
 get('tab-holidays').click();ok(!get('holidays').hidden&&get('activities').hidden,'holiday tab');get('tab-holidays').dispatch('keydown',{key:'ArrowRight'});ok(!get('activities').hidden&&get('tab-activities').attrs['aria-selected']==='true','keyboard tab navigation');
 run("revealTarget('#contact')");ok(get('section-directory').open,'hidden navigation destination revealed');
 run("revealTarget('#calendar-sources')");ok(get('calendar-sources').open,'source notes deep link opens');
 get('schedule-reset').click();run("month=new Date(2026,9,1);selectedDate='2026-10-20';renderCalendar()");ok(get('date-events').innerHTML.includes('Autumn Break'),'selected date details');
 get('month-next').click();ok(get('month-label').textContent==='2026 November','calendar month next');get('month-prev').click();ok(get('month-label').textContent==='2026 October','calendar previous');
 const originalImage=query('.hero-image').src;get('hero-next').click();ok(query('.hero-image').src!==originalImage,'second hero uses a distinct supplied photograph');get('hero-prev').click();ok(query('.hero-image').src===originalImage,'hero returns');
 get('leader-next').click();ok(get('leader-title').textContent.includes('Principal'),'leadership carousel');
 welcomeTimer();ok(!get('welcome-popup').hidden,'delayed welcome appears');get('welcome-close').click();ok(get('welcome-popup').hidden,'welcome dismissal');get('chat-toggle').click();ok(!get('chat-panel').hidden,'chat launcher');get('chat-minimize').click();ok(get('chat-panel').hidden,'chat minimize');get('quick-chat').click();ok(!get('chat-panel').hidden,'quick chat opens');
 const response=run("ask('Class 9 science exhibition')");ok(!get('chat-processing').hidden&&get('chat-send').disabled,'processing indicator and send lock');await response;ok(get('chat-processing').hidden&&!get('chat-send').disabled,'processing cleanup');let messages=get('chat-log').children;ok(textTree(messages.at(-1)).includes('14 Oct 2026'),'actual async chat answer');ok(messages.at(-1).children.some(e=>e.tagName==='time'),'timestamps rendered');
 const oldLink=messages.at(-1).children.find(e=>e.tagName==='a');await run("ask('Winter vacation')");oldLink.click();ok(get('chat-calendar-records').innerHTML.includes('Abhigyan'),'older message keeps original result link');ok(!get('chat-calendar-records').innerHTML.includes('Winter Vacation'),'older message does not use new query');ok(get('schedule-class').value==='9','chat query applies class');
 get('chat-results-close').click();ok(get('chat-calendar-results').hidden,'close conversation result panel');
 get('chat-reset').click();ok(get('chat-log').children.length===1&&run('assistant.context')===null,'clear chat resets transcript and memory');
 await run("ask('<img src=x onerror=alert(1)>')");ok(!get('chat-log').children.some(e=>e.children.some(c=>c.tagName==='img')),'user text never becomes HTML');
 const pending=run("ask('Winter vacation')");get('chat-reset').click();await pending;ok(get('chat-log').children.length===1,'clear during pending answer prevents stale message');
 run("askEvent('HOL-18')");ok(textTree(get('chat-log').children.at(-1)).includes('15 Nov 2026'),'record-specific chat exact date');
 get('chat-close').click();ok(get('chat-panel').hidden,'chat close');ok(document.activeElement===get('chat-toggle'),'focus returned to launcher');
 ok(networkCalls===0,'no runtime network request in simulated execution');
 console.log(`PASS: ${checks} interface checks in DOM simulation. Browser rendering/offline mode not tested.`);
 fs.writeFileSync(path.join(root,'tests/interface-results.json'),JSON.stringify({checks,passed:checks,environment:'Node VM with simulated DOM, no browser layout engine',networkCalls},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
