/* Shyamalian: deterministic offline interpretation and retrieval.
   No network, probabilistic generation, DOM writes, or hidden school facts.
   The UI and assistant receive the same calendar/info objects. */
class ShyamalianEngine {
 constructor(calendar,info,clock=()=>new Date()){
  this.data=calendar;this.info=info;this.clock=clock;this.reset();
  this.months=['january','february','march','april','may','june','july','august','september','october','november','december'];
  this.entities=[
   ['winter',['winter','christmas break'],['winter']],['summer',['summer'],['summer']],['autumn',['autumn','dussehra','durga puja'],['autumn']],
   ['deepawali',['deepawali','diwali','chhath','chhat','bhai duj'],['deepawali']],['abhigyan',['abhigyan','science exhibition','science fair'],['abhigyan']],
   ['good friday',['good friday'],['good friday']],['holi',['holi'],['holi']],['birsa',['birsa'],['birsa']],['rath',['rath yatra'],['rath']],
   ['gandhi',['gandhi'],['gandhi']],['ambedkar',['ambedkar'],['ambedkar']],['buddh',['buddh','buddha purnima','buddh poornima'],['buddh']],
   ['republic',['republic day'],['republic']],['independence',['independence day'],['independence']],['raksha',['rakshabandhan','raksha bandhan'],['rakshabandhan']],
   ['janmashtami',['janmashtami','janmastami'],['janmashtami']],['karma',['karma'],['karma']],['muharram',['muharram'],['muharram']],['milad',['milad','eid milad'],['milad']],
   ['fitr',['id ul fitr','eid ul fitr','eid al fitr'],['fitr']],['zoha',['id ul zoha','eid ul adha','bakrid'],['zoha']],['basant',['basant panchami','vasant panchami'],['basant']],
   ['shivratri',['shivratri','shivratni'],['shivratri']],['jummat',['jummat','jumat'],['jummat']],['makar',['makar','sankranti','guru gobind','guru govind'],['makar']],['nanak',['guru nanak'],['nanak']],
   ['story',['story telling','storytelling'],['story telling']],['handwriting',['handwriting'],['handwriting']],['spell',['spell bee','spelling bee'],['spell bee']],['quiz',['quiz'],['quiz']],
   ['music',['music','singing'],['music']],['dance',['dance','dancing'],['dance']],['drama',['drama'],['drama']],['debate',['debate'],['debate']],['essay',['essay'],['essay']],['elocution',['elocution'],['elocution']],
   ['meeting',['ptm','parent teacher meeting','parents teachers meeting'],['meeting']],['prize',['prize distribution','prizes'],['prize']],['grandparents',['grandparents','grand parents'],['grandparents']],
   ['doremi',['do re mi'],['do re mi']],['parvaaz',['parvaaz'],['parvaaz']],['harbingers',['harbingers','harbinger'],['harbinger']],['session',['new session','session begins','session starts'],['session']]
  ];
  this.vocab=[...new Set(('winter summer autumn vacation holiday holidays reopening examination exam exams activities activity calendar school exhibition abhigyan october november december january february march april june july august september admission principal chairman fees syllabus library tomorrow yesterday science competition mathematics '+this.entities.flatMap(e=>e[1]).join(' ')).split(' '))];
 }
 reset(){this.context=null;this.lastResults=[];this.lastQuery=null;this.offset=0;}
 static key(d){return d.toISOString().slice(0,10);}
 static day(s){return new Date(s+'T00:00:00Z');}
 static add(s,n){const d=this.day(s);d.setUTCDate(d.getUTCDate()+n);return this.key(d);}
 static valid(s){const d=this.day(s);return !isNaN(d)&&this.key(d)===s;}
 today(){const d=this.clock();return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);}
 format(s){return ShyamalianEngine.day(s).toLocaleDateString('en-GB',{timeZone:'UTC',day:'numeric',month:'short',year:'numeric'});}
 label(e){return e.classes.length===14?'All classes':e.classes.map(c=>/^\d+$/.test(c)?'Class '+c:c).join(', ');}
 range(e){return this.format(e.start)+(e.end!==e.start?' – '+this.format(e.end):'');}
 distance(a,b){let row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]===b[j-1]?0:1));row=next;}return row[b.length];}
 normalize(raw){
  let q=String(raw).toLowerCase().normalize('NFKC').replace(/&/g,' and ');
  const hindi={'सर्दियों':'winter','गर्मियों':'summer','छुट्टियां':'holidays','छुट्टियाँ':'holidays','छुट्टी':'holiday','परीक्षा':'exam','कक्षा':'class','अगले महीने':'next month','इस महीने':'this month','कब':'when','आज':'today','कल':'kal','खुलेगा':'reopen','स्कूल':'school','नवंबर':'november','अक्टूबर':'october','दिसंबर':'december'};
  for(const [a,b] of Object.entries(hindi))q=q.split(a).join(b);
  q=q.replace(/([a-z])-+(?=[a-z])/g,'$1 ').replace(/\b(class|grade|std)[ -]?(\d+)\b/g,'$1 $2');
  q=q.replace(/[’']/g,'').replace(/[^a-z0-9\s/\-]/g,' ').replace(/\s+/g,' ').trim();
  const aliases=[[/\bchutti(?:yan|yaan)?\b/g,'holiday'],[/\bkab (?:hain|hai|hoga|hogi)\b/g,'when'],[/\b(?:khulega|khulenge|khulna)\b/g,'reopen'],[/\b(?:chalu|resume|resumes|reopens)\b/g,'reopen'],[/\bagle mahine\b/g,'next month'],[/\bis mahine\b/g,'this month'],[/\bpariksha\b/g,'exam'],[/\bmath(?:ematics)?\b/g,'maths'],[/\bstorytelling\b/g,'story telling'],[/\bco curricular\b/g,'activities'],[/\bassessments?\b/g,'exam'],[/\bstandard\b/g,'class'],[/\bmidterm\b/g,'mid term'],[/\bsci exhibition\b/g,'science exhibition'],[/\bjunior kg\b/g,'lkg'],[/\bsenior kg\b/g,'ukg']];
  for(const [a,b] of aliases)q=q.replace(a,b);
  const protectedWords=new Set('start end ends starts finish open closed next last this about when where what which clear reset over more subjects timings history holidays exams tests activities classes maths duration month year week science summer winter autumn class grade school admission fees'.split(' '));
  const corrections=[];
  q=q.split(' ').map(w=>{if(w.length<5||protectedWords.has(w)||this.vocab.includes(w)||/\d/.test(w))return w;const ranked=this.vocab.map(v=>[v,this.distance(w,v)]).filter(x=>x[1]<=(w.length>=8?2:1)).sort((a,b)=>a[1]-b[1]);if(ranked.length&&(!ranked[1]||ranked[0][1]<ranked[1][1])){corrections.push(w+' → '+ranked[0][0]);return ranked[0][0];}return w;}).join(' ');
  return {q,corrections};
 }
 parseClasses(q){
  const roman={i:'1',ii:'2',iii:'3',iv:'4',v:'5',vi:'6',vii:'7',viii:'8',ix:'9',x:'10',xi:'11',xii:'12'};
  const words={one:'1',two:'2',three:'3',four:'4',five:'5',six:'6',seven:'7',eight:'8',nine:'9',ten:'10',eleven:'11',twelve:'12',ninth:'9',tenth:'10',eleventh:'11',twelfth:'12'};
  const decode=x=>x==='lkg'?'LKG':x==='ukg'?'UKG':roman[x]||words[x]||x;let classes=[];
  for(const token of ['lkg','ukg'])if(new RegExp('\\b'+token+'\\b').test(q))classes.push(token.toUpperCase());
  const numeric=q.match(/\b(?:classes|class|grade|std)\s+([a-z0-9]+)(?:\s*(to|through|and|-)\s*(?:class\s+)?([a-z0-9]+))?/);
  if(numeric){const a=decode(numeric[1]),b=decode(numeric[3]);if(!/^(LKG|UKG|[1-9]|1[012])$/.test(a))return {error:'Please choose LKG, UKG or a class from 1 to 12.'};classes.push(a);if(b){if(!/^([1-9]|1[012])$/.test(b))return {error:'The supported classes are LKG, UKG and 1–12.'};if(['to','through','-'].includes(numeric[2])){if(+b<+a)return {error:'Please give the class range in ascending order.'};classes.push(...Array.from({length:+b-+a+1},(_,i)=>String(+a+i)));}else classes.push(b);}}
  const wordGrade=q.match(/\b(ninth|tenth|eleventh|twelfth|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+(?:class|grade)\b/);if(wordGrade)classes.push(words[wordGrade[1]]);
  const shortFollow=q.match(/^(?:and|what about|how about)\s+(1[012]|[1-9])$/);if(shortFollow&&this.context?.classes?.length)classes.push(shortFollow[1]);
  const ord=q.match(/\b(\d{1,2})(?:st|nd|rd|th)\s+(?:class|grade)\b/);if(ord){if(+ord[1]<1||+ord[1]>12)return {error:'Please choose a class from 1 to 12.'};classes.push(ord[1]);}
  if(/\ball classes\b/.test(q))return {classes:[],explicit:true};
  return {classes:[...new Set(classes)],explicit:classes.length>0};
 }
 monthRange(y,m){const a=new Date(Date.UTC(y,m,1)),b=new Date(Date.UTC(y,m+1,0));return {start:ShyamalianEngine.key(a),end:ShyamalianEngine.key(b),label:a.toLocaleDateString('en-GB',{timeZone:'UTC',month:'long',year:'numeric'})};}
 parseTime(q,follow){
  const today=this.today(),d=ShyamalianEngine.day(today);let m;
  if(/\bkal\b/.test(q))return {error:'“Kal” can mean yesterday or tomorrow. Which date do you mean?',suggestions:['Yesterday','Tomorrow']};
  if(/\b(day after tomorrow)\b/.test(q)){const t=ShyamalianEngine.add(today,2);return {start:t,end:t,label:this.format(t)};}
  for(const [w,n]of [['today',0],['tomorrow',1],['yesterday',-1]])if(new RegExp('\\b'+w+'\\b').test(q)){const t=ShyamalianEngine.add(today,n);return {start:t,end:t,label:this.format(t)};}
  if((m=q.match(/\b(this|next|last) week\b/))){const offset=(d.getUTCDay()+6)%7,base=ShyamalianEngine.add(today,-offset+(m[1]==='next'?7:m[1]==='last'?-7:0));return {start:base,end:ShyamalianEngine.add(base,6),label:m[1]+' week (Monday–Sunday)'};}
  if((m=q.match(/\b(this|next|last) month\b/))){let base=d;if(follow&&m[1]!=='this'&&this.context?.period)base=ShyamalianEngine.day(this.context.period.start);return this.monthRange(base.getUTCFullYear(),base.getUTCMonth()+(m[1]==='next'?1:m[1]==='last'?-1:0));}
  const clean=q.replace(/\b(?:class|classes|grade|std)\s+[a-z0-9]+(?:\s*(?:to|and|-)\s*[a-z0-9]+)?/g,'').replace(/\b\d{1,2}(?:st|nd|rd|th)\s+(?:class|grade)\b/g,'');
  const explicitYears=[...clean.matchAll(/\b(20\d{2})\b/g)].map(x=>+x[1]);const yr=explicitYears[0];
  const full=[...clean.matchAll(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/g)].map(x=>x[1]+'-'+x[2].padStart(2,'0')+'-'+x[3].padStart(2,'0'));
  const numeric=[...clean.matchAll(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/g)].map(x=>x[3]+'-'+x[2].padStart(2,'0')+'-'+x[1].padStart(2,'0'));
  let dates=[...full,...numeric];
  const tokens='('+this.months.flatMap(n=>[n,n.slice(0,3)]).join('|')+')';
  const monthIndex=s=>this.months.findIndex(n=>n.startsWith(s));
  const inferredYear=mi=>yr||(mi<3?2027:2026);
  const spans=[...clean.matchAll(new RegExp('\\b(\\d{1,2})(?:st|nd|rd|th)?\\s*(?:to|through|-)\\s*(\\d{1,2})(?:st|nd|rd|th)?\\s+'+tokens+'(?:\\s+(20\\d{2}))?\\b','g'))];
  if(spans.length){const x=spans[0],mi=monthIndex(x[3]),y=+(x[4]||inferredYear(mi));dates=[x[1],x[2]].map(day=>y+'-'+String(mi+1).padStart(2,'0')+'-'+day.padStart(2,'0'));}
  if(!dates.length){for(const x of clean.matchAll(new RegExp('\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+'+tokens+'(?:\\s+(20\\d{2}))?\\b','g'))){const mi=monthIndex(x[2]);dates.push((x[3]||inferredYear(mi))+'-'+String(mi+1).padStart(2,'0')+'-'+x[1].padStart(2,'0'));}
   if(!dates.length)for(const x of clean.matchAll(new RegExp('\\b'+tokens+'\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s+(20\\d{2}))?\\b','g'))){const mi=monthIndex(x[1]);dates.push((x[3]||inferredYear(mi))+'-'+String(mi+1).padStart(2,'0')+'-'+x[2].padStart(2,'0'));}}
  if(dates.length){if(dates.some(x=>!ShyamalianEngine.valid(x)))return {error:'That date is invalid. Please use a real date, such as 14 October 2026.'};if(dates.length>2)return {error:'Please search one date or one date range at a time.'};if(dates.length===2&&dates[0]>dates[1])return {error:'The end date is before the start date. Include both years for a range across New Year.'};return {start:dates[0],end:dates[1]||dates[0],label:dates.map(x=>this.format(x)).join(' – ')};}
  const months=[...clean.matchAll(new RegExp('\\b'+tokens+'\\b','g'))].map(x=>monthIndex(x[1]));
  if(months.length){const a=this.monthRange(inferredYear(months[0]),months[0]),last=months.at(-1);if(months.length>1){let y=inferredYear(last);if(last<months[0])y=Math.max(y,+a.start.slice(0,4)+1);const b=this.monthRange(y,last);return {start:a.start,end:b.end,label:a.label+' – '+b.label};}return a;}
  if(/\b20\d{2}\s*[-/]\s*(?:20\d{2}|\d{2})\b/.test(q)&&!/2026\s*[-/]\s*(?:2027|27)/.test(q))return {error:'Only the supplied academic year 2026–27 is available. I cannot supply another session’s timetable.'};
  if(/2026\s*[-/]\s*(?:2027|27)|academic year|whole year|all months/.test(q))return {start:'2026-04-01',end:'2027-03-31',label:'Academic year 2026–27'};
  if(/\b20\d{2}\s*[-/]\s*(?:20\d{2}|\d{2})\b/.test(q))return {error:'Only the supplied academic year 2026–27 is available. I cannot supply another session’s timetable.'};
  if(yr)return {start:yr+'-01-01',end:yr+'-12-31',label:String(yr)};
  return null;
 }
 factAnswer(f){return {text:f.text+'\n\nSource: '+f.sourceLabel+' · '+f.status+'.',id:f.section,label:'Open '+f.title,suggestions:['About the school','Class 9 activities in October','When is winter vacation?'],factId:f.id};}
 reply(text,extra={}){return {text,id:'school-schedule',label:'Open school calendar',suggestions:['October holidays','Class 9 activities','About the school'],...extra};}
 respond(input){
  if(/<[^>]*>/.test(input))return this.reply('Please ask a school question in plain text. HTML and scripts are not executed.');
  const {q,corrections}=this.normalize(input);if(!q)return this.reply('What would you like to know about school?');
  if(/^(reset|clear chat|start over|new conversation|forget context)$/.test(q)){this.reset();return this.reply('Conversation cleared. Ask about any class, holiday or school information.');}
  if(/^(hi|hello|hey|namaste)$/.test(q))return this.reply('Hello! I’m Shyamalian, your offline JVM Shyamali exhibition assistant. Ask about a class, a date or the school. I answer from saved sources, not live updates.');
  if(/^(thanks|thank you|thankyou|ok|okay)$/.test(q))return this.reply('You’re welcome. What would you like to explore next?');
  if(/chatgpt|language model|are you ai|how do you work/.test(q))return this.reply('I use local JavaScript intent recognition, date parsing, fuzzy matching and structured school records. I am not ChatGPT or a live language model. My school answers work without an API key.',{id:'about'});
  if(/^(more|show more|next results)$/.test(q)){if(!this.lastResults.length)return this.reply('There are no previous results to expand. Ask a calendar question first.');this.offset+=4;return this.compose(this.lastResults,this.lastQuery,corrections);}
  const follow=/^(and\b|what about\b|how about\b|also\b|same\b|when does it\b|when will it\b|when is it\b|how long\b|how many days\b|when does school reopen|when will school reopen|when will the school reopen)/.test(q)||/^(?:class|grade|std)\s+\w+$|^(?:lkg|ukg)$/.test(q);
  const classInfo=this.parseClasses(q);if(classInfo.error)return this.reply(classInfo.error,{suggestions:['LKG activities','Class 9 exams','Class 12 exams']});
  const period=this.parseTime(q,follow);if(period?.error)return this.reply(period.error,{suggestions:period.suggestions||['14 October 2026','Next month']});
  const nav=q.match(/^(?:open|go to|show me the|navigate to)\s+(about|admission|alumni|calendar|holidays|activities|fees|facilities|sources|home)(?: section| page)?$/);
  if(nav){const id={sources:'calendar-sources',calendar:'school-schedule'}[nav[1]]||nav[1];return this.reply('Use the link below to open '+nav[1]+'.',{id,label:'Go to '+nav[1]});}
  const facts=this.info.facts.map(f=>({f,score:Math.max(0,...f.aliases.map(a=>{const needle=a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return new RegExp('\\b'+needle+'\\b').test(q)?a.split(' ').length:0;}))})).filter(x=>x.score).sort((a,b)=>b.score-a.score);
  const scheduleWords=/\b(exam|exams|test|tests|holiday|holidays|vacation|break|event|events|activities|activity|calendar|schedule|reopen|pt|rt|mock|exhibition|tomorrow|today|yesterday)\b/.test(q);
  if(facts.length&&!scheduleWords&&!period){this.reset();return this.factAnswer(facts[0].f);}
  const entities=this.entities.filter(e=>e[1].some(a=>new RegExp('\\b'+a+'\\b').test(q)));
  if(entities.length>1)return this.reply('Please choose one event or holiday so I can answer precisely.',{suggestions:entities.slice(0,4).map(e=>e[1][0])});
  let entity=entities[0];
  if(/\beid\b/.test(q)&&!entity)return this.reply('Which observance do you mean: Id-Ul-Fitr, Id-Ul-Zoha or Milad-Ul-Nabi?',{suggestions:['Id-Ul-Fitr','Id-Ul-Zoha','Milad-Ul-Nabi']});
  let intent=/reopen|back to school|return to school/.test(q)?'reopening':/\b(exam|exams|examination|examinations|test|tests|pt|rt|mock|mid term)\b/.test(q)?'exam':/\b(holiday|holidays|vacation|break|closure|closed)\b/.test(q)?'holiday':/\bsports?\b/.test(q)?'sports':/\b(activities|activity|events|event)\b/.test(q)?'activity':null;
  const openQuestion=/\b(?:is|will|does) (?:the )?school (?:be )?(?:open|closed)|\bschool (?:open|closed) (?:on|today|tomorrow)|\bis there school\b|\bdo (?:i|we) (?:have|need to go to) school/.test(q);
  let classes=classInfo.explicit?classInfo.classes:(follow?this.context?.classes||[]:[]);
  let testType=q.match(/\b(rt|pt|periodic|unit|mock|mid term|annual)\b/)?.[1]||null;
  const testNumber=q.match(/\b(?:rt|pt|test)\s*-?\s*([12])\b/)?.[1]||null;
  const subjects=['english','hindi','maths','evs','sanskrit','computer','science','vocal','instrumental'].filter(s=>new RegExp('\\b'+s+'\\b').test(q));
  const inherited=follow&&this.context;
  if(inherited){if(!entity)entity=this.entities.find(e=>e[0]===this.context.entity);if(!intent)intent=this.context.intent;if(!testType&&!entity)testType=this.context.testType;}
  const endRequested=/\b(end|ends|finish|finishes|last day)\b/.test(q),startRequested=/\b(start|starts|begin|begins|first day)\b/.test(q),duration=/how long|how many days|duration/.test(q);
  const query={classes,intent:intent||'calendar',entity:entity?.[0]||null,period:period||(inherited&&(!entity||entity[0]===this.context.entity)?this.context.period:null),testType,testNumber:testNumber||(inherited&&!entity?this.context.testNumber:null),subjects:subjects.length?subjects.filter(s=>!(s==='science'&&entity?.[0]==='abhigyan')):inherited?this.context.subjects:[],openQuestion,endRequested,startRequested,duration,next:/\b(next|upcoming|nearest)\b/.test(q)&&!period};
  if((endRequested||startRequested||duration)&&!entity&&follow&&!inherited)return this.reply('Which holiday or event do you mean?',{suggestions:['Winter vacation','Summer vacation','Autumn break']});
  if(!scheduleWords&&!entity&&!period&&!classInfo.explicit&&!inherited&&!testType&&!openQuestion){return this.reply('I could not identify a school topic confidently. Ask for a holiday, class, date, admission information or facilities.',{suggestions:['When is winter vacation?','Class 9 exams in October','About the school']});}
  if(inherited&&intent&&intent!==this.context.intent&&!entity){query.testType=testType;query.testNumber=testNumber;query.subjects=subjects;}
  if(openQuestion&&!query.period)return this.reply('Which date should I check? An activity entry alone cannot confirm that school is open.',{suggestions:['Is school open on 14 October 2026?','Is school open tomorrow?']});
  this.context={...query};this.lastQuery=query;this.offset=0;
  let pool=this.data.events.filter(e=>!classes.length||classes.some(c=>e.classes.includes(c)));
  if(query.period)pool=pool.filter(e=>e.start<=query.period.end&&e.end>=query.period.start);
  if(!openQuestion){
   if(entity)pool=pool.filter(e=>entity[2].some(s=>e.title.toLowerCase().includes(s)));
   if(query.intent==='reopening')pool=pool.filter(e=>e.category==='Reopening');
   else if(query.intent==='exam')pool=pool.filter(e=>e.category==='Examination');
   else if(query.intent==='holiday'||(entity&&['winter','summer','autumn','deepawali'].includes(entity[0])))pool=pool.filter(e=>e.id.startsWith('HOL')&&e.category!=='Reopening');
   else if(query.intent==='activity')pool=pool.filter(e=>e.id.startsWith('ACT'));
   else if(query.intent==='sports')pool=pool.filter(e=>e.category==='Sports');
   if(testType){const pattern={rt:/\bRT-/i,pt:/\bPT-|Periodic/i,periodic:/\bPT-|Periodic/i,unit:/Unit/i,mock:/Mock/i,'mid term':/Mid.term/i,annual:/Annual/i}[testType];pool=pool.filter(e=>pattern.test(e.title));}
   if(query.testNumber)pool=pool.filter(e=>new RegExp('(?:Test|PT|RT)[ -]*'+query.testNumber,'i').test(e.title));
   if(query.subjects.length)pool=pool.filter(e=>query.subjects.every(s=>e.title.toLowerCase().includes(s)));
  }
  if(query.next)pool=pool.filter(e=>e.end>=this.today());
  pool.sort((a,b)=>a.start.localeCompare(b.start)||a.title.localeCompare(b.title));
  this.lastResults=pool;return this.compose(pool,query,corrections);
 }
 compose(pool,q,corrections=[]){
  const contextLabel=(q.classes.length?q.classes.map(c=>/^\d+$/.test(c)?'Class '+c:c).join(' / '):'All classes')+(q.period?' · '+q.period.label:'');
  const extra={records:pool.slice(this.offset,this.offset+4).map(e=>e.id),matchedRecordIds:pool.map(e=>e.id),query:q,suggestions:[],label:'View matching calendar records'};
  if(corrections.length)extra.interpretation=corrections.join(', ');
  if(q.period&&(q.period.end<'2026-04-01'||q.period.start>'2027-03-31'))return this.reply(contextLabel+'\nThis date range is outside the supplied academic year (1 Apr 2026–31 Mar 2027). I cannot confirm its schedule.',{...extra,suggestions:['October 2026 activities','Winter vacation']});
  let text='';
  if(q.openQuestion){
   const closures=pool.filter(e=>['Holiday','Vacation'].includes(e.category)&&e.printed_days!==0),reopen=pool.filter(e=>e.category==='Reopening');
   if(closures.length)text='The supplied calendar lists '+closures.map(e=>e.title+' ('+this.range(e)+')').join('; ')+'. This is recorded as a holiday or vacation, subject to later school notices.';
   else if(reopen.length)text='The supplied calendar explicitly lists '+reopen.map(e=>e.title+' on '+this.format(e.start)).join('; ')+'. Check later notices for changes.';
   else text='I cannot confirm that school is open or closed on '+this.format(q.period.start)+'. '+(pool.length?'The calendar lists activities or observances, but those do not establish attendance requirements.':'No matching entry is recorded; missing entries do not establish school opening or closure.');
  }
  const rows=pool.slice(this.offset,this.offset+4);
  if(!pool.length){text=text||(q.entity?'No matching date for that event':'No matching record')+' was found for '+contextLabel+'. This does not mean there are no events or that school is open.';}
  else if(!rows.length){return this.reply('You have reached the end of these '+pool.length+' matching records.',{...extra,suggestions:['Start over','Next month']});}
  else{
   if(!text)text=contextLabel+'\n';else text+='\n\n';
   text+=rows.map(e=>{let date=this.range(e);if(q.endRequested)date='ends '+this.format(e.end);else if(q.startRequested)date='starts '+this.format(e.start);
    let line='• '+e.title+' — '+date+(q.classes.length===1?'':' · '+this.label(e));
    if(q.duration||e.calendar_days){const days=e.calendar_days||Math.round((ShyamalianEngine.day(e.end)-ShyamalianEngine.day(e.start))/86400000)+1;line+='\n  '+days+' inclusive calendar day'+(days===1?'':'s')+(e.printed_days!=null?'; printed holiday count: '+e.printed_days:'')+'.';}
    if(e.note)line+='\n  Note: '+e.note.trim();return line;}).join('\n\n');
   if(pool.length>this.offset+4){text+='\n\nShowing '+(this.offset+1)+'–'+Math.min(this.offset+4,pool.length)+' of '+pool.length+' matching records.';extra.suggestions.push('Show more');}
  }
  const gaps=this.data.coverage.filter(g=>g.missing.length&&(!q.classes.length||q.classes.some(c=>g.classes.includes(c)))&&(!q.period||g.missing.some(m=>{const start=m.includes('2027')?'2027-01-01':'2026-04-01',end=m.includes('2027')?'2027-03-31':'2026-06-30';return q.period.start<=end&&q.period.end>=start;})));
  if(gaps.length&&(!q.entity||!pool.length)&&!q.openQuestion&&(q.intent!=='holiday'&&q.intent!=='reopening'||!pool.length))text+='\n\nSource gap: '+gaps.map(g=>g.classes.map(c=>'Class '+c).join('/')+' · '+g.missing.join(', ')).join('; ')+'.';
  if(q.period&&(q.period.start<'2026-04-01'||q.period.end>'2027-03-31'))text+='\nOnly the part within Apr 2026–Mar 2027 is covered.';
  text+='\n\nSource: supplied 2026–27 calendar'+(rows.length?' · PDF page'+([...new Set(rows.map(e=>e.source_page))].length>1?'s ':' ')+[...new Set(rows.map(e=>e.source_page))].join(', '):'')+'. Later notices may change dates.';
  if(['summer','winter','autumn','deepawali'].includes(q.entity))extra.suggestions.push('When will school reopen?','How many days?');
  else extra.suggestions.push('And next month?','What about Class 10?');
  extra.suggestions.push('Start over');return this.reply(text,extra);
 }
}
