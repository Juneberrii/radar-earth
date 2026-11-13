// Radar Earth – interactive globe with radar sweep and cursor readout (no external libraries)
(function () {
  const TYPES = window.TYPES, SITES = window.SITES;

  // Very simplified continents (lon, lat)
  const LAND = [
    [[-165,65],[-140,70],[-110,72],[-80,70],[-65,60],[-55,50],[-70,43],[-80,32],[-81,25],[-97,26],[-97,20],[-88,15],[-80,8],[-92,15],[-105,20],[-117,32],[-125,42],[-125,50],[-140,60],[-165,60]],
    [[-80,8],[-60,10],[-50,0],[-35,-7],[-40,-22],[-58,-38],[-68,-55],[-75,-45],[-72,-20],[-81,-5]],
    [[-50,60],[-20,70],[-20,82],[-60,82],[-70,76]],
    [[-10,36],[0,43],[-5,48],[5,53],[10,57],[5,62],[15,69],[30,70],[40,65],[40,45],[28,41],[20,40],[12,44],[5,43]],
    [[-17,15],[-10,30],[10,37],[32,31],[43,12],[51,11],[40,-5],[35,-25],[20,-35],[12,-17],[9,4],[-8,5]],
    [[40,65],[70,73],[110,77],[140,72],[170,68],[160,60],[140,55],[135,40],[122,30],[110,20],[105,10],[100,2],[95,15],[80,8],[72,20],[60,25],[50,30],[36,36],[40,45]],
    [[130,31],[135,34],[140,36],[142,40],[141,43],[140,41],[136,36],[131,34]],
    [[114,-22],[130,-12],[142,-11],[153,-27],[146,-39],[135,-35],[115,-34]],
    [[95,5],[106,-6],[115,-8],[120,-2],[110,2]]
  ];

  const SIZE = 580, C = SIZE / 2, R = 262, TILT = 15, D = Math.PI / 180;
  const NS = 'http://www.w3.org/2000/svg';
  const state = { rot: 60, on: { fire: true, water: true, ground: true }, sel: null, spinning: true, target: null };

  const svg = document.getElementById('globe');
  if (!svg) return;
  svg.setAttribute('viewBox', `0 0 ${SIZE} ${SIZE}`);

  function el(name, attrs, parent) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  // ----- static layers -----
  const defs = el('defs', {}, svg);
  const clip = el('clipPath', { id: 'globe-clip' }, defs);
  el('circle', { cx: C, cy: C, r: R }, clip);
  const grad = el('linearGradient', { id: 'sweep-grad', x1: '0', y1: '0', x2: '1', y2: '0' }, defs);
  el('stop', { offset: '0', 'stop-color': '#8BE8B0', 'stop-opacity': '0' }, grad);
  el('stop', { offset: '1', 'stop-color': '#8BE8B0', 'stop-opacity': '0.28' }, grad);

  // range rings + ticks outside the globe (instrument look)
  for (let i = 0; i < 72; i++) {
    const a = i * 5 * D, long = i % 6 === 0;
    const r1 = R + 10, r2 = R + (long ? 20 : 15);
    el('line', { x1: C + r1 * Math.cos(a), y1: C + r1 * Math.sin(a), x2: C + r2 * Math.cos(a), y2: C + r2 * Math.sin(a), stroke: long ? '#3E5550' : '#24332F', 'stroke-width': 1 }, svg);
  }
  el('circle', { cx: C, cy: C, r: R, fill: '#0B1513', stroke: '#2E3E3A', 'stroke-width': 1 }, svg);
  const grat = el('path', { fill: 'none', stroke: '#16251F', 'stroke-width': 1 }, svg);
  const land = el('path', { fill: '#15302A', stroke: '#2C4C43', 'stroke-width': 1, 'stroke-linejoin': 'round' }, svg);

  // radar sweep (rotating wedge, clipped to the globe)
  const sweepClip = el('g', { 'clip-path': 'url(#globe-clip)' }, svg);
  const sweep = el('g', { class: 'sweep' }, sweepClip);
  const a0 = -40 * D;
  el('path', { d: `M${C} ${C} L${C + 300 * Math.cos(a0)} ${C + 300 * Math.sin(a0)} A300 300 0 0 1 ${C + 300} ${C} Z`, fill: 'url(#sweep-grad)' }, sweep);
  el('line', { x1: C, y1: C, x2: C + 300, y2: C, stroke: '#8BE8B0', 'stroke-opacity': 0.55, 'stroke-width': 1 }, sweep);
  el('circle', { cx: C, cy: C, r: 2.5, fill: '#8BE8B0' }, svg);

  const markerLayer = el('g', {}, svg);
  const cursorDot = el('circle', { r: 3, fill: 'none', stroke: '#8BE8B0', 'stroke-width': 1, style: 'display:none;pointer-events:none' }, svg);

  // ----- projection -----
  function proj(lon, lat) {
    const l = (lon - state.rot) * D, p = lat * D, t = TILT * D;
    let x = Math.cos(p) * Math.sin(l);
    let y = Math.cos(t) * Math.sin(p) - Math.sin(t) * Math.cos(p) * Math.cos(l);
    const c = Math.sin(t) * Math.sin(p) + Math.cos(t) * Math.cos(p) * Math.cos(l);
    if (c < 0) { const n = Math.hypot(x, y) || 1; x /= n; y /= n; }
    return { x: C + R * x, y: C - R * y, v: c >= 0 };
  }
  // screen point -> lat/lon (inverse orthographic)
  function invert(sx, sy) {
    const x = (sx - C) / R, y = (C - sy) / R, rho = Math.hypot(x, y);
    if (rho > 1) return null;
    const c = Math.asin(rho), t = TILT * D;
    const lat = rho === 0 ? t : Math.asin(Math.cos(c) * Math.sin(t) + (y * Math.sin(c) * Math.cos(t)) / rho);
    let lon = state.rot * D + Math.atan2(x * Math.sin(c), rho * Math.cos(c) * Math.cos(t) - y * Math.sin(c) * Math.sin(t));
    lon = ((lon / D + 540) % 360) - 180;
    return { lat: lat / D, lon };
  }
  const fmt = (lat, lon) => `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'} ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;

  function densify(pts) {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const n = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) / 3));
      for (let k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
    }
    return out;
  }
  const LANDS = LAND.map(densify);

  // ----- markers -----
  let moved = false, drag = null;
  const markers = SITES.map((s) => {
    const g = el('g', { class: 'marker', tabindex: '0', role: 'button', 'aria-label': `${s.name}, ${s.place} – ${TYPES[s.type].label}` }, markerLayer);
    el('circle', { class: 'pulse', r: 6, fill: TYPES[s.type].color }, g);
    const core = el('rect', { class: 'core', x: -5, y: -5, width: 10, height: 10, fill: TYPES[s.type].color, stroke: '#080C0B', 'stroke-width': 2, transform: 'rotate(45)' }, g);
    el('circle', { r: 20, fill: 'transparent' }, g);
    g.addEventListener('click', () => { if (!moved) select(s.id); });
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(s.id); } });
    return { s, g, core };
  });

  const elCenter = document.getElementById('ro-center');
  const elCursor = document.getElementById('ro-cursor');
  const elVisible = document.getElementById('ro-visible');

  function draw() {
    let d = '';
    const line = (pts) => {
      let pen = false;
      for (const [lo, la] of pts) {
        const q = proj(lo, la);
        if (!q.v) { pen = false; continue; }
        d += (pen ? 'L' : 'M') + q.x.toFixed(1) + ' ' + q.y.toFixed(1);
        pen = true;
      }
    };
    for (let lo = -180; lo < 180; lo += 30) { const p = []; for (let la = -90; la <= 90; la += 5) p.push([lo, la]); line(p); }
    for (let la = -60; la <= 60; la += 30) { const p = []; for (let lo = -180; lo <= 180; lo += 5) p.push([lo, la]); line(p); }
    grat.setAttribute('d', d);

    let ld = '';
    for (const poly of LANDS) {
      const pr = poly.map(([lo, la]) => proj(lo, la));
      if (!pr.some((q) => q.v)) continue;
      ld += pr.map((q, i) => (i ? 'L' : 'M') + q.x.toFixed(1) + ' ' + q.y.toFixed(1)).join('') + 'Z';
    }
    land.setAttribute('d', ld);

    let visible = 0;
    for (const m of markers) {
      const q = proj(m.s.lon, m.s.lat);
      const show = q.v && state.on[m.s.type];
      if (show) visible++;
      m.g.style.display = show ? '' : 'none';
      m.g.setAttribute('transform', `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)})`);
      m.core.setAttribute('stroke', state.sel === m.s.id ? '#FFFFFF' : '#080C0B');
    }
    if (elCenter) {
      const lon = ((state.rot + 540) % 360) - 180;
      elCenter.textContent = fmt(TILT, lon);
    }
    if (elVisible) elVisible.textContent = `${String(visible).padStart(2, '0')} / ${String(SITES.length).padStart(2, '0')}`;
  }

  function tick() {
    if (state.target !== null) {
      const diff = ((state.target - state.rot + 540) % 360) - 180;
      if (Math.abs(diff) < 0.3) { state.rot = state.target; state.target = null; }
      else state.rot += diff * 0.12;
    } else if (state.spinning && !drag) {
      state.rot -= 0.12;
    }
    draw();
    requestAnimationFrame(tick);
  }

  // ----- dragging + cursor readout -----
  function svgPoint(e) {
    const r = svg.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * SIZE, y: (e.clientY - r.top) / r.height * SIZE };
  }
  svg.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, rot: state.rot }; moved = false; });
  window.addEventListener('pointermove', (e) => {
    if (drag) {
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 4) moved = true;
      if (moved) { state.rot = drag.rot - dx * 0.35; state.target = null; }
    }
  });
  svg.addEventListener('pointermove', (e) => {
    const p = svgPoint(e), ll = invert(p.x, p.y);
    if (ll) {
      elCursor.textContent = fmt(ll.lat, ll.lon);
      cursorDot.setAttribute('cx', p.x); cursorDot.setAttribute('cy', p.y); cursorDot.style.display = '';
    } else { elCursor.textContent = 'OFF GLOBE'; cursorDot.style.display = 'none'; }
  });
  svg.addEventListener('pointerleave', () => { elCursor.textContent = '—'; cursorDot.style.display = 'none'; });
  window.addEventListener('pointerup', () => { drag = null; setTimeout(() => { moved = false; }, 0); });

  // ----- layer switches -----
  const layerBox = document.getElementById('layers');
  const layerButtons = {};
  Object.keys(TYPES).forEach((k, i) => {
    const t = TYPES[k];
    const n = SITES.filter((s) => s.type === k).length;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'layer';
    b.style.setProperty('--c', t.color);
    b.setAttribute('aria-pressed', 'true');
    b.innerHTML = `<span class="state">[ON]</span>
      <span class="label-wrap"><strong>${t.label}</strong><small>${t.sub}</small></span>
      <span class="count">${String(n).padStart(2, '0')}</span>`;
    b.addEventListener('click', () => setLayer(k, !state.on[k]));
    layerButtons[k] = b;
    layerBox.appendChild(b);
  });
  function setLayer(k, on) {
    state.on[k] = on;
    layerButtons[k].setAttribute('aria-pressed', String(on));
    layerButtons[k].querySelector('.state').textContent = on ? '[ON]' : '[OFF]';
    if (!on && state.sel && SITES.find((s) => s.id === state.sel).type === k) select(null);
  }
  document.getElementById('show-all').addEventListener('click', () => Object.keys(TYPES).forEach((k) => setLayer(k, true)));

  const spinBtn = document.getElementById('spin');
  spinBtn.addEventListener('click', () => {
    state.spinning = !state.spinning;
    spinBtn.textContent = state.spinning ? 'Pause rotation' : 'Resume rotation';
  });

  // ----- info panel -----
  const info = document.getElementById('info');
  const emptyHTML = info.innerHTML;
  function select(id) {
    state.sel = id;
    if (!id) { info.innerHTML = emptyHTML; info.style.removeProperty('--accent'); return; }
    const s = SITES.find((x) => x.id === id), t = TYPES[s.type];
    const st = (window.STATS || {})[s.id] || {};
    state.spinning = false; spinBtn.textContent = 'Resume rotation';
    state.target = s.lon;
    info.style.setProperty('--accent', t.color);
    const extra = st.water_before != null ? `<div class="meta">OPEN WATER ${st.water_before}% → ${st.water_after}%</div>` : '';
    const short = s.text.split('. ').slice(0, 2).join('. ').replace(/\.?$/, '.');
    info.innerHTML = `
      <div class="panel-head"><span class="tag-type" style="--c:${t.color}">${t.label}</span><span class="label">Target locked</span></div>
      <h2>${s.name}</h2>
      <div class="meta">${s.place.toUpperCase()}<br>${fmt(s.lat, s.lon)}</div>
      <div class="meta">PASS ${s.before.toUpperCase()} → ${s.after.toUpperCase()}</div>
      ${extra}
      <p>${short}</p>
      <a class="btn btn-solid" href="${t.page}#${s.id}">Open radar images</a>
      <button type="button" class="link-btn" id="close-info" style="align-self:flex-start">[ Clear target ]</button>`;
    document.getElementById('close-info').addEventListener('click', () => select(null));
  }

  requestAnimationFrame(tick);
})();
