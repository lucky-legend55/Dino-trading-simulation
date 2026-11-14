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

const STOCKS = [
  { name: "ACME",  drift: 0.0006, vol: 0.015 },
  { name: "BOLT",  drift: 0.0003, vol: 0.028 },
  { name: "CRUX",  drift: 0.0008, vol: 0.020 },
  { name: "DELTA", drift: 0.0000, vol: 0.012 },
  { name: "ECHO",  drift: -0.0003, vol: 0.025 },
  { name: "FLUX",  drift: 0.0005, vol: 0.035 }
];
const DAYS = 250;

function gauss() {
  const u = 1 - Math.random(), v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function walk(s) {
  const p = [100];
  for (let i = 1; i < DAYS; i++) p.push(Math.max(1, p[i-1] * (1 + s.drift + s.vol * gauss())));
  return p;
}

const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");
let series = STOCKS.map(walk);
let visible = STOCKS.map(() => true);
let hover = null;

const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

function draw() {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const pad = { l: 50, r: 12, t: 12, b: 24 };
  const shown = series.filter((_, i) => visible[i]);
  const all = (shown.length ? shown : series).flat();
  const min = Math.min(...all) * 0.97, max = Math.max(...all) * 1.03;
  const x = i => pad.l + (i / (DAYS - 1)) * (w - pad.l - pad.r);
  const y = p => pad.t + (1 - (p - min) / (max - min)) * (h - pad.t - pad.b);

  ctx.font = "12px Georgia, serif"; ctx.textBaseline = "middle";
  for (let g = 0; g <= 4; g++) {
    const p = min + (max - min) * g / 4, gy = y(p);
    ctx.strokeStyle = css("--grid"); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(w - pad.r, gy); ctx.stroke();
    ctx.fillStyle = css("--muted"); ctx.textAlign = "right";
    ctx.fillText(p.toFixed(0), pad.l - 6, gy);
  }
  // baseline at 100 (the starting value)
  if (100 > min && 100 < max) {
    ctx.strokeStyle = css("--muted"); ctx.setLineDash([3, 5]);
    ctx.beginPath(); ctx.moveTo(pad.l, y(100)); ctx.lineTo(w - pad.r, y(100)); ctx.stroke();
    ctx.setLineDash([]);
  }

  series.forEach((p, s) => {
    if (!visible[s]) return;
    ctx.strokeStyle = css("--c" + s); ctx.lineWidth = 2; ctx.lineJoin = "round";
    ctx.beginPath();
    p.forEach((v, i) => i ? ctx.lineTo(x(i), y(v)) : ctx.moveTo(x(i), y(v)));
    ctx.stroke();
  });

  if (hover !== null) {
    const hx = x(hover);
    ctx.strokeStyle = css("--muted"); ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(hx, pad.t); ctx.lineTo(hx, h - pad.b); ctx.stroke();
    ctx.setLineDash([]);
    const rows = series.map((p, s) => ({ s, v: p[hover] })).filter(r => visible[r.s]).sort((a, b) => b.v - a.v);
    rows.forEach(r => {
      ctx.fillStyle = css("--c" + r.s);
      ctx.beginPath(); ctx.arc(hx, y(r.v), 4, 0, 7); ctx.fill();
    });
    // tooltip box
    const bw = 130, bh = 22 + rows.length * 18;
    let bx = hx + 12; if (bx + bw > w - pad.r) bx = hx - 12 - bw;
    ctx.fillStyle = css("--panel"); ctx.strokeStyle = css("--grid");
    ctx.fillRect(bx, pad.t, bw, bh); ctx.strokeRect(bx, pad.t, bw, bh);
    ctx.textAlign = "left"; ctx.fillStyle = css("--muted");
    ctx.fillText("Day " + (hover + 1), bx + 8, pad.t + 12);
    rows.forEach((r, k) => {
      const ty = pad.t + 30 + k * 18;
      ctx.fillStyle = css("--c" + r.s); ctx.fillRect(bx + 8, ty - 2, 10, 4);
      ctx.fillStyle = css("--text");
      ctx.fillText(STOCKS[r.s].name, bx + 24, ty);
      ctx.textAlign = "right"; ctx.fillText(r.v.toFixed(1), bx + bw - 8, ty); ctx.textAlign = "left";
    });
  }
  canvas._m = { pad, w };
  renderLegend();
}

function renderLegend() {
  const el = document.getElementById("legend");
  el.innerHTML = "";
  STOCKS.forEach((st, s) => {
    const last = series[s][DAYS - 1], pct = last - 100;
    const b = document.createElement("button");
    b.className = "chip" + (visible[s] ? "" : " off");
    b.setAttribute("aria-pressed", visible[s]);
    b.innerHTML = `<span class="sw" style="background:var(--c${s})"></span>${st.name}
      <b class="${pct >= 0 ? "up" : "down"}">${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%</b>`;
    b.onclick = () => { visible[s] = !visible[s]; draw(); };
    el.appendChild(b);
  });
}

canvas.addEventListener("mousemove", e => {
  const r = canvas.getBoundingClientRect(), { pad, w } = canvas._m;
  const t = (e.clientX - r.left - pad.l) / (w - pad.l - pad.r);
  hover = Math.min(DAYS - 1, Math.max(0, Math.round(t * (DAYS - 1))));
  draw();
});
canvas.addEventListener("mouseleave", () => { hover = null; draw(); });
document.getElementById("regen").onclick = () => { series = STOCKS.map(walk); draw(); };
window.addEventListener("resize", draw);
draw();