// Chat presentation. All text, including questions, is inserted as text nodes.
const assistant=new ShyamalianEngine(SCHOOL_CONTENT,SCHOOL_INFO);
let chatOpener=$('#chat-toggle'),chatBusy=false,chatEpoch=0;
async function getAssistantReply(question){return assistant.respond(question);}
function setChat(open,opener){dismissWelcome();if(opener)chatOpener=opener;$('#chat-panel').hidden=!open;$('#chat-toggle').setAttribute('aria-expanded',String(open));$('#chat-toggle').setAttribute('aria-label',open?'Close Shyamalian':'Open Shyamalian');if(open)$('#chat-input').focus();else (chatOpener||$('#chat-toggle')).focus();}
function addMessage(text,who,result){
 const el=document.createElement('div');el.className='message '+who;
 const content=document.createElement('p');content.textContent=text;el.append(content);
 if(result?.interpretation){const note=document.createElement('small');note.className='interpretation';note.textContent='Interpreted: '+result.interpretation;el.append(note);}
 if(result?.id){const a=document.createElement('a');a.href='#'+result.id;a.textContent=result.label||'View section';a.className='message-link';a.addEventListener('click',()=>{if(result.query)applyChatQuery(result.query,result.matchedRecordIds||result.records);revealTarget('#'+result.id);setChat(false);});el.append(a);}
 const time=document.createElement('time');time.dateTime=new Date().toISOString();time.textContent=new Date().toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit'});time.className='message-time';el.append(time);
 $('#chat-log').append(el);$('#chat-log').scrollTop=$('#chat-log').scrollHeight;
}
function suggestions(items){$('#chat-suggestions').replaceChildren();for(const text of items.slice(0,4)){const b=document.createElement('button');b.type='button';b.textContent=text;b.dataset.question=text;$('#chat-suggestions').append(b);}}
function updateChatContext(){const q=assistant.context;$('#chat-context').textContent=q?[(q.classes.length?q.classes.map(c=>/^\d+$/.test(c)?'Class '+c:c).join(' / '):'All classes'),q.entity||q.intent,q.period?.label].filter(Boolean).join(' · '):'Ask naturally · Dates use India time';}
async function ask(question){
 const q=question.trim().slice(0,500);if(!q||chatBusy)return;chatBusy=true;const epoch=chatEpoch;addMessage(q,'user');$('#chat-input').value='';$('#chat-send').disabled=true;$('#chat-processing').hidden=false;$('#chat-log').setAttribute('aria-busy','true');
 try{await new Promise(resolve=>setTimeout(resolve,90));const r=await getAssistantReply(q);if(epoch!==chatEpoch)return;addMessage(r.text,'assistant',r);suggestions(r.suggestions||[]);updateChatContext();}
 catch{if(epoch===chatEpoch)addMessage('I could not complete that lookup. Try a class and month, or use the calendar filters below.','assistant');}
 finally{if(epoch===chatEpoch){chatBusy=false;$('#chat-send').disabled=false;$('#chat-processing').hidden=true;$('#chat-log').setAttribute('aria-busy','false');$('#chat-input').focus();}}
}
function clearConversation(){chatEpoch++;chatBusy=false;assistant.reset();$('#chat-log').replaceChildren();$('#chat-send').disabled=false;$('#chat-processing').hidden=true;$('#chat-log').setAttribute('aria-busy','false');$('#chat-input').value='';addMessage(WELCOME,'assistant');suggestions(['About the school','Winter holidays kab hain?','Class 9 science exhibition','Next month holidays']);updateChatContext();}
function applyChatQuery(q,recordIds){
 $('#schedule-class').value=q.classes.length===1?q.classes[0]:'all';$('#schedule-month').value='all';$('#schedule-type').value='all';$('#schedule-search').value='';
 if(q.period&&q.period.start>='2026-04-01'&&q.period.start<='2027-03-31'){month=parseDate(q.period.start.slice(0,7)+'-01');if(q.period.start.slice(0,7)===q.period.end.slice(0,7))$('#schedule-month').value=q.period.start.slice(0,7);}
 selectedDate=q.period&&q.period.start===q.period.end?q.period.start:'';shownActivities=25;shownUpcoming=12;
 // A dedicated results panel preserves exact multi-class, multi-month matching.
 const ids=new Set(recordIds||assistant.lastResults.map(e=>e.id));const results=SCHOOL_CONTENT.events.filter(e=>ids.has(e.id));
 $('#chat-calendar-results').hidden=false;$('#chat-calendar-heading').textContent='Your conversation search · '+results.length+' matching records';$('#chat-calendar-records').innerHTML=results.length?results.map(recordHTML).join(''):'<p>No matching records in the supplied data. See source coverage notes.</p>';
 refreshSchedule();setPlannerView(q.intent==='holiday'||q.intent==='reopening'?'holidays':'activities');
}
function askEvent(id){const e=SCHOOL_CONTENT.events.find(e=>e.id===id);if(!e)return;setChat(true,$('#chat-toggle'));assistant.respond(e.title+(e.classes.length===1?' class '+e.classes[0]:''));assistant.lastResults=[e];addMessage('Tell me about '+e.title+'.','user');addMessage(e.title+' — '+dateRange(e)+'\n'+classLabel(e)+(e.note?'\n'+e.note:'')+'\nSource: supplied calendar, PDF page '+e.source_page+'.','assistant',{id:'school-schedule',label:'View this calendar record',records:[e.id],query:assistant.context});suggestions(['When does it end?','What about Class 10?','Start over']);updateChatContext();}

