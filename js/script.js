const LOGOS = {
  dma: "img/0f52422e2b8aa4fe439f852e6fc2472ad4bc27b2.png",
  ds: "img/2add7139ffc40c618fb48ff4013ac1dcc023f63c.png",
  nomade: "img/2f2a8c6ee750f6d64719736e73c93a07e5546b01.png",
  mariage: "img/6e41af6aed38d8b985f842407b22b272dedfcd28.png",
  maquillage: "img/43c3108bee9502e759aef275982c02da9f90fe43.png",
  boumboum: "img/498f29729d0021af77320f9e7bf8a0aa50e0dc51.png",
  ako: "img/53141fb3347711d6cbbe2b910d7bd46a8df7f170.png",
  bioharvest: "img/Capture d'écran 2026-05-15 160938.png",
  btp: "img/Capture d'écran 2026-05-15 160951.png",
};


const links = [
  { key: "dma",        href: "dma/dma.html",                   tilt: -4 },
  { key: "ds",         href: "ds/ds.html",                     tilt:  3 },
  { key: "nomade",     href: "nomade/nomade.html",              tilt: -2 },
  { key: "mariage",    href: "mariage/mariage.html",            tilt:  5 },
  { key: "maquillage", href: "maquillage/maquillage.html",      tilt: -3 },
  { key: "boumboum",   href: "boumboum/boumboum.html",          tilt:  6 },
  { key: "ako",        href: "ako/ako.html",                    tilt: -5 },
  { key: "bioharvest", href: "bioharvest/bioharvest.html",      tilt:  2 },
  { key: "btp",        href: "btp/btp.html",                    tilt: -6 },
];

const ring     = document.getElementById("orbitRing");
const cursor   = document.getElementById("cursor");
const rpmEl    = document.getElementById("rpmEl");
const n        = links.length;
const R        = 300; // px, must match --R

// Build tick marks in SVG
const ticks = document.getElementById("ticks");
for (let i = 0; i < 36; i++) {
  const a = (i * 10) * Math.PI / 180;
  const len = i % 9 === 0 ? 14 : 6;
  const x1 = 300 + 300 * Math.cos(a);
  const y1 = 300 + 300 * Math.sin(a);
  const x2 = 300 + (300 - len) * Math.cos(a);
  const y2 = 300 + (300 - len) * Math.sin(a);
  const line = document.createElementNS("http://www.w3.org/2000/svg","line");
  line.setAttribute("x1",x1); line.setAttribute("y1",y1);
  line.setAttribute("x2",x2); line.setAttribute("y2",y2);
  line.setAttribute("stroke","#c5bdb1"); line.setAttribute("stroke-width",".8");
  ticks.appendChild(line);
}

// Tape colors
const tapeColors = ["rgba(255,220,80,.85)","rgba(180,220,255,.85)","rgba(255,180,200,.85)","rgba(200,255,190,.85)","rgba(255,200,140,.85)"];

const nodes = links.map((lk, i) => {
  const node = document.createElement("div");
  node.className = "orbit-node";

  const a = document.createElement("a");
  a.href = lk.href;
  a.className = "card";
  a.style.transform = `translate(-50%,-50%) rotate(${lk.tilt}deg)`;
  a.dataset.tilt = lk.tilt;

  // tape
  const tape = document.createElement("div");
  tape.className = "card-tape";
  tape.style.background = tapeColors[i % tapeColors.length];
  tape.style.transform = `translateX(-50%) rotate(${-lk.tilt + (Math.random()*4-2)}deg)`;

  // index
  const idx = document.createElement("span");
  idx.className = "card-index";
  idx.textContent = String(i+1).padStart(2,"0");

  // logo
  const img = document.createElement("img");
  img.src = LOGOS[lk.key];
  img.alt = lk.key;
  img.draggable = false;

  a.appendChild(tape);
  a.appendChild(idx);
  a.appendChild(img);
  node.appendChild(a);
  ring.appendChild(node);

  a.addEventListener("mouseenter", () => { paused = true;  cursor.classList.add("hover"); });
  a.addEventListener("mouseleave", () => { paused = false; cursor.classList.remove("hover"); });

  return { el: node, baseAngle: (2 * Math.PI / n) * i, tilt: lk.tilt };
});

let angle  = 0;
let rpm    = 6;
let paused = false;
let last   = null;

function layout(a) {
  nodes.forEach(({ el, baseAngle, tilt }) => {
    const θ = a + baseAngle;
    const x = Math.cos(θ) * R;
    const y = Math.sin(θ) * R;
    el.style.transform = `translate(${x}px, ${y}px)`;
    // keep card upright (cancel orbit rotation) + keep personal tilt
    const link = el.querySelector(".card");
    if (!link.matches(":hover")) {
      link.style.transform = `translate(-50%,-50%) rotate(${tilt}deg)`;
    }
  });
}

function tick(ts) {
  if (last !== null && !paused) {
    const dt = (ts - last) / 1000;
    angle += (rpm / 60) * 2 * Math.PI * dt;
  }
  last = ts;
  layout(angle);
  requestAnimationFrame(tick);
}

// keyboard speed control
document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp")   rpm = Math.min(rpm + .5, 30);
  if (e.key === "ArrowDown") rpm = Math.max(rpm - .5, .5);
  rpmEl.textContent = rpm.toFixed(1) + " rpm";
});

// cursor
document.addEventListener("mousemove", e => {
  cursor.style.left = e.clientX + "px";
  cursor.style.top  = e.clientY + "px";
});

layout(0);
requestAnimationFrame(tick);