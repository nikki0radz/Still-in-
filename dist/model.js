(function(root){'use strict';
const products={tampon:{name:'Tampon',verb:'Take out',hours:6,max:8,internal:true},cup:{name:'Cup',verb:'Take out',hours:12,max:12,internal:true,ml:true},disc:{name:'Disc',verb:'Take out',hours:12,max:12,internal:true,ml:true},pad:{name:'Pad',verb:'Change',hours:4,max:12},liner:{name:'Liner',verb:'Change',hours:4,max:12},pants:{name:'Period pants',verb:'Change',hours:8,max:12}};
function blank(){return {version:1,active:[],history:[],events:[],days:{},settings:{cheeky:true,hours:{}}};}
function day(ts=Date.now()){const d=new Date(ts);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function duration(type,hours){const p=products[type];if(!p)throw Error('Choose a product');const h=Number(hours);if(!Number.isFinite(h)||h<0.25||h>p.max)throw Error(`Choose between 15 minutes and ${p.max} hours`);return h*3600000;}
function validate(s){if(!s||s.version!==1||!Array.isArray(s.active)||!Array.isArray(s.history)||!s.days||!s.settings)throw Error('Could not read saved data');if(s.events===undefined)s.events=[];if(!Array.isArray(s.events))throw Error('Could not read reports');s.settings.hours=s.settings.hours||{};return s;}
function add(s,type,hours,at=Date.now()){duration(type,hours);if(!Number.isFinite(at)||at>Date.now()+60000)throw Error('Start time cannot be in the future');if(s.active.some(x=>x.type===type))throw Error('Already wearing one — log its removal first');if(products[type].internal&&s.active.some(x=>products[x.type]?.internal))throw Error('Log your current internal product out first');const x={id:Date.now().toString(36)+Math.random().toString(36).slice(2,8),type,start:at,due:at+duration(type,hours),hours:Number(hours)};s.active.push(x);return x;}
function finish(s,id,details={},reinsert=false,at=Date.now()){const i=s.active.findIndex(x=>x.id===id);if(i<0)throw Error('This product was already removed');const x=s.active[i];if(at<x.start)throw Error('Removal cannot be before insertion');if(details.ml!==null&&details.ml!==undefined&&(!Number.isFinite(details.ml)||details.ml<0||details.ml>500))throw Error('Enter a valid amount');s.history.unshift({...x,...details,end:at});s.active.splice(i,1);if(reinsert)add(s,x.type,x.hours,at);return x;}
function timer(x,now=Date.now()){let t=x.due-now;return {overdue:t<=0,ms:Math.abs(t),progress:Math.min(1,Math.max(0,(now-x.start)/(x.due-x.start)))}};
const reportTypes={cramps:'Cramps',leak:'Leaked',wake_dry:'Woke up dry',wake_blood:'Blood on the sheets',bleeding:'Bleeding started',heavy:'Heavy bleeding',clear:'No blood right now',other:'Something else',flow:'Flow updated'};
function report(s,type,details={},at=Date.now()){
 if(!Object.hasOwn(reportTypes,type))throw Error('Choose a report');
 if(!Number.isFinite(at)||at>Date.now()+60000)throw Error('Invalid report time');
 const severity=type==='cramps'?Number(details.severity):null;
 if(type==='cramps'&&(!Number.isInteger(severity)||severity<1||severity>6))throw Error('Choose a cramp level');
 if(type==='flow'&&!['none','spotting','light','medium','heavy'].includes(details.flow))throw Error('Choose a flow level');
 if(!Array.isArray(s.events))s.events=[];
 const x={id:Date.now().toString(36)+Math.random().toString(36).slice(2,9),type,at,severity,note:String(details.note||'').slice(0,1000),...(type==='flow'?{flow:details.flow}:{})};
 s.events.push(x);return x;
}
function dripFrame(x,now=Date.now()){
 const elapsed=Math.max(0,now-x.start),hours=(x.due-x.start)/3600000,wholeHours=Math.floor(elapsed/3600000),overdue=now>=x.due;
 if(!overdue&&wholeHours<1)return {sheet:'everyday',index:[0,2,4][Math.min(2,Math.floor(elapsed/1200000))],key:'idle-'+Math.min(2,Math.floor(elapsed/1200000)),idle:true};
 const type=['tampon','cup','disc','pad'].includes(x.type)?x.type:'pad',count=type==='cup'||type==='disc'?12:6;
 const stage=overdue?count-1:Math.min(count-2,Math.max(0,Math.floor((wholeHours-1)/Math.max(1,hours-1)*(count-1))));
 return {sheet:type,index:(type==='tampon'?6:0)+stage,key:type+'-'+stage,idle:false};
}
function dayBounds(key){const start=new Date(key+'T00:00:00');if(!Number.isFinite(start.getTime()))throw Error('Invalid day');const end=new Date(start);end.setDate(end.getDate()+1);return {start:start.getTime(),end:end.getTime()};}
function sessionsForDay(s,key,now=Date.now()) {const b=dayBounds(key);return [...s.history.map(x=>({...x,active:false})),...s.active.map(x=>({...x,active:true,end:now}))].filter(x=>x.start<b.end&&x.end>b.start).map(x=>({...x,dayStart:Math.max(x.start,b.start),dayEnd:Math.min(x.end,b.end),left:Math.max(0,(x.start-b.start)/(b.end-b.start)),width:Math.max(.003,(Math.min(x.end,b.end)-Math.max(x.start,b.start))/(b.end-b.start))}));}
function entriesForDay(s,key,now=Date.now()){
 const b=dayBounds(key),out=[];
 for(const x of [...s.history,...s.active]) {if(x.start>=b.start&&x.start<b.end)out.push({kind:'in',at:x.start,session:x,id:'in-'+x.id});if(x.end!==undefined&&x.end>=b.start&&x.end<b.end)out.push({kind:'out',at:x.end,session:x,id:'out-'+x.id});}
 for(const x of s.events||[])if(x.at>=b.start&&x.at<b.end)out.push({kind:'report',at:x.at,event:x,id:x.id});
 return out.sort((a,b)=>a.at-b.at||({out:0,'in':1,report:2}[a.kind]-{out:0,'in':1,report:2}[b.kind])||a.id.localeCompare(b.id));
}
const api={products,blank,day,duration,validate,add,finish,timer,reportTypes,report,dripFrame,dayBounds,sessionsForDay,entriesForDay};if(typeof module!=='undefined')module.exports=api;root.StillModel=api;
})(typeof window!=='undefined'?window:globalThis);
