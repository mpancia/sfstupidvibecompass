import { QS, AXN, LIKERT, QUADS, ENT, PROPS, SLATES } from "./data.js";

const S = { screen:"intro", qi:0, bi:0, a:Array(QS.length).fill(null), b:Array(PROPS.length).fill(null), shared:false };
const TOTAL = QS.length + PROPS.length;
const SITE = "sfstupidvibecompass.help";
const FONT = "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif";
const $app = document.getElementById("app");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
let busy = false;

const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function electionLabel(){
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone:"America/Los_Angeles", year:"numeric", month:"2-digit", day:"2-digit" }).format(new Date()).split("-").map(Number);
  const days = Math.round((Date.UTC(2026, 10, 3) - Date.UTC(y, m - 1, d)) / 864e5);
  if (days > 1) return `${days} days to Election Day`;
  if (days === 1) return "Election Day is tomorrow";
  if (days === 0) return "Election Day \u00b7 polls close 8 PM";
  return "Nov 3, 2026 election";
}

/* ------------------------------------------------------------------ scoring */

function axes(){
  let sx = 0, nx = 0, sy = 0, ny = 0;
  QS.forEach((q, i) => {
    const v = S.a[i];
    if (v == null) return;
    if (q.ax === "x") { sx += q.s * v; nx++; } else { sy += q.s * v; ny++; }
  });
  return { x: nx ? sx / (2 * nx) : 0, y: ny ? sy / (2 * ny) : 0 };
}

function quadKey(p){
  if (Math.abs(p.x) < .12 && Math.abs(p.y) < .12) return "c";
  return (p.y >= 0 ? "t" : "b") + (p.x >= 0 ? "r" : "l");
}

function slateScores(){
  return SLATES.map(sl => {
    let a = 0, n = 0;
    PROPS.forEach((p, i) => {
      if (S.b[i] == null || p.m[sl.q] === ".") return;
      n++;
      if (S.b[i] === p.m[sl.q]) a++;
    });
    return { ...sl, a, n, r: n ? a / n : 0 };
  }).sort((x, y) => y.r - x.r);
}

function encode(){
  return S.a.map(v => v == null ? "-" : String(v + 2)).join("") + S.b.map(v => v == null ? "-" : v.toLowerCase()).join("");
}

function decode(code){
  if (!new RegExp(`^[0-4-]{${QS.length}}[yn-]{${PROPS.length}}$`).test(code)) return false;
  S.a = [...code.slice(0, QS.length)].map(c => c === "-" ? null : Number(c) - 2);
  S.b = [...code.slice(QS.length)].map(c => c === "-" ? null : c.toUpperCase());
  return true;
}

/* ------------------------------------------------------------------ compass */

const K = 230, MID = 300;
const X = v => MID + clamp(v, -1.1, 1.1) * K;
const Y = v => MID - clamp(v, -1.1, 1.1) * K;

function compassInner(you){
  let s = `<rect x="50" y="50" width="500" height="500" fill="#0d0f15" stroke="rgba(255,255,255,.14)"/>`;
  for (const [k, x, y] of [["tl", 50, 50], ["tr", 300, 50], ["bl", 50, 300], ["br", 300, 300]]) {
    s += `<rect x="${x}" y="${y}" width="250" height="250" fill="${QUADS[k].color}" opacity=".08"/>`;
  }
  for (const v of [-.5, .5]) {
    s += `<line x1="${X(v)}" y1="50" x2="${X(v)}" y2="550" stroke="rgba(255,255,255,.06)" stroke-dasharray="3 5"/>`;
    s += `<line x1="50" y1="${Y(v)}" x2="550" y2="${Y(v)}" stroke="rgba(255,255,255,.06)" stroke-dasharray="3 5"/>`;
  }
  s += `<line x1="300" y1="50" x2="300" y2="550" stroke="rgba(255,255,255,.25)"/><line x1="50" y1="300" x2="550" y2="300" stroke="rgba(255,255,255,.25)"/>`;
  const c = .12 * K;
  s += `<rect x="${MID - c}" y="${MID - c}" width="${2 * c}" height="${2 * c}" fill="none" stroke="${QUADS.c.color}" stroke-opacity=".5" stroke-dasharray="2 4"/>`;
  const ax = 'fill="#8d897f" font-size="11" font-weight="700" letter-spacing="1.5"';
  s += `<text x="300" y="38" text-anchor="middle" ${ax}>SMART GUYS</text>`;
  s += `<text x="300" y="572" text-anchor="middle" ${ax}>MIDWIT DUMB GUYS</text>`;
  s += `<text x="60" y="290" ${ax}>LOVES MARKETS OR WHATEVER</text>`;
  s += `<text x="540" y="290" text-anchor="end" ${ax}>CARES ABOUT PEOPLE</text>`;
  for (const [k, x, y, anchor] of [["tl", 62, 76, "start"], ["tr", 538, 76, "end"], ["bl", 62, 538, "start"], ["br", 538, 538, "end"]]) {
    const hidden = you && Math.abs(X(you.x) - x) < 130 && Math.abs(Y(you.y) - y) < 32;
    s += `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${QUADS[k].color}" font-size="15" font-weight="800" opacity="${hidden ? .15 : 1}">${esc(QUADS[k].name)}</text>`;
  }
  for (const e of ENT) {
    const ex = X(e.x), ey = Y(e.y);
    s += `<circle cx="${ex}" cy="${ey}" r="4.5" fill="#e8e5dd" stroke="#07080c" stroke-width="2"/>`;
    s += `<text x="${e.l ? ex - 9 : ex + 9}" y="${ey + 4}" text-anchor="${e.l ? "end" : "start"}" fill="#d6d2c8" font-size="12" font-weight="600" stroke="#0d0f15" stroke-width="4" paint-order="stroke">${esc(e.n)}</text>`;
  }
  if (you) {
    const yx = X(you.x), yy = Y(you.y);
    s += `<circle cx="${yx}" cy="${yy}" r="16" fill="#ff4a3d" opacity=".25"/>`;
    s += `<circle cx="${yx}" cy="${yy}" r="8" fill="#ff4a3d" stroke="#fff" stroke-width="3"/>`;
    s += `<text x="${yx}" y="${yy - 16}" text-anchor="middle" fill="#fff" font-size="14" font-weight="800" letter-spacing="1" stroke="#07080c" stroke-width="5" paint-order="stroke">YOU</text>`;
  }
  return s;
}

function compass(you){
  const label = you ? `Compass with your position at people ${you.x.toFixed(2)}, brains ${you.y.toFixed(2)}` : "Compass showing where SF groups land";
  return `<svg class="compass" viewBox="0 0 600 590" font-family="${FONT}" role="img" aria-label="${label}">${compassInner(you)}</svg>`;
}

/* ------------------------------------------------------------------ views */

function viewIntro(){
  const axisCard = (kicker, color, left, right, body) => `
    <div class="axis-card">
      <div class="kicker" style="color:${color}">${kicker}</div>
      <div class="track" style="background:linear-gradient(90deg, rgba(255,255,255,.08), ${color})"></div>
      <div class="ends"><span>${left}</span><span>${right}</span></div>
      <p class="muted small">${body}</p>
    </div>`;
  return `
  <section class="narrow hero">
    <div class="kicker">A parody \u00b7 Nov 3, 2026</div>
    <h1>Where do you land on the SF Political Compass For AI Morons?</h1>
    <p class="lede">Someone vibe-coded a San Francisco political compass. It decided the two big questions were zoning and cops. The two real questions are whether you care about people and whether you\u2019re a midwit. Answer ${TOTAL} questions and we\u2019ll put you on the map.</p>
    <div class="ctas">
      <button class="btn" data-act="start">Take the quiz <span aria-hidden="true">\u2192</span></button>
      <button class="btn ghost" data-act="see">See the compass</button>
    </div>
    <p class="fine">About four minutes. The propositions in part 2 are fake. Your real ballot is at <a href="https://sfelections.org" target="_blank" rel="noopener">sfelections.org</a>.</p>
  </section>
  <section class="narrow">
    <h2 class="section-title">Two fights decide every SF election</h2>
    <div class="axis-grid">
      ${axisCard(AXN.x, "#ff4a3d", "Loves markets or whatever", "Cares about people", "Do you think housing is for living in, or for a REIT\u2019s quarterly call?")}
      ${axisCard(AXN.y, "#b48cff", "Midwit dumb guys", "Smart guys", "Have you noticed who pays for the group telling you to build luxury condos and hire cops?")}
    </div>
  </section>
  <section class="narrow" id="map">
    <div class="panel compass-panel">${compass(null)}</div>
    <p class="muted small center">Placements are our editorial read. Same rigor as the original.</p>
  </section>`;
}

function mini(){
  const p = axes();
  return `<div class="mini" aria-hidden="true"><i class="mx"></i><i class="my"></i><b style="left:${50 + clamp(p.x, -1, 1) * 44}%;top:${50 - clamp(p.y, -1, 1) * 44}%"></b></div>`;
}

function viewQ(){
  const q = QS[S.qi], cur = S.a[S.qi];
  const pips = LIKERT.map(([v, label], i) => `
    <button class="pip ${v > 0 ? "pos" : v < 0 ? "neg" : "zero"}" data-act="ans" data-v="${v}" aria-pressed="${cur === v}">
      <kbd>${i + 1}</kbd><span>${label}</span>
    </button>`).join("");
  return `
  <div class="narrow">
    <div class="panel qcard enter">
      <div class="qhead">
        <span class="kicker">Part 1 \u00b7 Your values \u00b7 ${S.qi + 1} of ${QS.length}</span>
        <span class="axis-tag ${q.ax}">${AXN[q.ax]}</span>
      </div>
      <p class="statement" id="qt">${esc(q.t)}</p>
      <div class="likert" role="group" aria-labelledby="qt">${pips}</div>
      <div class="qnav">
        <button class="link" data-act="back">\u2190 Back</button>
        <button class="link" data-act="skip">Skip</button>
      </div>
    </div>
    <div class="quiz-side">${mini()}<p class="muted small">You, so far. Keys 1\u20135 answer, \u2190 goes back.</p></div>
  </div>`;
}

function viewB(){
  const p = PROPS[S.bi], cur = S.b[S.bi];
  return `
  <div class="narrow">
    <div class="panel qcard enter">
      <div class="qhead">
        <span class="kicker">Part 2 \u00b7 Fake ballot \u00b7 ${S.bi + 1} of ${PROPS.length}</span>
        <span class="axis-tag fake">Not real</span>
      </div>
      <div class="prop-lab">${esc(p.lab)}</div>
      <p class="statement" id="qt">${esc(p.ttl)}</p>
      <p class="muted">${esc(p.desc)}</p>
      <div class="yn" role="group" aria-labelledby="qt">
        <button class="ch y" data-act="vote" data-v="Y" aria-pressed="${cur === "Y"}"><kbd>Y</kbd> Yes</button>
        <button class="ch n" data-act="vote" data-v="N" aria-pressed="${cur === "N"}"><kbd>N</kbd> No</button>
      </div>
      <div class="qnav">
        <button class="link" data-act="back">\u2190 Back</button>
        <button class="link" data-act="skip">Skip</button>
      </div>
    </div>
    <p class="muted small center">None of these are on your ballot. The real measures are at <a href="https://sfelections.org" target="_blank" rel="noopener">sfelections.org</a>.</p>
  </div>`;
}

function meter(label, v, left, right, line){
  return `
    <div class="meter-row">
      <div class="h-sm">${label}</div>
      <div class="meter"><span class="mk" style="left:${50 + clamp(v, -1, 1) * 48}%"></span></div>
      <div class="ends"><span>${left}</span><span>${right}</span></div>
      <p class="small">${line}</p>
    </div>`;
}

function viewResults(){
  const p = axes(), k = quadKey(p), Q = QUADS[k];
  const dist = ENT.map(e => ({ e, d:Math.hypot(e.x - p.x, e.y - p.y) })).sort((a, b) => a.d - b.d);
  const far = dist[dist.length - 1];
  const nearHTML = dist.slice(0, 3).map(({ e, d }) => `
    <div class="near-item"><b>${esc(e.n)}</b><span>${esc(e.d)}</span><i>${d < .2 ? "Basically you" : d < .45 ? "Close" : "Nearby"}</i></div>`).join("");

  const peopleLine = p.x > .5 ? "You care about people. Bold move in this city." : p.x < -.5 ? "You love markets or whatever." : "You care about people when it pencils.";
  const brainLine = p.y > .5 ? "Big brain. You have read things." : p.y < -.5 ? "You are the middle of the bell-curve meme, and you think you\u2019re the right side." : "Normal-sized brain. That\u2019s the problem.";

  const loud = QS.map((q, i) => ({ q, v:S.a[i] })).filter(r => r.v === 2 || r.v === -2).slice(0, 3);
  const loudHTML = loud.length
    ? `<ul class="takes">${loud.map(r => `<li><span class="${r.v > 0 ? "pos" : "neg"}">You strongly ${r.v > 0 ? "agreed" : "disagreed"}:</span> \u201c${esc(r.q.t)}\u201d</li>`).join("")}</ul>`
    : `<p class="muted">You didn\u2019t feel strongly about anything. Classic vest.</p>`;

  const answered = S.b.filter(v => v != null).length;
  let ballotHTML;
  if (!answered) {
    ballotHTML = `<p class="muted">You skipped every fake proposition. Honestly, smart.</p>`;
  } else {
    const sl = slateScores(), top = sl[0];
    const verdict = top.q === k
      ? `Your fake ballot votes like the <b>${esc(top.name)}</b>, which checks out.`
      : `Your compass says <b>${esc(Q.name)}</b>, but your fake ballot votes like the <b>${esc(top.name)}</b>. Pick a lane.`;
    const bars = sl.map(r => `
      <div class="gbar">
        <div class="nm"><span class="fdot" style="background:${QUADS[r.q].color}"></span>${esc(r.name)}</div>
        <div class="tr"><i style="width:${Math.max(3, r.r * 100)}%;background:${QUADS[r.q].color}"></i></div>
        <div class="pc">${r.a} of ${r.n}</div>
      </div>`).join("");
    const rows = PROPS.map((pr, i) => {
      const mine = S.b[i], theirs = pr.m.tr;
      const mark = mine == null ? "\u2013" : mine === theirs ? "\u2713" : "\u2717";
      return `<tr><td><b>${esc(pr.lab)}</b> ${esc(pr.ttl)}</td><td>${mine ?? "skip"}</td><td>${theirs}</td><td class="${mine == null ? "" : mine === theirs ? "pos" : "neg"}">${mark}</td></tr>`;
    }).join("");
    ballotHTML = `
      <p>${verdict}</p>
      <div class="bars">${bars}</div>
      <h3 class="h-sm" style="margin-top:22px">Your fake ballot vs. the Correct Guide</h3>
      <div class="table-wrap"><table class="sheet"><thead><tr><th>Measure</th><th>You</th><th>Correct</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  return `
  <div class="narrow">
    ${S.shared ? `<div class="panel banner"><span>Someone sent you this result. Want your own?</span><button class="btn" data-act="start">Take the quiz <span aria-hidden="true">\u2192</span></button></div>` : ""}
    <section class="panel result-head enter">
      <div class="kicker">Your faction</div>
      <h1 class="fac-name" style="color:${Q.color}">${esc(Q.h)}</h1>
      <p class="lede">${esc(Q.blurb)}</p>
      <div class="meters">
        ${meter(AXN.x, p.x, "Loves markets", "Cares about people", peopleLine)}
        ${meter(AXN.y, p.y, "Midwit", "Smart", brainLine)}
      </div>
    </section>
    <section class="panel compass-panel">${compass(p)}</section>
    <section class="panel">
      <div class="h-sm">Closest to you on the chart</div>
      <div class="near">${nearHTML}</div>
      <p class="small muted" style="margin-top:12px">Furthest from you: <b>${esc(far.e.n)}</b>. Keep it that way.</p>
    </section>
    <section class="panel">
      <div class="fac-cols">
        <div><h3 class="h-sm">In their words</h3><ul>${Q.words.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
        <div><h3 class="h-sm">What critics say</h3><ul>${Q.critics.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
      </div>
    </section>
    <section class="panel">
      <div class="h-sm">Your loudest takes</div>
      ${loudHTML}
    </section>
    <section class="panel">
      <div class="h-sm">Part 2: the fake ballot</div>
      ${ballotHTML}
    </section>
    <div class="sharebar">
      <button class="btn" data-act="share">Share result</button>
      <button class="btn ghost" data-act="png">Save image</button>
      <button class="btn ghost" data-act="retake">Retake</button>
    </div>
    <section class="panel notes">
      <h2 class="h-sm">How this works</h2>
      <ul>
        <li>Your position is the average of your answers on each axis, with skips left out. The original compass does the same. Neither of us checked whether two axes describe San Francisco.</li>
        <li>People and groups on the chart are placed by our editorial read. So were theirs.</li>
        <li>The original quoted every faction\u2019s self-description except one, which it wrote itself. We wrote all of them ourselves, so the bias is evenly spread.</li>
        <li>The fake ballot compares your picks with five made-up slates. None of these measures exist. Your real ballot is at <a href="https://sfelections.org" target="_blank" rel="noopener">sfelections.org</a>.</li>
      </ul>
    </section>
  </div>`;
}

/* ------------------------------------------------------------------ render */

function render(){
  $app.innerHTML = { intro:viewIntro, q:viewQ, b:viewB, results:viewResults }[S.screen]();
  document.body.dataset.screen = S.screen;
  const step = S.screen === "q" ? S.qi + 1 : S.screen === "b" ? QS.length + S.bi + 1 : null;
  document.getElementById("count").textContent = step ? `${String(step).padStart(2, "0")} / ${TOTAL}` : "";
  document.getElementById("prog").style.width = `${S.screen === "results" ? 100 : step ? (step - 1) / TOTAL * 100 : 0}%`;
}

function go(screen){
  S.screen = screen;
  render();
  window.scrollTo(0, 0);
  $app.focus({ preventScroll:true });
}

function reset(){
  S.a = Array(QS.length).fill(null);
  S.b = Array(PROPS.length).fill(null);
  S.qi = 0; S.bi = 0; S.shared = false;
  history.replaceState(null, "", location.pathname);
}

function next(){
  if (S.screen === "q") {
    if (S.qi < QS.length - 1) S.qi++; else { S.bi = 0; return go("b"); }
    return go("q");
  }
  if (S.bi < PROPS.length - 1) { S.bi++; return go("b"); }
  history.replaceState(null, "", `#r=${encode()}`);
  go("results");
}

function back(){
  if (S.screen === "b") {
    if (S.bi > 0) { S.bi--; return go("b"); }
    S.qi = QS.length - 1;
    return go("q");
  }
  if (S.qi > 0) { S.qi--; return go("q"); }
  go("intro");
}

function toast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("on");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove("on"), 2200);
}

async function share(){
  const Q = QUADS[quadKey(axes())];
  const text = `${Q.h.replace("You\u2019re", "I\u2019m").replace("You have", "I have")} The SF Political Compass For AI Morons says so.`;
  if (navigator.share) {
    try { await navigator.share({ title:"SF Political Compass For AI Morons", text, url:location.href }); } catch { /* user closed the share sheet */ }
    return;
  }
  await navigator.clipboard.writeText(`${text} ${location.href}`);
  toast("Link copied");
}

async function savePNG(){
  const p = axes(), Q = QUADS[quadKey(p)];
  const W = 600, H = 770;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}">
    <rect width="${W}" height="${H}" fill="#07080c"/>
    <text x="40" y="48" fill="#8d897f" font-size="12" font-weight="700" letter-spacing="2">SF POLITICAL COMPASS FOR AI MORONS</text>
    <text x="40" y="92" fill="${Q.color}" font-size="34" font-weight="800">${esc(Q.h)}</text>
    <g transform="translate(0,118)">${compassInner(p)}</g>
    <text x="300" y="${H - 22}" text-anchor="middle" fill="#8d897f" font-size="14" font-weight="600">${SITE}</text>
  </svg>`;
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await img.decode();
  const cv = document.createElement("canvas");
  cv.width = W * 2; cv.height = H * 2;
  cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
  const blob = await new Promise(r => cv.toBlob(r, "image/png"));
  const file = new File([blob], `sf-compass-${Q.name.toLowerCase().replace(/\W+/g, "-")}.png`, { type:"image/png" });
  if (navigator.canShare?.({ files:[file] })) {
    try { await navigator.share({ files:[file] }); } catch { /* user closed the share sheet */ }
    return;
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function burst(el, ev){
  if (reduceMotion) return;
  let glyph;
  if (el.dataset.act === "ans") {
    const q = QS[S.qi], c = q.s * Number(el.dataset.v);
    glyph = c > 0 ? "\u262d" : c < 0 ? (q.ax === "x" ? "\u{1f4c8}" : "\u{1f916}") : "\u{1f9ba}";
  } else {
    glyph = el.dataset.v === PROPS[S.bi].m.tr ? "\u262d" : "\u{1f4c8}";
  }
  const r = el.getBoundingClientRect();
  const x = ev.clientX || r.left + r.width / 2, y = ev.clientY || r.top + r.height / 2;
  for (let i = 0; i < 7; i++) {
    const s = document.createElement("span");
    s.className = "burst";
    s.textContent = glyph;
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    s.style.setProperty("--dx", `${Math.random() * 180 - 90}px`);
    s.style.setProperty("--dy", `${-50 - Math.random() * 110}px`);
    s.style.setProperty("--r", `${Math.random() * 120 - 60}deg`);
    s.addEventListener("animationend", () => s.remove());
    document.body.append(s);
  }
}

function act(name, v){
  switch (name) {
    case "home": reset(); go("intro"); break;
    case "start": reset(); go("q"); break;
    case "see": document.getElementById("map").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); break;
    case "ans": S.a[S.qi] = Number(v); next(); break;
    case "vote": S.b[S.bi] = v; next(); break;
    case "skip": if (S.screen === "q") S.a[S.qi] = null; else S.b[S.bi] = null; next(); break;
    case "back": back(); break;
    case "share": share(); break;
    case "png": savePNG(); break;
    case "retake": reset(); go("q"); break;
  }
}

document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (!el || busy) return;
  if (el.dataset.act === "ans" || el.dataset.act === "vote") {
    burst(el, e);
    el.setAttribute("aria-pressed", "true");
    busy = true;
    setTimeout(() => { busy = false; act(el.dataset.act, el.dataset.v); }, reduceMotion ? 0 : 170);
    return;
  }
  act(el.dataset.act, el.dataset.v);
});

document.addEventListener("keydown", e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const key = e.key.toLowerCase();
  let sel;
  if (S.screen === "q" && /^[1-5]$/.test(key)) sel = `[data-act="ans"][data-v="${LIKERT[key - 1][0]}"]`;
  else if (S.screen === "b" && (key === "y" || key === "n")) sel = `[data-act="vote"][data-v="${key.toUpperCase()}"]`;
  else if ((S.screen === "q" || S.screen === "b") && key === "arrowleft") sel = `[data-act="back"]`;
  if (!sel) return;
  e.preventDefault();
  $app.querySelector(sel).click();
});

document.getElementById("eday").textContent = electionLabel();
const shared = /^#r=(.+)$/.exec(location.hash);
if (shared && decode(shared[1])) { S.shared = true; S.screen = "results"; }
render();
