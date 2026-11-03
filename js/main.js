"use strict";
/* ---------- Helpers ---------- */
function h(tag, props, ...kids){
  const e = document.createElement(tag);
  for (const k in (props || {})){
    const v = props[k];
    if (v == null || v === false) continue;
    if (k === "class") e.className = v;
    else if (k === "text") e.textContent = v;
    else if (k.slice(0,2) === "on") e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? "" : v);
  }
  kids.flat(Infinity).forEach(c => { if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c)); });
  return e;
}
const NS = "http://www.w3.org/2000/svg";
function s(tag, attrs){
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}
function seedOf(str){ let n = 7; for (let i = 0; i < str.length; i++) n = (n * 31 + str.charCodeAt(i)) % 2147483647; return n || 1; }
function rng(seed){ let x = seed; return () => (x = (x * 16807) % 2147483647) / 2147483647; }

/* Original abstract art, one motif per mood. Stand-in until licensed photos are added. */
function art(key, moodId){
  const r = rng(seedOf(key));
  const svg = s("svg", {viewBox:"0 0 400 300", preserveAspectRatio:"xMidYMid slice", "aria-hidden":"true", focusable:"false"});
  const bg = s("rect", {width:400, height:300}); bg.style.fill = MOOD[moodId].color; svg.append(bg);
  const dark = "rgba(31,27,22,.13)", light = "rgba(255,255,255,.6)";
  const add = (el, fill, extra) => { el.setAttribute("fill", fill); if (extra) for (const k in extra) el.setAttribute(k, extra[k]); svg.append(el); };
  if (moodId === "relax"){
    const cx = 120 + r()*160, cy = 90 + r()*120;
    for (let i = 4; i >= 1; i--) add(s("circle",{cx,cy,r:i*38}), i % 2 ? light : dark);
    for (let i = 0; i < 3; i++) add(s("rect",{x:0,y:220+i*22,width:400,height:4}), dark);
  } else if (moodId === "nature"){
    for (let i = 0; i < 6; i++){
      const x = 40 + r()*320, y = 60 + r()*190, a = Math.round(r()*180);
      const e = s("ellipse",{cx:x,cy:y,rx:20+r()*20,ry:70+r()*40}); e.setAttribute("transform","rotate("+a+" "+x+" "+y+")");
      add(e, i % 2 ? light : dark);
    }
  } else if (moodId === "social"){
    for (let i = 0; i < 5; i++) add(s("circle",{cx:60+r()*280,cy:50+r()*200,r:50+r()*50}), i % 2 ? light : dark);
  } else if (moodId === "romantic"){
    const cx = 140 + r()*120;
    add(s("circle",{cx,cy:150,r:84}), light);
    add(s("circle",{cx:cx+90,cy:110,r:26}), dark);
    add(s("rect",{x:0,y:190,width:400,height:110}), dark);
    add(s("rect",{x:0,y:226,width:400,height:3}), light);
  } else if (moodId === "hidden"){
    const x0 = 80 + r()*140;
    [[160,"d"],[110,"l"],[60,"d"]].forEach(([w,t], i) => {
      const rr = w/2, y = 120 + i*18, x = x0 + (160-w)/2;
      add(s("path",{d:"M"+x+" 300 V"+y+" A"+rr+" "+rr+" 0 0 1 "+(x+w)+" "+y+" V300 Z"}), t === "d" ? dark : light);
    });
  } else {
    for (let ix = 0; ix < 9; ix++) for (let iy = 0; iy < 6; iy++) add(s("circle",{cx:30+ix*42,cy:30+iy*48,r:5}), dark);
    add(s("circle",{cx:100+r()*200,cy:90+r()*120,r:70}), light);
  }
  return svg;
}
const heartIcon = () => { const v = s("svg",{viewBox:"0 0 24 24","aria-hidden":"true",focusable:"false"}); const p = s("path",{d:"M12 21s-7.5-4.6-9.6-9.2C.8 8.2 2.9 4.5 6.6 4.5c2 0 3.5 1.1 4.4 2.5.9-1.4 2.4-2.5 4.4-2.5 3.7 0 5.8 3.700 4.200 7.300C19.500 16.400 12 21 12 21z",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linejoin":"round"}); v.append(p); return v; };

/* ---------- Saved places (localStorage, with fallback) ---------- */
let saved = [], storageOK = true;
try { const raw = localStorage.getItem("mbm-saved"); const arr = raw ? JSON.parse(raw) : []; saved = Array.isArray(arr) ? arr.filter(id => BY_ID[id]) : []; }
catch (e) { storageOK = false; saved = []; }
function persist(){ try { localStorage.setItem("mbm-saved", JSON.stringify(saved)); } catch (e) { storageOK = false; } }
const isSaved = id => saved.includes(id);
function live(msg){ const l = document.getElementById("live"); l.textContent = ""; setTimeout(() => { l.textContent = msg; }, 30); }
function updateCount(){
  const b = document.getElementById("savedCount");
  b.hidden = saved.length === 0; b.textContent = saved.length;
  b.setAttribute("aria-label", saved.length + " saved");
}
function toggleSave(id){
  const p = BY_ID[id]; if (!p) return;
  if (isSaved(id)) saved = saved.filter(x => x !== id); else saved.push(id);
  persist(); updateCount();
  document.querySelectorAll('[data-save="' + id + '"]').forEach(refreshSaveBtn);
  live((isSaved(id) ? "Saved " : "Removed ") + p.name);
}
function refreshSaveBtn(btn){
  const on = isSaved(btn.dataset.save);
  btn.setAttribute("aria-pressed", on ? "true" : "false");
  const t = btn.querySelector("span"); if (t) t.textContent = on ? "Saved" : "Save";
}
function saveBtn(p){
  const b = h("button", {type:"button", class:"save", "data-save":p.id, "aria-label":"Save " + p.name, onclick:() => toggleSave(p.id)}, heartIcon(), h("span", {text:"Save"}));
  refreshSaveBtn(b); return b;
}
function removeBtn(p){
  return h("button", {type:"button", class:"save", "aria-label":"Remove " + p.name + " from saved", onclick:() => { toggleSave(p.id); render(); document.getElementById("main").focus(); }}, h("span", {text:"Remove"}));
}
function storageNote(){
  return storageOK ? null : h("p", {class:"note"}, "Your browser is blocking storage, so saved places work for this visit only and will not be remembered.");
}

/* ---------- Components ---------- */
function moodTag(id){ const t = h("span", {class:"tag", text:MOOD[id].name}); t.style.background = MOOD[id].color; return t; }
function card(p, mode){
  const m = p.moods[0];
  return h("article", {class:"card"},
    h("div", {class:"pic"}, art(p.id, m)),
    h("div", {class:"body"},
      moodTag(m),
      h("h3", {}, h("a", {href:"#place-" + p.id, text:p.name})),
      h("p", {text:p.desc}),
      h("div", {class:"meta"}, h("span", {text:p.area}), h("span", {text:p.priceLabel})),
      h("div", {class:"actions"}, mode === "remove" ? removeBtn(p) : saveBtn(p))
    ));
}
function cardGrid(list, mode){ return h("div", {class:"grid"}, list.map(p => card(p, mode))); }
const inMood = (p, id) => id === "free" ? p.price === 0 : p.moods.includes(id);

/* ---------- Views ---------- */
let from = null;          // where the visitor came from, for the Back link
let budget = "any";       // explore budget filter

function viewHome(){
  from = {href:"#home", label:"Home"};
  const tiles = MOODS.map(m => {
    const n = PLACES.filter(p => inMood(p, m.id)).length;
    const a = h("a", {class:"tile", href:"#mood-" + m.id}, art("tile-" + m.id, m.id), h("b", {text:m.name}), h("span", {text:m.hint + " (" + n + " places)"}));
    return a;
  });
  const pop = PLACES.filter(p => p.popular);
  return [
    h("section", {class:"hero"},
      h("h1", {class:"mega", text:"How do you want to feel in Madrid?"}),
      h("p", {class:"lede", text:"Choose your mood and discover the perfect place."}),
      h("div", {class:"tiles"}, tiles)),
    h("section", {class:"section", "aria-labelledby":"popH"},
      h("div", {class:"section-head"}, h("h2", {class:"h2", id:"popH", text:"Popular picks"}), h("a", {class:"textlink", href:"#explore", text:"See every place"})),
      cardGrid(pop)),
    h("section", {class:"section", "aria-labelledby":"allH"},
      h("div", {class:"everything"},
        h("h2", {class:"h2", id:"allH", text:"We guide everything for everyone"}),
        h("div", {},
          h("h3", {text:"Everything"}),
          h("ul", {},
            h("li", {}, h("a", {href:"#mood-nature", text:"Parks and gardens"})),
            h("li", {}, h("a", {href:"#mood-free", text:"Museums on free evenings"})),
            h("li", {}, h("a", {href:"#mood-social", text:"Markets and tapas"})),
            h("li", {}, h("a", {href:"#mood-romantic", text:"Rooftops and viewpoints"})),
            h("li", {}, h("a", {href:"#mood-relax", text:"Quiet corners and warm water"})),
            h("li", {}, h("a", {href:"#mood-hidden", text:"Places most visitors skip"})))),
        h("div", {},
          h("h3", {text:"Everyone"}),
          h("ul", {},
            ["First-years finding their feet","Exchange students","Night owls","Early birds","Book lovers","Anyone on a budget"].map(t => h("li", {}, h("span", {text:t}))))))),
    h("section", {class:"section"},
      h("div", {class:"note"},
        h("h2", {text:"Keep a shortlist"}),
        h("p", {text:"Tap Save on any place and it stays in this browser, so you can plan your week."}),
        h("div", {class:"row"}, h("a", {class:"btn", href:"#saved", text:"Open saved places"}))))
  ];
}

function viewExplore(moodId){
  const m = moodId ? MOOD[moodId] : null;
  from = m ? {href:"#mood-" + m.id, label:m.name} : {href:"#explore", label:"Explore"};
  let list = PLACES.filter(p => !m || inMood(p, m.id));
  if (budget === "free") list = list.filter(p => p.price === 0);
  if (budget === "10") list = list.filter(p => p.price <= 10);

  const bar = h("nav", {class:"filters", "aria-label":"Moods"},
    h("a", {class:"chip", href:"#explore", "aria-current":m ? null : "page", text:"All moods"}),
    MOODS.map(x => { const a = h("a", {class:"chip", href:"#mood-" + x.id, "aria-current":m && m.id === x.id ? "page" : null}, h("span", {class:"dot", style:"background:" + x.color}), x.name); return a; }));

  const resultsWrap = h("div", {class:"results"});
  const count = h("p", {class:"count", role:"status"});
  const fill = () => {
    let l = PLACES.filter(p => !m || inMood(p, m.id));
    if (budget === "free") l = l.filter(p => p.price === 0);
    if (budget === "10") l = l.filter(p => p.price <= 10);
    count.textContent = l.length + (l.length === 1 ? " place" : " places");
    resultsWrap.replaceChildren(l.length ? cardGrid(l) : h("div", {class:"note"}, h("h2", {text:"No places match"}), h("p", {text:"Try a different budget, or pick another mood."}), h("div", {class:"row"}, h("button", {type:"button", class:"btn", onclick:() => { budget = "any"; syncChips(); fill(); }, text:"Show any budget"}))));
  };
  const chips = [["any","Any budget"],["free","Free only"],["10","Up to €10"]].map(([v,l]) => h("button", {type:"button", class:"chip", "data-b":v, onclick:() => { budget = v; syncChips(); fill(); }, text:l}));
  const syncChips = () => chips.forEach(c => c.setAttribute("aria-pressed", c.dataset.b === budget ? "true" : "false"));
  syncChips(); fill();

  return [
    h("div", {class:"page-top"},
      h("h1", {text:m ? m.head : "Every place, every mood."}),
      h("p", {text:m ? m.sub : "Twenty-four hand-picked places. Choose a mood to narrow them down."})),
    bar,
    h("div", {class:"filter-row"}, h("span", {class:"label", text:"Budget"}), chips),
    count, resultsWrap
  ];
}

function viewPlace(id){
  const p = BY_ID[id]; if (!p) return viewNotFound("place");
  const back = from || {href:"#mood-" + p.moods[0], label:MOOD[p.moods[0]].name};
  const maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(p.q);
  const m = p.moods[0];
  return [
    h("a", {class:"back", href:back.href, text:"Back to " + back.label}),
    h("article", {class:"detail"},
      h("div", {class:"pic"}, art(p.id, m)),
      h("div", {},
        h("div", {class:"tags"}, p.moods.map(x => { const a = h("a", {class:"tag", href:"#mood-" + x, text:MOOD[x].name}); a.style.background = MOOD[x].color; a.style.color = "var(--ink)"; return a; })),
        h("h1", {text:p.name}),
        h("p", {text:p.desc}),
        h("dl", {},
          h("div", {}, h("dt", {text:"Neighbourhood"}), h("dd", {text:p.area})),
          h("div", {}, h("dt", {text:"Cost (approx.)"}), h("dd", {text:p.priceLabel})),
          h("div", {}, h("dt", {text:"Student tip"}), h("dd", {text:p.tip}))),
        h("div", {class:"actions"},
          saveBtn(p),
          h("a", {class:"btn", href:maps, target:"_blank", rel:"noopener noreferrer"}, "Get directions", h("span", {class:"sr-only", text:" (opens Google Maps in a new tab)"}))),
        h("p", {class:"credit", text:"Directions open Google Maps in a new tab. Prices and opening times can change, so check before you go. Artwork is an original illustration; real photo credits will be listed on the About page."}))),
    storageNote()
  ];
}

function viewSaved(){
  from = {href:"#saved", label:"Saved"};
  const list = saved.map(id => BY_ID[id]).filter(Boolean);
  return [
    h("div", {class:"page-top"}, h("h1", {text:"Your saved places."}), h("p", {text:"Your shortlist is stored in this browser only. There are no accounts and nothing syncs between devices."})),
    storageNote(),
    list.length ? h("div", {class:"results"}, cardGrid(list, "remove"))
      : h("div", {class:"note"}, h("h2", {text:"Nothing saved yet"}), h("p", {text:"Browse the moods and tap Save on places you like."}), h("div", {class:"row"}, h("a", {class:"btn", href:"#explore", text:"Explore places"})))
  ];
}

function viewAbout(){
  from = {href:"#about", label:"About"};
  return [
    h("div", {class:"page-top"}, h("h1", {text:"A guide that starts with how you feel."}),
      h("div", {class:"prose", style:"margin-top:24px"},
        h("p", {text:"Madrid by Mood is a short guide to the city for university students, especially anyone new to Madrid or looking for something different to do. It runs entirely in your browser: no accounts, no tracking and no backend."}))),
    h("section", {"aria-labelledby":"howH"},
      h("h2", {class:"h2", id:"howH", text:"How to use it"}),
      h("ol", {class:"steps"},
        h("li", {}, h("b", {text:"Choose a mood"}), "Relax, Nature, Social, Romantic, Hidden or Free."),
        h("li", {}, h("b", {text:"Browse places"}), "Each card shows an area, an approximate price and a short description."),
        h("li", {}, h("b", {text:"Save favourites"}), "Keep a shortlist, then open directions when you are ready to go."))),
    h("div", {class:"facts"},
      h("div", {}, h("b", {text:"Curated, not complete"}), "This list has 24 places chosen by hand. It will grow over time but never aims to cover everything."),
      h("div", {}, h("b", {text:"Prices are approximate"}), "Costs, opening days and free-entry hours change. Confirm them before you go. “Free” in the mood bar means a price of zero."),
      h("div", {}, h("b", {text:"Credits"}), "The artwork on this site is original and abstract. Real photos will be added with the photographer, licence and source recorded for each one.")),
    h("p", {style:"margin:40px 0 64px"}, h("a", {class:"btn", href:"#home", text:"Choose your mood"}))
  ];
}

function viewNotFound(kind){
  return [h("div", {class:"page-top"},
    h("h1", {text: kind === "place" ? "That place isn’t on the map." : "That page isn’t on the map."}),
    h("p", {text:"The link may be old or mistyped. Start again from the home page or browse every place."}),
    h("div", {class:"filters"}, h("a", {class:"btn", href:"#home", text:"Go home"}), h("a", {class:"chip", href:"#explore", text:"Explore places"})))];
}

/* ---------- Router ---------- */
let first = true;
function render(){
  let hash = "home";
  try { hash = decodeURIComponent(location.hash.replace(/^#/, "")) || "home"; } catch (e) { hash = "bad-link"; }
  let nodes, nav = "", title = "Madrid by Mood";
  if (hash === "home"){ nodes = viewHome(); nav = "home"; }
  else if (hash === "explore"){ nodes = viewExplore(null); nav = "explore"; title = "Explore · Madrid by Mood"; }
  else if (hash.startsWith("mood-")){
    const id = hash.slice(5);
    if (MOOD[id]){ nodes = viewExplore(id); nav = "explore"; title = MOOD[id].name + " · Madrid by Mood"; }
    else { nodes = viewNotFound("mood"); title = "Not found · Madrid by Mood"; }
  }
  else if (hash.startsWith("place-")){
    const p = BY_ID[hash.slice(6)];
    nodes = viewPlace(hash.slice(6)); nav = "explore"; title = (p ? p.name : "Not found") + " · Madrid by Mood";
  }
  else if (hash === "saved"){ nodes = viewSaved(); nav = "saved"; title = "Saved · Madrid by Mood"; }
  else if (hash === "about"){ nodes = viewAbout(); nav = "about"; title = "About · Madrid by Mood"; }
  else { nodes = viewNotFound("page"); title = "Not found · Madrid by Mood"; }

  document.getElementById("app").replaceChildren(...nodes.filter(Boolean));
  document.title = title;
  document.querySelectorAll("[data-nav]").forEach(a => { if (a.dataset.nav === nav) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  closeMenu();
  if (!first){ window.scrollTo(0, 0); const hd = document.querySelector("#app h1"); if (hd){ hd.setAttribute("tabindex", "-1"); hd.focus({preventScroll:true}); } }
  first = false;
}

/* ---------- Mobile menu ---------- */
const menuBtn = document.getElementById("menuBtn"), navEl = document.getElementById("nav");
function closeMenu(){ navEl.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
menuBtn.addEventListener("click", () => { const o = navEl.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", o ? "true" : "false"); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && navEl.classList.contains("open")){ closeMenu(); menuBtn.focus(); } });

window.addEventListener("hashchange", render);
updateCount();
render();
