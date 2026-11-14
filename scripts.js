let bank = 10000
const startButton = document.getElementById("start"); //button from start page to dniosaur introduction
const intros = document.getElementById("intro");

startButton.addEventListener("click",function(){
    startButton.remove();
    intros.hidden = false;
    const bank_amount = document.getElementById("screen2bank").innerText = `Bank: ${bank} Rocks`
});

const to_simulate = document.getElementById("to_trading"); //button from dinosaur intro to simulation
const simulation = document.getElementById("simulation");

to_simulate.addEventListener("click",function(){
    to_simulate.remove();
    simulation.hidden = false;
    intros.hidden = true;
});

function openPopup(text){
    document.getElementById('popup-text').innerText = text;
    document.getElementById('popup').style.display='flex';
}

function closePopup(){
    document.getElementById('popup').style.display = 'none';
}

const dinos = [
    { name: "Lewis", total: 0, cost: 300},
    { name: "Clara", total: 0, cost: 500 },
    { name: "Durhack Dino", total: 0, cost: 1200 },
    { name: "Imogen", total: 0, cost: 200 },
    { name: "Steve", total: 0, cost: 900},
    { name: "Mia", total: 0, cost: 400 }
];

function updateBank(){
    const bankEl = document.getElementById("bankTotal");
    const introEl = document.getElementById("screen2bank");
    if (bankEl) bankEl.textContent = bank;
    if (introEl) introEl.textContent = `Bank: ${bank} Rocks`;
}

updateBank();

const controlBoxes = document.querySelectorAll(".controls");

dinos.forEach(function (dino, i) {
    const box = controlBoxes[i];          // the i-th controls box in the grid

    const label = document.createElement("span");
    const totalText = document.createElement("span");
    const minusBtn = document.createElement("button");
    const plusBtn = document.createElement("button");

    label.textContent = dino.name + ": ";
    totalText.textContent = dino.total;
    minusBtn.textContent = "-";
    plusBtn.textContent = "+";
    minusBtn.className = "small-btn";
    plusBtn.className = "small-btn";

    minusBtn.addEventListener("click", function () {
        if (dino.total > 0) {
            dino.total--;
            bank = bank + dino.cost;        // selling gives the money back
            totalText.textContent = dino.total;
            updateBank();
            }
    });

    plusBtn.addEventListener("click", function () {
        if (bank>=dino.cost){
            dino.total++;
            bank= bank-dino.cost;
            totalText.textContent = dino.total;
            updateBank();
        }
    });

    box.append(label, minusBtn, totalText, plusBtn);
});

const MIN_P = 1, MAX_P = 2500, RES = 4, LIVE = 300 * RES, SIM_DAYS = 60;   // 300 seconds live stand in for 60 simulated days
const simDay = j => Math.floor(j * SIM_DAYS / LIVE);   // one simulated day every 5 real seconds
const secs = j => Math.floor(j / RES);                 // real seconds elapsed at tick j
const clamp = p => Math.min(MAX_P, Math.max(MIN_P, p));
const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());

const STOCKS = [
  { id: 1, name: "lewis", start: 300,   vol: 0.005 },
  { id: 2, name: "clara",start: 500, vol: 0.008 },
  { id: 3, name: "dino",start: 1200,  vol: 0.004 },
  { id: 4, name: "imogen",start: 200, vol: 0.007 },
  { id: 5, name: "steve",start: 900, vol: 0.009 },
  { id: 6, name: "mia",start: 400, vol: 0.006 }
];

// ---- Random events: a pool of 15. Each game picks 12 of them at random. Changes are fractions (0.3 = +30%).
const EVENTS = [
  { id: 1, stock: 1,  name: "",           lo:  0.30, hi:  0.60 },
  { id: 2,  stock: 1, name:"Earnings miss",           lo: -0.60, hi: -0.30 },
  { id: 3,  stock: 2, name:"Product recall",          lo: -0.70, hi: -0.40 },
  { id: 4,  stock: 2, name:"Major contract won",      lo:  0.40, hi:  0.80 },
  { id: 5,  stock: 3, name:"CEO resigns",             lo: -0.50, hi: -0.30 },
  { id: 6,  stock: 3,name: "Buyout rumour",           lo:  0.50, hi:  0.90 },
  { id: 7,  stock: 4,name: "Regulatory fine",         lo: -0.40, hi: -0.20 },
  { id: 8,  stock: 4,name: "New product launch",      lo:  0.25, hi:  0.50 },
  { id: 9,  stock: 4,name: "Total crash",             lo: -0.95, hi: -0.80 },
  { id: 10, stock: 5,name: "Fraud scandal",           lo: -0.90, hi: -0.60 },
  { id: 11, stock: 5,name: "Moonshot rally",          lo:  0.80, hi:  1.50 },
  { id: 12, stock: 5,name: "Bankruptcy filing",       lo: -0.97, hi: -0.90 },
  { id: 13, stock: 6,name: "Factory fire",            lo: -0.45, hi: -0.25 },
  { id: 14, stock: 6,name: "Data breach",             lo: -0.40, hi: -0.20 },
  { id: 15, stock: 6,name: "Patent win",              lo:  0.30, hi:  0.60 }
];
const VOL_BOOST = 4;       // multiplies the everyday price wobble
const WARN_SECS = 8;       // seconds of warning before an event hits (at 1x speed)
const RECOVER_SECS = 15;   // how long the quick recovery after a drop takes
const WARN_TICKS = WARN_SECS * RES;
const MAX_EVENTS = 8;     // events picked per game, out of the 25 in EVENTS

// ---- State
let live, events, k, timer = null, hover = null;
let pending = null, recov = [], schedule = [], deck = [], alertState = null, hideK = 0, lastHit = null;

function reset() {
  stop();
  live = STOCKS.map(s => [s.start]);
  events = []; k = 0; pending = null; recov = []; schedule = makeSchedule(); deck = pickEvents(); alertState = null; updateAlert();
  draw();
}

function tick() {
  k++;
  STOCKS.forEach((s, i) => {
    let p = live[i][k - 1] * (1 + s.vol * VOL_BOOST / Math.sqrt(RES) * gauss());
    if (Math.random() < 0.01) p *= 1 + (Math.random() - 0.5) * 0.12;   // occasional small random jump (up to 6%)
    const r = recov[i];                                   // quick recovery pulls the price back up
    if (r) { p += (r.target - p) * r.rate; if (--r.left <= 0) recov[i] = null; }
    live[i].push(clamp(p));
  });
  if (!pending && alertState !== "hit" && schedule.length && k >= schedule[0]) {
    schedule.shift();
    const ev = deck.shift();   // next of the 12 events picked for this game
    const si = ev.stock - 1;  
    const pct = ev.lo + Math.random() * (ev.hi - ev.lo);
    pending = { si, ev, pct, hitK: k + WARN_TICKS };   // warn first, hit later
    alertState = "warn";
  }
  if (pending && k >= pending.hitK) hitEvent();
  else if (alertState === "hit" && k >= hideK) alertState = null;
  updateAlert();
  if (k >= LIVE) { stop(); setTimeout(() => { alertState = null; updateAlert(); }, 4000); }
  draw();
}

// Pick 12 different events at random from the pool of 25 (Fisher-Yates shuffle).
function pickEvents() {
  const pool = EVENTS.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, MAX_EVENTS);
}

// Spread the big events across the game at random times, with room for each warning.
function makeSchedule() {
  const margin = 10 * RES, tail = 4 * RES;
  const slot = (LIVE - margin - WARN_TICKS - tail) / MAX_EVENTS;
  const room = Math.max(0, slot - WARN_TICKS - tail);
  return Array.from({ length: MAX_EVENTS }, (_, i) => Math.floor(margin + i * slot + Math.random() * room));
}

function hitEvent() {
  const { si, ev, pct } = pending;
  const before = live[si][k], after = clamp(before * (1 + pct));
  live[si][k] = after;
  let target = null;
  if (pct < 0) {                                  // quick recovery: win back 50-90% of the loss
    target = after + (before - after) * (0.5 + Math.random() * 0.4);
    const left = RECOVER_SECS * RES;
    recov[si] = { target, left, rate: 1 - Math.pow(0.1, 1 / left) };
  }
  lastHit = { si, ev, pct, before, after, target };
  pending = null; alertState = "hit"; hideK = k + 4 * RES;
}

function updateAlert() {
  const el = document.getElementById("alert");
  const info = alertState === "warn" ? pending : lastHit;
  if (!alertState || !info) { el.classList.remove("show"); return; }
  const good = info.pct >= 0, id = STOCKS[info.si].name;
  const speed = Number(document.getElementById("speed").value);
  const title = document.getElementById("aTitle"), body = document.getElementById("aBody");
  const fill = document.getElementById("aFill"), btn = document.getElementById("aPause");
  el.className = "show " + (good ? "good" : "bad");
  if (alertState === "warn") {
    const left = Math.max(0, pending.hitK - k);
    title.textContent = (good ? "Opportunity" : "Warning") + ": " + id;
    body.textContent = "Event " + info.ev.id + ", " + info.ev.name + ", is about to hit. Impact in " + Math.ceil(left / RES / speed) + "s.";
    fill.style.width = (left / WARN_TICKS * 100) + "%";
    btn.style.display = ""; btn.textContent = timer ? "Pause to react" : "Resume";
  } else {
    title.textContent = info.ev.name + " hit " + id;
    body.textContent = (good ? "+" : "") + (info.pct * 100).toFixed(1) + "% (" + info.before.toFixed(2) + " to " + info.after.toFixed(2) + ")." +
      (info.target ? " Quick recovery under way, toward about " + info.target.toFixed(2) + "." : "");
    fill.style.width = (Math.max(0, hideK - k) / (4 * RES) * 100) + "%";
    btn.style.display = "none";
  }
}
document.getElementById("aPause").onclick = () => { timer ? stop() : start(); updateAlert(); };

function start() {
  if (k >= LIVE) return;
  const ms = 1000 / RES / Number(document.getElementById("speed").value);
  timer = setInterval(tick, ms);
  document.getElementById("go").textContent = "Pause";
}
function stop() {
  clearInterval(timer); timer = null;
  document.getElementById("go").textContent = k >= LIVE ? "Finished" : (k > 0 ? "Resume" : "Start");
  document.getElementById("go").disabled = k >= LIVE;
}

// ---- Drawing
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const mmss = s => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
const LOG_MIN = Math.log(MIN_P), LOG_RANGE = Math.log(MAX_P) - LOG_MIN;

function draw() {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const pad = { l: 50, r: 12, t: 12, b: 26 };
  const inner = w - pad.l - pad.r;
  const xl = j => pad.l + (j / LIVE) * inner;
  const y = p => pad.t + (1 - (Math.log(p) - LOG_MIN) / LOG_RANGE) * (h - pad.t - pad.b);

  ctx.font = "12px Georgia, serif"; ctx.textBaseline = "middle";
  [1, 3, 10, 30, 100, 300, 1000, 2500].forEach(p => {
    ctx.strokeStyle = css("--grid"); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.l, y(p)); ctx.lineTo(w - pad.r, y(p)); ctx.stroke();
    ctx.fillStyle = css("--muted"); ctx.textAlign = "right"; ctx.fillText(p, pad.l - 6, y(p));
  });

  // x labels
  ctx.fillStyle = css("--muted"); ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";   ctx.fillText("Start", pad.l, h - 6);
  ctx.textAlign = "center"; ctx.fillText("+1 month", xl(LIVE / 2), h - 6);
  ctx.textAlign = "right";  ctx.fillText("+2 months", w - pad.r, h - 6);

  STOCKS.forEach((s, i) => {
    ctx.strokeStyle = css("--c" + i); ctx.lineWidth = 2; ctx.lineJoin = "round";
    ctx.beginPath();
    live[i].forEach((v, j) => j ? ctx.lineTo(xl(j), y(v)) : ctx.moveTo(xl(j), y(v)));
    ctx.stroke();
  });

  if (hover) {
    const hx = xl(hover.k);
    ctx.strokeStyle = css("--muted"); ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(hx, pad.t); ctx.lineTo(hx, h - pad.b); ctx.stroke(); ctx.setLineDash([]);
    const rows = STOCKS.map((s, i) => ({ i, v: live[i][hover.k] }))
      .sort((a, b) => b.v - a.v);
    ctx.textBaseline = "middle";
    rows.forEach(r => { ctx.fillStyle = css("--c" + r.i); ctx.beginPath(); ctx.arc(hx, y(r.v), 4, 0, 7); ctx.fill(); });
    const bw = 190, bh = 24 + rows.length * 18;
    let bx = hx + 12; if (bx + bw > w - pad.r) bx = hx - 12 - bw;
    ctx.fillStyle = css("--panel"); ctx.strokeStyle = css("--grid");
    ctx.fillRect(bx, pad.t, bw, bh); ctx.strokeRect(bx, pad.t, bw, bh);
    ctx.textAlign = "left"; ctx.fillStyle = css("--muted");
    ctx.fillText("Day " + simDay(hover.k) + " of " + SIM_DAYS, bx + 8, pad.t + 12);
    rows.forEach((r, n) => {
      const ty = pad.t + 32 + n * 18;
      ctx.fillStyle = css("--c" + r.i); ctx.fillRect(bx + 8, ty - 2, 10, 4);
      ctx.fillStyle = css("--text"); ctx.fillText("Stock " + STOCKS[r.i].id, bx + 24, ty);
      ctx.textAlign = "right"; ctx.fillText(r.v.toFixed(2), bx + bw - 8, ty); ctx.textAlign = "left";
    });
  }
  canvas._m = { pad, inner };
  document.getElementById("clock").textContent = "Day " + simDay(k) + " of " + SIM_DAYS + "  (" + mmss(secs(k)) + " / " + mmss(secs(LIVE)) + ")";
  renderLegend();
}

function renderLegend() {
  const el = document.getElementById("legend");
  el.innerHTML = "";
  STOCKS.forEach((s, i) => {
    const p = live[i][k], pct = (p / s.start - 1) * 100;
    const d = document.createElement("div");
    d.className = "chip";
    d.innerHTML = `<span class="sw" style="background:var(--c${i})"></span>${s.name}
      <span>${p.toFixed(2)}</span><small class="${pct >= 0 ? "up" : "down"}">${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%</small>`;
    el.appendChild(d);
  });
}

// ---- Interaction
canvas.addEventListener("mousemove", ev => {
  const r = canvas.getBoundingClientRect(), { pad, inner } = canvas._m;
  const mx = ev.clientX - r.left - pad.l;
  if (mx < 0) hover = null;
  else hover = { k: Math.min(k, Math.round(mx / inner * LIVE)) };
  draw();
});
canvas.addEventListener("mouseleave", () => { hover = null; draw(); });
document.getElementById("go").onclick = () => { timer ? stop() : start(); updateAlert(); };
document.getElementById("speed").onchange = () => { if (timer) { stop(); start(); } };
window.addEventListener("resize", draw);
reset();