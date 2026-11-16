const SUBJECTS = [
  {id:"physics",name:"Physics",symbol:"◉",tone:"physics"},
  {id:"chemistry",name:"Chemistry",symbol:"◈",tone:"chemistry"},
  {id:"botany",name:"Botany",symbol:"❀",tone:"botany"},
  {id:"zoology",name:"Zoology",symbol:"✿",tone:"zoology"}
];
const COLUMNS=["Module","Race Module","NCERT","JEE Mains","NEET PYQs"];
const STATUSES=["Not yet started","In Progress","Done"];
const KEY="bloom-study-tracker-v2";
let data=loadData(),currentSubject="physics",searchTerm="",toastTimer;
let duration=25*60,remaining=25*60,timerId=null,running=false,mode="focus",sessions=Number(localStorage.getItem("bloom-sessions-today")||0);

function loadData(){
  try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&SUBJECTS.every(s=>Array.isArray(d[s.id])))return d;}catch(e){}
  return Object.fromEntries(SUBJECTS.map(s=>[s.id,[]]));
}
function save(){localStorage.setItem(KEY,JSON.stringify(data));updateOverview();}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function toast(msg){const el=document.getElementById("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2100);}
function newRow(){return {chapter:"",statuses:COLUMNS.map(()=>STATUSES[0])};}
function updateOverview(){
  const rows=SUBJECTS.flatMap(s=>data[s.id]),statuses=rows.flatMap(r=>r.statuses||[]);
  const done=statuses.filter(s=>s==="Done").length,progress=statuses.filter(s=>s==="In Progress").length,pct=statuses.length?Math.round(done/statuses.length*100):0;
  document.getElementById("overallPercent").innerHTML=`${pct}<small>%</small>`;
  document.getElementById("overallBar").style.width=pct+"%";
  document.getElementById("overallTasks").textContent=`${done} of ${statuses.length} study tasks completed`;
  document.getElementById("totalChapters").textContent=rows.length;
  document.getElementById("inProgressTasks").textContent=progress;
  document.getElementById("chapterCount").textContent=`${rows.length} chapters added`;
  SUBJECTS.forEach(s=>document.getElementById(s.id+"Meta").textContent=`${data[s.id].length} chapters`);
}
function showPage(){
  const route=(location.hash.slice(1)||"home").toLowerCase();
  document.querySelectorAll(".page-view").forEach(p=>p.classList.add("hidden"));
  document.querySelectorAll(".main-nav a").forEach(a=>a.classList.toggle("active",a.dataset.nav===route));
  const crumbs={home:"OVERVIEW",physics:"PHYSICS",chemistry:"CHEMISTRY",botany:"BOTANY",zoology:"ZOOLOGY",focus:"FOCUS TIMER"};
  document.getElementById("breadcrumb").innerHTML=`YOUR WORKSPACE <span>/</span> ${crumbs[route]||"OVERVIEW"}`;
  if(route==="focus"){document.getElementById("focusPage").classList.remove("hidden");return;}
  if(SUBJECTS.some(s=>s.id===route)){currentSubject=route;document.getElementById("subjectPage").classList.remove("hidden");renderSubject();return;}
  document.getElementById("homePage").classList.remove("hidden");updateOverview();
}
function renderSubject(){
  const s=SUBJECTS.find(x=>x.id===currentSubject);
  document.getElementById("subjectTitle").textContent=s.name;
  document.getElementById("subjectArt").textContent=s.symbol;
  document.getElementById("subjectBanner").className=`subject-banner ${s.tone}-banner`;
  document.getElementById("subjectEyebrow").textContent=`${s.name.toUpperCase()} WORKSPACE`;
  const list=data[currentSubject].map((r,i)=>{
    if(searchTerm&&!r.chapter.toLowerCase().includes(searchTerm))return "";
    const selects=COLUMNS.map((col,j)=>{const v=r.statuses[j]||STATUSES[0];return `<td><select class="status-select ${v==="Done"?"done":v==="In Progress"?"progress":"todo"}" data-row="${i}" data-col="${j}" aria-label="${col} status"><option ${v===STATUSES[0]?"selected":""}>Not yet started</option><option ${v==="In Progress"?"selected":""}>In Progress</option><option ${v==="Done"?"selected":""}>Done</option></select></td>`;}).join("");
    return `<tr><td><input class="chapter-input" data-row="${i}" maxlength="100" value="${esc(r.chapter)}" placeholder="Type chapter name…"></td>${selects}<td><button class="delete-row" data-delete="${i}" aria-label="Delete chapter" title="Delete chapter">×</button></td></tr>`;
  }).join("");
  document.getElementById("chapterRows").innerHTML=list||`<tr><td colspan="7" class="empty-row">${searchTerm?"No matching chapters found.":"Your chapter list is waiting for you. Add your first chapter above ✿"}</td></tr>`;
  document.getElementById("subjectFooter").textContent=`${data[currentSubject].length} chapters · ${data[currentSubject].filter(r=>r.chapter.trim()).length} named`;
  updateOverview();
}
document.getElementById("addChapterBtn").addEventListener("click",()=>{data[currentSubject].push(newRow());save();renderSubject();const inputs=document.querySelectorAll(".chapter-input");inputs[inputs.length-1]?.focus();});
document.getElementById("chapterRows").addEventListener("input",e=>{if(!e.target.matches(".chapter-input"))return;data[currentSubject][+e.target.dataset.row].chapter=e.target.value;save();document.getElementById("subjectFooter").textContent=`${data[currentSubject].length} chapters · ${data[currentSubject].filter(r=>r.chapter.trim()).length} named`;});
document.getElementById("chapterRows").addEventListener("change",e=>{if(!e.target.matches(".status-select"))return;const r=data[currentSubject][+e.target.dataset.row];r.statuses[+e.target.dataset.col]=e.target.value;save();e.target.className=`status-select ${e.target.value==="Done"?"done":e.target.value==="In Progress"?"progress":"todo"}`;});
document.getElementById("chapterRows").addEventListener("click",e=>{const b=e.target.closest("[data-delete]");if(b&&confirm("Delete this chapter and its progress?")){data[currentSubject].splice(+b.dataset.delete,1);save();renderSubject();toast("Chapter deleted.");}});
document.getElementById("chapterSearch").addEventListener("input",e=>{searchTerm=e.target.value.trim().toLowerCase();renderSubject();});
document.getElementById("printSubjectBtn").addEventListener("click",()=>window.print());
document.getElementById("exportBtn").addEventListener("click",()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="bloom-study-backup.json";a.click();URL.revokeObjectURL(url);toast("Backup downloaded.");});
document.getElementById("importFile").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());if(!SUBJECTS.every(s=>Array.isArray(d[s.id])))throw 0;data=Object.fromEntries(SUBJECTS.map(s=>[s.id,d[s.id].map(r=>({chapter:String(r.chapter||""),statuses:COLUMNS.map((_,i)=>STATUSES.includes(r.statuses?.[i])?r.statuses[i]:STATUSES[0])}))]));save();showPage();toast("Backup restored.");}catch(_){alert("This file is not a valid Bloom backup.");}e.target.value="";});
window.addEventListener("hashchange",()=>{searchTerm="";document.getElementById("chapterSearch").value="";showPage();});
document.getElementById("todayLabel").textContent=new Intl.DateTimeFormat("en-IN",{weekday:"short",day:"numeric",month:"short"}).format(new Date());
document.getElementById("sessionCount").textContent=sessions;

function formatTime(sec){return `${String(Math.floor(sec/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}`;}
function updateTimer(){
  document.getElementById("timerDisplay").textContent=formatTime(remaining);
  document.getElementById("timerCaption").textContent=mode==="focus"?"TIME TO FOCUS":"TAKE A BREATHER";
  document.getElementById("timerMode").textContent=mode==="focus"?"FOCUS SESSION":"BREAK TIME";
  document.getElementById("startPauseBtn").textContent=running?"Pause session":(remaining===duration?"Start "+(mode==="focus"?"focus":"break"):"Resume session");
  const progress=duration?((duration-remaining)/duration):0;
  const deg=Math.round(progress*360);
  document.getElementById("timerRing").style.background=`conic-gradient(#c887a0 0deg ${deg}deg,#f5e9ee ${deg}deg 360deg)`;
  document.title=`${formatTime(remaining)} — Bloom`;
}
function stopTimer(){if(timerId){clearInterval(timerId);timerId=null;}running=false;updateTimer();}
function setTimer(minutes,newMode="focus"){
  stopTimer();mode=newMode;duration=minutes*60;remaining=duration;
  document.querySelectorAll(".preset").forEach(b=>b.classList.toggle("active",newMode==="focus"&&b.dataset.minutes===String(minutes)));
  document.getElementById("customTime").classList.add("hidden");updateTimer();
}
function tick(){
  if(remaining>0){remaining--;updateTimer();return;}
  stopTimer();
  if(mode==="focus"){sessions++;localStorage.setItem("bloom-sessions-today",String(sessions));document.getElementById("sessionCount").textContent=sessions;toast("Focus session complete. Lovely work! ✿");}
  else toast("Break finished. Ready when you are!");
  try{if("Notification"in window&&Notification.permission==="granted")new Notification(mode==="focus"?"Focus session complete!":"Break finished!",{body:mode==="focus"?"Take a short break. You earned it.":"Ready for another focused session?"});}catch(e){}
}
document.getElementById("startPauseBtn").addEventListener("click",()=>{if(running){stopTimer();return;}if(remaining===0)remaining=duration;running=true;updateTimer();timerId=setInterval(tick,1000);});
document.getElementById("resetTimerBtn").addEventListener("click",()=>{stopTimer();remaining=duration;updateTimer();});
document.querySelectorAll(".preset").forEach(b=>b.addEventListener("click",()=>{if(b.dataset.minutes==="custom"){stopTimer();document.getElementById("customTime").classList.remove("hidden");document.querySelectorAll(".preset").forEach(x=>x.classList.remove("active"));return;}setTimer(+b.dataset.minutes);}));
document.getElementById("applyCustom").addEventListener("click",()=>{const n=Math.max(1,Math.min(180,Number(document.getElementById("customMinutes").value)||25));setTimer(n);});
document.getElementById("breakBtn").addEventListener("click",()=>setTimer(5,"break"));
updateTimer();showPage();
