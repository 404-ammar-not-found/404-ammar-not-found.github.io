/* Project strip visualisations.
 *
 * Six small canvas vignettes, one per project card, each grounded in what the
 * repository actually contains: a register-blocked matmul wave over a GPU tile
 * grid (jaxmetal), iterative magnitude pruning thinning a layered network
 * (lottery-ticket), retrieval arcs from papers to an answer (rag-for-research),
 * self-attention lines over a patch grid (vision-transformers), stocks
 * clustering into a correlation network (market-structure), and an invariant
 * mass histogram filling event by event until the Z peak emerges (z-boson).
 *
 * One rAF loop drives everything; IntersectionObserver skips off-screen cards
 * and prefers-reduced-motion renders a single static frame.
 */
(() => {
  "use strict";

  const INK = "rgba(29,29,31,0.3)";
  const INK_SOFT = "rgba(29,29,31,0.13)";
  const MUTED = "#86868b";
  const ACCENT = "#0071e3";
  const ACCENT_SOFT = "rgba(0,113,227,0.32)";
  const FONT = '9px "JetBrains Mono", monospace';

  const mulberry32 = (seed) => {
    let a = seed >>> 0;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const lerp = (a, b, u) => a + (b - a) * u;
  const easeInOut = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);

  /* -- jaxmetal: tile grid with a compute wave and a 19-encoder command buffer */

  const drawJaxmetal = (ctx, w, h, t) => {
    const p = (t % 6) / 6;
    const cols = Math.floor((w - 8) / 16);
    const rows = Math.floor((h - 26) / 16);
    const gridW = cols * 16 - 4;
    const x0 = (w - gridW) / 2;
    const y0 = 4;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const wave = Math.max(0, 1 - Math.abs(p * (cols + rows) * 1.15 - (c + r)));
        const macro = Math.floor(p * cols * 0.9) === c && r >= Math.floor(rows / 2) - 1 && r <= Math.floor(rows / 2) + 1;
        ctx.fillStyle = macro
          ? "rgba(0,113,227," + (0.45 + wave * 0.5) + ")"
          : wave > 0.02
            ? "rgba(29,29,31," + (0.06 + wave * 0.22) + ")"
            : INK_SOFT;
        ctx.fillRect(x0 + c * 16, y0 + r * 16, 12, 12);
      }
    }
    ctx.fillStyle = MUTED;
    ctx.font = FONT;
    ctx.fillText("cmd buffer", x0, h - 12);
    const bx = x0 + 62;
    for (let i = 0; i < 19; i++) {
      const done = p * 22 > i;
      ctx.fillStyle = done ? ACCENT : INK_SOFT;
      ctx.fillRect(bx + i * ((w - bx - x0 - 18) / 19), h - 19, 4, 7);
    }
  };

  /* -- lottery-ticket: a dense layered network pruning itself to 89.26% sparsity */

  const lotteryEdges = [];
  {
    const rand = mulberry32(97);
    const layers = [10, 8, 6, 5, 4];
    for (let l = 0; l < layers.length - 1; l++) {
      for (let a = 0; a < layers[l]; a++) {
        for (let b = 0; b < layers[l + 1]; b++) {
          lotteryEdges.push({ l: l, a: a, b: b, rank: rand() });
        }
      }
    }
  }

  const drawLottery = (ctx, w, h, t) => {
    const p = (t % 8) / 8;
    const layers = [10, 8, 6, 5, 4];
    const prune = easeInOut(Math.min(1, p * 1.12)) * 0.8926;
    const pad = 14;
    const bandTop = 30;
    const bandH = h - bandTop - 8;
    const nodePos = layers.map((count, l) => {
      const x = pad + (l * (w - pad * 2)) / (layers.length - 1);
      const spacing = bandH / (count - 1);
      const y0 = bandTop + (bandH - (count - 1) * spacing) / 2;
      const out = [];
      for (let i = 0; i < count; i++) {
        out.push([x, y0 + i * spacing]);
      }
      return out;
    });
    for (const e of lotteryEdges) {
      if (e.rank < prune) {
        continue;
      }
      const pa = nodePos[e.l][e.a];
      const pb = nodePos[e.l + 1][e.b];
      const survivor = prune > 0.4;
      ctx.strokeStyle = survivor ? ACCENT_SOFT : INK_SOFT;
      ctx.beginPath();
      ctx.moveTo(pa[0], pa[1]);
      ctx.lineTo(pb[0], pb[1]);
      ctx.stroke();
    }
    ctx.fillStyle = INK;
    for (const layer of nodePos) {
      for (const n of layer) {
        ctx.fillRect(n[0] - 1.5, n[1] - 1.5, 3, 3);
      }
    }
    ctx.font = FONT;
    ctx.fillStyle = prune >= 0.889 ? ACCENT : MUTED;
    ctx.textAlign = "right";
    ctx.fillText("sparsity " + (prune * 100).toFixed(2) + "%", w - 8, 14);
    ctx.fillStyle = MUTED;
    ctx.fillText("acc 98.33%", w - 8, 26);
    ctx.textAlign = "left";
  };

  /* -- rag-for-research: retrieval arcs from paper chunks to an answer box */

  const ragSeeds = mulberry32(5);
  const ragPapers = [];
  for (let i = 0; i < 4; i++) {
    const lines = [];
    for (let j = 0; j < 5; j++) {
      lines.push(0.2 + ragSeeds() * 0.6);
    }
    ragPapers.push({ lines: lines, chunk: Math.floor(ragSeeds() * 5) });
  }

  const drawRag = (ctx, w, h, t) => {
    const p = (t % 7) / 7;
    const answer = { x: w - 86, y: 12, w: 74, h: h - 34 };
    const papers = ragPapers.map((paper, i) => ({
      x: 10,
      y: 10 + i * ((h - 24) / 4),
      w: 46,
      h: (h - 24) / 4 - 7,
    }));
    papers.forEach((rect, i) => {
      ctx.strokeStyle = INK_SOFT;
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      const active = p > 0.15 + i * 0.14 && p < 0.62 + i * 0.08;
      ragPapers[i].lines.forEach((len, j) => {
        ctx.strokeStyle = j === ragPapers[i].chunk && active ? ACCENT : INK;
        ctx.beginPath();
        ctx.moveTo(rect.x + 4, rect.y + 6 + j * 5);
        ctx.lineTo(rect.x + 4 + len * (rect.w - 8), rect.y + 6 + j * 5);
        ctx.stroke();
      });
      const up = Math.min(1, Math.max(0, (p - (0.15 + i * 0.14)) / 0.34));
      if (up > 0 && up < 1) {
        const cx = lerp(rect.x + rect.w, answer.x, up);
        const cy = Math.max(4, lerp(rect.y + rect.h / 2, answer.y + answer.h / 2, up) - Math.sin(up * Math.PI) * 22);
        const ctrlY = Math.max(6, lerp(rect.y + rect.h / 2, answer.y + answer.h / 2, 0.5) - 40);
        ctx.fillStyle = ACCENT;
        ctx.beginPath();
        ctx.arc(cx, cy, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = ACCENT_SOFT;
        ctx.beginPath();
        ctx.moveTo(rect.x + rect.w, rect.y + rect.h / 2);
        ctx.quadraticCurveTo(lerp(rect.x + rect.w, answer.x, 0.5), ctrlY, answer.x, answer.y + answer.h / 2);
        ctx.stroke();
      }
    });
    const fill = Math.min(1, Math.max(0, (p - 0.45) / 0.4));
    ctx.strokeStyle = fill > 0 ? ACCENT : INK_SOFT;
    ctx.strokeRect(answer.x, answer.y, answer.w, answer.h);
    ctx.font = FONT;
    ctx.fillStyle = MUTED;
    ctx.fillText("answer", answer.x + 4, answer.y + 11);
    for (let j = 0; j < 4; j++) {
      const shown = fill * 4 > j;
      ctx.strokeStyle = shown ? ACCENT_SOFT : INK_SOFT;
      ctx.beginPath();
      ctx.moveTo(answer.x + 5, answer.y + 20 + j * 7);
      ctx.lineTo(answer.x + 5 + (0.4 + (0.5 * ((j * 37) % 10)) / 10) * (answer.w - 10), answer.y + 20 + j * 7);
      ctx.stroke();
    }
  };

  /* -- vision-transformers: self-attention lines over an 8x8 patch grid */

  const vitHeads = [];
  {
    const rand = mulberry32(12);
    for (let head = 0; head < 6; head++) {
      const query = 9 + Math.floor(rand() * 46);
      const targets = [];
      for (let k = 0; k < 9; k++) {
        let idx = Math.floor(rand() * 64);
        if (idx === query) {
          idx = (idx + 17) % 64;
        }
        targets.push({ idx: idx, w: 0.25 + rand() * 0.75 });
      }
      vitHeads.push({ query: query, targets: targets });
    }
  }

  const drawVit = (ctx, w, h, t) => {
    const p = (t % 9) / 9;
    const head = Math.floor(p * 6) % 6;
    const fade = 1 - Math.abs(((p * 6) % 1) - 0.5) * 1.4;
    const size = h - 18;
    const x0 = (w - size) / 2;
    const y0 = 2;
    const cell = size / 8;
    const center = (idx) => [x0 + ((idx % 8) + 0.5) * cell, y0 + (Math.floor(idx / 8) + 0.5) * cell];
    const cur = vitHeads[head];
    for (const target of cur.targets) {
      const from = center(cur.query);
      const to = center(target.idx);
      ctx.strokeStyle = "rgba(0,113,227," + (0.1 + target.w * 0.55 * fade) + ")";
      ctx.lineWidth = 0.5 + target.w * 1.1;
      ctx.beginPath();
      ctx.moveTo(from[0], from[1]);
      ctx.lineTo(to[0], to[1]);
      ctx.stroke();
    }
    ctx.lineWidth = 1;
    for (let r = 0; r < 9; r++) {
      ctx.strokeStyle = INK_SOFT;
      ctx.beginPath();
      ctx.moveTo(x0, y0 + r * cell);
      ctx.lineTo(x0 + size, y0 + r * cell);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x0 + r * cell, y0);
      ctx.lineTo(x0 + r * cell, y0 + size);
      ctx.stroke();
    }
    for (const target of cur.targets) {
      const to = center(target.idx);
      ctx.fillStyle = "rgba(0,113,227," + (0.08 + target.w * 0.16 * fade) + ")";
      ctx.fillRect(x0 + (target.idx % 8) * cell + 1, y0 + Math.floor(target.idx / 8) * cell + 1, cell - 2, cell - 2);
    }
    const q = center(cur.query);
    ctx.fillStyle = "rgba(0,113,227," + (0.5 + 0.4 * Math.sin(t * 4)) + ")";
    ctx.fillRect(q[0] - 2, q[1] - 2, 4, 4);
    ctx.font = FONT;
    ctx.fillStyle = MUTED;
    ctx.fillText("head " + (head + 1) + "/6", x0, h - 3);
  };

  /* -- market-structure: scattered stocks condensing into correlation clusters */

  const marketNodes = [];
  {
    const rand = mulberry32(2024);
    const clusterCenters = [
      [0.3, 0.3],
      [0.72, 0.38],
      [0.5, 0.74],
    ];
    for (let i = 0; i < 27; i++) {
      const cluster = i % 3;
      marketNodes.push({
        scatter: [0.08 + rand() * 0.84, 0.1 + rand() * 0.8],
        cluster: cluster,
        home: [clusterCenters[cluster][0] + (rand() - 0.5) * 0.22, clusterCenters[cluster][1] + (rand() - 0.5) * 0.2],
      });
    }
  }

  const drawMarket = (ctx, w, h, t) => {
    const p = (t % 10) / 10;
    const u = easeInOut(Math.min(1, p * 1.15));
    const year = 2004 + Math.min(20, Math.floor(p * 20.999));
    const pts = marketNodes.map((n) => [lerp(n.scatter[0], n.home[0], u) * w, lerp(n.scatter[1], n.home[1], u) * (h - 16) + 4]);
    for (let i = 0; i < marketNodes.length; i++) {
      for (let j = i + 1; j < marketNodes.length; j++) {
        if (marketNodes[i].cluster !== marketNodes[j].cluster) {
          continue;
        }
        const closeness = 1 - Math.min(1, Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]) / (w * 0.16));
        if (closeness <= 0) {
          continue;
        }
        ctx.strokeStyle = "rgba(0,113,227," + (closeness * 0.5 * u + 0.04) + ")";
        ctx.beginPath();
        ctx.moveTo(pts[i][0], pts[i][1]);
        ctx.lineTo(pts[j][0], pts[j][1]);
        ctx.stroke();
      }
    }
    ctx.fillStyle = INK;
    for (const pt of pts) {
      ctx.fillRect(pt[0] - 1.5, pt[1] - 1.5, 3, 3);
    }
    ctx.font = FONT;
    ctx.fillStyle = year >= 2024 ? ACCENT : MUTED;
    ctx.textAlign = "right";
    ctx.fillText(String(year), w - 8, h - 4);
    ctx.textAlign = "left";
    ctx.fillStyle = MUTED;
    ctx.fillText("S&P 500 correlation", 8, h - 4);
  };

  /* -- z-boson: an invariant-mass histogram filling until the Z peak emerges */

  const zEvents = [];
  {
    const rand = mulberry32(91);
    for (let i = 0; i < 260; i++) {
      const bump = rand() < 0.34;
      const x = bump ? 0.58 + (rand() + rand() + rand() - 1.5) * 0.07 : 0.08 + rand() * 0.8;
      zEvents.push({ x: x, at: rand() });
    }
  }

  const drawZboson = (ctx, w, h, t) => {
    const p = (t % 9) / 9;
    const bins = 40;
    const counts = new Array(bins).fill(0);
    let landed = 0;
    for (const ev of zEvents) {
      if (ev.at < p) {
        counts[Math.min(bins - 1, Math.floor(ev.x * bins))]++;
        landed++;
      }
    }
    const baseline = h - 16;
    ctx.strokeStyle = INK;
    ctx.beginPath();
    ctx.moveTo(6, baseline);
    ctx.lineTo(w - 6, baseline);
    ctx.stroke();
    const maxC = Math.max(6, Math.max.apply(null, counts));
    const bw = (w - 12) / bins;
    for (let b = 0; b < bins; b++) {
      if (!counts[b]) {
        continue;
      }
      const inBump = Math.abs((b + 0.5) / bins - 0.58) < 0.06;
      const bh = (counts[b] / maxC) * (baseline - 12);
      ctx.fillStyle = inBump ? ACCENT : "rgba(29,29,31,0.34)";
      ctx.fillRect(6 + b * bw + 0.5, baseline - bh, Math.max(1, bw - 1), bh);
    }
    for (const ev of zEvents) {
      const falling = p - ev.at;
      if (falling > 0 && falling < 0.045) {
        const y = 6 + (falling / 0.045) * (baseline - 12);
        ctx.fillStyle = Math.abs(ev.x - 0.58) < 0.06 ? ACCENT_SOFT : INK_SOFT;
        ctx.fillRect(6 + ev.x * (w - 12), y, 1.6, 1.6);
      }
    }
    ctx.font = FONT;
    ctx.fillStyle = p > 0.75 ? ACCENT : MUTED;
    ctx.fillText("m \u2248 91 GeV", 6 + 0.58 * (w - 12) - 24, 12);
    ctx.fillStyle = MUTED;
    ctx.textAlign = "right";
    ctx.fillText(landed + " events", w - 8, 12);
    ctx.textAlign = "left";
  };

  /* -- mpinsde: a double-well potential, jittering paths, and an out-of-support IC */

  const mpinsdeParticles = [];
  {
    const rand = mulberry32(26);
    for (let i = 0; i < 11; i++) {
      mpinsdeParticles.push({ x: -1.2 + rand() * 2.4, rx: null, acc: i === 0 });
    }
  }

  let mpinsdeLastT = 0;

  const drawMpinsde = (ctx, w, h, t) => {
    const p = (t % 9) / 9;
    const padX = 14;
    const baseY = h - 16;
    const topY = 20;
    const well = (x) => Math.pow(x * x - 1, 2);
    const toPx = (x, u) => [padX + ((x + 1.7) / 3.4) * (w - padX * 2), baseY - (u / 3.6) * (baseY - topY)];
    const bandL = toPx(-1.25, 0)[0];
    const bandR = toPx(1.25, 0)[0];
    ctx.fillStyle = "rgba(29,29,31,0.045)";
    ctx.fillRect(bandL, topY - 8, bandR - bandL, baseY - topY + 8);
    ctx.strokeStyle = INK;
    ctx.beginPath();
    for (let i = 0; i <= 72; i++) {
      const x = -1.7 + (i / 72) * 3.4;
      const pt = toPx(x, well(x));
      if (i === 0) {
        ctx.moveTo(pt[0], pt[1]);
      } else {
        ctx.lineTo(pt[0], pt[1]);
      }
    }
    ctx.stroke();
    ctx.strokeStyle = INK_SOFT;
    ctx.beginPath();
    ctx.moveTo(padX - 4, baseY);
    ctx.lineTo(w - padX + 4, baseY);
    ctx.stroke();
    /* Euler-Maruyama on dx = -U'(x) dt + sigma dW, with a clamped dt so the
     * speed does not depend on the display refresh rate, and a damped render
     * position so the noise reads as Brownian motion instead of twitching. */
    const dt = Math.min(0.05, Math.max(0, t - mpinsdeLastT));
    mpinsdeLastT = t;
    for (const particle of mpinsdeParticles) {
      if (particle.acc) {
        const u = easeInOut(Math.min(1, p * 1.4));
        const from = toPx(-1.62, well(-1.62));
        const now = toPx(-1.62 + u * 0.62, well(-1.62 + u * 0.62));
        ctx.strokeStyle = "rgba(0,113,227,0.35)";
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(from[0], from[1] - 3);
        ctx.lineTo(now[0], now[1] - 3);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = ACCENT;
        ctx.fillRect(now[0] - 1.5, now[1] - 4.5, 3, 3);
        continue;
      }
      if (dt > 0) {
        const grad = 4 * particle.x * (particle.x * particle.x - 1);
        let next = particle.x - grad * 0.55 * dt + 0.5 * Math.sqrt(dt) * (Math.random() * 2 - 1);
        next = Math.max(-1.58, Math.min(1.58, next));
        particle.x = next;
        particle.rx = particle.rx === null ? next : particle.rx + (next - particle.rx) * Math.min(1, dt * 14);
      }
      const pt = toPx(particle.rx, well(particle.rx));
      ctx.fillStyle = "rgba(29,29,31,0.5)";
      ctx.fillRect(pt[0] - 0.9, pt[1] - 3.4, 1.8, 1.8);
    }
    ctx.font = FONT;
    ctx.fillStyle = MUTED;
    ctx.fillText("double well", 8, 12);
    ctx.fillText("train ICs", bandL + 3, baseY - 4);
    ctx.fillStyle = ACCENT;
    ctx.textAlign = "right";
    ctx.fillText("o.o.s. err -58%", w - 8, 12);
    ctx.textAlign = "left";
  };

  const VIZ = {
    jaxmetal: drawJaxmetal,
    "lottery-ticket": drawLottery,
    "rag-for-research": drawRag,
    "vision-transformers": drawVit,
    "market-structure": drawMarket,
    "z-boson": drawZboson,
    mpinsde: drawMpinsde,
  };

  const entries = [];
  for (const canvas of Array.from(document.querySelectorAll("canvas.project-strip-viz"))) {
    const href = canvas.closest("a.project-strip-card")?.getAttribute("href") || "";
    const key = href.split("/").filter(Boolean).pop();
    const draw = VIZ[key];
    if (!draw || !canvas.getContext) {
      continue;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      continue;
    }
    entries.push({ canvas: canvas, ctx: ctx, draw: draw, active: true });
  }

  const sizeOf = (entry) => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = entry.canvas.getBoundingClientRect();
    entry.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    entry.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    entry.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    entry.w = rect.width;
    entry.h = rect.height;
  };

  const render = (entry, t) => {
    entry.ctx.clearRect(0, 0, entry.w, entry.h);
    entry.draw(entry.ctx, entry.w, entry.h, t);
  };

  for (const entry of entries) {
    sizeOf(entry);
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const renderStatic = () => {
    for (const entry of entries) {
      render(entry, 4.2);
    }
  };

  if (reduceMotion.matches || entries.length === 0) {
    renderStatic();
  } else {
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (observed) => {
          for (const item of observed) {
            const entry = entries.find((e) => e.canvas === item.target);
            if (entry) {
              entry.active = item.isIntersecting;
            }
          }
        },
        { rootMargin: "60px" }
      );
      for (const entry of entries) {
        io.observe(entry.canvas);
      }
    }
    const start = performance.now();
    const frame = (now) => {
      /* The first rAF timestamp can round below `start` on coarsened clocks,
       * which would make every period negative; clamp so it cannot. */
      const t = Math.max(0, (now - start) / 1000);
      for (const entry of entries) {
        if (!entry.active) {
          continue;
        }
        /* One throwing vignette must not kill the loop for the others. */
        try {
          render(entry, t);
        } catch (err) {
          entry.failures = (entry.failures || 0) + 1;
          if (entry.failures > 2) {
            entry.active = false;
          }
        }
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      for (const entry of entries) {
        sizeOf(entry);
      }
      if (reduceMotion.matches) {
        renderStatic();
      }
    }, 150);
  });
})();
