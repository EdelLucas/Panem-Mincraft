/* Oberfläche: Navigation, Ebenen-Steuerung, Bauplan (2D) und Materialliste. */
(function () {
  const $ = id => document.getElementById(id);
  const cache = new Map();
  const viewer = new Viewer($('view3d'));
  const SYMBOLS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  const state = { mode: 'all', layer: 0, explode: 'none', gap: 1, hiddenParts: new Set(), highlight: true, matScope: 'layer' };
  let cur = null; // { loc, data, layers, symbols }

  function load(loc) {
    if (!cache.has(loc.id)) {
      const data = loc.build().finish();
      const layers = Array.from({ length: data.size.y }, () => []);
      for (const bl of data.blocks) layers[bl.y].push(bl);
      const counts = countBlocks(data.blocks);
      const symbols = {};
      counts.forEach(([t], i) => { symbols[t] = SYMBOLS[i] || '?'; });
      cache.set(loc.id, { loc, data, layers, counts, symbols });
    }
    return cache.get(loc.id);
  }

  function countBlocks(list) {
    const m = new Map();
    for (const bl of list) m.set(bl.t, (m.get(bl.t) || 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1] || BLOCKS[a[0]].n.localeCompare(BLOCKS[b[0]].n));
  }

  /* ---------- Navigation ---------- */
  function buildNav() {
    const nav = $('nav'), pick = $('pick');
    for (const r of REGIONS) {
      const locs = LOCATIONS.filter(l => l.region === r.name);
      if (!locs.length) continue;
      const h = document.createElement('div'); h.className = 'region';
      h.innerHTML = `<span>${r.name}</span><small>${r.info}</small>`;
      nav.appendChild(h);
      const og = document.createElement('optgroup'); og.label = `${r.name} – ${r.info}`;
      for (const l of locs) {
        const btn = document.createElement('button');
        btn.textContent = l.name; btn.dataset.id = l.id;
        btn.addEventListener('click', () => { location.hash = l.id; });
        nav.appendChild(btn);
        const o = document.createElement('option'); o.value = l.id; o.textContent = l.name; og.appendChild(o);
      }
      pick.appendChild(og);
    }
    pick.addEventListener('change', () => { location.hash = pick.value; });
  }

  function select(id) {
    const loc = LOCATIONS.find(l => l.id === id) || LOCATIONS[0];
    cur = load(loc);
    document.querySelectorAll('nav button').forEach(b => b.setAttribute('aria-current', b.dataset.id === loc.id ? 'true' : 'false'));
    $('pick').value = loc.id;
    const reg = REGIONS.find(r => r.name === loc.region);
    $('region').textContent = loc.region + (reg ? ' · ' + reg.info : '');
    $('name').textContent = loc.name;
    $('desc').textContent = loc.desc;
    const s = cur.data.size;
    $('sx').textContent = s.x; $('sy').textContent = s.y; $('sz').textContent = s.z;
    $('sn').textContent = cur.data.blocks.length.toLocaleString('de-DE');
    $('st').textContent = cur.counts.length;
    document.title = loc.name + ' · Panem Bauanleitung';

    state.hiddenParts = new Set();
    state.layer = Math.min(state.layer, s.y - 1);
    if (state.mode === 'all') state.layer = 0;
    $('layer').max = s.y - 1;
    buildParts();
    viewer.setBuilding(cur.data);
    refresh();
  }

  function buildParts() {
    const box = $('parts'); box.innerHTML = '';
    cur.data.parts.forEach((p, i) => {
      const lab = document.createElement('label');
      const n = cur.data.blocks.filter(b => b.p === p).length;
      lab.innerHTML = `<input type="checkbox" checked> ${i + 1}. ${p} <small>(${n})</small>`;
      const cb = lab.querySelector('input');
      cb.addEventListener('change', () => {
        if (cb.checked) state.hiddenParts.delete(p); else state.hiddenParts.add(p);
        lab.classList.toggle('off', !cb.checked);
        refresh();
      });
      box.appendChild(lab);
    });
  }

  /* ---------- Steuerung ---------- */
  function seg(id, key, after) {
    const el = $(id);
    el.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      state[key] = b.dataset.v;
      if (after) after();
      refresh();
    });
  }
  function syncSeg(id, val) { $(id).querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === val ? 'true' : 'false')); }

  function setLayer(v) {
    if (!cur) return;
    state.layer = Math.max(0, Math.min(cur.data.size.y - 1, v));
    if (state.mode === 'all') state.mode = 'upto';
    refresh();
  }

  function refresh() {
    syncSeg('mode', state.mode); syncSeg('explode', state.explode); syncSeg('matScope', state.matScope);
    $('layer').value = state.layer;
    const n = cur.layers[state.layer].filter(b => !state.hiddenParts.has(b.p)).length;
    $('layerOut').textContent = `Y = ${state.layer} von ${cur.data.size.y - 1} · ${n} Bl.`;
    $('planTitle').textContent = `Bauplan Ebene ${state.layer}`;
    viewer.update(state);
    drawPlan();
    drawMats();
  }

  /* ---------- Bauplan ---------- */
  let planGeo = null;
  function isDark(hex) {
    const v = parseInt(hex.slice(1), 16);
    return (0.299 * (v >> 16) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255)) < 120;
  }
  function drawPlan() {
    const cv = $('plan'), wrap = cv.parentElement;
    const { x: W, z: D } = cur.data.size;
    const css = getComputedStyle(document.documentElement);
    const avail = Math.max(240, wrap.clientWidth - 2);
    const margin = 22;
    const cell = Math.max(10, Math.min(26, Math.floor((avail - margin) / W)));
    const w = margin + W * cell + 1, h = margin + D * cell + 1;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px';
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = css.getPropertyValue('--cell-empty'); g.fillRect(0, 0, w, h);

    const visible = b => !state.hiddenParts.has(b.p);
    const here = new Map();
    for (const b of cur.layers[state.layer]) if (visible(b)) here.set(b.x + ',' + b.z, b);
    if ($('ghost').checked && state.layer > 0) {
      g.fillStyle = css.getPropertyValue('--ghost');
      for (const b of cur.layers[state.layer - 1]) if (visible(b) && !here.has(b.x + ',' + b.z))
        g.fillRect(margin + b.x * cell, margin + b.z * cell, cell, cell);
    }
    g.font = `700 ${Math.round(cell * 0.5)}px system-ui, sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const b of here.values()) {
      const info = BLOCKS[b.t];
      const px = margin + b.x * cell, pz = margin + b.z * cell;
      g.fillStyle = info.c;
      const shape = info.shape || 'full';
      if (shape === 'fence' || shape === 'plant' || shape === 'small') {
        const i = cell * 0.22; g.fillRect(px + i, pz + i, cell - 2 * i, cell - 2 * i);
      } else g.fillRect(px, pz, cell, cell);
      if (shape === 'slab') { g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(px, pz + cell / 2, cell, cell / 2); }
      if (info.t) { g.strokeStyle = 'rgba(0,0,0,0.35)'; g.strokeRect(px + 2.5, pz + 2.5, cell - 5, cell - 5); }
      if (cell >= 13) { g.fillStyle = isDark(info.c) ? '#fff' : '#000'; g.fillText(cur.symbols[b.t], px + cell / 2, pz + cell / 2 + 0.5); }
    }
    // Raster
    g.strokeStyle = css.getPropertyValue('--cell-grid'); g.lineWidth = 1;
    g.beginPath();
    for (let x = 0; x <= W; x++) { g.moveTo(margin + x * cell + 0.5, margin); g.lineTo(margin + x * cell + 0.5, margin + D * cell); }
    for (let z = 0; z <= D; z++) { g.moveTo(margin, margin + z * cell + 0.5); g.lineTo(margin + W * cell, margin + z * cell + 0.5); }
    g.stroke();
    g.strokeStyle = css.getPropertyValue('--muted'); g.globalAlpha = 0.5; g.beginPath();
    for (let x = 0; x <= W; x += 5) { g.moveTo(margin + x * cell + 0.5, margin); g.lineTo(margin + x * cell + 0.5, margin + D * cell); }
    for (let z = 0; z <= D; z += 5) { g.moveTo(margin, margin + z * cell + 0.5); g.lineTo(margin + W * cell, margin + z * cell + 0.5); }
    g.stroke(); g.globalAlpha = 1;
    // Achsen
    g.fillStyle = css.getPropertyValue('--muted'); g.font = '10px system-ui, sans-serif';
    for (let x = 0; x < W; x += 5) g.fillText(x, margin + x * cell + cell / 2, margin / 2);
    for (let z = 0; z < D; z += 5) g.fillText(z, margin / 2, margin + z * cell + cell / 2);
    planGeo = { margin, cell, W, D, here };

    // Legende (nur Blöcke dieser Ebene)
    const types = countBlocks([...here.values()]);
    $('legend').innerHTML = types.length ? types.map(([t]) => {
      const i = BLOCKS[t];
      return `<span><i class="sw${isDark(i.c) ? ' dark' : ''}" style="background:${i.c}">${cur.symbols[t]}</i>${i.n}</span>`;
    }).join('') : '<span>Auf dieser Ebene sind keine Blöcke (Luft).</span>';
  }

  function planHover(e) {
    if (!planGeo) return;
    const cv = $('plan'), r = cv.getBoundingClientRect(), tip = $('tip');
    const x = Math.floor((e.clientX - r.left - planGeo.margin) / planGeo.cell);
    const z = Math.floor((e.clientY - r.top - planGeo.margin) / planGeo.cell);
    if (x < 0 || z < 0 || x >= planGeo.W || z >= planGeo.D) { tip.hidden = true; return; }
    const b = planGeo.here.get(x + ',' + z);
    tip.textContent = `X ${x} · Y ${state.layer} · Z ${z} — ` + (b ? `${BLOCKS[b.t].n} (minecraft:${BLOCKS[b.t].id})` : 'Luft');
    tip.hidden = false;
    const wrap = cv.parentElement;
    tip.style.left = (e.clientX - wrap.getBoundingClientRect().left + wrap.scrollLeft + 12) + 'px';
    tip.style.top = (e.clientY - wrap.getBoundingClientRect().top + wrap.scrollTop + 12) + 'px';
  }

  /* ---------- Materialliste ---------- */
  function stacks(n) {
    const s = Math.floor(n / 64), r = n % 64;
    if (!s) return '–';
    return r ? `${s} × 64 + ${r}` : `${s} × 64`;
  }
  function drawMats() {
    let list = state.matScope === 'layer' ? cur.layers[state.layer] : cur.data.blocks;
    list = list.filter(b => !state.hiddenParts.has(b.p));
    const rows = countBlocks(list);
    const total = rows.reduce((a, r) => a + r[1], 0);
    $('matBody').innerHTML = rows.map(([t, n]) => {
      const i = BLOCKS[t];
      return `<tr><td><i class="sw${isDark(i.c) ? ' dark' : ''}" style="background:${i.c}">${cur.symbols[t]}</i></td>
        <td>${i.n}<small>minecraft:${i.id}</small></td><td class="num">${n.toLocaleString('de-DE')}</td><td class="num">${stacks(n)}</td></tr>`;
    }).join('') + `<tr><td></td><td><strong>Summe</strong></td><td class="num"><strong>${total.toLocaleString('de-DE')}</strong></td><td class="num">${stacks(total)}</td></tr>`;
  }

  /* ---------- Ereignisse ---------- */
  buildNav();
  seg('mode', 'mode');
  seg('explode', 'explode');
  seg('matScope', 'matScope');
  $('layer').addEventListener('input', e => setLayer(+e.target.value));
  $('prev').addEventListener('click', () => setLayer(state.layer - 1));
  $('next').addEventListener('click', () => setLayer(state.layer + 1));
  $('gap').addEventListener('input', e => { state.gap = +e.target.value; refresh(); });
  $('ghost').addEventListener('change', drawPlan);
  $('plan').addEventListener('mousemove', planHover);
  $('plan').addEventListener('mouseleave', () => { $('tip').hidden = true; });
  document.querySelector('.view-tools').addEventListener('click', e => {
    const a = e.target.closest('button')?.dataset.act;
    if (a === 'rotl') viewer.rotate(-Math.PI / 8);
    if (a === 'rotr') viewer.rotate(Math.PI / 8);
    if (a === 'zin') viewer.zoom(0.85);
    if (a === 'zout') viewer.zoom(1.18);
    if (a === 'fit') { viewer.fit(); viewer.update(state); }
  });
  document.addEventListener('keydown', e => {
    if (e.target.matches('input, select, textarea')) return;
    if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); setLayer(state.layer + 1); }
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); setLayer(state.layer - 1); }
  });
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => cur && drawPlan(), 150); });
  window.addEventListener('hashchange', () => select(location.hash.slice(1)));
  select(location.hash.slice(1));
})();
