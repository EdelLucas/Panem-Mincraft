/*
 * DAS KAPITOL – im echten Maßstab: 1 Block = 1 Meter.
 * Nachgebaut nach Filmbildern (Stadtkreis, Paradeallee, Trainingscenter,
 * Präsidentenpalast, Prachtboulevard, Seepavillon, Goldkuppel, Hochhausviertel).
 * Jeder Abschnitt hat eine feste Position (world) in der Gesamtkarte, damit
 * alle Teile in Minecraft exakt aneinanderpassen. Ursprung der Karte (0|0) ist
 * die Mitte des Stadtkreises. x = Osten, z = Süden.
 */

/* ---------- Hilfen ---------- */
function angDeg(x, z, cx, cz) { let a = Math.atan2(z - cz, x - cx) * 180 / Math.PI; return a < 0 ? a + 360 : a; }
function inArc(a, a1, a2) { return a1 <= a2 ? (a >= a1 && a <= a2) : (a >= a1 || a <= a2); }
/** Tangentialer Abstand zur nächsten Winkel-Teilung (in Blöcken). */
function nearRay(x, z, cx, cz, step) {
  const r = Math.hypot(x - cx, z - cz), a = angDeg(x, z, cx, cz);
  const d = Math.min(a % step, step - (a % step));
  return r * Math.sin(d * Math.PI / 180);
}

/**
 * Hochhaus mit Fensterraster im Art-déco-Stil.
 * tiers: [{inset, h}] – Rücksprünge nach oben. bay: Achsabstand der Pfeiler. fh: Geschosshöhe.
 */
function tower(b, x1, z1, x2, z2, y0, tiers, o = {}) {
  const wall = o.wall || 'smooth_stone', win = o.win || 'gray_stained_glass', pier = o.pier || wall;
  const bay = o.bay || 3, fh = o.fh || 4, roof = o.roof || wall;
  let y = y0;
  tiers.forEach((t, ti) => {
    const ax = x1 + t.inset, bx = x2 - t.inset, az = z1 + t.inset, bz = z2 - t.inset;
    const top = y + t.h - 1;
    for (let yy = y; yy <= top; yy++) {
      const fl = (yy - y0) % fh;
      const winRow = o.band ? fl !== 0 : (fl === 1 || fl === 2);
      const isWin = (c, a) => winRow && yy > y0 && (c - a) % bay !== 0;
      for (let x = ax; x <= bx; x++) {
        const edge = x === ax || x === bx;
        b.set(x, yy, az, edge ? pier : isWin(x, ax) ? win : ((x - ax) % bay === 0 ? pier : wall));
        b.set(x, yy, bz, edge ? pier : isWin(x, ax) ? win : ((x - ax) % bay === 0 ? pier : wall));
      }
      for (let z = az + 1; z < bz; z++) {
        b.set(ax, yy, z, isWin(z, az) ? win : ((z - az) % bay === 0 ? pier : wall));
        b.set(bx, yy, z, isWin(z, az) ? win : ((z - az) % bay === 0 ? pier : wall));
      }
    }
    b.fill(ax, top + 1, az, bx, top + 1, bz, roof);
    if (o.crown) b.ring(ax, az, bx, bz, top + 1, o.crown);
    y = top + 2;
    if (ti === tiers.length - 1 && o.spire) b.fill(Math.round((ax + bx) / 2), y, Math.round((az + bz) / 2), Math.round((ax + bx) / 2), y + o.spire, Math.round((az + bz) / 2), o.spireT || 'iron_bars');
  });
  return y;
}

/** Großes Kapitol-Banner (rot mit goldenem Ring) auf einer Fassade. axis: 'x' = Fassade liegt in x-Richtung (feste z). */
function banner(b, axis, c, fixed, yTop, w, h) {
  const half = Math.floor(w / 2);
  for (let i = -half; i <= half; i++) for (let y = yTop - h + 1; y <= yTop; y++) {
    if (axis === 'x') b.set(c + i, y, fixed, 'red_wool'); else b.set(fixed, y, c + i, 'red_wool');
  }
  const cy = yTop - Math.floor(h / 3), r = Math.max(1, Math.floor(w / 3));
  for (let i = -half; i <= half; i++) for (let y = cy - r - 1; y <= cy + r + 1; y++) {
    const d = Math.hypot(i, y - cy);
    if (d >= r - 0.5 && d < r + 0.5) { if (axis === 'x') b.set(c + i, y, fixed, 'gold_block'); else b.set(fixed, y, c + i, 'gold_block'); }
  }
  if (axis === 'x') b.fill(c - half, yTop + 1, fixed, c + half, yTop + 1, fixed, 'gold_block');
  else b.fill(fixed, yTop + 1, c - half, fixed, yTop + 1, c + half, 'gold_block');
}

/** Stufentribüne: fn(x,z) liefert Stufe k (0 = vorne unten) oder -1. */
function grandstand(b, x1, z1, x2, z2, kFn, aisleFn) {
  for (let x = x1; x <= x2; x++) for (let z = z1; z <= z2; z++) {
    const k = kFn(x, z);
    if (k < 0) continue;
    const h = 1 + k;
    const top = aisleFn && aisleFn(x, z) ? 'stone_bricks' : (k % 2 === 1 ? 'red_concrete' : 'smooth_stone');
    b.set(x, h, z, top);
    if (h > 1) b.set(x, h - 1, z, 'stone_bricks');
  }
}

/* ====================== Abschnitte ====================== */

const KAPITOL = [
{
  id: 'kapitol-karte', region: 'Kapitol', name: 'Gesamtkarte des Kapitols', map: true,
  desc: 'Lageplan aller Kapitol-Abschnitte im echten Maßstab (1 Block = 1 Meter). Jeder Abschnitt hat feste Koordinaten – baust du sie an diesen Stellen, passen Stadtkreis, Paradeallee, Trainingscenter, Palast, Boulevard, See und Hochhausviertel genau zusammen. Klicke auf einen Abschnitt, um seine Bauanleitung zu öffnen.',
},
{
  id: 'kapitol-stadtkreis', view: { theta: 1.85, phi: 0.95 }, region: 'Kapitol', name: 'Stadtkreis (City Circle)', world: { x: -75, z: -75 },
  desc: 'Der große runde Platz im Zentrum des Kapitols, Ziel der Tributenparade: 150 m Durchmesser, Pflaster mit weißen Ringlinien und Lorbeerkranz, geschwungene Tribünen mit roten Sitzreihen, hohe Rückwände mit Kapitol-Bannern, Feuerschalen und im Süden die goldene Tribüne des Präsidenten. Im Norden mündet die Paradeallee.',
  build() {
    const b = new Build();
    const C = 75;
    b.part('Platzboden');
    for (let x = 0; x <= 150; x++) for (let z = 0; z <= 150; z++) {
      const r = Math.hypot(x - C, z - C);
      if (r > 75.4) continue;
      let t = 'polished_andesite';
      if ((r >= 11.5 && r < 12.5) || (r >= 29.5 && r < 30.5) || (r >= 53.5 && r < 54.5)) t = 'smooth_quartz';
      else if (r > 30 && r < 54 && nearRay(x, z, C, C, 30) < 0.5) t = 'smooth_quartz';
      else if (r < 11.5 && (x + z) % 2 === 0) t = 'smooth_stone';
      b.set(x, 0, z, t);
    }
    b.part('Lorbeerkranz');
    for (let i = 0; i < 72; i++) {
      const a = i * 5 * Math.PI / 180, rr = 20 + (i % 2 ? 1.6 : -1.6);
      for (const da of [0, 0.03]) b.set(C + Math.cos(a + da) * rr, 0, C + Math.sin(a + da) * rr, 'smooth_quartz');
      b.set(C + Math.cos(a) * 20, 0, C + Math.sin(a) * 20, 'smooth_quartz');
    }
    b.cyl(C, C, 4, 0, 0, 'gold_block', true);
    b.part('Tribünen');
    const arcs = [[115, 245], [295, 65]];
    const inArcs = a => arcs.some(([a1, a2]) => inArc(a, a1, a2));
    grandstand(b, 0, 0, 150, 150, (x, z) => {
      const r = Math.hypot(x - C, z - C);
      if (r < 57 || r >= 72) return -1;
      if (!inArcs(angDeg(x, z, C, C))) return -1;
      return Math.floor(r - 57);
    }, (x, z) => nearRay(x, z, C, C, 15) < 1);
    for (let x = 0; x <= 150; x++) for (let z = 0; z <= 150; z++) {
      const r = Math.hypot(x - C, z - C), a = angDeg(x, z, C, C);
      if (!inArcs(a)) continue;
      if (r >= 56 && r < 57) b.set(x, 1, z, 'polished_andesite');
    }
    b.part('Rückwände');
    for (let x = 0; x <= 150; x++) for (let z = 0; z <= 150; z++) {
      const r = Math.hypot(x - C, z - C), a = angDeg(x, z, C, C);
      if (!inArcs(a) || r < 72 || r >= 74) continue;
      b.fill(x, 1, z, x, 22, z, 'stone_bricks');
      b.set(x, 23, z, 'chiseled_stone_bricks');
    }
    b.part('Banner');
    for (const [a1, a2] of arcs) {
      for (let a = a1 + 10; ; a += 20) {
        const aa = a % 360;
        if (!inArc(aa, a1, a2) || !inArc((aa + 3) % 360, a1, a2)) break;
        const rad = aa * Math.PI / 180;
        for (let w = -2; w <= 2; w++) for (let y = 16; y <= 22; y++) {
          const px = C + Math.cos(rad) * 71.4 - Math.sin(rad) * w, pz = C + Math.sin(rad) * 71.4 + Math.cos(rad) * w;
          b.set(px, y, pz, y === 19 && Math.abs(w) <= 1 ? 'gold_block' : 'red_wool');
        }
        if (a > 400) break;
      }
    }
    b.part('Feuerschalen');
    for (let a = 0; a < 360; a += 20) {
      if (!inArcs(a)) continue;
      const px = Math.round(C + Math.cos(a * Math.PI / 180) * 54.5), pz = Math.round(C + Math.sin(a * Math.PI / 180) * 54.5);
      b.fill(px, 1, pz, px, 3, pz, 'polished_andesite');
      b.ring(px - 1, pz - 1, px + 1, pz + 1, 4, 'polished_blackstone');
      b.set(px, 4, pz, 'glowstone');
    }
    b.part('Präsidententribüne');
    b.fill(69, 1, 131, 81, 5, 141, 'quartz_block');
    b.fill(69, 6, 131, 81, 6, 141, 'smooth_quartz');
    b.fill(69, 7, 131, 81, 7, 131, 'gold_block');
    b.fill(69, 7, 131, 69, 7, 135, 'gold_block'); b.fill(81, 7, 131, 81, 7, 135, 'gold_block');
    b.fill(74, 7, 132, 76, 8, 132, 'gold_block');
    for (let i = 0; i < 6; i++) b.fill(73, 1, 142 + i, 77, 5 - i, 142 + i, 'quartz_block');
    return b;
  }
},
{
  id: 'kapitol-allee', view: { theta: 1.75, phi: 0.95 }, region: 'Kapitol', name: 'Paradeallee mit Tribünen', world: { x: -60, z: -296 },
  desc: 'Die 220 m lange Prachtstraße der Tributenparade zwischen Trainingscenter (Norden) und Stadtkreis (Süden): 40 m breite Fahrbahn, auf beiden Seiten steile Tribünen mit roten Sitzblöcken und Treppengängen, goldene Laternenmasten mit Fahnen und dahinter monumentale Gebäude mit riesigen Kapitol-Bannern.',
  build() {
    const b = new Build();
    b.part('Straße');
    for (let x = 0; x <= 120; x++) for (let z = 0; z <= 220; z++) {
      let t = 'stone';
      if (x >= 36 && x <= 84) t = (x >= 40 && x <= 80) ? 'smooth_stone' : 'polished_andesite';
      if (x >= 59 && x <= 61 && z % 10 < 6) t = 'smooth_quartz';
      b.set(x, 0, z, t);
    }
    b.part('Tribünen');
    const cross = z => z >= 100 && z <= 111;
    grandstand(b, 20, 0, 35, 220, (x, z) => cross(z) ? -1 : 35 - x, (x, z) => z % 24 === 12);
    grandstand(b, 85, 0, 100, 220, (x, z) => cross(z) ? -1 : x - 85, (x, z) => z % 24 === 12);
    b.part('Laternen & Fahnen');
    for (let z = 4; z <= 216; z += 12) for (const x of [38, 82]) {
      if (cross(z)) continue;
      b.fill(x, 1, z, x, 7, z, 'polished_andesite');
      b.set(x, 8, z, 'gold_block'); b.set(x, 9, z, 'lantern');
      b.fill(x, 4, z + 1, x, 7, z + 1, 'red_wool');
    }
    b.part('Gebäude West');
    const segs = [[0, 46, 38], [50, 96, 46], [115, 160, 34], [164, 220, 42]];
    segs.forEach(([z1, z2, h], i) => {
      tower(b, 0, z1, 18, z2, 1, [{ inset: 0, h }], { wall: i % 2 ? 'polished_andesite' : 'stone_bricks', pier: 'smooth_stone', bay: 3 });
      banner(b, 'z', Math.round((z1 + z2) / 2), 19, h - 2, 9, Math.min(26, h - 8));
    });
    b.part('Gebäude Ost');
    segs.forEach(([z1, z2, h], i) => {
      const hh = h + (i % 2 ? -6 : 6);
      tower(b, 102, z1, 120, z2, 1, [{ inset: 0, h: hh }], { wall: i % 2 ? 'stone_bricks' : 'polished_andesite', pier: 'smooth_stone', bay: 3 });
      banner(b, 'z', Math.round((z1 + z2) / 2), 101, hh - 2, 9, Math.min(26, hh - 8));
    });
    return b;
  }
},
{
  id: 'kapitol-trainingscenter', region: 'Kapitol', name: 'Trainingscenter', world: { x: -60, z: -357 },
  desc: 'Das Trainingscenter am Nordende der Paradeallee: ein rund 137 m hoher Mittelturm (mit Goldspitze) im Art-déco-Stil mit Rücksprüngen und vertikalen Pfeilern, flankiert von zwei rund 102 m hohen Türmen und niedrigen Verbindungsbauten. Im Mittelturm liegen die Tribut-Etagen (eine pro Distrikt, Geschosshöhe 4 m).',
  build() {
    const b = new Build();
    b.part('Vorplatz');
    b.fill(0, 0, 0, 120, 0, 60, 'polished_andesite');
    b.fill(52, 0, 46, 68, 0, 60, 'smooth_quartz');
    b.part('Verbindungsbauten');
    tower(b, 31, 24, 41, 44, 1, [{ inset: 0, h: 24 }], { wall: 'smooth_stone', pier: 'polished_andesite' });
    tower(b, 79, 24, 89, 44, 1, [{ inset: 0, h: 24 }], { wall: 'smooth_stone', pier: 'polished_andesite' });
    b.part('Seitentürme');
    for (const x1 of [12, 90]) {
      tower(b, x1, 22, x1 + 18, 40, 1, [{ inset: 0, h: 84 }, { inset: 2, h: 12 }, { inset: 4, h: 4 }], { wall: 'smooth_stone', pier: 'polished_diorite', crown: 'polished_andesite', spire: 0 });
      banner(b, 'x', x1 + 9, 41, 78, 9, 44);
    }
    b.part('Mittelturm');
    tower(b, 42, 12, 78, 46, 1, [{ inset: 0, h: 96 }, { inset: 3, h: 20 }, { inset: 7, h: 14 }], { wall: 'smooth_stone', pier: 'polished_diorite', crown: 'polished_andesite', spire: 4, spireT: 'gold_block' });
    b.part('Tribut-Etagen');
    for (let k = 1; k <= 13; k++) b.fill(43, 1 + 4 * k, 13, 77, 1 + 4 * k, 45, 'smooth_stone');
    b.part('Eingang');
    b.fill(53, 1, 46, 67, 14, 46, 'glass');
    for (let x = 53; x <= 67; x += 3) b.fill(x, 1, 46, x, 14, 46, 'polished_diorite');
    b.fill(51, 15, 46, 69, 15, 50, 'gold_block');
    b.fill(57, 1, 46, 63, 6, 46, null);
    return b;
  }
},
{
  id: 'kapitol-palast', view: { theta: -1.1, phi: 1.1 }, region: 'Kapitol', name: 'Präsidentenpalast', world: { x: -65, z: 80 },
  desc: 'Der Palast von Präsident Snow im Stil eines französischen Schlosses: 77 m breite Sandsteinfassade mit drei Geschossen, hohes Mansarddach aus Schiefer, Mittelrisalit mit quadratischer Kuppel, Eckpavillons, Terrasse mit breiter Freitreppe, Löwenstatuen, Formschnitt-Gärten und Snows Rosengewächshaus. Die Fassade blickt nach Norden zum Stadtkreis.',
  build() {
    const b = new Build();
    b.part('Gärten');
    b.fill(0, 0, 0, 130, 0, 150, 'grass_block');
    b.fill(55, 0, 0, 75, 0, 71, 'gravel');
    for (const [x1, x2] of [[20, 48], [82, 110]]) for (const [z1, z2] of [[6, 28], [36, 62]]) {
      b.ring(x1, z1, x2, z2, 1, 'oak_leaves');
      b.fill(x1 + 3, 0, z1 + 3, x2 - 3, 0, z2 - 3, 'gravel');
      b.fill(x1 + 4, 0, z1 + 4, x2 - 4, 0, z2 - 4, 'grass_block');
    }
    for (let z = 6; z <= 62; z += 14) for (const x of [52, 78]) {
      b.ring(x - 1, z - 1, x + 1, z + 1, 1, 'cut_sandstone'); b.set(x, 1, z, 'grass_block');
      b.fill(x - 1, 2, z - 1, x + 1, 3, z + 1, 'oak_leaves');
    }
    b.part('Rosengewächshaus');
    b.walls(4, 1, 36, 16, 6, 60, 'glass');
    for (let z = 36; z <= 60; z += 4) { b.fill(4, 1, z, 4, 6, z, 'white_concrete'); b.fill(16, 1, z, 16, 6, z, 'white_concrete'); }
    b.gable(4, 36, 16, 60, 7, 'glass', 'glass', 'z', 36, 60, 'white_concrete');
    b.fill(16, 1, 47, 16, 3, 49, null);
    for (let z = 38; z <= 58; z++) for (const x of [6, 7, 13, 14]) b.set(x, 1, z, (z + x) % 5 ? 'white_tulip' : 'rose_bush');
    b.part('Terrasse & Freitreppe');
    b.walls(20, 1, 78, 110, 3, 99, 'cut_sandstone');
    b.fill(21, 3, 79, 109, 3, 99, 'smooth_sandstone');
    b.ring(20, 78, 110, 99, 4, 'smooth_sandstone_slab');
    for (let j = 1; j <= 6; j++) {
      const z = 71 + j, full = Math.floor(j / 2);
      b.fill(45, 4, z, 85, 4, z, null);
      if (full) b.fill(45, 1, z, 85, full, z, 'smooth_sandstone');
      if (j % 2) b.fill(45, full + 1, z, 85, full + 1, z, 'smooth_sandstone_slab');
    }
    b.fill(45, 4, 78, 85, 4, 78, null);
    for (const x of [44, 86]) { b.fill(x, 1, 72, x, 3, 78, 'cut_sandstone'); b.fill(x, 4, 72, x, 4, 78, 'smooth_sandstone_slab'); }
    for (const x of [44, 86]) { b.fill(x, 4, 72, x, 4, 73, 'cut_sandstone'); b.fill(x, 5, 72, x, 6, 73, 'calcite'); b.set(x, 7, 72, 'calcite'); }
    b.part('Sockel & Geschossdecken');
    b.fill(27, 1, 100, 103, 3, 121, 'cut_sandstone');
    b.fill(55, 1, 97, 75, 3, 99, 'cut_sandstone');
    b.fill(28, 9, 101, 102, 9, 120, 'oak_planks');
    b.fill(28, 14, 101, 102, 14, 120, 'oak_planks');
    b.part('Fassade');
    const facade = (x1, x2, zf, zb) => {
      for (let y = 4; y <= 19; y++) {
        const row = (y >= 5 && y <= 8) ? 1 : (y >= 10 && y <= 13) ? 2 : (y >= 16 && y <= 18) ? 3 : 0;
        for (let x = x1; x <= x2; x++) {
          const m = (x - x1) % 4, win = row && (m === 2 || m === 3) && x > x1 && x < x2;
          const t = win ? 'gray_stained_glass' : (m === 0 ? 'cut_sandstone' : (y === 9 || y === 14 ? 'chiseled_sandstone' : 'smooth_sandstone'));
          b.set(x, y, zf, t); b.set(x, y, zb, t);
        }
        for (let z = zf + 1; z < zb; z++) {
          const m = (z - zf) % 4, win = row && (m === 2 || m === 3);
          const t = win ? 'gray_stained_glass' : 'smooth_sandstone';
          b.set(x1, y, z, t); b.set(x2, y, z, t);
        }
      }
    };
    facade(27, 103, 100, 121);
    b.ring(26, 99, 104, 122, 20, 'chiseled_sandstone');
    b.part('Mittelrisalit');
    facade(55, 75, 97, 100);
    for (const x of [56, 58, 72, 74]) b.fill(x, 4, 96, x, 19, 96, 'quartz_pillar');
    b.fill(55, 20, 96, 75, 20, 99, 'chiseled_sandstone');
    for (let k = 0; k < 3; k++) b.fill(58 + 2 * k, 21 + k, 96, 72 - 2 * k, 21 + k, 97, 'cut_sandstone');
    b.fill(64, 1, 96, 66, 3, 96, 'smooth_sandstone_slab');
    b.fill(63, 4, 97, 67, 8, 97, null);
    b.part('Eckpavillons');
    for (const x1 of [27, 95]) { facade(x1, x1 + 8, 98, 100); b.ring(x1 - 1, 97, x1 + 9, 101, 20, 'chiseled_sandstone'); }
    b.part('Mansarddach');
    const prof = [0, 0, 1, 1, 2, 2, 3, 3];
    prof.forEach((ins, i) => {
      const y = 21 + i;
      b.ring(27 + ins, 100 + ins, 103 - ins, 121 - ins, y, 'deepslate_tiles');
    });
    b.fill(30, 29, 103, 100, 29, 118, 'deepslate_tiles');
    for (let x = 31; x <= 99; x += 4) {
      if (x > 53 && x < 77) continue;
      b.fill(x, 22, 99, x + 1, 24, 99, 'cut_sandstone'); b.fill(x, 22, 100, x + 1, 23, 100, 'gray_stained_glass');
      b.fill(x, 25, 99, x + 1, 25, 99, 'deepslate_tile_slab');
    }
    for (const x1 of [27, 95]) {
      [0, 0, 1, 1, 2, 2, 3, 3, 4, 4].forEach((ins, i) => b.ring(x1 + ins, 98 + ins, x1 + 8 - ins, 108 - ins, 21 + i, 'deepslate_tiles'));
      b.fill(x1 + 4, 31, 102, x1 + 4, 33, 104, 'deepslate_tiles');
    }
    b.part('Kuppel');
    const dome = [0, 0, 0, 0, 1, 1, 1, 2, 2, 3, 4, 5, 6, 7];
    dome.forEach((ins, i) => {
      const y = 21 + i;
      b.ring(57 + ins, 101 + ins, 73 - ins, 117 - ins, y, 'deepslate_tiles');
    });
    b.fill(64, 35, 108, 66, 35, 110, 'deepslate_tiles');
    for (const [x, z] of [[65, 101], [65, 117], [57, 109], [73, 109]]) {
      b.set(x, 25, z, 'gray_stained_glass'); b.set(x, 26, z, 'gray_stained_glass');
      for (const d of [-1, 1]) { if (z === 101 || z === 117) { b.set(x + d, 25, z, 'cut_sandstone'); b.set(x + d, 26, z, 'cut_sandstone'); } else { b.set(x, 25, z + d, 'cut_sandstone'); b.set(x, 26, z + d, 'cut_sandstone'); } }
      b.set(x, 27, z, 'cut_sandstone');
    }
    b.walls(64, 36, 108, 66, 38, 110, 'cut_sandstone');
    b.set(65, 37, 108, 'gray_stained_glass'); b.set(65, 37, 110, 'gray_stained_glass');
    b.fill(64, 39, 108, 66, 39, 110, 'deepslate_tiles');
    b.fill(65, 40, 109, 65, 42, 109, 'gold_block');
    b.part('Park hinter dem Palast');
    for (let x = 10; x <= 120; x += 15) b.tree(x, 1, 140, 7, 'oak');
    return b;
  }
},
{
  id: 'kapitol-boulevard', view: { theta: 3.6, phi: 1.0 }, region: 'Kapitol', name: 'Prachtboulevard & Regierungspalast', world: { x: 80, z: -50 },
  desc: 'Der lange Boulevard östlich des Stadtkreises: Wasserbecken in Reihe, quadratische Pflanzinseln mit Bäumen, Lichtobelisken mit Goldspitze und rote Fahnen. Am Ende erhebt sich der weiße Regierungspalast mit 35 m hoher Säulenfront, Seitenflügeln und gestuften Ecktürmen.',
  build() {
    const b = new Build();
    b.part('Boden');
    for (let x = 0; x <= 300; x++) for (let z = 0; z <= 100; z++)
      b.set(x, 0, z, (z < 10 || z > 90) ? 'grass_block' : ((x + z) % 8 === 0 ? 'polished_andesite' : 'smooth_stone'));
    for (let x = 6; x <= 240; x += 14) { b.tree(x, 1, 4, 6, 'oak'); b.tree(x, 1, 96, 6, 'oak'); }
    b.part('Wasserbecken');
    for (let x0 = 4; x0 + 34 <= 238; x0 += 40) {
      b.ring(x0, 36, x0 + 34, 64, 1, 'smooth_quartz');
      b.fill(x0 + 1, 0, 37, x0 + 33, 0, 63, 'water');
      for (const [x1, z1, z2] of [[x0 + 4, 24, 31], [x0 + 4, 69, 76]]) {
        b.ring(x1, z1, x1 + 26, z2, 1, 'smooth_quartz');
        b.fill(x1 + 1, 0, z1 + 1, x1 + 25, 0, z2 - 1, 'water');
      }
      b.fill(x0 + 16, 1, 49, x0 + 18, 2, 51, 'smooth_quartz'); b.set(x0 + 17, 3, 50, 'water');
    }
    b.part('Pflanzinseln');
    for (let x = 10; x <= 232; x += 24) for (const z of [14, 82]) {
      b.walls(x, 1, z, x + 5, 2, z + 5, 'polished_andesite');
      b.fill(x + 1, 2, z + 1, x + 4, 2, z + 4, 'grass_block');
      b.tree(x + 2, 3, z + 2, 4, 'oak');
    }
    b.part('Obelisken & Fahnen');
    for (let x = 2; x <= 238; x += 12) for (const z of [33, 67]) {
      b.fill(x, 1, z, x, 9, z, 'polished_andesite'); b.set(x, 10, z, 'gold_block');
    }
    for (let x = 8; x <= 238; x += 24) for (const z of [21, 79]) {
      b.fill(x, 1, z, x, 12, z, 'iron_bars'); b.fill(x + 1, 7, z, x + 2, 12, z, 'red_wool');
    }
    b.part('Freitreppe');
    for (let i = 0; i < 6; i++) b.fill(240 + i, 1, 20, 240 + i, 1 + i, 80, 'smooth_quartz');
    b.part('Regierungspalast');
    b.fill(246, 1, 5, 300, 6, 95, 'quartz_block');
    tower(b, 255, 30, 292, 70, 7, [{ inset: 0, h: 42 }, { inset: 4, h: 8 }], { wall: 'white_concrete', pier: 'smooth_quartz', win: 'black_stained_glass', bay: 4, fh: 5 });
    for (let z = 30; z <= 70; z += 3) b.fill(250, 7, z, 250, 41, z, 'quartz_pillar');
    b.fill(249, 42, 29, 254, 45, 71, 'smooth_quartz');
    b.fill(251, 7, 32, 254, 7, 68, 'smooth_quartz');
    for (const [z1, z2] of [[8, 29], [71, 92]]) tower(b, 258, z1, 296, z2, 7, [{ inset: 0, h: 30 }], { wall: 'white_concrete', pier: 'smooth_quartz', win: 'black_stained_glass', bay: 3 });
    for (const [z1, z2] of [[5, 17], [83, 95]]) tower(b, 258, z1, 270, z2, 7, [{ inset: 0, h: 44 }, { inset: 2, h: 10 }, { inset: 4, h: 6 }], { wall: 'smooth_quartz', pier: 'white_concrete', win: 'black_stained_glass', bay: 3, spire: 5, spireT: 'gold_block' });
    banner(b, 'z', 50, 249, 38, 7, 22);
    return b;
  }
},
{
  id: 'kapitol-seepavillon', view: { theta: -1.3, phi: 1.05 }, region: 'Kapitol', name: 'Seepavillon', world: { x: 100, z: 70 },
  desc: 'Der Kuppelpavillon auf einer runden Insel im See vor der Skyline: Plattform mit Stufenring, Rotunde aus 18 Säulen, Gebälk und gläserne Rippenkuppel, verbunden mit der Uferpromenade durch einen Steg. Daneben eine kleine Bauminsel.',
  build() {
    const b = new Build();
    b.part('See');
    b.fill(0, -1, 9, 100, -1, 100, 'sand');
    b.fill(0, 0, 9, 100, 0, 100, 'water');
    b.part('Uferpromenade');
    b.fill(0, 0, 0, 100, 0, 8, 'smooth_stone');
    b.fill(0, 1, 8, 100, 2, 8, 'polished_andesite');
    for (let x = 0; x <= 100; x += 8) b.set(x, 3, 8, 'polished_andesite');
    b.fill(48, 1, 8, 52, 2, 8, null);
    b.part('Steg');
    b.fill(48, 0, 9, 52, 0, 35, 'polished_andesite');
    b.fill(48, 1, 9, 48, 1, 34, 'polished_andesite_slab'); b.fill(52, 1, 9, 52, 1, 34, 'polished_andesite_slab');
    b.part('Inselplattform');
    for (let x = 28; x <= 72; x++) for (let z = 33; z <= 77; z++) {
      const r = Math.hypot(x - 50, z - 55);
      if (r <= 21.4) b.set(x, 0, z, 'polished_andesite');
      if (r <= 19.4) b.set(x, 1, z, r < 11 && (x + z) % 2 ? 'smooth_quartz' : 'smooth_stone');
      else if (r <= 21.4) b.set(x, 1, z, 'smooth_stone_slab');
    }
    b.part('Rotunde');
    for (let i = 0; i < 18; i++) {
      const a = i * 20 * Math.PI / 180;
      const x = Math.round(50 + Math.cos(a) * 10), z = Math.round(55 + Math.sin(a) * 10);
      b.fill(x, 2, z, x, 13, z, 'quartz_pillar');
    }
    for (let x = 38; x <= 62; x++) for (let z = 43; z <= 67; z++) {
      const r = Math.hypot(x - 50, z - 55);
      if (r >= 8.6 && r < 11.6) { b.set(x, 14, z, 'smooth_quartz'); b.set(x, 15, z, r >= 10.6 ? 'chiseled_quartz_block' : 'smooth_quartz'); }
    }
    b.part('Kuppel');
    for (let x = 39; x <= 61; x++) for (let y = 16; y <= 27; y++) for (let z = 44; z <= 66; z++) {
      const d = Math.hypot(x - 50, y - 16, z - 55);
      if (d > 10.4 || d < 9.4) continue;
      const rib = nearRay(x, z, 50, 55, 30) < 0.6 || y === 16;
      b.set(x, y, z, rib ? 'smooth_quartz' : 'light_blue_stained_glass');
    }
    b.cyl(50, 55, 1, 27, 28, 'smooth_quartz');
    b.set(50, 29, 55, 'gold_block');
    b.part('Bauminsel');
    for (let x = 6; x <= 26; x++) for (let z = 30; z <= 50; z++) {
      const r = Math.hypot(x - 16, z - 40);
      if (r <= 9.4) { b.set(x, 0, z, 'dirt'); b.set(x, 1, z, 'grass_block'); }
    }
    b.tree(13, 2, 38, 6, 'oak'); b.tree(19, 2, 43, 7, 'oak'); b.tree(15, 2, 45, 5, 'oak');
    return b;
  }
},
{
  id: 'kapitol-goldkuppel', region: 'Kapitol', name: 'Goldkuppel', world: { x: -140, z: -230 },
  desc: 'Das Gebäude mit der goldenen Kuppel, das über der Paradeallee aufragt: quadratischer Sockelbau mit Fensterraster, darauf ein Tambour mit Fenstern, eine 13 m hohe Kuppel aus Goldblöcken und eine goldene Laterne mit Spitze.',
  build() {
    const b = new Build();
    b.part('Vorplatz');
    b.fill(0, 0, 0, 60, 0, 60, 'polished_andesite');
    b.part('Sockelbau');
    tower(b, 6, 6, 54, 54, 1, [{ inset: 0, h: 28 }], { wall: 'smooth_stone', pier: 'polished_diorite', crown: 'chiseled_stone_bricks' });
    b.part('Tambour');
    b.cyl(30, 30, 13, 30, 38, 'quartz_block', true);
    for (let a = 0; a < 360; a += 15) {
      const x = Math.round(30 + Math.cos(a * Math.PI / 180) * 13), z = Math.round(30 + Math.sin(a * Math.PI / 180) * 13);
      b.fill(x, 32, z, x, 36, z, 'gray_stained_glass');
    }
    b.cyl(30, 30, 14, 39, 39, 'chiseled_quartz_block', true);
    b.part('Goldkuppel');
    b.sphere(30, 39, 30, 13, 'gold_block', { hollow: true, topOnly: true });
    b.part('Laterne');
    b.cyl(30, 30, 2, 53, 56, 'gold_block', true);
    b.cyl(30, 30, 2, 57, 57, 'gold_block');
    b.fill(30, 58, 30, 30, 62, 30, 'gold_block');
    return b;
  }
},
{
  id: 'kapitol-viertel', region: 'Kapitol', name: 'Hochhausviertel (Stadtblock)', world: { x: -210, z: -300 },
  placements: [[-210, -300], [-146, -300], [-210, -230], [-210, -160], [-146, -160], [-210, -90], [-146, -90], [-210, 0], [-146, 0], [-146, 80], [65, -300], [129, -300], [65, -230], [129, -230], [65, -160], [129, -160], [210, 70], [210, 140]],
  desc: 'Ein typischer Stadtblock der Kapitol-Skyline (64 × 64 m), der auf der Gesamtkarte mehrfach eingesetzt wird: Art-déco-Turm mit Rücksprüngen (82 m), runder Glasturm (56 m), weißes Bürohaus mit Fensterbändern und ein Flachbau mit Dachgarten, umgeben von Straßen und Gehwegen.',
  build() {
    const b = new Build();
    b.part('Straßen');
    for (let x = 0; x <= 63; x++) for (let z = 0; z <= 63; z++) {
      const street = x < 4 || z < 4 || x > 59 || z > 59 || (x >= 30 && x <= 33) || (z >= 30 && z <= 33);
      b.set(x, 0, z, street ? 'gray_concrete' : 'smooth_stone');
    }
    b.part('Art-déco-Turm');
    tower(b, 6, 6, 27, 27, 1, [{ inset: 0, h: 52 }, { inset: 3, h: 16 }, { inset: 6, h: 10 }], { wall: 'smooth_stone', pier: 'polished_diorite', crown: 'polished_andesite', spire: 3 });
    b.part('Glasturm');
    for (let y = 1; y <= 56; y++) b.cyl(46.5, 17.5, 10, y, y, y % 4 === 0 ? 'white_concrete' : 'light_blue_stained_glass', true);
    b.cyl(46.5, 17.5, 10, 57, 57, 'white_concrete');
    b.part('Bürohaus');
    tower(b, 6, 36, 27, 57, 1, [{ inset: 0, h: 40 }], { wall: 'white_concrete', pier: 'white_concrete', win: 'black_stained_glass', band: true, bay: 6 });
    b.part('Flachbau mit Dachgarten');
    tower(b, 36, 36, 57, 57, 1, [{ inset: 0, h: 16 }], { wall: 'polished_andesite', pier: 'smooth_stone' });
    b.fill(37, 18, 37, 56, 18, 56, 'grass_block');
    b.tree(41, 19, 41, 4, 'oak'); b.tree(51, 19, 51, 4, 'oak');
    return b;
  }
},
{
  id: 'kapitol-tributenzug', region: 'Kapitol', name: 'Tributenzug', world: null,
  desc: 'Der Hochgeschwindigkeitszug der Tribute im echten Maßstab: stromlinienförmige Lok und Salonwagen, je 3 m breit und gut 4 m hoch, zusammen 52 m lang, auf einem Normalspur-Gleisbett.',
  build() {
    const b = new Build();
    b.part('Gleisbett');
    b.fill(0, 0, 0, 56, 0, 4, 'gravel');
    for (let x = 0; x <= 56; x += 2) b.fill(x, 0, 1, x, 0, 3, 'spruce_planks');
    b.fill(0, 1, 1, 56, 1, 1, 'rail'); b.fill(0, 1, 3, 56, 1, 3, 'rail');
    const car = (x1, x2) => {
      b.fill(x1, 2, 1, x2, 2, 3, 'black_concrete');
      b.walls(x1, 3, 1, x2, 5, 3, 'iron_block');
      for (let x = x1 + 1; x < x2; x++) if ((x - x1) % 5) { b.set(x, 4, 1, 'black_stained_glass'); b.set(x, 4, 3, 'black_stained_glass'); }
      b.fill(x1, 6, 1, x2, 6, 3, 'smooth_quartz_slab'); b.fill(x1, 6, 2, x2, 6, 2, 'smooth_quartz');
      b.fill(x1 + 1, 3, 2, x2 - 1, 3, 2, 'red_carpet');
    };
    b.part('Lokomotive');
    car(6, 27);
    b.fill(1, 2, 2, 1, 2, 2, 'iron_block');
    b.fill(2, 2, 1, 3, 2, 3, 'iron_block'); b.fill(2, 3, 2, 3, 3, 2, 'smooth_quartz_slab');
    b.fill(4, 2, 1, 5, 3, 3, 'iron_block'); b.fill(4, 4, 1, 5, 4, 3, 'black_stained_glass'); b.fill(5, 5, 1, 5, 5, 3, 'iron_block'); b.set(4, 5, 2, 'smooth_quartz_slab');
    b.part('Salonwagen');
    car(29, 54);
    b.set(28, 2, 2, 'black_concrete');
    return b;
  }
},
];

/* Kapitol vor die übrigen Orte setzen. Distrikte & Arena sind noch alte Entwürfe. */
LOCATIONS.forEach(l => { l.legacy = true; });
LOCATIONS.unshift(...KAPITOL);
