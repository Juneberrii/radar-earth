// Builds a section page (Burn Scars / Floods & Wetlands / Ground Motion) from js/sites.js
(function () {
  const type = document.body.dataset.type;
  const T = window.TYPES[type];
  const sites = window.SITES.filter((s) => s.type === type);
  const STATS = window.STATS || {};
  const $ = (id) => document.getElementById(id);
  const NOTE_MODE = location.search.includes('notes');
  let lensOn = false;

  document.documentElement.style.setProperty('--accent', T.color);

  // ----- location picker -----
  const picker = $('picker');
  sites.forEach((s, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.id = s.id;
    b.innerHTML = `${s.name}<small>${String(i + 1).padStart(2, '0')} · ${s.place}</small>`;
    b.addEventListener('click', () => { history.replaceState(null, '', location.search + '#' + s.id); show(s.id); });
    picker.appendChild(b);
  });

  // ----- before/after slider -----
  const slider = $('slider');
  function setSplit(v) {
    const after = document.querySelector('#viewer .after');
    const handle = document.querySelector('#viewer .handle');
    if (after) after.style.clipPath = `inset(0 0 0 ${v}%)`;
    if (handle) handle.style.left = v + '%';
  }
  if (slider) slider.addEventListener('input', () => setSplit(slider.value));

  function missing(img) {
    img.addEventListener('error', () => {
      img.style.visibility = 'hidden';
      const note = $('viewer').querySelector('.missing');
      note.style.display = 'flex';
      note.textContent = 'IMAGE NOT FOUND: website/' + img.getAttribute('src') + ' – run scripts/prepare_images.py';
    });
  }

  // ----- image notes -----
  function addNotes(viewer, s) {
    (s.notes || []).forEach((n, i) => {
      const pin = document.createElement('button');
      pin.type = 'button';
      pin.className = 'note-pin';
      pin.textContent = i + 1;
      pin.style.left = n.x + '%';
      pin.style.top = n.y + '%';
      pin.setAttribute('aria-label', 'Note ' + (i + 1) + ': ' + n.text);
      pin.setAttribute('aria-expanded', 'false');
      const box = document.createElement('div');
      box.className = 'note-box';
      box.textContent = n.text;
      box.style.display = 'none';
      // place the box on the side with more room
      box.style.left = n.x > 55 ? '' : `calc(${n.x}% + 20px)`;
      box.style.right = n.x > 55 ? `calc(${100 - n.x}% + 20px)` : '';
      box.style.top = `calc(${Math.min(n.y, 85)}% - 12px)`;
      const open = (on) => { box.style.display = on ? '' : 'none'; pin.setAttribute('aria-expanded', String(on)); };
      pin.addEventListener('mouseenter', () => open(true));
      pin.addEventListener('mouseleave', () => open(false));
      pin.addEventListener('focus', () => open(true));
      pin.addEventListener('blur', () => open(false));
      pin.addEventListener('click', (e) => { e.stopPropagation(); open(pin.getAttribute('aria-expanded') !== 'true'); });
      viewer.appendChild(pin);
      viewer.appendChild(box);
    });
    if (NOTE_MODE) {
      const out = document.createElement('div');
      out.className = 'note-coords';
      out.textContent = 'NOTE MODE: click the image to get x / y';
      viewer.appendChild(out);
    }
  }

  // ----- zoom lens -----
  function addLens(viewer) {
    const lens = document.createElement('div');
    lens.className = 'lens';
    viewer.appendChild(lens);
  }
  // listeners are attached once; they look up the current lens / images when they run
  (function () {
    const viewer = $('viewer');
    const ZOOM = 3;
    viewer.addEventListener('pointermove', (e) => {
      const lens = viewer.querySelector('.lens');
      if (!lens) return;
      if (!lensOn || e.pointerType === 'touch') { lens.style.display = 'none'; return; }
      const r = viewer.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const split = slider ? slider.value / 100 * r.width : 0;
      const img = viewer.querySelector(x < split ? '.before' : '.after') || viewer.querySelector('img');
      if (!img) return;
      lens.style.display = 'block';
      lens.style.left = (x - 85) + 'px';
      lens.style.top = (y - 85) + 'px';
      lens.style.backgroundImage = `url("${img.getAttribute('src')}")`;
      lens.style.backgroundSize = `${r.width * ZOOM}px ${r.height * ZOOM}px`;
      lens.style.backgroundPosition = `${-(x * ZOOM - 85)}px ${-(y * ZOOM - 85)}px`;
    });
    viewer.addEventListener('pointerleave', () => { const l = viewer.querySelector('.lens'); if (l) l.style.display = 'none'; });
    if (NOTE_MODE) viewer.addEventListener('click', (e) => {
      const out = viewer.querySelector('.note-coords');
      if (!out) return;
      const r = viewer.getBoundingClientRect();
      const x = Math.round((e.clientX - r.left) / r.width * 100), y = Math.round((e.clientY - r.top) / r.height * 100);
      out.textContent = `{ x: ${x}, y: ${y}, text: '…' },`;
    });
  })();
  const lensBtn = $('lens-btn');
  if (lensBtn) lensBtn.addEventListener('click', () => {
    lensOn = !lensOn;
    lensBtn.setAttribute('aria-pressed', String(lensOn));
    lensBtn.textContent = lensOn ? 'Zoom lens: on' : 'Zoom lens: off';
  });

  const VIEW_LABELS = { raw: 'Raw rainbow', clean: 'Sky removed', cm: 'Movement in cm' };

  function show(id) {
    const s = sites.find((x) => x.id === id) || sites[0];
    const st = STATS[s.id] || {};
    picker.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === s.id)));

    $('site-name').textContent = s.name;
    $('site-place').innerHTML = `${s.place.toUpperCase()} · ${Math.abs(s.lat).toFixed(2)}°${s.lat >= 0 ? 'N' : 'S'} ${Math.abs(s.lon).toFixed(2)}°${s.lon >= 0 ? 'E' : 'W'}<br>NISAR PASSES ${s.before.toUpperCase()} → ${s.after.toUpperCase()}`;
    $('site-text').textContent = s.text;
    $('site-why').textContent = s.why || '';
    $('site-matters').textContent = s.matters || '';
    $('why-panel').style.display = s.why ? '' : 'none';
    $('matters-panel').style.display = s.matters ? '' : 'none';
    $('site-source').textContent = 'Data: NASA–ISRO NISAR (provisional) via ASF DAAC. ' + s.source;

    const viewer = $('viewer');
    if (type === 'ground') {
      renderGround(s, st);
    } else {
      const bt = s.beforeTag || 'BEFORE', at = s.afterTag || 'AFTER';
      viewer.innerHTML = `
        <img class="before" src="images/${s.id}_before.png" alt="NISAR radar image of ${s.name}, ${s.place}, on ${s.before}">
        <img class="after" src="images/${s.id}_after.png" alt="NISAR radar image of ${s.name}, ${s.place}, on ${s.after}">
        <div class="crosshair"></div>
        <div class="handle"></div>
        <span class="tag left">${bt} · ${s.before.replace(', 2026', '').toUpperCase()}</span>
        <span class="tag right">${at} · ${s.after.replace(', 2026', '').toUpperCase()}</span>
        <div class="missing"></div>`;
      viewer.querySelectorAll('img').forEach(missing);
      setSplit(slider.value);
      addNotes(viewer, s);
      addLens(viewer);
    }

    // stats
    const stats = s.stats.slice();
    if (st.water_before != null) {
      stats.unshift(['Open water ' + s.after.replace(', 2026', ''), st.water_after + '%']);
      stats.unshift(['Open water ' + s.before.replace(', 2026', ''), st.water_before + '%']);
    }
    if (st.range_cm != null) stats.unshift(['Signal across scene', '≈ ' + st.range_cm + ' cm']);
    if (st.clean_cm != null) stats.splice(1, 0, ['After removing sky', '± ' + st.clean_cm + ' cm']);
    $('stats').innerHTML = stats.map(([k, v]) => `<div class="stat"><small>${k}</small><strong>${v}</strong></div>`).join('');

    // water chart
    const chart = $('water-chart');
    if (chart) {
      if (st.water_before != null) {
        const max = Math.max(st.water_before, st.water_after, 1);
        chart.style.display = '';
        chart.querySelector('.bars').innerHTML = [[s.before, st.water_before], [s.after, st.water_after]].map(([d, v], i) =>
          `<div class="bar ${i ? 'hi' : ''}"><b>${v}%</b><div class="track"><div style="height:${Math.max(4, v / max * 100)}%"></div></div><span>${d.replace(', 2026', '').toUpperCase()}</span></div>`).join('');
      } else chart.style.display = 'none';
    }
  }

  function renderGround(s, st) {
    const views = s.views || ['raw', 'cm'];
    const toggle = $('views');
    toggle.innerHTML = views.map((v) => `<button type="button" data-view="${v}">${VIEW_LABELS[v]}</button>`).join('');
    const setView = (v) => {
      toggle.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
      const file = v === 'raw' ? `${s.id}_fringes_raw.png` : v === 'clean' ? `${s.id}_fringes_clean.png` : `${s.id}_cm.png`;
      const viewer = $('viewer');
      viewer.innerHTML = `<img src="images/${file}" alt="NISAR interferogram of ${s.name}, ${s.place}, ${s.before} to ${s.after}" style="object-fit:contain"><div class="crosshair"></div><div class="missing"></div>`;
      missing(viewer.querySelector('img'));
      addNotes(viewer, s);
      addLens(viewer);
      const lim = st.cm_limit;
      $('legend').innerHTML = v === 'cm' && lim != null
        ? `<div class="colorbar" style="background:linear-gradient(90deg,#2166ac,#f7f7f7,#b2182b)"></div>
           <div class="label" style="display:flex;justify-content:space-between;margin-top:6px"><span>−${lim} cm away</span><span>0</span><span>+${lim} cm toward</span></div>`
        : `<div class="colorbar" style="background:linear-gradient(90deg,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)"></div>
           <div class="label" style="margin-top:6px">One full color cycle ≈ 12 cm change in distance to the satellite</div>`;
    };
    toggle.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));
    setView(views[0]);
  }

  window.addEventListener('hashchange', () => show(location.hash.slice(1)));
  show(location.hash.slice(1));
})();
