const QUESTIONS = [{"id": 1, "prompt": "Would you rather get $1,000 today or $2,000 one year from now?", "options": [{"label": "$1,000 today", "sub": "Immediate and certain", "crowd": 63}, {"label": "$2,000 in one year", "sub": "Wait for the larger reward", "crowd": 37}]}, {"id": 2, "prompt": "Which would most people choose for a free evening?", "options": [{"label": "Stay home", "sub": "A quiet night in", "crowd": 58}, {"label": "Go out", "sub": "Meet people or explore", "crowd": 42}]}, {"id": 3, "prompt": "Which notification would you open first?", "options": [{"label": "A message from a friend", "sub": "Personal conversation", "crowd": 72}, {"label": "A work email", "sub": "Something that might matter", "crowd": 28}]}, {"id": 4, "prompt": "You can master one skill instantly. Which would people pick?", "options": [{"label": "Speak any language", "sub": "Communicate anywhere", "crowd": 54}, {"label": "Play any instrument", "sub": "Make music effortlessly", "crowd": 46}]}, {"id": 5, "prompt": "Which is harder for most people?", "options": [{"label": "Say no", "sub": "Set a clear boundary", "crowd": 61}, {"label": "Ask for help", "sub": "Admit you need support", "crowd": 39}]}, {"id": 6, "prompt": "A surprise 3-day break appears. Where would most people go?", "options": [{"label": "Somewhere new", "sub": "Explore a new place", "crowd": 57}, {"label": "Somewhere familiar", "sub": "Return to a favorite", "crowd": 43}]}, {"id": 7, "prompt": "Which small win feels better?", "options": [{"label": "Finding money in a pocket", "sub": "Unexpected cash", "crowd": 66}, {"label": "Getting a compliment", "sub": "A few good words", "crowd": 34}]}, {"id": 8, "prompt": "Which would most people keep if they could keep only one?", "options": [{"label": "Photos", "sub": "Keep the memories", "crowd": 79}, {"label": "Messages", "sub": "Keep the conversations", "crowd": 21}]}, {"id": 9, "prompt": "Which meal would people choose for a comfort night?", "options": [{"label": "Pizza", "sub": "Easy and familiar", "crowd": 64}, {"label": "Burger", "sub": "Classic and filling", "crowd": 36}]}, {"id": 10, "prompt": "Which is more satisfying to finish?", "options": [{"label": "A messy task", "sub": "Finally off your mind", "crowd": 67}, {"label": "A creative project", "sub": "Something you made", "crowd": 33}]}, {"id": 11, "prompt": "Which would people rather have at 8 a.m.?", "options": [{"label": "Good news", "sub": "A bright start", "crowd": 74}, {"label": "Extra sleep", "sub": "Ten more minutes", "crowd": 26}]}, {"id": 12, "prompt": "Which would most people choose on a first visit to a new city?", "options": [{"label": "Walk around", "sub": "See what happens", "crowd": 62}, {"label": "Follow a plan", "sub": "Hit the main spots", "crowd": 38}]}, {"id": 13, "prompt": "Which purchase feels easier to justify?", "options": [{"label": "Something useful", "sub": "Practical value", "crowd": 71}, {"label": "Something fun", "sub": "Pure enjoyment", "crowd": 29}]}, {"id": 14, "prompt": "Which would most people protect more carefully?", "options": [{"label": "Their free time", "sub": "Time that is truly theirs", "crowd": 56}, {"label": "Their money", "sub": "Financial security", "crowd": 44}]}, {"id": 15, "prompt": "Which is more tempting after a long day?", "options": [{"label": "Watch one more episode", "sub": "Keep the story going", "crowd": 69}, {"label": "Go to bed early", "sub": "Start fresh tomorrow", "crowd": 31}]}, {"id": 16, "prompt": "Which would most people choose for a weekend?", "options": [{"label": "A quiet place", "sub": "Peace and space", "crowd": 52}, {"label": "A busy city", "sub": "Energy and options", "crowd": 48}]}, {"id": 17, "prompt": "Which would you rather know instantly?", "options": [{"label": "What people think of you", "sub": "Unfiltered opinions", "crowd": 43}, {"label": "What your future looks like", "sub": "One clear glimpse", "crowd": 57}]}, {"id": 18, "prompt": "Which habit is harder to start?", "options": [{"label": "Daily exercise", "sub": "Move every day", "crowd": 59}, {"label": "Daily reading", "sub": "Read every day", "crowd": 41}]}, {"id": 19, "prompt": "Which would most people choose for a free upgrade?", "options": [{"label": "Bigger room", "sub": "More space", "crowd": 55}, {"label": "Better view", "sub": "A better scene", "crowd": 45}]}, {"id": 20, "prompt": "Which would most people delete first from their phone?", "options": [{"label": "Old screenshots", "sub": "Clutter with no purpose", "crowd": 78}, {"label": "Old conversations", "sub": "Past chats", "crowd": 22}]}];
const KEY = "oneMoreStateV1";

const $ = (sel) => document.querySelector(sel);
const todayKey = () => new Date().toISOString().slice(0,10);
const state = loadState();

function loadState(){
  try{
    return Object.assign({played:0,scores:[],best:0,lastPlayed:null,streak:0,answers:{}}, JSON.parse(localStorage.getItem(KEY)||"{}"));
  }catch{ return {played:0,scores:[],best:0,lastPlayed:null,streak:0,answers:{}}; }
}
function saveState(){ localStorage.setItem(KEY, JSON.stringify(state)); updateStats(); }

function questionFor(day=todayKey()){
  let hash=0;
  for(const ch of day) hash=(hash*31+ch.charCodeAt(0))>>>0;
  return QUESTIONS[hash % QUESTIONS.length];
}
function getSharedId(){
  const id = new URLSearchParams(location.search).get("q");
  const n = Number(id);
  return Number.isInteger(n) && n>=1 && n<=QUESTIONS.length ? n : null;
}
function currentQuestion(){ return getSharedId() ? QUESTIONS[getSharedId()-1] : questionFor(); }

function formatDate(){
  return new Intl.DateTimeFormat(undefined,{weekday:"long",month:"short",day:"numeric"}).format(new Date());
}
function render(){
  $("#dateLabel").textContent = getSharedId() ? "Challenge" : formatDate();
  const q = currentQuestion();
  $("#questionCount").textContent = `Question ${q.id} / ${QUESTIONS.length}`;

  const saved = state.answers[String(q.id)];
  let selected = saved?.selected ?? null;
  let revealed = !!saved?.revealed;
  let predicted = saved?.predicted ?? 50;

  const root = $("#game");
  root.innerHTML = `
    <h2 class="question">${escapeHtml(q.prompt)}</h2>
    <div class="answers">
      ${q.options.map((o,i)=>`
        <button class="answer-btn ${selected===i?'selected':''}" data-index="${i}" type="button" ${revealed?'disabled':''}>
          <span class="answer-main">${escapeHtml(o.label)}</span>
          <span class="answer-sub">${escapeHtml(o.sub)}</span>
        </button>`).join("")}
    </div>
    <div class="predict-box">
      <div class="predict-head">
        <div>
          <p class="predict-title">What percentage will choose it?</p>
          <p class="answer-sub">Move the slider before you reveal the crowd.</p>
        </div>
        <div class="big-percent" id="percentValue">${predicted}%</div>
      </div>
      <div class="range-wrap">
        <input id="percent" type="range" min="1" max="99" value="${predicted}" aria-label="Predicted percentage" ${selected===null||revealed?'disabled':''}>
        <div class="range-labels"><span>1%</span><span>50%</span><span>99%</span></div>
      </div>
      <div class="action-row">
        <button class="primary-btn" id="revealBtn" type="button" ${selected===null||revealed?'disabled':''}>Reveal crowd</button>
        ${revealed?'<button class="secondary-btn" id="shareResultBtn" type="button">Share result</button>':''}
      </div>
    </div>
    <div class="result ${revealed?'visible':''}" id="result">
      ${revealed ? resultMarkup(q,saved) : ""}
    </div>
  `;

  root.querySelectorAll(".answer-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      selected=Number(btn.dataset.index);
      root.querySelectorAll(".answer-btn").forEach(b=>b.classList.toggle("selected", b===btn));
      $("#percent").disabled=false;
      $("#revealBtn").disabled=false;
    });
  });
  $("#percent")?.addEventListener("input",e=>$("#percentValue").textContent=`${e.target.value}%`);
  $("#revealBtn")?.addEventListener("click",()=>{
    const pct=Number($("#percent").value);
    const crowd=q.options[selected].crowd;
    const score=Math.max(0,100-Math.abs(pct-crowd)*2);
    const key=String(q.id);
    state.answers[key]={selected,predicted:pct,crowd,score,revealed:true,day:todayKey()};
    state.played += 1;
    state.scores.push(score);
    state.best=Math.max(state.best,score);
    updateStreak();
    saveState();
    render();
  });
  $("#shareResultBtn")?.addEventListener("click",()=>openShare(q,state.answers[String(q.id)]));
  updateStats();
}

function resultMarkup(q,r){
  const diff=Math.abs(r.predicted-r.crowd);
  const chosen=q.options[r.selected].label;
  return `
    <div class="result-top">
      <div>
        <div class="score">${r.score}<small>OUT OF 100</small></div>
        <p class="result-copy">You were <strong>${diff}% off</strong>. The crowd landed on <strong>${r.crowd}%</strong> for “${escapeHtml(chosen)}”.</p>
      </div>
    </div>
    <div class="result-line">
      <div class="result-metric"><span>Your guess</span><strong>${r.predicted}%</strong></div>
      <div class="result-metric"><span>Crowd</span><strong>${r.crowd}%</strong></div>
    </div>`;
}

function updateStreak(){
  const today=todayKey();
  if(state.lastPlayed===today) return;
  if(state.lastPlayed){
    const a=new Date(state.lastPlayed+"T00:00:00Z");
    const b=new Date(today+"T00:00:00Z");
    const days=Math.round((b-a)/86400000);
    state.streak = days===1 ? state.streak+1 : 1;
  }else state.streak=1;
  state.lastPlayed=today;
}
function updateStats(){
  $("#playedStat").textContent=state.played;
  $("#avgStat").textContent=state.scores.length ? Math.round(state.scores.reduce((a,b)=>a+b,0)/state.scores.length) : "—";
  $("#bestStat").textContent=state.scores.length ? state.best : "—";
  $("#streakStat").textContent=state.streak;
}

function openShare(q,r){
  const url=new URL(location.href);
  url.searchParams.set("q",q.id);
  $("#shareCard").innerHTML=`
    <div class="share-brand">ONE MORE.</div>
    <div class="share-score">${r.score}</div>
    <div class="share-details">I predicted <strong>${r.predicted}%</strong>. The crowd was <strong>${r.crowd}%</strong>.<br>Can you beat me?</div>`;
  $("#shareDialog").hidden=false;
  window.__share={q,r,url:url.toString()};
}
async function nativeShare(){
  const s=window.__share; if(!s) return;
  const text=`I scored ${s.r.score}/100 on One More. I predicted ${s.r.predicted}%. The crowd was ${s.r.crowd}%. Can you beat me?`;
  if(navigator.share){ try{await navigator.share({title:"One More",text,url:s.url});return;}catch(e){} }
  await navigator.clipboard?.writeText(`${text}\n${s.url}`);
  $("#copyBtn").textContent="Copied";
}
$("#shareBtn").addEventListener("click",nativeShare);
$("#copyBtn").addEventListener("click",nativeShare);
document.querySelectorAll("[data-close-dialog]").forEach(el=>el.addEventListener("click",()=>$("#shareDialog").hidden=true));

function escapeHtml(v){
  return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
}
render();

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
