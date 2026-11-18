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
function visual(p, moodId, eager){
  const ph = PHOTOS[p.id];
  if (!ph) return art(p.id, moodId);
  return h("img", {src:ph.file, alt:ph.alt, width:1000, height:667, loading:eager ? "eager" : "lazy", decoding:"async"});
}
function creditLine(p){
  const ph = PHOTOS[p.id];
  if (!ph) return "Artwork is an original illustration.";
  return h("span", {}, "Photo: " + ph.artist + ", ", ph.licenseUrl ? h("a", {href:ph.licenseUrl, target:"_blank", rel:"noopener noreferrer", text:ph.license}) : ph.license, ", via ", h("a", {href:ph.source, target:"_blank", rel:"noopener noreferrer", text:"Wikimedia Commons"}), " (opens in a new tab)." + (ph.note ? " " + ph.note : ""));
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
    h("div", {class:"pic"}, visual(p, m)),
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

/* ---------- Guidebook cover (home) ---------- */
let bookOpen = false;   // remembered while you move around the site
function coverArt(){
  const v = s("svg", {viewBox:"0 0 200 130", class:"cover-art", "aria-hidden":"true", focusable:"false"});
  MOODS.forEach((m, k) => {
    const r = 96 - k * 14;
    const arc = s("path", {d:"M" + (100 - r) + " 124 A " + r + " " + r + " 0 0 1 " + (100 + r) + " 124 Z"});
    arc.style.fill = m.color; arc.style.stroke = "rgba(31,27,22,.35)"; arc.style.strokeWidth = "1.5";
    v.append(arc);
  });
  v.append(s("rect", {x:0, y:124, width:200, height:3, fill:"rgba(251,247,240,.7)"}));
  return v;
}
function buildBook(){
  const book = h("div", {class:"book" + (bookOpen ? " open" : "")});
  const front = h("button", {type:"button", class:"cover-front", "aria-expanded":bookOpen ? "true" : "false", "aria-controls":"bookPage"},
    h("span", {class:"cover-kicker", text:"A student’s pocket guide"}),
    h("span", {class:"cover-title", text:"Madrid by Mood"}),
    h("span", {class:"cover-open", text:"Open the guidebook →"}),
    coverArt());
  const back = h("div", {class:"cover-back", "aria-hidden":"true"},
    h("p", {class:"eyebrow", text:"How it works"}),
    h("ol", {class:"mini-steps"}, h("li", {text:"Pick a mood."}), h("li", {text:"Swipe through real places."}), h("li", {text:"Save the ones you like."})));
  const close = h("button", {type:"button", class:"book-close", text:"Close book"});
  const list = h("ol", {class:"mood-list"}, MOODS.map(m => {
    const n = PLACES.filter(p => inMood(p, m.id)).length;
    const a = h("a", {class:"mood-row", href:"#mood-" + m.id},
      h("span", {class:"mr-text"}, h("b", {text:m.name}), h("span", {text:m.hint})),
      h("span", {class:"mr-n", text:n + " places"}));
    a.style.background = m.color;
    return h("li", {}, a);
  }));
  const page = h("div", {class:"book-page", id:"bookPage"},
    h("div", {class:"page-head"}, h("div", {}, h("p", {class:"eyebrow", text:"Contents"}), h("h2", {class:"h2", text:"Pick a mood"})), close),
    list,
    h("a", {class:"textlink", href:"#explore", text:"Or see every place"}));
  page.inert = !bookOpen;   // closed pages cannot be tabbed into

  function setOpen(o){
    bookOpen = o;
    book.classList.toggle("open", o);
    front.setAttribute("aria-expanded", o ? "true" : "false");
    page.inert = !o;
    if (o){
      const first = page.querySelector("a"); if (first) first.focus({preventScroll:true});
      book.scrollIntoView({block:"nearest", behavior:reduceMotion() ? "auto" : "smooth"});
      live("Guidebook open. Pick a mood.");
    } else { front.focus({preventScroll:true}); live("Guidebook closed."); }
  }
  front.addEventListener("click", () => setOpen(true));
  close.addEventListener("click", () => setOpen(false));
  book.addEventListener("keydown", e => { if (e.key === "Escape" && bookOpen) setOpen(false); });
  book.append(page, h("div", {class:"cover"}, front, back));
  return h("div", {class:"book-stage"}, book);
}

/* ---------- Swipe deck (explore) ---------- */
const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const crossIcon = () => { const v = s("svg", {viewBox:"0 0 24 24", "aria-hidden":"true", focusable:"false"}); v.append(s("path", {d:"M6 6l12 12M18 6L6 18", fill:"none", stroke:"currentColor", "stroke-width":"2.5", "stroke-linecap":"round"})); return v; };
let view = window.matchMedia("(max-width:720px)").matches ? "swipe" : "list";   // phones start in swipe mode
let deckPos = {key:"", i:0};   // remembers which card you were on

function ensureSaved(id){
  if (isSaved(id)) return;
  saved.push(id); persist(); updateCount();
  document.querySelectorAll('[data-save="' + id + '"]').forEach(refreshSaveBtn);
}
function swipeCard(p, top){
  const m = p.moods[0];
  const c = h("article", {class:"swipe-card " + (top ? "top" : "behind"), "aria-hidden":top ? null : "true"},
    h("div", {class:"pic"}, visual(p, m, true)),
    h("div", {class:"body"}, moodTag(m), h("h3", {text:p.name}), h("p", {text:p.desc}),
      h("div", {class:"meta"}, h("span", {text:p.area}), h("span", {text:p.priceLabel}))));
  c.querySelectorAll("img").forEach(i => { i.draggable = false; });
  if (top) c.append(h("span", {class:"stamp stamp-save", "aria-hidden":"true", text:"Save"}), h("span", {class:"stamp stamp-skip", "aria-hidden":"true", text:"Skip"}));
  return c;
}
function buildDeck(list, key){
  let i = deckPos.key === key ? Math.min(deckPos.i, list.length) : 0, busy = false;
  deckPos = {key, i};
  const root = h("section", {class:"deck", "aria-label":"Swipe through places"});
  const count = h("p", {class:"deck-count"});
  const stage = h("div", {class:"deck-stage", tabindex:"0", role:"group", "aria-label":"Place card", "aria-describedby":"deckHelp", "aria-keyshortcuts":"ArrowLeft ArrowRight"});
  const skipBtn = h("button", {type:"button", class:"deck-btn skip", onclick:() => commit(-1)}, crossIcon(), h("span", {text:"Skip"}));
  const likeSpan = h("span", {text:"Save"});
  const likeBtn = h("button", {type:"button", class:"deck-btn like", onclick:() => commit(1)}, heartIcon(), likeSpan);
  const more = h("a", {class:"textlink", href:"#"});
  const help = h("p", {class:"deck-help", id:"deckHelp", text:"Swipe a card right to save it or left to skip. You can also use the buttons or the left and right arrow keys."});
  const actions = h("div", {class:"deck-actions"}, skipBtn, likeBtn);
  const moreP = h("p", {class:"deck-more"}, more);

  function mount(){ root.replaceChildren(count, stage, actions, moreP, help); }
  function draw(){
    stage.replaceChildren();
    if (i >= list.length){
      root.replaceChildren(h("div", {class:"note", id:"deckEnd", tabindex:"-1"},
        h("h2", {text:"That’s every place in this set"}),
        h("p", {text:saved.length ? "You have " + saved.length + " saved. Open your shortlist to plan your week." : "Nothing saved yet. Start again and tap Save on the ones you like."}),
        h("div", {class:"row"},
          h("button", {type:"button", class:"btn", onclick:() => { i = 0; deckPos.i = 0; mount(); draw(); stage.focus({preventScroll:true}); }, text:"Start again"}),
          h("a", {class:"btn", href:"#saved", text:"Open saved places"}))));
      return;
    }
    const p = list[i];
    if (list[i + 1]) stage.append(swipeCard(list[i + 1], false));
    const top = swipeCard(p, true); stage.append(top); attach(top);
    count.textContent = "Place " + (i + 1) + " of " + list.length;
    likeSpan.textContent = isSaved(p.id) ? "Saved" : "Save";
    skipBtn.setAttribute("aria-label", "Skip " + p.name);
    likeBtn.setAttribute("aria-label", (isSaved(p.id) ? "Already saved: " : "Save ") + p.name);
    more.href = "#place-" + p.id;
    more.replaceChildren("Details", h("span", {class:"sr-only", text:" for " + p.name}));
    const ahead = list[i + 2]; if (ahead && PHOTOS[ahead.id]) new Image().src = PHOTOS[ahead.id].file;   // warm up the next photo
  }
  function commit(dir){   // dir: 1 = save, -1 = skip
    if (busy || i >= list.length) return;
    busy = true;
    const p = list[i], card = stage.querySelector(".swipe-card.top");
    if (dir === 1) ensureSaved(p.id);
    const done = () => {
      i++; deckPos.i = i; busy = false;
      const nxt = list[i];
      draw();
      live((dir === 1 ? "Saved " : "Skipped ") + p.name + "." + (nxt ? " Next: " + nxt.name + ", " + (i + 1) + " of " + list.length + "." : " That was the last place."));
      if (!nxt){ const e = root.querySelector("#deckEnd"); if (e) e.focus({preventScroll:true}); }
    };
    if (!card || reduceMotion()){ done(); return; }
    const stamp = card.querySelector(dir === 1 ? ".stamp-save" : ".stamp-skip"); if (stamp) stamp.style.opacity = 1;
    card.style.transition = "transform .32s ease, opacity .32s ease";
    card.style.transform = "translateX(" + (dir * 125) + "%) rotate(" + (dir * 16) + "deg)";
    card.style.opacity = "0";
    setTimeout(done, 320);
  }
  function attach(card){   // drag with finger or mouse
    const sSave = card.querySelector(".stamp-save"), sSkip = card.querySelector(".stamp-skip");
    let x0 = 0, y0 = 0, dx = 0, drag = false, pid = null;
    card.addEventListener("pointerdown", e => {
      if (busy || (e.pointerType === "mouse" && e.button !== 0) || e.target.closest("a,button")) return;
      x0 = e.clientX; y0 = e.clientY; dx = 0; drag = false; pid = e.pointerId;
    });
    card.addEventListener("pointermove", e => {
      if (e.pointerId !== pid) return;
      const mx = e.clientX - x0, my = e.clientY - y0;
      if (!drag){
        if (Math.abs(mx) > 8 && Math.abs(mx) > Math.abs(my)){ drag = true; card.setPointerCapture(pid); card.classList.add("dragging"); }
        else return;
      }
      dx = mx;
      card.style.transform = "translateX(" + dx + "px) rotate(" + (dx / 18) + "deg)";
      const k = Math.min(Math.abs(dx) / 110, 1);
      sSave.style.opacity = dx > 0 ? k : 0; sSkip.style.opacity = dx < 0 ? k : 0;
    });
    const end = e => {
      if (e.pointerId !== pid) return;
      pid = null;
      if (!drag) return;
      drag = false; card.classList.remove("dragging");
      if (Math.abs(dx) > 110){ commit(dx > 0 ? 1 : -1); return; }
      card.style.transition = reduceMotion() ? "none" : "transform .25s ease";
      card.style.transform = ""; sSave.style.opacity = 0; sSkip.style.opacity = 0;
    };
    card.addEventListener("pointerup", end);
    card.addEventListener("pointercancel", end);
  }
  root.addEventListener("keydown", e => {
    if (e.key === "ArrowRight"){ e.preventDefault(); commit(1); }
    else if (e.key === "ArrowLeft"){ e.preventDefault(); commit(-1); }
  });
  mount(); draw();
  return root;
}

/* ---------- "Right now in Madrid" (home) ---------- */
function rightNow(){
  let hr = 12;
  try { hr = Number(new Intl.DateTimeFormat("en-GB", {hour:"numeric", hourCycle:"h23", timeZone:"Europe/Madrid"}).format(new Date())); } catch (e) {}
  const slots = [
    {to:12, when:"A calm morning",  id:"palacio-de-cristal"},
    {to:17, when:"Afternoon walk",  id:"madrid-rio"},
    {to:21, when:"Golden hour",     id:"templo-de-debod"},
    {to:30, when:"Late night",      id:"chocolateria-san-gines"}
  ];
  const h24 = hr < 6 ? hr + 24 : hr;   // treat 00:00 to 05:59 as part of the night
  const slot = slots.find(x => h24 < x.to), p = BY_ID[slot.id];
  if (!p) return null;
  const a = h("a", {class:"now", href:"#place-" + p.id},
    h("span", {class:"now-dot", "aria-hidden":"true"}),
    h("span", {class:"now-text"}, h("b", {text:"Right now in Madrid: " + slot.when}), h("span", {text:p.name + " · " + p.area + " · " + p.priceLabel})));
  a.style.background = MOOD[p.moods[0]].color;
  return a;
}

/* ---------- Views ---------- */
let from = null;          // where the visitor came from, for the Back link
let budget = "any";       // explore budget filter

function viewHome(){
  from = {href:"#home", label:"Home"};
  const pop = PLACES.filter(p => p.popular);
  return [
    h("section", {class:"hero"},
      h("h1", {class:"mega", text:"How do you want to feel in Madrid?"}),
      h("p", {class:"lede", text:"Choose your mood and discover the perfect place."}),
      rightNow(),
      buildBook()),
    h("section", {class:"section", "aria-labelledby":"popH"},
      h("div", {class:"section-head"}, h("h2", {class:"h2", id:"popH", text:"Popular picks"}), h("a", {class:"textlink", href:"#explore", text:"See every place"})),
      cardGrid(pop)),
h("section", {class:"section", "aria-labelledby":"weekH"},
  h("div", {class:"section-head"},
    h("h2", {class:"h2", id:"weekH", text:"My first-week picks"}),
    h("a", {class:"textlink", href:"#explore", text:"See every place"})),
  h("p", {class:"lede", text:"Three places I would recommend to someone new to Madrid."}),
  cardGrid([
  BY_ID["palacio-de-cristal"],
BY_ID["museo-del-prado-gratis"],
    BY_ID["cuesta-de-moyano"]
  ])),
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
    count.textContent = view === "swipe" ? "" : l.length + (l.length === 1 ? " place" : " places");
    resultsWrap.replaceChildren(l.length ? (view === "swipe" ? buildDeck(l, (m ? m.id : "all") + "|" + budget) : cardGrid(l)) : h("div", {class:"note"}, h("h2", {text:"No places match"}), h("p", {text:"Try a different budget, or pick another mood."}), h("div", {class:"row"}, h("button", {type:"button", class:"btn", onclick:() => { budget = "any"; syncChips(); fill(); }, text:"Show any budget"}))));
  };
  const chips = [["any","Any budget"],["free","Free only"],["10","Up to €10"]].map(([v,l]) => h("button", {type:"button", class:"chip", "data-b":v, onclick:() => { budget = v; syncChips(); fill(); }, text:l}));
  const viewChips = [["swipe","Swipe"],["list","List"]].map(([v,l]) => h("button", {type:"button", class:"chip", "data-v":v, onclick:() => { view = v; syncChips(); fill(); }, text:l}));
  const syncChips = () => {
    chips.forEach(c => c.setAttribute("aria-pressed", c.dataset.b === budget ? "true" : "false"));
    viewChips.forEach(c => c.setAttribute("aria-pressed", c.dataset.v === view ? "true" : "false"));
  };
  syncChips(); fill();

  return [
    h("div", {class:"page-top" + (m ? " moody" : ""), style:m ? "--moodc:" + m.color : null},
      h("h1", {text:m ? m.head : "Every place, every mood."}),
      h("p", {text:m ? m.sub : "Twenty-four hand-picked places. Choose a mood to narrow them down."})),
    bar,
    h("div", {class:"filter-row"}, h("span", {class:"label", text:"Budget"}), chips, h("span", {class:"label", text:"View"}), viewChips),
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
      h("div", {class:"pic"}, visual(p, m, true)),
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
        h("p", {class:"credit"}, creditLine(p), " Directions open Google Maps in a new tab. Prices and opening times can change, so check before you go."))),
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
      h("div", {}, h("b", {text:"Credits"}), "The place photos come from Wikimedia Commons and are used under their Creative Commons or public-domain licences. The abstract artwork on the mood tiles is original.")),
    h("section", {"aria-labelledby":"credH", style:"margin-top:40px"}, h("h2", {class:"h2", id:"credH", text:"Photo credits"}),
      h("ul", {class:"credits"}, PLACES.filter(p => PHOTOS[p.id]).map(p => h("li", {}, h("b", {text:p.name + ": "}), creditLine(p))))),
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
