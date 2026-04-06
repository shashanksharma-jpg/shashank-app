"use client";
import{useState,useEffect,useCallback,useRef}from"react";
import{createClient}from"@supabase/supabase-js";

// ── Persistence: localStorage (instant) + Supabase (cross-device backup) ─────
const _url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const _key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const _sb   = _url && _url.startsWith("https://") && _key ? createClient(_url, _key) : null;
const LS_KEY    = "marathon-shashank-v1";
const STATE_KEY = "marathon-app-shashank";

function lsLoad(){
  try{const v=localStorage.getItem(LS_KEY);return v?JSON.parse(v):null;}catch{return null;}
}
function lsSave(state){
  try{localStorage.setItem(LS_KEY,JSON.stringify(state));}catch{}
}
async function loadState(){
  const local=lsLoad();
  if(_sb){
    try{
      const{data,error}=await _sb.from("app_state").select("value").eq("key",STATE_KEY).single();
      if(!error&&data){
        const remote=JSON.parse(data.value);
        const localCount=local?Object.values(local.chk||{}).filter(Boolean).length:0;
        const remoteCount=Object.values(remote.chk||{}).filter(Boolean).length;
        if(remoteCount>=localCount){lsSave(remote);return remote;}
      }
    }catch{}
  }
  return local;
}
async function saveState(state){
  lsSave(state);
  if(!_sb) return true;
  try{
    const{error}=await _sb.from("app_state").upsert({key:STATE_KEY,value:JSON.stringify(state),updated_at:new Date().toISOString()});
    return !error;
  }catch{return true;}
}

const CATS=[
  {id:"rg",icon:"👟",label:"Running Gear",items:[
    {id:"rg1",t:"Running shoes (worn-in, nothing new race day)"},
    {id:"rg2",t:"Backup trainers / lightweight shoes"},
    {id:"rg3",t:"Running socks — 5–7 pairs moisture-wicking"},
    {id:"rg4",t:"Running shorts — 3–4 pairs"},
    {id:"rg5",t:"Running singlets/shirts — 3–4"},
    {id:"rg6",t:"Long-sleeve top (London & Edinburgh)"},
    {id:"rg7",t:"Running tights (Edinburgh)"},
    {id:"rg8",t:"Wind jacket / shell (Scotland rain)"},
    {id:"rg9",t:"Cap or visor"},
    {id:"rg10",t:"Sunglasses"},
    {id:"rg11",t:"RACE: bib belt + 4 safety pins from Expo"},
    {id:"rg12",t:"RACE: outfit laid out night before (nothing new!)"},
    {id:"rg13",t:"RACE: throwaway warm layer for cold start pen"},
  ]},
  {id:"nu",icon:"⚡",label:"Race Nutrition (Pack Race Day)",items:[
    {id:"nu1",t:"Maurten Gel 160 × 5 (race belt: 4 in-race + 1 backup)"},
    {id:"nu2",t:"Maurten Gel 100 Caf 100 × 3 (pre-race + km 20 + km 32)"},
    {id:"nu3",t:"SaltStick Caps × 15+ (9 race day + training)"},
    {id:"nu4",t:"Beetroot shot × 2 (take 60 min pre-race at start area)"},
    {id:"nu5",t:"Oats + banana + honey — pre-made or hotel"},
    {id:"nu6",t:"Pre-race coffee (hotel room, 90 min before start)"},
  ]},
  {id:"re",icon:"💊",label:"Recovery & Health",items:[
    {id:"re1",t:"Foam roller (travel size) or massage ball"},
    {id:"re2",t:"KT tape / blister plasters"},
    {id:"re3",t:"Anti-chafe balm (Body Glide / Vaseline)"},
    {id:"re4",t:"Compression socks (flights + recovery)"},
    {id:"re5",t:"Ibuprofen / paracetamol"},
    {id:"re6",t:"Melatonin 0.5mg (flights + jet lag)"},
    {id:"re7",t:"Eye mask + ear plugs (red-eye flights)"},
    {id:"re8",t:"Post-marathon: compression tights / ice packs"},
    {id:"re9",t:"Tart cherry juice × 4 (post-race recovery)"},
  ]},
  {id:"tr",icon:"🌍",label:"Travel Essentials",items:[
    {id:"tr1",t:"Universal travel adapter (UK plugs)"},
    {id:"tr2",t:"Passport + travel docs"},
    {id:"tr3",t:"Hertz rental confirmation — DL7PE6"},
    {id:"tr4",t:"Medications / prescriptions"},
    {id:"tr5",t:"Sunscreen (Las Vegas + London)"},
    {id:"tr6",t:"Race bib (from Expo — don't leave to race morning)"},
  ]},
  {id:"cl",icon:"👔",label:"Clothing",items:[
    {id:"cl1",t:"Light outfits — Las Vegas (warm)"},
    {id:"cl2",t:"Layers — London & Edinburgh (10–15°C, rainy)"},
    {id:"cl3",t:"Smart casual for dinners"},
    {id:"cl4",t:"Comfortable walking shoes — Scotland"},
  ]},
  {id:"bd",icon:"🎂",label:"Ayaansh's Birthday (Sat 25 Apr)",items:[
    {id:"bd1",t:"🎈 Birthday banner + balloons (T2 Arrivals surprise)"},
    {id:"bd2",t:"🎁 Birthday gift — buy Fri 24 Apr (LEGO / Harry Potter Shop)"},
    {id:"bd3",t:"🎬 Cinema tickets pre-booked (~2:30pm Sat 25 Apr)"},
    {id:"bd4",t:"🍝 Ristorante Olivelli dinner — pre-book 6pm Sat 25 Apr"},
    {id:"bd5",t:"🍱 OKAN lunch — pre-book 12:30pm Sat 25 Apr"},
  ]},
  {id:"bk",icon:"📋",label:"🔴 Book / Action Now!",items:[
    {id:"bk1",t:"🚨 UK ETA: gov.uk/eta — all 4 family members (£16 before 8 Apr)"},
    {id:"bk2",t:"🚂 LNER First Class: London→Edinburgh Mon 28 Apr (lner.co.uk)"},
    {id:"bk3",t:"🍱 OKAN lunch: Sat 25 Apr 12:30pm (+44 7746 025394)"},
    {id:"bk4",t:"🍝 Olivelli dinner: Sat 25 Apr 6pm (+44 20 7261 1221)"},
    {id:"bk5",t:"📲 Download TCS London Marathon App (~mid-April)"},
    {id:"bk6",t:"📦 Check letterbox: race pack due by Tue 31 Mar"},
    {id:"bk7",t:"🛏️ Request late check-out — Park Plaza Westminster"},
  ]},
];

const SCHEDULE=[
  {d:"Sun 19 Apr",type:"reminder",src:"action",loc:"gov.uk/eta",label:"🚨 UK ETA — Apply TODAY",detail:"All 4 family members. £16 now → £20 from 8 Apr. Denial of boarding without it.\n• Shashank (VS 156 LAS→LHR 21 Apr)\n• Aditi, Ayaansh, Adidev (SQ 322 SIN→LHR 24 Apr)\n📲 gov.uk/eta — OFFICIAL SITE ONLY"},
  {d:"Fri 17 Apr",type:"tempo",src:"runna",loc:"Singapore",label:"🏃 Tempo 4km • 8km",detail:"3km warm up (≤5:25/km) → 4km @ 4:25/km, 150s rest → 1km cool down\nLast hard session before travel. Do before packing."},
  {d:"Sat 18 Apr",type:"strength",src:"runna",loc:"Singapore",label:"🏋️ Light(er) Work • Legs & Core",detail:"Clam Shells, Mountain Climber, Fire Hydrants, Step Up, SL Calf Raise, Hamstring Walkout, Hurdle Hops, Lopsided Squat, Plank Pull Through, SL Deadlift + Knee Drive\nDo evening. Bag packed. Bed by 9:30pm."},
  {d:"Sun 19 Apr",type:"long",src:"runna",loc:"Singapore — Pre-flight",label:"🏃 13km Long Run • PRE-FLIGHT ✅",detail:"5:30am start → finish 6:45am → shower → leave T3 by 7:10am\nConversational pace throughout. Compression socks on immediately after. SQ 32 departs 09:15 SGT."},
  {d:"Sun 19 Apr",type:"flight",src:"travel",loc:"SIN → SFO → LAS",label:"✈️ SQ 32 + AS 776",detail:"SIN T3 09:15 → SFO 09:10 PDT (2h17 layover) → LAS 1:13pm PDT\nCompression socks. 250ml water/hr. Set watch to Vegas time."},
  {d:"Mon 20 Apr",type:"mobility",src:"runna",loc:"Las Vegas hotel",label:"🧘 Yoga Session 14 • 30 min",detail:"Hips & glutes focus. Poolside or hotel room.\nPerfect jet lag recovery — loosens all flight stiffness."},
  {d:"Mon 20 Apr",type:"conference",src:"travel",loc:"The Venetian Expo, Las Vegas",label:"🎯 Adobe Summit — Day 1",detail:"Expect 8–12k steps indoors. Cushioned non-running shoes.\nConference catering = your carb load. Electrolyte in bag. Avoid evening bar — red-eye tomorrow."},
  {d:"Tue 21 Apr",type:"easy",src:"runna",loc:"Las Vegas Strip",label:"🏃 7.5km Easy Run • PRE-SUMMIT ✅",detail:"6:00am start, finish by 7:00am. ≤5:20/km — this is a limit, not a target.\nRed-eye tonight at 10pm. Zone 1 only. Conserve energy."},
  {d:"Tue 21 Apr",type:"reminder",src:"travel",loc:"Virgin Atlantic App",label:"🪑 10:00am PDT — VS 156 Check-In Opens",detail:"Do from phone at Adobe Summit. Best seats go fast.\nPremium Economy: Row 20A/K. Economy: exit rows 30–33, left-side window (A seats).\nAVOID: last rows near galley — noise destroys sleep."},
  {d:"Tue 21 Apr",type:"sleep",src:"travel",loc:"VS 156 in-flight",label:"😴 Sleep Window — VS 156 (10pm PDT)",detail:"Board → melatonin 0.5mg → eye mask + ear plugs → no screens → 8hrs anchored to London time.\nNo alcohol. No films before sleeping. This is the most critical night of race prep."},
  {d:"Wed 22 Apr",type:"flight",src:"travel",loc:"LHR T3 → Park Plaza Westminster",label:"✈️ Arrive London 3:55pm — Park Plaza Check-In",detail:"Drop bags → walk South Bank immediately. Natural light = jet lag reset.\nStay awake until 10pm minimum."},
  {d:"Wed 22 Apr",type:"easy",src:"coach",loc:"London — South Bank",label:"🏃 Easy Activation Run — South Bank",detail:"4km, Zone 1. Walk out of hotel, cross Westminster Bridge, run east.\nGoal: light exposure + circulation only."},
  {d:"Fri 24 Apr",type:"shakeout",src:"runna",loc:"St James's Park → ExCeL London",label:"🏃 Race Pace Fartlek • 8km + Expo + Birthday Gift",detail:"2km warm up → 2km @ 5:00/km → 1km easy → 2km @ 5:00/km → 1km cool down\n\n🏁 EXPO (after run): ExCeL London, Custom House (Elizabeth Line). Thu 10am–8pm = quietest day. Bring QR code + passport. In/out 30 min.\n\n🎁 GIFT (after Expo): LEGO Store Leicester Sq (world's largest) or Harry Potter Shop Platform 9¾ at King's Cross."},
  {d:"Sat 25 Apr",type:"birthday",src:"travel",loc:"LHR T2 → Park Plaza Westminster",label:"🎂 Ayaansh's 10th! Fetch Family — T2 (SQ 322 lands 5:55am)",detail:"Leave Park Plaza by 6:30am. Family out by ~7:30am.\n\n⏰ BIRTHDAY DAY (keep your steps <6,000!):\n7:30am — 🎈 Reunite at T2! Banner + gift reveal\n10:30am — Gentle walk: Westminster → Big Ben → St James's Park\n12:30pm — 🍱 OKAN (vegetarian Japanese, 4 min walk from hotel)\n2:30pm — Cinema or Borough Market (seated = resting legs)\n4:30pm — Hotel nap — MANDATORY FOR YOU\n6:00pm — 🍝 Ristorante Olivelli (your pasta carb load + Ayaansh's veggie birthday dinner)\n8:00pm — Lay out race kit. Pin bib. Set 3 alarms.\n9:30pm — SLEEP. Non-negotiable."},
  {d:"Sat 25 Apr",type:"rest",src:"coach",loc:"Park Plaza Westminster",label:"🛌 Complete Rest Day — Race Eve",detail:"Walk only. Under 6,000 steps. Taxi everywhere. Zero alcohol.\nCarb-heavy all day (birthday cake = carbs ✅). Bed 9:30pm sharp."},
  {d:"Sun 26 Apr",type:"race",src:"runna",loc:"Green Assembly → Blackheath → The Mall",label:"🏅 TCS LONDON MARATHON — BIB 78722",detail:"TARGET: 3h27–3h35 @ 4:55–5:05/km\n\n🎽 YOUR RACE INFO:\nBib: 78722 (GREEN) · Wave 6 · Start: 10:00am\nAssembly: GREEN · Station: Blackheath (10 min walk)\nTrain arrival: 08:18 / 08:23 / 08:29 · Arrive assembly by 08:38\n⚠️ No bag drop in Green Assembly — drop bag at St James's Park on Sat 25 Apr\n\n🕐 RACE MORNING TIMELINE:\n6:00am — Oats + banana + honey + coffee\n7:30am — Leave Park Plaza (FREE TfL — do NOT tap in/out, show bib)\n~8:00am — Blackheath station (Southeastern from London Bridge)\n8:00am — ☕ Caf Gel #1 (100mg) + 1x SaltStick + beetroot shot\n8:38am — Arrive Green Assembly. Bib on chest.\n9:30am — Into start pen.\n10:00am — 🏃 GREEN WAVE 6 START\n\n⚡ NUTRITION:\nKm 5: SaltStick\nKm 10 (Cutty Sark): 🟠 Gel 160 #1 + SaltStick\nKm 15: SaltStick\nKm 20 (Tower Bridge): 🟠 Gel 160 #2 + ☕ Caf Gel #2 + SaltStick → peaks km 29–30\nKm 25: SaltStick\nKm 30 (Canary Wharf): 🟠 Gel 160 #3 + SaltStick → ☕ PEAKING\nKm 32: ☕ Caf Gel #3 + SaltStick ⚠️ CRITICAL\nKm 35 (Embankment): 🟠 Gel 160 #4 + SaltStick\nKm 38: Water only\nFinish ~1:27–1:35pm 🏅\n\n💧 ON-COURSE (free):\nWater every 3mi (Mile 3–12), every 2mi (Mile 12–24)\nLucozade Sport: Miles 7, 15, 21, 23\nLucozade Gels: Miles 13 + 19 (backup)\n\n👨\u200d👩\u200d👦 FAMILY:\nBest spots: Cutty Sark (km10) · Tower Bridge (km21) · Embankment (km35) · The Mall\nDo NOT go to Start — go straight to Cutty Sark\nMeet at Horse Guards Road (lettered zones) — AGREE LETTER BEFORE RACE\nMobile signal unreliable at finish · Free TfL until 20:00"},
  {d:"Mon 27 Apr",type:"recovery",src:"coach",loc:"Park Plaza Westminster",label:"💆 Post-Marathon Rest",detail:"Hotel bathtub soak / ice bath. Room service. 9–10hrs sleep.\nTart cherry juice. Ibuprofen for inflammation."},
  {d:"Mon 28 Apr",type:"recovery",src:"coach",loc:"Park Plaza → LNER → Edinburgh",label:"🚂 Check Out + LNER First Class → Edinburgh",detail:"Check-out 12pm. Westminster → King's Cross (4 stops, 10 min).\nLNER First Class 10am: King's Cross Lounge + at-seat meal = recovery nutrition on the train.\n~4h08 to Edinburgh Waverley."},
  {d:"Tue 29 Apr",type:"recovery",src:"coach",loc:"Edinburgh",label:"🏴󠁧󠁢󠁳󠁣󠁴󠁿 Family Day — Edinburgh",detail:"Edinburgh Castle, Royal Mile. 2–3 hrs gentle walking = perfect active recovery. No running."},
  {d:"Wed 30 Apr",type:"easy",src:"coach",loc:"Edinburgh — Holyrood Park",label:"🏃 Easy Run — Arthur's Seat",detail:"5km Zone 1. Hertz pickup 9am — run before then. Only if legs feel ready."},
  {d:"Thu 1 May",type:"rest",src:"coach",loc:"Scotland → Glasgow",label:"🚗 Family Road Trip → Glasgow",detail:"GLA→LHR 5pm. Walking day. Enjoy Scotland's last morning."},
  {d:"Fri 2 May",type:"flight",src:"travel",loc:"GLA→LHR→SIN",label:"✈️ BA 1487 + SQ 317 — Return to Singapore",detail:"BA 1487 GLA→LHR 5pm T5. Renaissance Heathrow overnight.\nSQ 317 LHR T2 11:25am Sat → SIN 7:30am Sun 3 May.\nMelatonin once airborne. Compression socks. Eastward = harder jet lag."},
  {d:"Sun 3 May",type:"travel",src:"travel",loc:"SIN",label:"🏠 Home — Arrive Singapore 7:30am",detail:"Full rest day. Don't run. Rest IS the training now. 🏆"},
];

const NUTRITION={
  preRace:[
    {time:"5:30am",what:"Wake up",detail:"Sip 500ml water immediately"},
    {time:"6:00am",what:"Breakfast — Hotel Room",detail:"Oats + banana + honey (slow + fast carbs, ~80g) · Coffee (100mg caffeine · helps GI clearance) · ~95g carbs total"},
    {time:"7:30am",what:"Leave Park Plaza",detail:"FREE TfL with race bib. Bag drop closes 8:45am."},
    {time:"8:00am",what:"Start area (Blackheath)",detail:"☕ Gel 100 Caf 100 #1 (100mg caffeine + 25g carbs) · 1x SaltStick · 🍇 2× Beetroot shots (400–800mg nitrates) · ⏱ Caffeine peaks at ~9:35am — perfectly timed for 10:00am wave start"},
    {time:"9:20am",what:"Into start pen",detail:"Everything peaking. Belt loaded. Throwaway warm layer on."},
  ],
  inRace:[
    {km:"Km 0–10",time:"0:00–0:49",gel160:"—",caf:"☕ Pre-race gel building",ss:"1x @ km 5",note:"Settle in. Resist crowd pace."},
    {km:"Km 10",time:"~0:49",gel160:"🟠 #1 (40g)",caf:"—",ss:"1x",note:"Cutty Sark 🏛️ — first crowd surge. Carbs: ~185g ✓"},
    {km:"Km 15",time:"~1:14",gel160:"—",caf:"—",ss:"1x",note:"Stay on 4:55–5:05/km."},
    {km:"Km 20",time:"~1:38",gel160:"🟠 #2 (40g)",caf:"☕ #2 (100mg)",ss:"1x",note:"Tower Bridge approach. ⏱ Caffeine peaks km 29–30. Carbs: ~250g ✓"},
    {km:"Km 21",time:"~1:43",gel160:"—",caf:"—",ss:"—",note:"HALFWAY 🌉 Soak it in."},
    {km:"Km 25",time:"~2:03",gel160:"—",caf:"☕ building",ss:"1x",note:"Canary Wharf approaching."},
    {km:"Km 30",time:"~2:27",gel160:"🟠 #3 (40g)",caf:"☕ PEAKING",ss:"1x",note:"Canary Wharf 🏙️ — FEEL THE LIFT. Carbs: ~315g ✓"},
    {km:"Km 32",time:"~2:37",gel160:"—",caf:"☕ #3 (100mg) ⚠️",ss:"1x CRITICAL",note:"Caffeine peaks km 40–42. Cramp prevention. Carbs: ~340g ✓"},
    {km:"Km 35",time:"~2:52",gel160:"🟠 #4 (40g)",caf:"—",ss:"1x",note:"Embankment 🌊 — PUSH. Carbs: ~380g ✓"},
    {km:"Km 38",time:"~3:06",gel160:"—",caf:"☕☕ PEAKING",ss:"1x if needed",note:"Water only. The Mall is 4km. Family waiting."},
    {km:"Km 42.2",time:"3:27–3:35",gel160:"Done",caf:"Peak ☕☕☕",ss:"Done",note:"🏅 FINISH LINE"},
  ],
  totals:[
    ["Gel 160","5 total (4 in-race + 1 backup)","200g carbs","—"],
    ["Gel 100 Caf 100","3 total (1 pre + 2 in-race)","75g carbs","300mg caffeine"],
    ["Oats + banana + coffee","Breakfast","~95g carbs","~100mg caffeine"],
    ["Beetroot shots","2× pre-race (60min before)","~20g carbs","400–800mg nitrates"],
    ["SaltStick Caps","~9 caps","—","~1,935mg sodium"],
    ["TOTAL","~3.5 hrs","~390g (~111g/hr) ✓","~400mg caffeine · ~2,580mg sodium ✓"],
  ],
  missed:[
    {icon:"🍇",title:"Beetroot Shots ← YOU MISSED THIS",urgency:"high",detail:"400–800mg nitrates 60 min pre-race dilate blood vessels, improve oxygen efficiency, and reduce the energy cost of running. Research shows 2–3% performance improvement. Take at Blackheath at 8am alongside your Caf gel. Widely used by elites. Buy: HiBAR or Beet It concentrated shots."},
    {icon:"🍒",title:"Tart Cherry Juice — Post-Race Recovery",urgency:"medium",detail:"Proven to reduce DOMS and inflammation. Drink 250ml immediately post-race and daily for 3–4 days in Edinburgh. Buy before you fly — hard to find in London on race weekend."},
    {icon:"🌊",title:"Hydration Tracking — Pre-Race Days",urgency:"medium",detail:"Aim for clear/pale yellow urine by race morning. Drink 500ml with electrolytes on waking each day Wed–Fri in London. The jet lag + hotel AC + London cold can mask dehydration — you won't feel thirsty but will be losing fluids."},
    {icon:"🥣",title:"Oats vs Toast — You Updated Correctly",urgency:"low",detail:"Oats + banana + honey is superior to plain toast for marathon morning. Oats = slow-release carbs (low GI), banana = quick glucose + potassium, honey = fast carbs. The combination gives you a sustained energy base that toast alone doesn't."},
    {icon:"☕",title:"Coffee Timing — Important Detail",urgency:"medium",detail:"Coffee at 6am (90 min before the 8am Caf gel) is fine — the caffeine from coffee will have metabolised before your Gel 100 Caf 100 doses kick in. But don't have coffee AND a Caf gel simultaneously — that's 200mg at once which can cause GI distress. Your plan (coffee at 6am, Caf gel at 8am) is correctly spaced."},
  ],
};

const HANDBOOK=[
  {icon:"🏁",title:"Your Start Info — Wave 6 GREEN",items:[
    "Bib: 78722 · Assembly: GREEN · Wave: 6",
    "Wave start time: 10:00am",
    "Nearest station: Blackheath (10-min walk to Green Assembly)",
    "Recommended trains: 08:18 / 08:23 / 08:29 → arrive assembly by 08:38",
    "All start lines close: 11:30am",
    "⚠️ NO bag drop in Green Assembly — drop small bag at St James's Park on SAT 25 APR",
    "Bib is non-transferable · Green background = opted for medal",
    "Complete medical info on the BACK of your bib — it could save your life",
  ]},
  {icon:"🎟️",title:"Expo & Bib Collection — ExCeL London",items:[
    "📍 ExCeL London, Custom House (Elizabeth Line / DLR)",
    "Fri 24 Apr: 10am–8pm (quietest — go after morning run ✅)",
    "Sat 25 Apr: 8:30am–5:30pm — DEADLINE 17:30",
    "Bring: QR code (from email or TCS App) + passport/photo ID",
    "You receive: bib, timing chip, safety pins, kitbag sticker",
    "⚠️ Team Green: NO official kitbag/sticker — bring your own small bag",
    "Someone can collect for you: they need your QR code + signed letter + copy of your ID + their own ID",
    "Name printing: visit printmyeventtop.com to pre-order, then get it done at the expo",
  ]},
  {icon:"🚇",title:"Race Day Transport",items:[
    "FREE travel to start: Southeastern trains, DLR, Elizabeth Line, Tube, Overground, buses",
    "🚫 DO NOT tap in/out — just show your bib",
    "Leave Park Plaza by 7:30am → London Bridge → Blackheath (Southeastern)",
    "DLR starts ~05:30 from Tower Gateway / Lewisham, ~07:00 from Bank",
    "Thames Clippers: every 20min to Greenwich Pier → short walk to assembly areas",
    "⚠️ Spectators: do NOT go to the Start — go straight to Cutty Sark (km 10)",
    "Post-race: FREE on TfL (Tube/DLR/Elizabeth Line/bus) until 20:00",
    "⚠️ Westminster station: EXIT ONLY after the race",
    "⚠️ Southeastern trains do NOT offer free post-race travel",
  ]},
  {icon:"🎒",title:"Bag Drop — Team Green Special Rules",items:[
    "⚠️ CRITICAL: No bag drop facility at Green Assembly on race day",
    "✅ Drop small bag at St James's Park on SATURDAY 25 APRIL (day before)",
    "Look for Team Green bag drop signage on the map (page 16 of guide)",
    "Pack a snack in your bag to eat after finishing — pack this on Friday night",
    "Do NOT put valuables (phone, cash) in your kitbag",
    "After finish: look for Team Green marquee signage to retrieve your bag",
    "Only official event kitbags accepted for those who have them",
  ]},
  {icon:"🗺️",title:"The Course",items:[
    "Start: Blackheath (Green, Blue, Pink lines merge after ~3 miles)",
    "Mile 3–12: Water every 3 miles (Buxton Natural Mineral Water)",
    "Mile 7: Lucozade Sport · Mile 13: Lucozade Gel",
    "Mile 12–24: Water every 2 miles",
    "Mile 15: Lucozade Sport · Mile 19: Lucozade Gel",
    "Mile 21 + 23: Lucozade Sport",
    "Water Refill Stations at Miles 5, 10, 14, 17, 20 (bring reusable bottle)",
    "Toilets: every mile 1–24 + accessible toilets at Mile 1, 2, then every even mile",
    "Vaseline: Miles 14, 17, 20, 22",
    "Headphones: non-noise-cancelling or bone conduction only — must hear instructions",
    "Blue line on road = shortest route. Move left if you need to walk.",
    "Km 10: Cutty Sark · Km 21: Tower Bridge · Km 30: Canary Wharf · Km 35: Embankment · Km 42.2: The Mall",
    "Pacers available from 3:00 to 7:30 — bright flag with finish time on their back",
  ]},
  {icon:"👨‍👩‍👦",title:"Family — Spectator Guide",items:[
    "📲 Download TCS London Marathon App — live GPS tracking + split times + predicted finish",
    "Best spectator spots: Cutty Sark (km 10) · Tower Bridge (km 21) · Embankment (km 35) · The Mall (finish)",
    "⚠️ Spectators do NOT go to the Start — go straight to Cutty Sark from hotel",
    "Park Plaza Westminster is 1.5km from The Mall finish line 🏅",
    "Family reunion: Horse Guards Road / Whitehall / Horse Guards Parade — lettered zones A–Z",
    "⚠️ AGREE your meeting letter BEFORE race — mobile signal at finish is unreliable",
    "Take a screenshot of the meeting plan — don't rely on phone signal",
  ]},
  {icon:"🏅",title:"Finish Area",items:[
    "You receive: finisher medal · Buxton water · GetPRO yoghurt pouch · Lucozade Sport",
    "Keep moving after crossing — seek medical help at First Aid if needed",
    "Team Green bag collection: look for designated Team Green marquee with signage",
    "T-shirt exchange (if wrong size): Information Point at Horse Guards Parade",
    "Sensory Calm Tent + Parent & Child Tent + Multi-Faith Prayer Tent available",
    "Results online within 24hrs · Race photos within 48hrs via Sportograf",
    "Also in the TCS App: finisher selfie frame + virtual medal",
    "Post-race free TfL travel until 20:00 · ⚠️ Westminster exit only",
  ]},
  {icon:"⚕️",title:"Safety & Medical",items:[
    "Only race if you are fit and well — running with illness or injury is dangerous",
    "Complete medical info on BACK of bib — emergency services will check this",
    "Emergency: call 999",
    "Drop out: tell staff at nearest First Aid Point — sweep minibus will collect you",
    "Free public transport if you drop out — show your bib",
    "Dropping out deadline for deferral to 2027: 23:59 Sat 25 Apr",
    "Period products available at Start, Finish, and all Drinks Stations",
  ]},
];

const RESERVATIONS=[
  {id:"okan",name:"🍱 OKAN — Birthday Lunch",when:"Sat 25 Apr · 12:30pm · Party of 4",addr:"County Hall, Belvedere Rd, SE1 7PB",dist:"4-min walk from Park Plaza",phone:"+44 7746 025394",web:"okanlondon.com",rating:"4.6★ · Japanese",why:"Vegetarian Japanese — Ayaansh's pick. Open kitchen he'll love. 4 min walk saves pre-race steps.",menu:"Ayaansh: veg gyoza · tofu okonomiyaki · edamame · miso udon\nShashank: miso soup · rice dishes (carb top-up)"},
  {id:"olivelli",name:"🍝 Ristorante Olivelli — Birthday Dinner",when:"Sat 25 Apr · 6:00pm SHARP · Party of 4",addr:"61 The Cut, SE1 8LL",dist:"12-min walk from Park Plaza",phone:"+44 20 7261 1221",web:"ristoranteolivelli.co.uk",rating:"4.4★ · Sicilian Italian",why:"Doubles as birthday dinner AND your pasta carb load. Great veggie pasta for Ayaansh. Eat by 6pm for full digestion before 10:00am wave start.",menu:"Ayaansh: pistachio pasta · vegetarian lasagne · pomodoro\nShashank: plain pasta + tomato/pomodoro sauce (150–200g carbs). No cream, no alcohol."},
];

const TM={
  race:{c:"#f59e0b",l:"RACE DAY"},tempo:{c:"#ef4444",l:"TEMPO"},long:{c:"#3b82f6",l:"LONG RUN"},
  easy:{c:"#10b981",l:"EASY RUN"},shakeout:{c:"#6366f1",l:"SHAKEOUT"},strength:{c:"#a855f7",l:"STRENGTH"},
  mobility:{c:"#06b6d4",l:"MOBILITY"},rest:{c:"#4a5568",l:"REST"},recovery:{c:"#ec4899",l:"RECOVERY"},
  flight:{c:"#8b5cf6",l:"FLIGHT"},travel:{c:"#8b5cf6",l:"TRAVEL"},reminder:{c:"#f59e0b",l:"⚡ ACTION"},
  sleep:{c:"#6366f1",l:"SLEEP"},birthday:{c:"#f472b6",l:"BIRTHDAY 🎂"},conference:{c:"#f59e0b",l:"SUMMIT"},
};

export default function App(){
  const[tab,setTab]=useState("schedule");
  const[cats,setCats]=useState(CATS);
  const[chk,setChk]=useState({});
  const[coll,setColl]=useState({});
  const[newT,setNewT]=useState({});
  const[sync,setSync]=useState("idle");
  const[filter,setFilter]=useState("all");
  const[open,setOpen]=useState({});
  const[openH,setOpenH]=useState({});
  const[openR,setOpenR]=useState({});
  const timer=useRef(null);

  useEffect(()=>{
    (async()=>{
      try{
        const s=await loadState();
        if(s){if(s.cats)setCats(s.cats);if(s.chk)setChk(s.chk);}
      }catch(_){}
      setSync("idle");
    })();
  },[]);

  const persist=useCallback((c,k)=>{
    setSync("saving");
    if(timer.current)clearTimeout(timer.current);
    timer.current=setTimeout(async()=>{
      const ok=await saveState({cats:c,chk:k});
      setSync(ok?"saved":"error");if(ok)setTimeout(()=>setSync("idle"),2000);
    },800);
  },[]);

  const tick=id=>{const k={...chk,[id]:!chk[id]};setChk(k);persist(cats,k);};
  const add=cid=>{
    const t=(newT[cid]||"").trim();if(!t)return;
    const id="c"+Date.now();
    const c=cats.map(x=>x.id===cid?{...x,items:[...x.items,{id,t}]}:x);
    setCats(c);persist(c,chk);setNewT(p=>({...p,[cid]:""}));
  };
  const del=(cid,id)=>{
    const c=cats.map(x=>x.id===cid?{...x,items:x.items.filter(i=>i.id!==id)}:x);
    const k={...chk};delete k[id];setCats(c);setChk(k);persist(c,k);
  };

  const total=cats.reduce((s,c)=>s+c.items.length,0);
  const done=Object.values(chk).filter(Boolean).length;
  const pct=total>0?Math.round((done/total)*100):0;
  const dot={display:"inline-block",width:6,height:6,borderRadius:"50%",marginRight:4,
    background:sync==="saved"?"#4ade80":sync==="saving"?"#f59e0b":sync==="error"?"#f87171":"#2a2448"};

  const vis=filter==="all"?SCHEDULE:filter==="runna"?SCHEDULE.filter(s=>s.src==="runna"):SCHEDULE.filter(s=>s.type===filter);
  const TABS=[["schedule","📅"],["nutrition","⚡"],["handbook","📖"],["reservations","🍽️"],["pack","📦"]];

  return(
    <div style={{minHeight:"100vh",background:"#08070f",fontFamily:"Georgia,serif",color:"#e2ddd6"}}>
      {/* Header */}
      <div style={{background:"linear-gradient(160deg,#0f0c1a,#130e22 60%,#0c0f18)",borderBottom:"1px solid #1c1830",padding:"18px 16px 0",position:"sticky",top:0,zIndex:10}}>
        <div style={{maxWidth:740,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                <a href="https://shashank.app" style={{display:"flex",alignItems:"center",gap:4,textDecoration:"none",color:"#3e3660",fontSize:9,fontFamily:"monospace",letterSpacing:"0.1em",padding:"2px 6px",borderRadius:4,border:"1px solid #1e1840",background:"rgba(255,255,255,0.02)"}} title="Home">← HOME</a>
                <div style={{fontSize:9,fontFamily:"monospace",color:"#42d692",letterSpacing:"0.2em"}}>⚡ LONDON MARATHON 2026</div>
              </div>
              <h1 style={{margin:0,fontSize:20,fontWeight:"normal",color:"#f0ebe2"}}>Race-Ready <span style={{color:"#c8a45e",fontStyle:"italic"}}>Travel App</span></h1>
              <div style={{fontSize:9,fontFamily:"monospace",color:"#3e3660",marginTop:2}}>SIN→LAS→LHR · Park Plaza · 🏅 26 APR WAVE 6 10:00 · 🎂 Ayaansh 10th · EDI→SIN</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:22,fontWeight:"bold",color:pct===100?"#4ade80":"#c8a45e",fontFamily:"monospace",lineHeight:1}}>{pct}%</div>
              <div style={{fontSize:9,color:"#3e3660",fontFamily:"monospace"}}>{done}/{total}</div>
              <div style={{fontSize:9,fontFamily:"monospace",color:"#3e3660",marginTop:2}}><span style={dot}/>{sync==="saving"?"SYNCING…":sync==="saved"?"SYNCED ✓":"MULTI-DEVICE"}</div>
            </div>
          </div>
          <div style={{display:"flex",marginTop:14}}>
            {TABS.map(([k,l])=>(
              <button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:"8px 0",border:"none",background:"none",cursor:"pointer",fontSize:tab===k?11:10,fontFamily:"monospace",color:tab===k?"#c8a45e":"#3e3660",borderBottom:tab===k?"2px solid #c8a45e":"2px solid transparent",transition:"all 0.2s"}}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:740,margin:"0 auto",padding:"16px 14px 56px"}}>

        {/* ── SCHEDULE ── */}
        {tab==="schedule"&&<>
          <div style={{marginBottom:12,padding:"8px 12px",background:"rgba(239,68,68,0.09)",border:"1px solid rgba(239,68,68,0.4)",borderRadius:7}}>
            <div style={{fontSize:9,fontFamily:"monospace",color:"#ef4444",letterSpacing:"0.2em",marginBottom:5}}>🚨 DO THESE TODAY</div>
            <div style={{fontSize:12,color:"#e0b0b0",lineHeight:1.9}}>
              🇬🇧 <strong style={{color:"#f0ebe2"}}>UK ETA</strong> — all 4 family members · £16 now → £20 on 8 Apr · <a href="https://www.gov.uk/eta" target="_blank" rel="noreferrer" style={{color:"#42d692",fontSize:11}}>gov.uk/eta →</a><br/>
              🚂 <strong style={{color:"#f0ebe2"}}>LNER First Class</strong> — London→Edinburgh Mon 28 Apr · 4 pax ~£337 · <a href="https://www.lner.co.uk" target="_blank" rel="noreferrer" style={{color:"#42d692",fontSize:11}}>lner.co.uk →</a><br/>
              🍱 <strong style={{color:"#f0ebe2"}}>Book OKAN</strong> — Sat 25 Apr 12:30pm · +44 7746 025394<br/>
              🍝 <strong style={{color:"#f0ebe2"}}>Book Olivelli</strong> — Sat 25 Apr 6pm · +44 20 7261 1221
            </div>
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>
            {[["all","ALL","#c8a45e"],["runna","RUNNA","#42d692"],["race","RACE","#f59e0b"],["reminder","ACTIONS","#ef4444"],["birthday","BDAY","#f472b6"],["easy","EASY","#10b981"],["flight","FLIGHTS","#8b5cf6"],["recovery","RECOVERY","#ec4899"]].map(([k,l,c])=>(
              <button key={k} onClick={()=>setFilter(k)} style={{padding:"2px 8px",borderRadius:20,border:`1px solid ${filter===k?c:"#1a1530"}`,background:filter===k?c+"18":"transparent",color:filter===k?c:"#3e3660",fontSize:8,fontFamily:"monospace",cursor:"pointer"}}>{l}</button>
            ))}
          </div>
          {vis.map((s,i)=>{
            const m=TM[s.type]||TM.rest,isO=open[i],isR=s.type==="race",isB=s.type==="birthday";
            return(
              <div key={i} onClick={()=>setOpen(p=>({...p,[i]:!p[i]}))} style={{marginBottom:isR||isB?14:5,border:`1px solid ${isR?"rgba(245,158,11,0.5)":isB?"rgba(244,114,182,0.4)":m.c+"22"}`,borderRadius:7,overflow:"hidden",cursor:"pointer",background:isR?"rgba(245,158,11,0.08)":isB?"rgba(244,114,182,0.07)":"rgba(255,255,255,0.015)",boxShadow:isR?"0 0 20px rgba(245,158,11,0.1)":"none"}}>
                <div style={{padding:"9px 12px",display:"flex",alignItems:"center",gap:10}}>
                  <div style={{minWidth:52,fontSize:8,fontFamily:"monospace",color:"#4a4260",lineHeight:1.5}}>
                    {s.d.split(" ").map((w,j)=><div key={j}>{w}</div>)}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap",marginBottom:2}}>
                      <span style={{fontSize:7,fontFamily:"monospace",color:m.c,border:`1px solid ${m.c}44`,borderRadius:3,padding:"1px 4px"}}>{m.l}</span>
                      {s.src==="runna"&&<span style={{fontSize:7,fontFamily:"monospace",color:"#42d692",border:"1px solid rgba(66,214,146,0.4)",borderRadius:3,padding:"1px 4px"}}>RUNNA</span>}
                      <span style={{fontSize:isR||isB?13:12,color:isR?"#f59e0b":isB?"#f472b6":"#e2ddd6",fontWeight:isR||isB?"bold":"normal"}}>{s.label}</span>
                    </div>
                    <div style={{fontSize:9,color:"#4a4260",fontFamily:"monospace"}}>📍 {s.loc}</div>
                  </div>
                  <span style={{fontSize:8,color:"#3e3660",transform:isO?"rotate(180deg)":"none",display:"inline-block",transition:"transform 0.2s"}}>▼</span>
                </div>
                {isO&&<div style={{padding:"0 12px 10px 74px",borderTop:`1px solid ${m.c}18`}}>
                  <div style={{paddingTop:8,fontSize:11,color:"#9a9090",lineHeight:1.7,whiteSpace:"pre-line"}}>{s.detail}</div>
                </div>}
              </div>
            );
          })}
        </>}

        {/* ── NUTRITION ── */}
        {tab==="nutrition"&&<>
          <div style={{marginBottom:14,padding:"10px 14px",background:"rgba(245,158,11,0.07)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:8}}>
            <div style={{fontSize:9,fontFamily:"monospace",color:"#f59e0b",letterSpacing:"0.2em",marginBottom:4}}>⚡ RACE DAY NUTRITION — GEL-ONLY STRATEGY</div>
            <div style={{fontSize:11,color:"#9a8060"}}>Maurten Gel 160 + Gel 100 Caf 100 + SaltStick + Beetroot · No bottles · ~111g carbs/hr · 400mg caffeine · 400–800mg nitrates</div>
          </div>

          {/* Products */}
          <div style={{fontSize:9,fontFamily:"monospace",color:"#c8a45e",letterSpacing:"0.2em",marginBottom:8}}>PRODUCTS</div>
          <div style={{marginBottom:16,display:"flex",flexDirection:"column",gap:6}}>
            {[
              {e:"🟠",n:"Maurten Gel 160",p:"40g carbs · 30mg sodium · ~160 kcal · take WITHOUT water"},
              {e:"☕",n:"Maurten Gel 100 Caf 100",p:"25g carbs · 100mg caffeine · 22mg sodium · take WITHOUT water"},
              {e:"🔵",n:"SaltStick Caps",p:"215mg sodium · 63mg K · 22mg Ca · 11mg Mg · take WITH water"},
              {e:"🍇",n:"Beetroot Shot (NEW)",p:"400–800mg nitrates · 60 min pre-race · dilates blood vessels · 2–3% performance boost"},
            ].map((p,i)=>(
              <div key={i} style={{padding:"10px 12px",border:"1px solid #1a1530",borderRadius:7,background:"rgba(255,255,255,0.02)",display:"flex",gap:10,alignItems:"center"}}>
                <span style={{fontSize:20,flexShrink:0}}>{p.e}</span>
                <div><div style={{fontSize:13,color:"#f0ebe2",marginBottom:2}}>{p.n}</div><div style={{fontSize:11,color:"#6b6580"}}>{p.p}</div></div>
              </div>
            ))}
          </div>

          {/* Pre-race */}
          <div style={{fontSize:9,fontFamily:"monospace",color:"#c8a45e",letterSpacing:"0.2em",marginBottom:8}}>PRE-RACE MORNING</div>
          <div style={{marginBottom:16,border:"1px solid #1a1530",borderRadius:8,overflow:"hidden"}}>
            {NUTRITION.preRace.map((r,i)=>(
              <div key={i} style={{display:"flex",gap:0,padding:"9px 12px",borderTop:i>0?"1px solid #100e1c":"none"}}>
                <div style={{minWidth:60,fontSize:9,fontFamily:"monospace",color:"#c8a45e",flexShrink:0,paddingTop:1}}>{r.time}</div>
                <div><div style={{fontSize:12,color:"#e2ddd6",marginBottom:2}}>{r.what}</div><div style={{fontSize:11,color:"#6b6580",lineHeight:1.5}}>{r.detail}</div></div>
              </div>
            ))}
          </div>

          {/* In-race */}
          <div style={{fontSize:9,fontFamily:"monospace",color:"#c8a45e",letterSpacing:"0.2em",marginBottom:8}}>IN-RACE KM BY KM</div>
          <div style={{marginBottom:16,border:"1px solid #1a1530",borderRadius:8,overflow:"hidden"}}>
            {NUTRITION.inRace.map((r,i)=>{
              const isF=r.km==="Km 42.2",isC=r.ss.includes("CRITICAL");
              return(
                <div key={i} style={{display:"flex",gap:0,padding:"8px 12px",borderTop:i>0?"1px solid #100e1c":"none",background:isF?"rgba(245,158,11,0.07)":isC?"rgba(239,68,68,0.04)":"transparent"}}>
                  <div style={{minWidth:52,flexShrink:0,paddingTop:1}}>
                    <div style={{fontSize:9,fontFamily:"monospace",color:isF?"#f59e0b":isC?"#ef4444":"#c8a45e"}}>{r.km}</div>
                    <div style={{fontSize:8,fontFamily:"monospace",color:"#3e3660"}}>{r.time}</div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:3}}>
                      {r.gel160!=="—"&&r.gel160!=="Done"&&<span style={{fontSize:9,fontFamily:"monospace",color:"#fb923c",background:"rgba(251,146,60,0.12)",padding:"1px 5px",borderRadius:3}}>{r.gel160}</span>}
                      {r.caf!=="—"&&<span style={{fontSize:9,fontFamily:"monospace",color:r.caf.includes("PEAKING")?"#ef4444":"#fb923c",background:r.caf.includes("PEAKING")?"rgba(239,68,68,0.12)":"rgba(251,146,60,0.1)",padding:"1px 5px",borderRadius:3}}>{r.caf}</span>}
                      {r.ss!=="—"&&r.ss!=="Done"&&<span style={{fontSize:9,fontFamily:"monospace",color:isC?"#ef4444":"#42d692",background:isC?"rgba(239,68,68,0.1)":"rgba(66,214,146,0.1)",padding:"1px 5px",borderRadius:3}}>🔵 {r.ss}</span>}
                    </div>
                    <div style={{fontSize:11,color:"#6b6580",lineHeight:1.4}}>{r.note}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div style={{marginBottom:16,padding:"12px 14px",background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:8}}>
            <div style={{fontSize:9,fontFamily:"monospace",color:"#10b981",letterSpacing:"0.2em",marginBottom:8}}>RACE DAY TOTALS</div>
            {NUTRITION.totals.map(([prod,qty,carbs,extra],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderTop:i>0?"1px solid rgba(16,185,129,0.1)":"none",flexWrap:"wrap",gap:4}}>
                <span style={{fontSize:11,color:i===NUTRITION.totals.length-1?"#f0ebe2":"#6b9e80",fontWeight:i===NUTRITION.totals.length-1?"bold":"normal"}}>{prod}</span>
                <div style={{display:"flex",gap:10}}>
                  <span style={{fontSize:11,fontFamily:"monospace",color:"#10b981"}}>{carbs}</span>
                  {extra&&<span style={{fontSize:11,fontFamily:"monospace",color:"#f59e0b"}}>{extra}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* What you missed */}
          <div style={{fontSize:9,fontFamily:"monospace",color:"#c8a45e",letterSpacing:"0.2em",marginBottom:8}}>💡 WHAT YOU MAY HAVE MISSED</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {NUTRITION.missed.map((m,i)=>{
              const isO=openR["m"+i];
              const bc=m.urgency==="high"?"rgba(239,68,68,0.3)":m.urgency==="medium"?"rgba(245,158,11,0.3)":"rgba(74,85,104,0.3)";
              const cc=m.urgency==="high"?"#ef4444":m.urgency==="medium"?"#f59e0b":"#4a5568";
              return(
                <div key={i} onClick={()=>setOpenR(p=>({...p,["m"+i]:!p["m"+i]}))} style={{padding:"10px 12px",border:`1px solid ${bc}`,borderRadius:7,cursor:"pointer",background:"rgba(255,255,255,0.02)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:18}}>{m.icon}</span>
                      <span style={{fontSize:12,color:cc,fontWeight:"bold"}}>{m.title}</span>
                    </div>
                    <span style={{fontSize:8,color:"#3e3660",transform:isO?"rotate(180deg)":"none",display:"inline-block",transition:"transform 0.2s"}}>▼</span>
                  </div>
                  {isO&&<div style={{marginTop:8,fontSize:12,color:"#9a9090",lineHeight:1.65,paddingLeft:26}}>{m.detail}</div>}
                </div>
              );
            })}
          </div>
        </>}

        {/* ── HANDBOOK ── */}
        {tab==="handbook"&&<>
          <div style={{marginBottom:12,padding:"8px 12px",background:"rgba(245,158,11,0.07)",border:"1px solid rgba(245,158,11,0.25)",borderRadius:7}}>
            <div style={{fontSize:9,fontFamily:"monospace",color:"#f59e0b",letterSpacing:"0.2em",marginBottom:3}}>📖 TCS LONDON MARATHON 2026 — OFFICIAL HANDBOOK</div>
            <div style={{fontSize:11,color:"#9a8060"}}>Wave 6 Green · Bib 78722 · Start 10:00 · Expo Wed–Sat · Free TfL with bib</div>
          </div>
          {HANDBOOK.map((s,i)=>{
            const isO=openH[i];
            return(
              <div key={i} style={{marginBottom:8,border:"1px solid #1a1530",borderRadius:7,overflow:"hidden"}}>
                <button onClick={()=>setOpenH(p=>({...p,[i]:!p[i]}))} style={{width:"100%",background:"rgba(255,255,255,0.02)",padding:"10px 12px",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",textAlign:"left"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:17}}>{s.icon}</span><span style={{fontSize:13,color:"#e2ddd6"}}>{s.title}</span></div>
                  <span style={{fontSize:9,color:"#3e3660",transform:isO?"rotate(180deg)":"none",display:"inline-block",transition:"transform 0.2s"}}>▼</span>
                </button>
                {isO&&<div style={{padding:"4px 0 8px",borderTop:"1px solid #1a1530"}}>
                  {s.items.map((it,j)=>(
                    <div key={j} style={{display:"flex",gap:8,padding:"6px 12px",borderTop:j>0?"1px solid #0f0d1a":"none"}}>
                      <span style={{color:"#c8a45e",fontSize:10,marginTop:2,flexShrink:0}}>›</span>
                      <span style={{fontSize:12,color:"#b0a898",lineHeight:1.5}}>{it}</span>
                    </div>
                  ))}
                </div>}
              </div>
            );
          })}
          <div style={{marginTop:10,padding:"10px 12px",background:"rgba(66,214,146,0.06)",border:"1px solid rgba(66,214,146,0.2)",borderRadius:7,fontSize:11,color:"#6b9e80",lineHeight:1.8}}>
            🌐 tcslondonmarathon.com · 📱 TCS Marathon App (iOS/Android) · 🚇 Road closures: tcslondonmarathon.com/road-closures · 📺 BBC One live 08:30
          </div>
        </>}

        {/* ── RESERVATIONS ── */}
        {tab==="reservations"&&<>
          <div style={{marginBottom:12,padding:"8px 12px",background:"rgba(244,114,182,0.07)",border:"1px solid rgba(244,114,182,0.28)",borderRadius:7}}>
            <div style={{fontSize:9,fontFamily:"monospace",color:"#f472b6",letterSpacing:"0.2em",marginBottom:3}}>🍽️ RACE EVE RESTAURANTS — SAT 25 APR</div>
            <div style={{fontSize:11,color:"#9a7090"}}>Book both TODAY — Saturday is one of London's busiest dining nights.</div>
          </div>
          {RESERVATIONS.map((r,i)=>{
            const booked=chk["res-"+r.id];
            const isO=openR[r.id];
            return(
              <div key={i} style={{marginBottom:14,border:`1px solid ${booked?"rgba(74,222,128,0.3)":"rgba(244,114,182,0.4)"}`,borderRadius:8,overflow:"hidden",background:booked?"rgba(74,222,128,0.04)":"rgba(244,114,182,0.05)"}}>
                <div style={{padding:"12px 14px"}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,flexWrap:"wrap"}}>
                        {booked?<span style={{fontSize:8,fontFamily:"monospace",color:"#4ade80",border:"1px solid rgba(74,222,128,0.4)",borderRadius:3,padding:"1px 5px"}}>✓ BOOKED</span>:<span style={{fontSize:8,fontFamily:"monospace",color:"#ef4444",border:"1px solid rgba(239,68,68,0.4)",borderRadius:3,padding:"1px 5px"}}>BOOK NOW</span>}
                        <span style={{fontSize:14,color:"#f0ebe2",fontWeight:"bold"}}>{r.name}</span>
                      </div>
                      <div style={{fontSize:10,fontFamily:"monospace",color:"#c8a45e",marginBottom:3}}>{r.when}</div>
                      <div style={{fontSize:11,color:"#6b6580"}}>{r.addr} · {r.dist}</div>
                      <div style={{fontSize:11,color:"#42d692",marginTop:2}}>{r.rating}</div>
                    </div>
                    <button onClick={e=>{e.stopPropagation();tick("res-"+r.id);}} style={{padding:"6px 10px",borderRadius:6,border:`1.5px solid ${booked?"#4ade80":"rgba(244,114,182,0.5)"}`,background:"transparent",color:booked?"#4ade80":"#f472b6",fontSize:9,fontFamily:"monospace",cursor:"pointer",flexShrink:0}}>
                      {booked?"✓ BOOKED":"MARK BOOKED"}
                    </button>
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
                    <a href={"tel:"+r.phone} style={{fontSize:10,fontFamily:"monospace",color:"#6366f1",border:"1px solid rgba(99,102,241,0.3)",borderRadius:4,padding:"3px 8px",textDecoration:"none"}}>📞 {r.phone}</a>
                    <a href={"https://"+r.web} target="_blank" rel="noreferrer" style={{fontSize:10,fontFamily:"monospace",color:"#42d692",border:"1px solid rgba(66,214,146,0.3)",borderRadius:4,padding:"3px 8px",textDecoration:"none"}}>🌐 {r.web}</a>
                    <button onClick={()=>setOpenR(p=>({...p,[r.id]:!p[r.id]}))} style={{fontSize:10,fontFamily:"monospace",color:"#c8a45e",border:"1px solid rgba(200,164,94,0.3)",borderRadius:4,padding:"3px 8px",background:"none",cursor:"pointer"}}>{isO?"▲ LESS":"▼ DETAILS"}</button>
                  </div>
                </div>
                {isO&&<div style={{padding:"0 14px 12px",borderTop:"1px solid #1a1530",background:"rgba(0,0,0,0.15)"}}>
                  <div style={{marginTop:10,fontSize:11,color:"#9a9090"}}><strong style={{color:"#c8a45e",fontSize:9,fontFamily:"monospace"}}>WHY: </strong>{r.why}</div>
                  <div style={{marginTop:8,fontSize:11,color:"#9a9090",whiteSpace:"pre-line"}}><strong style={{color:"#42d692",fontSize:9,fontFamily:"monospace"}}>ORDER: </strong>{r.menu}</div>
                </div>}
              </div>
            );
          })}
          <div style={{padding:"10px 14px",background:"rgba(200,164,94,0.05)",border:"1px solid rgba(200,164,94,0.2)",borderRadius:8}}>
            <div style={{fontSize:9,fontFamily:"monospace",color:"#c8a45e",letterSpacing:"0.15em",marginBottom:8}}>RACE EVE TIMELINE — SAT 25 APR</div>
            {[["7:30am","🎈 Reunite at T2 — birthday!"],["10:30am","Gentle walk: Westminster → Big Ben"],["12:30pm","🍱 OKAN lunch (4 min walk)"],["2:30pm","Cinema / Borough Market"],["4:30pm","🛌 Hotel nap — MANDATORY"],["6:00pm","🍝 Olivelli dinner (pasta carb load)"],["8:00pm","Lay out race kit. Pin bib. Set 3 alarms."],["9:30pm","😴 SLEEP — non-negotiable"]].map(([t,a],i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"5px 0",borderTop:i>0?"1px solid #110f1e":"none"}}>
                <span style={{fontSize:9,fontFamily:"monospace",color:t==="9:30pm"?"#ef4444":"#c8a45e",minWidth:52,flexShrink:0}}>{t}</span>
                <span style={{fontSize:12,color:t==="9:30pm"?"#ef4444":"#e2ddd6"}}>{a}</span>
              </div>
            ))}
          </div>
        </>}

        {/* ── PACKING ── */}
        {tab==="pack"&&<>
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{fontSize:9,fontFamily:"monospace",color:"#3e3660",letterSpacing:"0.2em"}}>PACKING PROGRESS</div>
              {done>0&&<button onClick={()=>{setChk({});persist(cats,{});}} style={{fontSize:9,color:"#3e3660",background:"none",border:"1px solid #1a1530",borderRadius:4,padding:"2px 8px",cursor:"pointer",fontFamily:"monospace"}}>RESET</button>}
            </div>
            <div style={{height:2,background:"#1a1630",borderRadius:2}}>
              <div style={{height:"100%",borderRadius:2,background:pct===100?"#4ade80":"linear-gradient(90deg,#7c5fff,#c8a45e)",width:`${pct}%`,transition:"width 0.4s"}}/>
            </div>
            {pct===100&&<div style={{marginTop:6,fontSize:11,color:"#4ade80",fontFamily:"monospace"}}>✓ ALL PACKED — YOU'RE RACE READY!</div>}
          </div>
          {cats.map(cat=>{
            const cd=cat.items.filter(i=>chk[i.id]).length;
            const done2=cd===cat.items.length&&cat.items.length>0;
            const isColl=coll[cat.id];
            const isB=cat.id==="bd",isBk=cat.id==="bk";
            const bc=isBk?"rgba(245,158,11,0.35)":isB?"rgba(244,114,182,0.3)":done2?"rgba(74,222,128,0.18)":"#1a1530";
            return(
              <div key={cat.id} style={{marginBottom:8}}>
                <button onClick={()=>setColl(p=>({...p,[cat.id]:!p[cat.id]}))} style={{width:"100%",background:done2?"rgba(74,222,128,0.03)":isBk?"rgba(245,158,11,0.04)":isB?"rgba(244,114,182,0.04)":"rgba(255,255,255,0.02)",border:`1px solid ${bc}`,borderRadius:isColl?6:"6px 6px 0 0",padding:"9px 12px",cursor:"pointer",color:"#e2ddd6",display:"flex",alignItems:"center",justifyContent:"space-between",textAlign:"left"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:14}}>{cat.icon}</span><span style={{fontSize:12,fontFamily:"monospace"}}>{cat.label}</span></div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:9,fontFamily:"monospace",color:done2?"#4ade80":"#3e3660"}}>{cd}/{cat.items.length}</span><span style={{color:"#3e3660",fontSize:9,transform:isColl?"rotate(-90deg)":"none",display:"inline-block",transition:"transform 0.2s"}}>▼</span></div>
                </button>
                {!isColl&&<div style={{border:`1px solid ${bc}`,borderTop:"none",borderRadius:"0 0 6px 6px",overflow:"hidden"}}>
                  {cat.items.map((item,idx)=>(
                    <div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderTop:idx>0?"1px solid #100e1c":"none",background:chk[item.id]?"rgba(74,222,128,0.02)":"transparent"}}>
                      <button onClick={()=>tick(item.id)} style={{width:16,height:16,minWidth:16,borderRadius:3,border:`1.5px solid ${chk[item.id]?"#4ade80":"#2e2848"}`,background:chk[item.id]?"#4ade80":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                        {chk[item.id]&&<span style={{color:"#08070f",fontSize:9,fontWeight:"bold"}}>✓</span>}
                      </button>
                      <span style={{fontSize:11,color:chk[item.id]?"#3d3d50":"#c0b9af",flex:1,textDecoration:chk[item.id]?"line-through":"none",lineHeight:1.4}}>{item.t}</span>
                      <button onClick={()=>del(cat.id,item.id)} style={{background:"none",border:"none",color:"#2e2848",cursor:"pointer",fontSize:13,padding:"0 2px"}} onMouseOver={e=>e.currentTarget.style.color="#e05050"} onMouseOut={e=>e.currentTarget.style.color="#2e2848"}>×</button>
                    </div>
                  ))}
                  <div style={{display:"flex",gap:6,padding:"6px 10px",borderTop:"1px solid #100e1c"}}>
                    <input placeholder="Add item…" value={newT[cat.id]||""} onChange={e=>setNewT(p=>({...p,[cat.id]:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter")add(cat.id);}} style={{flex:1,background:"transparent",border:"none",borderBottom:"1px solid #1e1838",color:"#a09890",fontSize:11,padding:"2px 2px",outline:"none",fontFamily:"Georgia,serif"}}/>
                    <button onClick={()=>add(cat.id)} style={{background:"rgba(124,95,255,0.1)",border:"1px solid rgba(124,95,255,0.3)",color:"#9a7fff",borderRadius:4,padding:"2px 8px",cursor:"pointer",fontSize:9,fontFamily:"monospace"}}>+ADD</button>
                  </div>
                </div>}
              </div>
            );
          })}
        </>}
      </div>
    </div>
  );
}
