(() => {
  "use strict";
  const SAVE_KEY = "empireTerminalSave_v1";
  const $ = id => document.getElementById(id);
  const fmt = n => {
    if (!Number.isFinite(n)) n = 0;
    const abs = Math.abs(n);
    if (abs >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
    if (abs >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
    if (abs >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
    if (abs >= 1e4) return "$" + n.toLocaleString("en-US", {maximumFractionDigits:0});
    return "$" + n.toLocaleString("en-US", {minimumFractionDigits:0, maximumFractionDigits:2});
  };
  const num = n => Number(n).toLocaleString("en-US");
  const businesses = [
    {id:"kiosk",name:"Corner Kiosk",desc:"A tiny operation with room to grow.",cost:100,income:1,unlock:0},
    {id:"cafe",name:"Coffee Counter",desc:"A steady stream of caffeine and cash.",cost:750,income:7,unlock:250},
    {id:"studio",name:"Creative Studio",desc:"Small teams make products people want.",cost:6000,income:48,unlock:2500},
    {id:"logistics",name:"Logistics Firm",desc:"Move goods. Connect markets. Scale up.",cost:50000,income:360,unlock:20000},
    {id:"tech",name:"Technology Company",desc:"Build tools that other businesses depend on.",cost:450000,income:2800,unlock:150000},
    {id:"bank",name:"Investment House",desc:"Capital begins to multiply capital.",cost:4000000,income:22000,unlock:1500000},
    {id:"global",name:"Global Conglomerate",desc:"A network of companies across the world.",cost:50000000,income:260000,unlock:15000000}
  ];
  const upgrades = [
    {id:"pitch",name:"Sharper Pitch",desc:"+1 base income per tap each level.",base:50,growth:1.65,effect:1,type:"tap"},
    {id:"automation",name:"Workflow Automation",desc:"+25% passive income per level.",base:300,growth:1.9,effect:.25,type:"passive"},
    {id:"marketing",name:"Marketing Campaign",desc:"+10% income from every source per level.",base:1200,growth:2.1,effect:.10,type:"all"},
    {id:"negotiation",name:"Negotiation Training",desc:"+15% tap income per level.",base:500,growth:1.85,effect:.15,type:"tapmult"}
  ];
  const chapters = [
    {title:"A Small Beginning",text:"Your company is a desk, a second-hand laptop, and a balance that barely covers tomorrow. A local shop owner offers you a chance to run a tiny kiosk. It will not make you famous, but it could be your first proof that the plan works.",choices:[
      {title:"Take the practical deal",detail:"Pay $50 for supplies. Gain a small, steady boost.",cost:50,reward:120,flag:"practical",result:"You choose steady progress. The shop owner introduces you to two nearby suppliers. Your reputation starts with reliability."},
      {title:"Negotiate for a bigger cut",detail:"No upfront cost. A riskier first impression.",cost:0,reward:70,flag:"bold",result:"You hold your ground. The deal is smaller, but you keep your cash and learn that every conversation has a price."}
    ]},
    {title:"The First Rival",text:"A competing kiosk opens across the street and cuts prices. Your adviser suggests two paths: protect your reputation or fight for attention. This decision will shape how your company is known.",choices:[
      {title:"Win customers with quality",detail:"Spend $250. Earn a reputation for reliability.",cost:250,reward:500,flag:"quality",result:"Customers notice the difference. Your name spreads slowly, but people trust what you sell."},
      {title:"Launch an aggressive promotion",detail:"Spend $100. Bring in quick attention.",cost:100,reward:300,flag:"aggressive",result:"The promotion gets attention. You gain short-term momentum and learn to measure every campaign."}
    ]},
    {title:"A Door Opens",text:"A regional supplier has noticed your growth. They can offer a discount, but they want a long-term commitment. Your company is finally being taken seriously.",choices:[
      {title:"Sign a cautious agreement",detail:"Spend $1,000. Unlock a lasting capital bonus.",cost:1000,reward:2200,flag:"cautious",result:"You negotiate clear terms and keep room to change direction. The supplier becomes a dependable partner."},
      {title:"Make a bold expansion promise",detail:"Spend $500. Receive a larger immediate payment.",cost:500,reward:1800,flag:"bolddeal",result:"You make a confident promise. The bigger deal pays off today, and now you must grow into the ambition."}
    ]},
    {title:"The Bigger Picture",text:"Your team wants to expand into a new market. The numbers look promising, but expansion means risk. Decide what kind of leader you want to be.",choices:[
      {title:"Build slowly and sustainably",detail:"Spend $5,000. Improve passive income permanently.",cost:5000,reward:9000,flag:"sustainable",result:"You invest in training and dependable systems. Growth takes patience, but the company becomes stronger."},
      {title:"Move fast and capture the market",detail:"Spend $2,500. Take a larger short-term reward.",cost:2500,reward:7000,flag:"fast",result:"You move before competitors can react. The gamble works, and your next challenge will be managing the scale."}
    ]},
    {title:"A Name in the Market",text:"Your company is no longer invisible. A respected investor asks what you want your empire to stand for. The answer will be remembered long after this meeting.",choices:[
      {title:"Create opportunities for others",detail:"Spend $20,000. Gain a leadership bonus.",cost:20000,reward:40000,flag:"people",result:"You choose to build a company people want to work for. Your reputation becomes an asset of its own."},
      {title:"Focus on market dominance",detail:"Spend $10,000. Gain a larger cash injection.",cost:10000,reward:32000,flag:"dominance",result:"You choose scale and speed. Your company becomes harder to ignore, and every move attracts attention."}
    ]}
  ];
  const achievements = [
    {id:"first",name:"First Revenue",desc:"Earn your first $1.",test:s=>s.totalEarned>=1},
    {id:"thousand",name:"Four Digits",desc:"Reach $1,000 in total earnings.",test:s=>s.totalEarned>=1000},
    {id:"tap100",name:"Finger on the Pulse",desc:"Tap 100 times.",test:s=>s.totalTaps>=100},
    {id:"firstbiz",name:"Business Owner",desc:"Buy your first business.",test:s=>Object.values(s.owned).some(v=>v>0)},
    {id:"million",name:"Million-Dollar Mindset",desc:"Reach $1,000,000 net worth.",test:s=>netWorth(s)>=1e6},
    {id:"story2",name:"Plot Thickens",desc:"Make two story decisions.",test:s=>s.chapter>=2},
    {id:"fivebiz",name:"Portfolio Builder",desc:"Own 5 businesses in total.",test:s=>Object.values(s.owned).reduce((a,b)=>a+b,0)>=5},
    {id:"empire",name:"Empire Status",desc:"Reach $100,000,000 net worth.",test:s=>netWorth(s)>=1e8}
  ];
  function freshState(){return {cash:0,totalEarned:0,totalTaps:0,owned:{},upgradeLevels:{},chapter:0,decisions:[],unlocked:{},achievements:[],lastSeen:Date.now(),createdAt:Date.now(),sound:false};}
  let state = loadState();
  let toastTimer = null;
  let toastMessage = "";
  let lastTick = Date.now();
  function loadState(){
    try{
      const raw=localStorage.getItem(SAVE_KEY);
      if(!raw)return freshState();
      const parsed=JSON.parse(raw);
      const s={...freshState(),...parsed};
      s.owned=s.owned||{};s.upgradeLevels=s.upgradeLevels||{};s.decisions=s.decisions||[];s.achievements=s.achievements||[];s.unlocked=s.unlocked||{};
      s.cash=Math.max(0,Number(s.cash)||0);
      const away=Math.min(8*60*60,Math.max(0,(Date.now()-(Number(s.lastSeen)||Date.now()))/1000));
      const earned=passiveRate(s)*away;
      if(earned>0){s.cash+=earned;s.totalEarned+=earned;toastMessage="Welcome back. Offline earnings: "+fmt(earned);}
      s.lastSeen=Date.now();
      return s;
    }catch(e){return freshState();}
  }
  function save(){state.lastSeen=Date.now();try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));$("save-indicator").textContent="● SAVED";}catch(e){$("save-indicator").textContent="● SAVE ERROR";}}
  function netWorth(s=state){return s.cash+businesses.reduce((sum,b)=>sum+(s.owned[b.id]||0)*b.cost*.65,0);}
  function totalBusinesses(){return Object.values(state.owned).reduce((a,b)=>a+b,0);}
  function tapRate(s=state){
    let value=1+(s.upgradeLevels.pitch||0);
    value*=1+(s.upgradeLevels.negotiation||0)*.15;
    value*=1+(s.upgradeLevels.marketing||0)*.10;
    return value;
  }
  function passiveRate(s=state){
    let value=businesses.reduce((sum,b)=>sum+(s.owned[b.id]||0)*b.income,0);
    value*=1+(s.upgradeLevels.automation||0)*.25;
    value*=1+(s.upgradeLevels.marketing||0)*.10;
    return value;
  }
  function upgradeCost(u){return Math.floor(u.base*Math.pow(u.growth,state.upgradeLevels[u.id]||0));}
  function multiplier(){return 1+(state.upgradeLevels.marketing||0)*.10;}
  function earn(amount){if(!Number.isFinite(amount)||amount<=0)return;state.cash+=amount;state.totalEarned+=amount;checkAchievements();renderTop();save();}
  function spend(amount){if(state.cash+1e-8<amount)return false;state.cash-=amount;return true;}
  function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2200);}
  function checkAchievements(){
    achievements.forEach(a=>{if(!state.achievements.includes(a.id)&&a.test(state)){state.achievements.push(a.id);toast("ACHIEVEMENT UNLOCKED: "+a.name);}});
  }
  function renderTop(){
    $("cash").textContent=fmt(state.cash);
    $("tap-rate").textContent=fmt(tapRate());
    $("passive-rate").textContent=fmt(passiveRate())+"/s";
    $("net-worth").textContent=fmt(netWorth());
    const lvl=1+Math.floor(Math.log10(Math.max(1,netWorth()))/1.5);
    $("level").textContent=num(lvl);
    $("total-taps").textContent=num(state.totalTaps);
    $("business-count").textContent=num(totalBusinesses());
    const target=Math.max(1000,Math.pow(10,Math.floor(Math.log10(Math.max(1,netWorth()))+1)));
    $("progress-text").textContent=fmt(netWorth())+" / "+fmt(target);
    $("progress-bar").style.width=Math.min(100,netWorth()/target*100)+"%";
    $("story-badge").classList.toggle("hidden",state.chapter>=chapters.length);
  }
  function makeItem(title,desc,level,cost,buttonText,disabled,action){
    const row=document.createElement("div");row.className="item-card";
    const main=document.createElement("div");main.className="item-main";
    const h=document.createElement("div");h.className="item-title";h.textContent=title;
    const d=document.createElement("div");d.className="item-desc";d.textContent=desc;
    const l=document.createElement("div");l.className="item-level";l.textContent=level;
    main.append(h,d,l);
    const btn=document.createElement("button");btn.className="buy-button";btn.textContent=buttonText;btn.disabled=disabled;btn.addEventListener("click",action);
    row.append(main,btn);return row;
  }
  function renderUpgrades(){
    const targets=[$("quick-upgrades")];targets.forEach(el=>el.replaceChildren());
    upgrades.forEach(u=>{
      const level=state.upgradeLevels[u.id]||0,cost=upgradeCost(u);
      const desc=u.desc;
      const item=makeItem(u.name,desc,"LEVEL "+level+"  •  NEXT COST "+fmt(cost),cost, "BUY",state.cash<cost,()=>{
        if(!spend(cost))return;
        state.upgradeLevels[u.id]=level+1;save();renderAll();toast(u.name+" upgraded.");
      });
      $("quick-upgrades").append(item);
    });
  }
  function renderBusinesses(){
    const list=$("business-list");list.replaceChildren();
    businesses.forEach(b=>{
      const owned=state.owned[b.id]||0;
      const unlocked=netWorth()>=b.unlock || owned>0 || b.unlock===0;
      const cost=Math.floor(b.cost*Math.pow(1.16,owned));
      const desc=unlocked?b.desc+" Each unit earns "+fmt(b.income*multiplier())+"/s.":"Unlock at "+fmt(b.unlock)+" net worth.";
      const item=makeItem(unlocked?b.name:"LOCKED ASSET",desc,"OWNED "+owned+"  •  BASE "+fmt(b.income)+"/s",cost,unlocked?fmt(cost):"LOCKED",!unlocked||state.cash<cost,()=>{
        if(!spend(cost))return;
        state.owned[b.id]=owned+1;save();renderAll();toast(b.name+" acquired.");
      });
      list.append(item);
    });
  }
  function renderStory(){
    const chapter=chapters[Math.min(state.chapter,chapters.length-1)];
    $("story-title").textContent=state.chapter>=chapters.length?"The Next Chapter Awaits":chapter.title;
    $("story-text").textContent=state.chapter>=chapters.length?"You have completed the first story arc. Your decisions are recorded. Keep growing your empire to unlock future chapters in later updates.":chapter.text;
    const choices=$("story-choices");choices.replaceChildren();
    if(state.chapter<chapters.length){
      chapter.choices.forEach((c,i)=>{
        const btn=document.createElement("button");btn.className="choice-button";btn.disabled=!!state.unlocked["chapter"+state.chapter];
        const strong=document.createElement("strong");strong.textContent=(i+1)+". "+c.title;
        const small=document.createElement("small");small.textContent=c.detail;
        btn.append(strong,small);
        btn.addEventListener("click",()=>chooseStory(c));
        choices.append(btn);
      });
    }
    const chosen=state.decisions[state.decisions.length-1];
    $("story-result").textContent=chosen?"LAST DECISION: "+chosen.title:"Your choices will be recorded here.";
    const hist=$("decision-history");hist.replaceChildren();
    if(!state.decisions.length){hist.innerHTML='<div class="muted">No decisions recorded yet.</div>';return;}
    [...state.decisions].reverse().forEach((d,i)=>{
      const row=document.createElement("div");row.className="record-row";
      const left=document.createElement("span");left.textContent="CHAPTER "+(state.decisions.length-i);
      const right=document.createElement("span");right.textContent=d.title;
      row.append(left,right);hist.append(row);
    });
  }
  function chooseStory(c){
    if(state.unlocked["chapter"+state.chapter])return;
    if(!spend(c.cost)){toast("Not enough capital for this decision.");return;}
    state.cash+=c.reward;state.totalEarned+=c.reward;
    state.decisions.push({title:c.title,flag:c.flag,result:c.result});
    state.unlocked["chapter"+state.chapter]=true;state.chapter++;
    // Meaningful consequences: choices permanently influence income.
    if(["practical","quality","cautious","sustainable","people"].includes(c.flag))state.upgradeLevels.automation=(state.upgradeLevels.automation||0)+1;
    else state.upgradeLevels.marketing=(state.upgradeLevels.marketing||0)+1;
    save();checkAchievements();renderAll();
    $("story-result").textContent=c.result;
    toast("DECISION RECORDED. YOUR EMPIRE HAS CHANGED.");
  }
  function renderAchievements(){
    const list=$("achievement-list");list.replaceChildren();
    achievements.forEach(a=>{
      const done=state.achievements.includes(a.id);
      const row=document.createElement("div");row.className="achievement"+(done?"":" locked");
      const icon=document.createElement("div");icon.className="achievement-icon";icon.textContent=done?"✓":"◇";
      const body=document.createElement("div");const title=document.createElement("strong");title.textContent=a.name;
      const desc=document.createElement("small");desc.textContent=a.desc;
      body.append(title,desc);row.append(icon,body);list.append(row);
    });
    $("achievement-count").textContent=state.achievements.length+" / "+achievements.length;
    const rows=[
      ["Total money earned",fmt(state.totalEarned)],["Total taps",num(state.totalTaps)],
      ["Businesses owned",num(totalBusinesses())],["Story decisions",num(state.decisions.length)],
      ["Tap value",fmt(tapRate())],["Passive income",fmt(passiveRate())+"/s"],
      ["Company founded",new Date(state.createdAt).toLocaleDateString()]
    ];
    const record=$("record-list");record.replaceChildren();
    rows.forEach(([a,b])=>{const row=document.createElement("div");row.className="record-row";const l=document.createElement("span");l.textContent=a;const r=document.createElement("span");r.textContent=b;row.append(l,r);record.append(row);});
  }
  function renderAll(){renderTop();renderUpgrades();renderBusinesses();renderStory();renderAchievements();}
  function setTab(name){
    document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.tab===name));
    document.querySelectorAll(".view").forEach(v=>v.classList.toggle("hidden",v.id!=="view-"+name));
    window.scrollTo({top:0,behavior:"smooth"});
  }
  document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>setTab(t.dataset.tab)));
  $("tap-button").addEventListener("click",()=>{
    const amount=tapRate();state.totalTaps++;earn(amount);
    if(state.totalTaps%10===0)toast("REVENUE GENERATED: +"+fmt(amount));
    // Brief visual feedback, without requiring graphics.
    $("tap-button").style.borderColor="var(--green)";
    setTimeout(()=>$("tap-button").style.borderColor="",90);
  });
  $("intel-button").addEventListener("click",()=>{
    const lines=[
      "MARKET REPORT: Reinvest early profits. Small recurring income compounds into serious capital.",
      "RIVAL WATCH: Competitors are watching your pricing. Build value before you race to the bottom.",
      "BOARD NOTE: Every upgrade should make future decisions easier. Keep a reserve for opportunities.",
      "ANALYST BRIEF: Passive income buys time. Taps accelerate the early game; businesses carry the long game.",
      "PRIVATE MEMO: Reputation is built through choices. There is more than one way to grow an empire."
    ];
    $("intel-text").textContent=lines[Math.floor(Math.random()*lines.length)];
  });
  $("sound-toggle").addEventListener("click",()=>{
    state.sound=!state.sound;$("sound-state").textContent=state.sound?"ON":"OFF";save();
    toast(state.sound?"Sound setting enabled (reserved for future audio).":"Sound setting off.");
  });
  function showModal(title,message,code){
    $("modal-title").textContent=title;$("modal-text").textContent=message;
    $("save-code").classList.toggle("hidden",!code);$("modal-copy").classList.toggle("hidden",!code);
    $("save-code").value=code||"";$("modal").classList.remove("hidden");
  }
  $("modal-close").addEventListener("click",()=>$("modal").classList.add("hidden"));
  $("modal").addEventListener("click",e=>{if(e.target===$("modal"))$("modal").classList.add("hidden");});
  $("export-button").addEventListener("click",()=>{ const code=btoa(unescape(encodeURIComponent(JSON.stringify(state)))); showModal("Export save code","Copy this code somewhere safe. This is an export backup; the game currently saves automatically on this device.",code); });
  $("modal-copy").addEventListener("click",async()=>{
    try{await navigator.clipboard.writeText($("save-code").value);toast("SAVE CODE COPIED.");}
    catch(e){$("save-code").focus();$("save-code").select();toast("Select the code and copy it manually.");}
  });
  $("reset-button").addEventListener("click",()=>{
    showModal("Reset company?","This will erase the saved company on this device. To confirm, close this message and tap RESET COMPANY again.");
    $("modal-close").textContent="CANCEL";
    $("modal-close").onclick=()=>{
      $("modal").classList.add("hidden");
      if(confirm("Permanently reset your Empire Terminal save? This cannot be undone.")){
        state=freshState();save();renderAll();setTab("overview");toast("New company founded.");$("modal-close").onclick=()=>{$("modal").classList.add("hidden");$("modal-close").textContent="CLOSE";};
      } else {$("modal-close").onclick=()=>{$("modal").classList.add("hidden");$("modal-close").textContent="CLOSE";};}
    };
  });
  // Passive income is earned while open. Tick every second.
  setInterval(()=>{
    const now=Date.now(),seconds=Math.min(5,Math.max(0,(now-lastTick)/1000));lastTick=now;
    const income=passiveRate()*seconds;
    if(income>0){state.cash+=income;state.totalEarned+=income;checkAchievements();renderTop();}
    save();
  },1000);
  // Autosave when the app is backgrounded or closed.
  document.addEventListener("visibilitychange",()=>{if(document.hidden)save();else{const now=Date.now();const away=Math.min(8*60*60,Math.max(0,(now-(state.lastSeen||now))/1000));const gain=passiveRate()*away;if(gain>0){state.cash+=gain;state.totalEarned+=gain;toast("Offline earnings: "+fmt(gain));}lastTick=now;renderAll();save();}});
  window.addEventListener("beforeunload",save);

  // Simple boot sequence.
  const statuses=["Loading company records...","Connecting financial systems...","Preparing your dashboard...","Welcome, CEO."];
  let progress=0,step=0;
  const boot=setInterval(()=>{
    progress=Math.min(100,progress+25);$("load-progress").style.width=progress+"%";
    $("load-status").textContent=statuses[Math.min(step,statuses.length-1)];step++;
    if(progress>=100){clearInterval(boot);$("loading").classList.add("hidden");$("game").classList.remove("hidden");renderAll();if(toastMessage)toast(toastMessage);save();}
  },250);
})();
