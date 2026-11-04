/*
 * Alle Bauwerke von Panem als Block-Baupläne.
 * Jede Funktion erzeugt das Gebäude deterministisch – Block für Block, Maßstab 1:1.
 */

/* ---------- Hilfsfunktionen ---------- */

/** Gelände als Hülle (nicht massiv) aus einer Höhenfunktion bauen. */
function terrainShell(b, hfn, x1, z1, x2, z2, matFn, thick = 2) {
  const H = (x, z) => (x < x1 || x > x2 || z < z1 || z > z2) ? 0 : Math.max(0, Math.round(hfn(x, z)));
  for (let x = x1; x <= x2; x++) for (let z = z1; z <= z2; z++) {
    const h = H(x, z);
    if (h < 1) continue;
    const hmin = Math.min(H(x - 1, z), H(x + 1, z), H(x, z - 1), H(x, z + 1));
    const from = Math.max(1, Math.min(h - thick + 1, hmin + 1));
    for (let y = from; y <= h; y++) b.set(x, y, z, matFn(x, y, z, h));
  }
  return H;
}

/** Fenster in eine Wand entlang x (feste z) setzen. */
function winX(b, xs, z, ys, t) { for (const x of xs) for (const y of ys) b.set(x, y, z, t); }
function winZ(b, zs, x, ys, t) { for (const z of zs) for (const y of ys) b.set(x, y, z, t); }
function range(a, bb, step = 1) { const r = []; for (let i = a; i <= bb; i += step) r.push(i); return r; }

/** Pixel-Ziffern (3×5) für Schilder und Landeplätze. */
const DIGITS = {
  '1': ['010', '110', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'],
  '3': ['111', '001', '111', '001', '111'],
};
function drawFlat(b, text, x, y, z, t, scale = 1) {
  let cx = x;
  for (const ch of text) {
    const g = DIGITS[ch];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (g[r][c] === '1')
      for (let sx = 0; sx < scale; sx++) for (let sz = 0; sz < scale; sz++) b.set(cx + c * scale + sx, y, z + r * scale + sz, t);
    cx += 4 * scale;
  }
}

/* ---------- Bauwerke ---------- */

const LOCATIONS = [

/* ====================== DISTRIKT 1 ====================== */
{
  id: 'd1-juwelen', region: 'Distrikt 1', name: 'Juwelen-Manufaktur (Luxusgüter)',
  desc: 'Distrikt 1 stellt Luxusgüter für das Kapitol her. Elegante Manufaktur aus Quarz mit goldenem Gesims, gläserner Dachpyramide und Vitrinen voller Diamant- und Smaragdblöcke.',
  build() {
    const b = new Build();
    b.part('Fundament');
    b.fill(0, 0, 0, 26, 0, 28, 'grass_block');
    b.fill(2, 0, 2, 24, 0, 18, 'smooth_quartz');
    b.fill(11, 0, 19, 15, 0, 28, 'smooth_quartz');
    b.part('Wände');
    b.walls(3, 1, 3, 23, 10, 17, 'quartz_block');
    for (const [x, z] of [[3, 3], [23, 3], [3, 17], [23, 17]]) b.fill(x, 1, z, x, 10, z, 'quartz_pillar');
    b.fill(6, 2, 17, 20, 8, 17, 'glass');
    for (const x of range(6, 20, 3)) b.fill(x, 2, 17, x, 8, 17, 'quartz_pillar');
    b.fill(12, 1, 17, 14, 4, 17, null);
    winX(b, range(6, 20, 3), 3, [3, 4, 7, 8], 'glass');
    winZ(b, range(6, 14, 4), 3, [3, 4, 7, 8], 'glass');
    winZ(b, range(6, 14, 4), 23, [3, 4, 7, 8], 'glass');
    b.ring(3, 3, 23, 17, 9, 'emerald_block');
    b.part('Geschossdecke');
    b.fill(4, 5, 4, 22, 5, 16, 'smooth_quartz');
    b.fill(8, 5, 8, 18, 5, 12, null);
    b.part('Vitrinen');
    for (const [x, z, t] of [[6, 7, 'diamond_block'], [10, 14, 'emerald_block'], [16, 14, 'diamond_block'], [20, 7, 'emerald_block'], [13, 9, 'gold_block']]) {
      b.set(x, 1, z, 'smooth_quartz'); b.set(x, 2, z, t); b.set(x, 3, z, 'glass');
    }
    b.part('Dach & Glaspyramide');
    b.fill(3, 11, 3, 23, 11, 17, 'smooth_quartz');
    b.ring(2, 2, 24, 18, 11, 'gold_block');
    b.ring(2, 2, 24, 18, 12, 'smooth_quartz_slab');
    b.fill(8, 11, 8, 18, 11, 12, null);
    b.hip(8, 6, 18, 14, 12, 'light_blue_stained_glass', 'light_blue_stained_glass');
    b.set(13, 17, 10, 'diamond_block');
    b.part('Brunnen');
    b.cyl(13, 23, 3, 1, 1, 'gold_block', true);
    b.cyl(13, 23, 2, 1, 1, 'water');
    b.set(13, 1, 23, 'quartz_pillar'); b.set(13, 2, 23, 'diamond_block');
    return b;
  }
},

/* ====================== DISTRIKT 2 ====================== */
{
  id: 'd2-nuss', region: 'Distrikt 2', name: 'Die Nuss (Bergfestung)',
  desc: 'Distrikt 2 – Steinbrüche und Friedenswächter. „Die Nuss“ ist eine ausgehöhlte Bergfestung: der Berg ist als begehbare Hülle gebaut, mit Tunnelportal, Schienen, Wachtürmen und erleuchteten Fensterreihen.',
  build() {
    const b = new Build();
    const cx = 28, cz = 24, rx = 25, rz = 22;
    const hfn = (x, z) => {
      const d = Math.hypot((x - cx) / rx, (z - cz) / rz);
      if (d >= 1) return 0;
      const n = Math.sin(x * 0.55 + 1.3) * Math.cos(z * 0.47 + 0.4) * 1.6 + Math.sin((x + z) * 0.23) * 1.2;
      return 34 * Math.pow(1 - d, 1.35) + n * (1 - d);
    };
    b.part('Gelände');
    b.fill(0, 0, 0, 56, 0, 58, 'grass_block');
    b.fill(24, 0, 40, 32, 0, 58, 'gravel');
    b.part('Berg');
    terrainShell(b, hfn, 0, 0, 56, 50, (x, y, z, h) => {
      if (y === h && y >= 26) return 'snow_block';
      if ((x * 7 + y * 3 + z * 5) % 11 === 0) return 'andesite';
      return 'stone';
    }, 2);
    b.part('Innenhalle');
    for (let x = 8; x <= 48; x++) for (let z = 6; z <= 42; z++) if (hfn(x, z) > 6) b.set(x, 0, z, 'stone_bricks');
    for (const [x, z] of [[20, 20], [36, 20], [20, 30], [36, 30]]) { b.fill(x, 1, z, x, 6, z, 'stone_bricks'); b.set(x, 7, z, 'glowstone'); }
    b.part('Tunnel & Portal');
    const archTop = x => 4 + Math.floor(Math.sqrt(Math.max(0, 25 - (x - 28) * (x - 28))));
    for (let z = 22; z <= 52; z++) {
      for (let x = 23; x <= 33; x++) for (let y = 1; y <= archTop(x); y++) b.set(x, y, z, null);
      const inside = hfn(28, z) >= 11;
      const portal = !inside && hfn(28, z - 1) >= 11;
      if (inside || portal) {
        const mat = portal ? 'chiseled_stone_bricks' : 'stone_bricks';
        for (let x = 22; x <= 34; x++) {
          const top = (x === 22 || x === 34) ? 4 : archTop(x) + 1;
          if (x === 22 || x === 34) b.fill(x, 1, z, x, top, z, mat);
          else b.set(x, top, z, mat);
        }
        b.fill(23, 0, z, 33, 0, z, 'stone_bricks');
        if (z % 5 === 0) b.set(28, archTop(28), z, 'glowstone');
      }
    }
    b.fill(26, 1, 22, 26, 1, 58, 'rail'); b.fill(30, 1, 22, 30, 1, 58, 'rail');
    b.part('Fenster');
    for (const y of [10, 14, 18, 22]) for (let x = 8; x <= 48; x += 3) {
      let zMax = -1;
      for (let z = 50; z >= 0; z--) if (b.has(x, y, z) && b.get(x, y, z) !== 'rail') { zMax = z; break; }
      if (zMax < 0 || zMax < cz) continue;
      if (Math.abs(x - 28) < 8 && y < 12) continue;
      b.set(x, y, zMax, (x + y) % 2 ? 'glowstone' : 'gray_stained_glass');
    }
    b.part('Wachtürme');
    for (const x of [18, 38]) {
      b.walls(x - 1, 1, 52, x + 1, 9, 54, 'stone_bricks');
      b.fill(x - 2, 10, 51, x + 2, 10, 55, 'stone_bricks');
      b.ring(x - 2, 51, x + 2, 55, 11, 'stone_brick_slab');
      b.set(x, 11, 53, 'lantern');
      b.set(x, 5, 54, 'gray_stained_glass');
    }
    return b;
  }
},

/* ====================== DISTRIKT 3 ====================== */
{
  id: 'd3-fabrik', region: 'Distrikt 3', name: 'Elektronikfabrik',
  desc: 'Distrikt 3 – Technik und Elektronik. Fabrikhalle aus Beton mit Sheddach (Sägezahndach mit Oberlichtern), Fensterband, zwei Schornsteinen und Funkmast.',
  build() {
    const b = new Build();
    b.part('Fundament');
    b.fill(0, 0, 0, 32, 0, 24, 'smooth_stone');
    b.fill(2, 0, 17, 25, 0, 19, 'yellow_concrete');
    for (let x = 2; x <= 25; x += 2) b.fill(x, 0, 17, x, 0, 19, 'black_concrete');
    b.part('Halle');
    b.walls(2, 1, 2, 25, 8, 16, 'light_gray_concrete');
    for (let x = 3; x <= 24; x++) if ((x - 2) % 4 !== 0) { b.set(x, 5, 16, 'light_blue_stained_glass'); b.set(x, 6, 16, 'light_blue_stained_glass'); b.set(x, 5, 2, 'light_blue_stained_glass'); b.set(x, 6, 2, 'light_blue_stained_glass'); }
    b.fill(11, 1, 16, 16, 4, 16, null);
    b.fill(10, 5, 16, 17, 5, 16, 'yellow_concrete');
    b.fill(3, 1, 4, 3, 1, 14, 'redstone_block');
    for (const x of range(6, 22, 4)) { b.fill(x, 1, 6, x + 1, 2, 7, 'iron_block'); b.fill(x, 1, 11, x + 1, 2, 12, 'iron_block'); }
    b.part('Sheddach');
    for (let i = 0; i < 4; i++) {
      const x0 = 2 + 6 * i;
      for (let j = 0; j <= 4; j++) {
        b.fill(x0 + j, 9 + j, 2, x0 + j, 9 + j, 16, 'gray_concrete');
        for (const z of [2, 16]) for (let y = 9; y < 9 + j; y++) b.set(x0 + j, y, z, 'light_gray_concrete');
      }
      b.fill(x0 + 5, 9, 3, x0 + 5, 13, 15, 'light_blue_stained_glass');
      b.fill(x0 + 5, 9, 2, x0 + 5, 13, 2, 'light_gray_concrete'); b.fill(x0 + 5, 9, 16, x0 + 5, 13, 16, 'light_gray_concrete');
    }
    b.part('Schornsteine');
    for (const z of [6, 12]) {
      b.cyl(29, z, 1, 1, 20, 'iron_block');
      b.cyl(29, z, 1, 17, 18, 'red_concrete');
    }
    b.fill(26, 1, 5, 28, 3, 13, 'light_gray_concrete');
    b.part('Funkmast');
    b.fill(5, 14, 9, 5, 22, 9, 'iron_bars');
    b.set(5, 23, 9, 'redstone_block');
    b.fill(4, 20, 9, 6, 20, 9, 'iron_bars');
    return b;
  }
},

/* ====================== DISTRIKT 4 ====================== */
{
  id: 'd4-fischer', region: 'Distrikt 4', name: 'Fischerhütte am Steg',
  desc: 'Distrikt 4 – Fischerei. Pfahlhütte über dem Wasser mit Prismarin-Dach, Steg ins tiefe Wasser, Seelaternen und einem kleinen Fischerboot.',
  build() {
    const b = new Build();
    b.part('Strand & Wasser');
    b.fill(0, 0, 0, 34, 0, 9, 'sand');
    b.fill(0, -2, 10, 34, -2, 30, 'sand');
    b.fill(0, -1, 10, 34, 0, 30, 'water');
    b.part('Pfähle & Plattform');
    for (const x of [8, 13, 18]) for (const z of [11, 15, 19]) b.fill(x, -1, z, x, 1, z, 'oak_log');
    b.fill(8, 2, 10, 18, 2, 19, 'spruce_planks');
    b.fill(12, 1, 8, 14, 1, 9, 'spruce_slab');
    b.part('Hütte');
    b.walls(9, 3, 11, 17, 6, 17, 'birch_planks');
    for (const [x, z] of [[9, 11], [17, 11], [9, 17], [17, 17]]) b.fill(x, 3, z, x, 6, z, 'stripped_spruce_log');
    b.fill(13, 3, 17, 13, 4, 17, null);
    winX(b, [11, 15], 17, [4, 5], 'glass'); winX(b, [11, 13, 15], 11, [4, 5], 'glass');
    winZ(b, [14], 9, [4, 5], 'glass'); winZ(b, [14], 17, [4, 5], 'glass');
    b.ring(9, 11, 17, 17, 6, 'prismarine');
    b.set(10, 3, 12, 'barrel'); b.set(16, 3, 12, 'barrel');
    b.part('Dach');
    b.gable(8, 10, 18, 18, 7, 'dark_prismarine', 'birch_planks', 'x', 9, 17);
    b.part('Steg & Boot');
    for (let z = 20; z <= 29; z++) b.fill(12, 2, z, 14, 2, z, 'spruce_planks');
    for (const z of [22, 25, 28]) { b.fill(12, -1, z, 12, 1, z, 'oak_log'); b.fill(14, -1, z, 14, 1, z, 'oak_log'); }
    for (const z of [21, 29]) { b.set(12, 3, z, 'spruce_fence'); b.set(12, 4, z, 'sea_lantern'); b.set(14, 3, z, 'spruce_fence'); b.set(14, 4, z, 'sea_lantern'); }
    b.fill(18, 0, 24, 21, 0, 27, null);
    b.ring(17, 23, 22, 28, 1, 'oak_planks');
    b.fill(18, 0, 24, 21, 0, 27, 'oak_planks');
    b.set(17, 1, 23, null); b.set(22, 1, 28, null); b.set(17, 1, 28, null); b.set(22, 1, 23, null);
    b.fill(19, 2, 25, 19, 5, 25, 'spruce_fence');
    b.fill(19, 3, 26, 19, 5, 26, 'white_wool');
    return b;
  }
},

/* ====================== DISTRIKT 5 ====================== */
{
  id: 'd5-kraftwerk', region: 'Distrikt 5', name: 'Kraftwerk mit Kühlturm',
  desc: 'Distrikt 5 – Energie. Hyperbolischer Kühlturm, Generatorhalle mit Fensterband, rot-weiß gestreifter Schornstein, Transformatoren und Strommast.',
  build() {
    const b = new Build();
    b.part('Gelände');
    b.fill(0, 0, 0, 46, 0, 32, 'gravel');
    b.fill(22, 0, 4, 44, 0, 30, 'smooth_stone');
    b.part('Kühlturm');
    for (let y = 1; y <= 28; y++) {
      const r = Math.round(6 + 5 * Math.pow((y - 20) / 18, 2));
      if (y <= 2) {
        for (let a = 0; a < 360; a += 5) {
          const x = Math.round(11 + r * Math.cos(a * Math.PI / 180)), z = Math.round(15 + r * Math.sin(a * Math.PI / 180));
          if (Math.floor(a / 30) % 2 === 0) b.set(x, y, z, 'light_gray_concrete');
        }
      } else b.cyl(11, 15, r, y, y, 'light_gray_concrete', true);
    }
    b.cyl(11, 15, 6, 27, 28, 'gray_concrete', true);
    b.part('Generatorhalle');
    b.walls(24, 1, 6, 42, 10, 22, 'white_concrete');
    for (let x = 25; x <= 41; x++) if ((x - 24) % 3 !== 0) { b.set(x, 7, 22, 'glass'); b.set(x, 8, 22, 'glass'); b.set(x, 7, 6, 'glass'); b.set(x, 8, 6, 'glass'); }
    b.fill(31, 1, 22, 35, 5, 22, null);
    b.fill(24, 11, 6, 42, 11, 22, 'gray_concrete');
    b.ring(24, 6, 42, 22, 12, 'smooth_stone_slab');
    for (const x of [28, 33, 38]) { b.cyl(x, 14, 2, 1, 3, 'iron_block'); b.set(x, 4, 14, 'redstone_block'); }
    b.part('Schornstein');
    for (let y = 1; y <= 24; y++) b.cyl(40, 2, 1, y, y, Math.floor(y / 4) % 2 ? 'red_concrete' : 'white_concrete');
    b.part('Transformatoren & Strommast');
    for (const x of [27, 33, 39]) { b.fill(x, 1, 25, x + 2, 3, 27, 'iron_block'); b.fill(x, 1, 28, x + 2, 3, 28, 'iron_bars'); b.set(x + 1, 4, 26, 'iron_bars'); }
    for (const z of [26, 30]) b.fill(4, 1, z, 4, 13, z, 'iron_bars');
    b.fill(4, 12, 25, 4, 12, 31, 'iron_bars');
    b.fill(4, 13, 26, 4, 13, 30, 'iron_bars');
    b.fill(5, 11, 25, 22, 11, 25, 'chain'); b.fill(5, 11, 31, 22, 11, 31, 'chain');
    return b;
  }
},

/* ====================== DISTRIKT 6 ====================== */
{
  id: 'd6-bahnhof', region: 'Distrikt 6', name: 'Bahnhofshalle',
  desc: 'Distrikt 6 – Transport. Große Bahnhofshalle mit gewölbtem Dach aus Glas und Eisenbögen, zwei Gleisen, Bahnsteigen mit Bänken und einer Ziegelfassade mit Uhr.',
  build() {
    const b = new Build();
    b.part('Boden & Gleise');
    b.fill(0, 0, 0, 40, 0, 20, 'smooth_stone');
    b.fill(0, 0, 6, 40, 0, 14, 'gravel');
    b.fill(0, 1, 8, 44, 1, 8, 'rail'); b.fill(0, 1, 12, 44, 1, 12, 'rail');
    b.fill(41, 0, 6, 44, 0, 14, 'gravel');
    b.part('Bahnsteige');
    b.fill(0, 1, 1, 40, 1, 5, 'smooth_stone'); b.fill(0, 1, 15, 40, 1, 19, 'smooth_stone');
    b.fill(0, 1, 5, 40, 1, 5, 'yellow_concrete'); b.fill(0, 1, 15, 40, 1, 15, 'yellow_concrete');
    for (const x of range(6, 34, 7)) { b.fill(x, 2, 2, x + 2, 2, 2, 'spruce_slab'); b.fill(x, 2, 18, x + 2, 2, 18, 'spruce_slab'); }
    b.part('Seitenwände');
    for (let x = 0; x <= 40; x++) for (const z of [0, 20]) b.fill(x, 1, z, x, 4, z, x % 5 === 0 ? 'iron_block' : 'bricks');
    for (let x = 1; x < 40; x++) if (x % 5) { b.set(x, 3, 0, 'glass'); b.set(x, 3, 20, 'glass'); }
    b.part('Gewölbedach');
    for (let x = 0; x <= 40; x++) for (let z = 0; z <= 20; z++) for (let y = 4; y <= 15; y++) {
      const d = Math.hypot(z - 10, y - 4);
      if (d >= 9.5 && d < 10.5) b.set(x, y, z, x % 5 === 0 ? 'iron_block' : 'glass');
    }
    for (const x of [5, 15, 25, 35]) for (const z of [3, 17]) { b.fill(x, 8, z, x, 9, z, 'chain'); b.set(x, 7, z, 'lantern'); }
    b.part('Fassade');
    for (let z = 0; z <= 20; z++) for (let y = 1; y <= 15; y++) {
      const d = Math.hypot(z - 10, y - 4);
      if (y > 4 && d >= 9.5) continue;
      if (z >= 6 && z <= 14 && y <= 6) continue;
      b.set(0, y, z, (d < 6.5 && y >= 8) ? 'glass' : 'bricks');
    }
    b.fill(0, 11, 9, 0, 13, 11, 'white_concrete'); b.set(0, 12, 10, 'black_concrete');
    b.fill(0, 7, 6, 0, 7, 14, 'stone_bricks');
    return b;
  }
},

/* ====================== DISTRIKT 7 ====================== */
{
  id: 'd7-saegewerk', region: 'Distrikt 7', name: 'Sägewerk im Fichtenwald',
  desc: 'Distrikt 7 – Holz und Papier. Sägewerk aus Fichtenholz mit Kreissäge, Holzstapeln, Baumstümpfen und dichtem Fichtenwald ringsum.',
  build() {
    const b = new Build();
    b.part('Gelände');
    b.fill(0, 0, 0, 38, 0, 30, 'grass_block');
    b.fill(12, 0, 19, 16, 0, 30, 'dirt_path');
    b.fill(22, 0, 8, 34, 0, 16, 'coarse_dirt');
    b.part('Sägewerk');
    b.fill(6, 0, 8, 20, 0, 18, 'spruce_planks');
    b.walls(6, 1, 8, 20, 5, 18, 'spruce_planks');
    for (const x of range(6, 20, 4).concat([20])) { b.fill(x, 1, 8, x, 5, 8, 'spruce_log'); b.fill(x, 1, 18, x, 5, 18, 'spruce_log'); }
    for (const z of [8, 13, 18]) { b.fill(6, 1, z, 6, 5, z, 'spruce_log'); b.fill(20, 1, z, 20, 5, z, 'spruce_log'); }
    b.fill(11, 1, 18, 15, 4, 18, null);
    b.fill(20, 1, 11, 20, 3, 15, null);
    winX(b, [8, 18], 18, [3], 'glass'); winX(b, [8, 12, 16], 8, [3], 'glass');
    b.ring(6, 8, 20, 18, 5, 'stripped_spruce_log');
    b.part('Kreissäge');
    b.fill(10, 1, 12, 17, 1, 14, 'spruce_planks');
    for (let x = 12; x <= 16; x++) for (let y = 1; y <= 5; y++) if (Math.hypot(x - 14, y - 3) <= 2.4) b.set(x, y, 13, 'iron_block');
    b.fill(10, 2, 13, 12, 2, 13, 'spruce_log');
    b.part('Dach');
    b.gable(5, 7, 21, 19, 6, 'dark_oak_planks', 'spruce_planks', 'x', 6, 20, 'dark_oak_slab');
    b.part('Holzstapel');
    for (let lvl = 0; lvl < 3; lvl++) for (let x = 23 + lvl; x <= 33 - lvl; x++) b.fill(x, 1 + lvl, 10, x, 1 + lvl, 14, 'spruce_log');
    for (const [x, z] of [[3, 24], [8, 27], [28, 22], [34, 26], [2, 4]]) b.set(x, 1, z, 'spruce_log');
    b.part('Fichtenwald');
    const R = rng(7);
    for (let i = 0; i < 40; i++) {
      const x = Math.floor(R() * 37) + 1, z = Math.floor(R() * 29) + 1;
      if (x >= 3 && x <= 36 && z >= 5 && z <= 20) continue;
      if (x >= 10 && x <= 18 && z >= 18) continue;
      if (b.has(x, 1, z) || b.has(x + 1, 1, z) || b.has(x - 1, 1, z) || b.has(x, 1, z + 1) || b.has(x, 1, z - 1)) continue;
      b.tree(x, 1, z, 6 + Math.floor(R() * 5), 'spruce');
    }
    return b;
  }
},

/* ====================== DISTRIKT 8 ====================== */
{
  id: 'd8-textil', region: 'Distrikt 8', name: 'Textilfabrik',
  desc: 'Distrikt 8 – Textilien. Dreistöckige Backstein-Fabrik mit Fensterreihen, runder Schornstein, Wassertank auf dem Dach und ein Ladehof voller bunter Wollballen.',
  build() {
    const b = new Build();
    b.part('Hof');
    b.fill(0, 0, 0, 34, 0, 24, 'cobblestone');
    b.part('Fabrikgebäude');
    b.walls(2, 1, 2, 28, 12, 14, 'bricks');
    for (const ys of [[2, 3], [6, 7], [10, 11]]) {
      winX(b, range(3, 27, 3), 2, ys, 'glass'); winX(b, range(3, 27, 3), 14, ys, 'glass');
      winZ(b, [5, 8, 11], 2, ys, 'glass'); winZ(b, [5, 8, 11], 28, ys, 'glass');
    }
    b.fill(14, 1, 14, 16, 3, 14, null);
    b.ring(2, 2, 28, 14, 5, 'stone_bricks'); b.ring(2, 2, 28, 14, 9, 'stone_bricks');
    b.part('Geschossdecken');
    b.fill(3, 5, 3, 27, 5, 13, 'spruce_planks'); b.fill(3, 9, 3, 27, 9, 13, 'spruce_planks');
    for (const x of range(5, 25, 5)) for (const z of [6, 10]) b.set(x, 1, z, 'iron_block');
    b.part('Dach');
    b.fill(2, 13, 2, 28, 13, 14, 'bricks');
    b.ring(2, 2, 28, 14, 14, 'brick_slab');
    b.part('Wassertank');
    for (const [x, z] of [[6, 6], [9, 6], [6, 9], [9, 9]]) b.fill(x, 14, z, x, 16, z, 'spruce_fence');
    b.cyl(7.5, 7.5, 2, 17, 20, 'spruce_planks', true);
    b.cyl(7.5, 7.5, 2, 17, 17, 'spruce_planks');
    b.cyl(7.5, 7.5, 2, 21, 21, 'spruce_slab');
    b.part('Schornstein');
    b.cyl(31, 8, 1, 1, 26, 'bricks');
    b.cyl(31, 8, 2, 25, 26, 'bricks', true);
    b.part('Wollballen');
    const wools = ['red_wool', 'blue_wool', 'yellow_wool', 'green_wool', 'purple_wool', 'white_wool'];
    wools.forEach((w, i) => { const x = 3 + i * 4; b.fill(x, 1, 18, x + 2, 1, 20, 'spruce_slab'); b.fill(x, 2, 18, x + 2, 3, 20, w); });
    return b;
  }
},

/* ====================== DISTRIKT 9 ====================== */
{
  id: 'd9-silos', region: 'Distrikt 9', name: 'Getreidesilos',
  desc: 'Distrikt 9 – Getreide. Drei Metallsilos mit Kegeldach, hölzerner Getreide-Elevator mit Förderrohren und ein bewässertes Weizenfeld.',
  build() {
    const b = new Build();
    b.part('Hof');
    b.fill(0, 0, 0, 36, 0, 15, 'gravel');
    b.part('Weizenfeld');
    for (let z = 16; z <= 30; z++) for (let x = 0; x <= 36; x++) {
      if (z === 23) { b.set(x, 0, z, 'water'); continue; }
      b.set(x, 0, z, 'farmland'); b.set(x, 1, z, 'wheat');
    }
    b.fill(0, 1, 15, 36, 1, 15, 'oak_fence');
    b.fill(17, 1, 15, 19, 1, 15, null);
    b.part('Silos');
    for (const x of [6, 14, 22]) {
      b.cyl(x, 8, 3, 1, 18, 'iron_block', true);
      for (const y of [6, 12]) b.cyl(x, 8, 3, y, y, 'light_gray_concrete', true);
      for (let k = 0; k <= 3; k++) b.cyl(x, 8, 3 - k, 19 + k, 19 + k, 'iron_block', k < 3);
    }
    b.part('Getreide-Elevator');
    b.walls(27, 1, 5, 31, 24, 10, 'spruce_planks');
    for (const [x, z] of [[27, 5], [31, 5], [27, 10], [31, 10]]) b.fill(x, 1, z, x, 24, z, 'spruce_log');
    b.fill(29, 1, 10, 29, 3, 10, null);
    for (const y of [8, 14, 20]) winX(b, [29], 10, [y], 'glass');
    b.gable(26, 4, 32, 11, 25, 'dark_oak_planks', 'spruce_planks', 'z', 5, 10);
    b.part('Förderrohre');
    b.fill(7, 22, 8, 26, 22, 8, 'iron_block');
    for (const x of [6, 14, 22]) b.set(x, 22, 8, 'iron_block');
    b.fill(5, 1, 12, 7, 2, 13, 'hay_block');
    return b;
  }
},

/* ====================== DISTRIKT 10 ====================== */
{
  id: 'd10-stall', region: 'Distrikt 10', name: 'Viehstall mit Koppel',
  desc: 'Distrikt 10 – Viehzucht. Großer roter Stall mit hohem Giebeldach, Heuboden, Strohballen, kleiner Silo und eine eingezäunte Koppel mit Wassertrog.',
  build() {
    const b = new Build();
    b.part('Wiese');
    b.fill(0, 0, 0, 38, 0, 30, 'grass_block');
    b.fill(9, 0, 19, 13, 0, 30, 'dirt_path');
    b.part('Stall');
    b.fill(4, 0, 4, 18, 0, 18, 'cobblestone');
    b.walls(4, 1, 4, 18, 6, 18, 'red_terracotta');
    for (const [x, z] of [[4, 4], [18, 4], [4, 18], [18, 18]]) b.fill(x, 1, z, x, 6, z, 'birch_planks');
    b.fill(9, 1, 18, 13, 5, 18, null);
    b.ring(8, 18, 14, 18, 6, 'birch_planks'); b.fill(8, 1, 18, 8, 5, 18, 'birch_planks'); b.fill(14, 1, 18, 14, 5, 18, 'birch_planks');
    b.fill(9, 1, 4, 13, 5, 4, null);
    winZ(b, [8, 14], 4, [3, 4], 'glass'); winZ(b, [8, 14], 18, [3, 4], 'glass');
    for (const z of range(6, 16, 3)) { b.set(6, 1, z, 'hay_block'); b.set(16, 1, z, 'hay_block'); b.set(16, 2, z, 'hay_block'); }
    b.part('Heuboden');
    b.fill(5, 7, 5, 17, 7, 17, 'spruce_planks');
    b.fill(6, 8, 6, 9, 9, 16, 'hay_block');
    b.part('Dach');
    b.gable(3, 3, 19, 19, 7, 'dark_oak_planks', 'red_terracotta', 'z', 4, 18, 'dark_oak_slab');
    b.fill(10, 9, 18, 12, 10, 18, null);
    b.fill(10, 11, 18, 12, 11, 18, 'birch_planks');
    b.part('Silo');
    b.cyl(5, 25, 2, 1, 12, 'stone_bricks', true);
    b.sphere(5, 13, 25, 2, 'cut_copper', { hollow: true, topOnly: true });
    b.part('Koppel');
    b.ring(22, 4, 36, 26, 1, 'oak_fence');
    b.fill(22, 1, 10, 22, 1, 12, null);
    b.ring(26, 8, 31, 10, 1, 'smooth_stone');
    b.fill(27, 1, 9, 30, 1, 9, 'water');
    for (const [x, z] of [[33, 20], [25, 22], [34, 7]]) b.set(x, 1, z, 'hay_block');
    return b;
  }
},

/* ====================== DISTRIKT 11 ====================== */
{
  id: 'd11-obstgarten', region: 'Distrikt 11', name: 'Obstgarten mit Wachturm',
  desc: 'Distrikt 11 – Landwirtschaft. Streng bewachte Obstplantage: Reihen von Apfelbäumen, ein hoher Grenzzaun mit Stacheldraht und ein Friedenswächter-Wachturm mit Suchscheinwerfer.',
  build() {
    const b = new Build();
    b.part('Gelände');
    b.fill(0, 0, 0, 40, 0, 32, 'grass_block');
    b.fill(0, 0, 0, 40, 0, 2, 'dirt_path');
    b.part('Grenzzaun');
    for (let x = 0; x <= 40; x++) {
      if (x % 6 === 0) { b.fill(x, 1, 3, x, 8, 3, 'gray_concrete'); b.set(x, 9, 3, 'chain'); }
      else { b.fill(x, 1, 3, x, 7, 3, 'iron_bars'); b.set(x, 8, 3, 'chain'); }
    }
    b.part('Wachturm');
    for (const [x, z] of [[17, 5], [21, 5], [17, 9], [21, 9]]) b.fill(x, 1, z, x, 15, z, 'spruce_log');
    for (const y of [5, 10]) { b.ring(17, 5, 21, 9, y, 'spruce_fence'); }
    b.fill(16, 16, 4, 22, 16, 10, 'spruce_planks');
    b.ring(16, 4, 22, 10, 17, 'spruce_fence');
    for (const [x, z] of [[17, 5], [21, 5], [17, 9], [21, 9]]) b.fill(x, 17, z, x, 19, z, 'spruce_log');
    b.hip(16, 4, 22, 10, 20, 'spruce_slab', 'spruce_slab');
    b.set(19, 17, 4, 'sea_lantern'); b.set(19, 18, 4, 'iron_bars');
    b.part('Apfelbäume');
    for (let x = 4; x <= 36; x += 7) for (let z = 15; z <= 29; z += 7) b.tree(x, 1, z, 4, 'apple');
    b.part('Erntekörbe');
    for (const [x, z] of [[10, 12], [24, 12], [31, 26]]) b.set(x, 1, z, 'barrel');
    return b;
  }
},

/* ====================== DISTRIKT 12 ====================== */
{
  id: 'd12-justiz', region: 'Distrikt 12', name: 'Justizgebäude & Platz',
  desc: 'Das Justizgebäude am Hauptplatz von Distrikt 12, Schauplatz der Ernte: grauer Steinbau mit Säulen, Uhrturm, Kapitol-Bannern, Bühne und den beiden gläsernen Losbehältern.',
  build() {
    const b = new Build();
    b.part('Platz');
    b.fill(0, 0, 0, 30, 0, 28, 'cobblestone');
    b.fill(0, 0, 19, 30, 0, 28, 'stone_bricks');
    b.part('Sockel & Treppe');
    b.fill(2, 1, 1, 28, 1, 16, 'stone_bricks');
    b.fill(9, 1, 17, 21, 1, 17, 'stone_brick_slab');
    b.part('Gebäude');
    b.walls(3, 2, 2, 27, 14, 14, 'stone_bricks');
    b.ring(3, 2, 27, 14, 2, 'deepslate_bricks');
    for (const [x, z] of [[3, 2], [27, 2], [3, 14], [27, 14]]) b.fill(x, 2, z, x, 14, z, 'chiseled_stone_bricks');
    for (const ys of [[3, 4], [7, 8], [11, 12]]) {
      winX(b, range(5, 25, 4), 14, ys, 'gray_stained_glass'); winX(b, range(5, 25, 4), 2, ys, 'gray_stained_glass');
      winZ(b, [4, 8, 12], 3, ys, 'gray_stained_glass'); winZ(b, [4, 8, 12], 27, ys, 'gray_stained_glass');
    }
    b.fill(14, 2, 14, 16, 5, 14, null);
    b.ring(3, 2, 27, 14, 10, 'smooth_stone'); b.ring(3, 2, 27, 14, 6, 'smooth_stone');
    b.part('Geschossdecken');
    b.fill(4, 6, 3, 26, 6, 13, 'smooth_stone'); b.fill(4, 10, 3, 26, 10, 13, 'smooth_stone');
    b.part('Säulen');
    for (const x of [10, 13, 17, 20]) b.fill(x, 2, 16, x, 12, 16, 'smooth_stone');
    b.fill(9, 13, 15, 21, 13, 16, 'stone_bricks');
    b.fill(9, 14, 15, 21, 14, 16, 'stone_brick_slab');
    b.part('Banner');
    for (const x0 of [5, 24]) { b.fill(x0, 5, 15, x0 + 1, 12, 15, 'red_concrete'); b.fill(x0, 9, 15, x0 + 1, 9, 15, 'gold_block'); }
    b.part('Dach & Uhrturm');
    b.fill(3, 15, 2, 27, 15, 14, 'deepslate_tiles');
    b.ring(2, 1, 28, 15, 15, 'chiseled_stone_bricks');
    b.ring(2, 1, 28, 15, 16, 'stone_brick_slab');
    b.walls(13, 16, 6, 17, 21, 10, 'stone_bricks');
    b.fill(14, 18, 10, 16, 20, 10, 'white_concrete'); b.set(15, 19, 10, 'black_concrete'); b.set(15, 20, 10, 'black_concrete');
    b.fill(14, 18, 6, 16, 20, 6, 'white_concrete'); b.set(15, 19, 6, 'black_concrete');
    b.hip(12, 5, 18, 11, 22, 'deepslate_tiles', 'deepslate_tiles');
    b.part('Erntebühne');
    b.fill(9, 1, 20, 21, 1, 23, 'spruce_planks');
    b.ring(9, 20, 21, 23, 2, 'spruce_slab');
    b.fill(10, 2, 21, 20, 2, 22, null);
    for (const x of [11, 19]) { b.set(x, 2, 22, 'spruce_planks'); b.fill(x, 3, 22, x, 4, 22, 'glass'); }
    b.set(15, 2, 22, 'iron_bars'); b.set(15, 3, 22, 'black_concrete');
    return b;
  }
},
{
  id: 'd12-baeckerei', region: 'Distrikt 12', name: 'Bäckerei Mellark',
  desc: 'Die Bäckerei der Familie Mellark in der Stadt von Distrikt 12: Backstein-Erdgeschoss mit Schaufenster und Ofen, Fachwerk-Obergeschoss, Kamin – und hinten der Hof mit Apfelbaum und Schweinestall.',
  build() {
    const b = new Build();
    b.part('Gelände');
    b.fill(0, 0, -9, 14, 0, 1, 'grass_block');
    b.fill(0, 0, 2, 14, 0, 10, 'cobblestone');
    b.fill(0, 0, 11, 14, 0, 14, 'stone_bricks');
    b.part('Erdgeschoss (Laden)');
    b.walls(2, 1, 2, 12, 4, 10, 'bricks');
    b.fill(4, 2, 10, 8, 3, 10, 'glass');
    b.fill(10, 1, 10, 10, 2, 10, null);
    winX(b, [5, 9], 2, [2, 3], 'glass');
    b.fill(4, 1, 8, 8, 1, 8, 'spruce_planks');
    b.fill(3, 1, 3, 4, 2, 4, 'bricks'); b.set(4, 1, 4, 'glowstone');
    b.set(6, 1, 3, 'barrel'); b.set(7, 1, 3, 'barrel');
    b.fill(4, 4, 11, 8, 4, 11, 'spruce_slab');
    b.part('Obergeschoss');
    b.fill(3, 5, 3, 11, 5, 9, 'spruce_planks');
    b.walls(2, 5, 2, 12, 8, 10, 'oak_planks');
    for (const [x, z] of [[2, 2], [12, 2], [2, 10], [12, 10]]) b.fill(x, 5, z, x, 8, z, 'dark_oak_log');
    b.ring(2, 2, 12, 10, 5, 'dark_oak_log');
    winX(b, [5, 9], 10, [6, 7], 'glass'); winX(b, [5, 9], 2, [6, 7], 'glass');
    winZ(b, [6], 2, [6, 7], 'glass'); winZ(b, [6], 12, [6, 7], 'glass');
    b.part('Dach & Kamin');
    b.gable(1, 1, 13, 11, 9, 'dark_oak_planks', 'oak_planks', 'x', 2, 12, 'dark_oak_slab');
    b.fill(4, 1, 3, 4, 15, 3, 'bricks');
    b.set(3, 1, 3, 'bricks');
    b.part('Hinterhof');
    b.tree(11, 1, -4, 5, 'apple');
    b.ring(2, -7, 7, -2, 1, 'oak_fence');
    b.set(5, 1, -2, null);
    b.fill(6, 1, 1, 6, 1, 1, 'spruce_slab');
    return b;
  }
},
{
  id: 'd12-everdeen', region: 'Distrikt 12', name: 'Haus der Everdeens (Saum)',
  desc: 'Das kleine, graue Holzhaus der Familie Everdeen im Saum, der ärmsten Gegend von Distrikt 12: Bruchsteinfundament, Fichtenholz, Kamin, Veranda mit Waschfass und Wäscheleine, dazu ein Ziegenverschlag.',
  build() {
    const b = new Build();
    b.part('Gelände');
    b.fill(0, 0, 0, 16, 0, 15, 'coarse_dirt');
    b.fill(6, 0, 11, 8, 0, 15, 'dirt_path');
    b.part('Fundament & Boden');
    b.fill(3, 0, 3, 10, 0, 9, 'cobblestone');
    b.part('Wände');
    b.walls(3, 1, 3, 10, 3, 9, 'spruce_planks');
    for (const [x, z] of [[3, 3], [10, 3], [3, 9], [10, 9]]) b.fill(x, 1, z, x, 3, z, 'spruce_log');
    b.fill(7, 1, 9, 7, 2, 9, null);
    b.set(5, 2, 9, 'glass'); b.set(9, 2, 9, 'glass'); b.set(6, 2, 3, 'glass'); b.set(10, 2, 6, 'glass');
    b.fill(4, 1, 4, 5, 1, 4, 'spruce_slab');
    b.set(9, 1, 4, 'barrel');
    b.part('Dach & Kamin');
    b.gable(2, 2, 11, 10, 4, 'spruce_planks', 'spruce_planks', 'x', 3, 10, 'spruce_slab');
    b.fill(4, 1, 5, 4, 9, 5, 'cobblestone');
    b.part('Veranda');
    b.fill(5, 1, 10, 9, 1, 11, 'spruce_slab');
    b.fill(5, 2, 11, 5, 3, 11, 'spruce_fence'); b.fill(9, 2, 11, 9, 3, 11, 'spruce_fence');
    b.fill(5, 4, 10, 9, 4, 11, 'spruce_slab');
    b.set(10, 1, 11, 'barrel');
    b.part('Wäscheleine');
    b.fill(13, 1, 3, 13, 3, 3, 'spruce_fence'); b.fill(13, 1, 9, 13, 3, 9, 'spruce_fence');
    b.fill(13, 3, 4, 13, 3, 8, 'chain');
    b.set(13, 2, 5, 'white_wool'); b.set(13, 2, 7, 'blue_wool');
    b.part('Ziegenverschlag');
    b.walls(12, 1, 11, 15, 2, 14, 'spruce_fence');
    b.fill(12, 3, 11, 15, 3, 14, 'spruce_slab');
    b.set(13, 1, 12, 'hay_block');
    return b;
  }
},
{
  id: 'd12-siegerdorf', region: 'Distrikt 12', name: 'Haus im Dorf der Sieger',
  desc: 'Eines der großen Häuser im Dorf der Sieger von Distrikt 12, die Gewinner der Hungerspiele bewohnen: zweistöckig, weiß, mit Säulenveranda, zwei Kaminen, Garten und Zaun.',
  build() {
    const b = new Build();
    b.part('Garten');
    b.fill(0, 0, 0, 22, 0, 24, 'grass_block');
    b.fill(10, 0, 19, 12, 0, 24, 'gravel');
    b.ring(0, 0, 22, 23, 1, 'oak_fence');
    b.fill(10, 1, 23, 12, 1, 23, null);
    for (const x of [4, 5, 6, 16, 17, 18]) b.set(x, 1, 17, 'rose_bush');
    b.tree(3, 1, 21, 5, 'oak'); b.tree(19, 1, 21, 5, 'oak');
    b.part('Fundament');
    b.fill(3, 0, 3, 19, 0, 15, 'stone_bricks');
    b.part('Erdgeschoss');
    b.walls(3, 1, 3, 19, 4, 15, 'white_concrete');
    for (const [x, z] of [[3, 3], [19, 3], [3, 15], [19, 15]]) b.fill(x, 1, z, x, 9, z, 'quartz_pillar');
    winX(b, [5, 7, 15, 17], 15, [2, 3], 'glass'); winX(b, [5, 9, 13, 17], 3, [2, 3], 'glass');
    winZ(b, [7, 11], 3, [2, 3], 'glass'); winZ(b, [7, 11], 19, [2, 3], 'glass');
    b.fill(11, 1, 15, 11, 2, 15, null);
    b.fill(10, 3, 15, 12, 3, 15, 'glass');
    b.part('Obergeschoss');
    b.fill(4, 5, 4, 18, 5, 14, 'oak_planks');
    b.ring(3, 3, 19, 15, 5, 'smooth_quartz');
    b.walls(3, 6, 3, 19, 9, 15, 'white_concrete');
    for (const [x, z] of [[3, 3], [19, 3], [3, 15], [19, 15]]) b.fill(x, 6, z, x, 9, z, 'quartz_pillar');
    winX(b, [5, 9, 13, 17], 15, [7, 8], 'glass'); winX(b, [5, 9, 13, 17], 3, [7, 8], 'glass');
    winZ(b, [7, 11], 3, [7, 8], 'glass'); winZ(b, [7, 11], 19, [7, 8], 'glass');
    b.part('Veranda');
    b.fill(7, 0, 16, 15, 0, 18, 'polished_andesite');
    for (const x of [7, 15]) b.fill(x, 1, 18, x, 4, 18, 'quartz_pillar');
    b.fill(7, 5, 16, 15, 5, 18, 'deepslate_tile_slab');
    b.part('Dach & Kamine');
    b.gable(2, 2, 20, 16, 10, 'deepslate_tiles', 'white_concrete', 'x', 3, 19, 'deepslate_tile_slab');
    for (const x of [6, 16]) b.fill(x, 10, 9, x, 19, 9, 'bricks');
    return b;
  }
},
{
  id: 'd12-hob', region: 'Distrikt 12', name: 'Der Hob (Schwarzmarkt)',
  desc: 'Der Hob: ein altes Kohlelager, in dem der Schwarzmarkt von Distrikt 12 stattfindet. Rußige Ziegelwände, Wellblechdach, Marktstände mit Fässern, Laternen an Ketten und Kohlehaufen vor der Tür.',
  build() {
    const b = new Build();
    b.part('Gelände');
    b.fill(0, 0, 0, 26, 0, 18, 'gravel');
    b.fill(2, 0, 2, 24, 0, 12, 'coarse_dirt');
    b.part('Lagerhaus');
    b.walls(2, 1, 2, 24, 2, 12, 'cobblestone');
    b.walls(2, 3, 2, 24, 7, 12, 'bricks');
    for (const x of range(4, 22, 4)) { b.set(x, 5, 12, 'gray_stained_glass'); b.set(x, 6, 12, 'gray_stained_glass'); b.set(x, 5, 2, 'gray_stained_glass'); b.set(x, 6, 2, x === 12 ? null : 'gray_stained_glass'); }
    b.fill(11, 1, 12, 15, 5, 12, null);
    b.fill(2, 1, 6, 2, 3, 8, null);
    b.part('Dach');
    b.gable(1, 1, 25, 13, 8, 'gray_concrete', 'bricks', 'x', 2, 24, 'iron_block');
    b.part('Marktstände');
    for (const x of range(4, 20, 4)) for (const z of [4, 10]) {
      b.set(x, 1, z, 'spruce_fence'); b.set(x + 1, 1, z, 'barrel'); b.set(x, 2, z, 'spruce_slab'); b.set(x + 1, 2, z, 'spruce_slab');
    }
    for (const x of [8, 16]) { b.fill(x, 9, 7, x, 11, 7, 'chain'); b.set(x, 8, 7, 'lantern'); }
    b.fill(21, 1, 6, 22, 1, 8, 'cobblestone'); b.set(21, 2, 7, 'glowstone');
    b.part('Kohlehaufen');
    b.fill(18, 1, 14, 24, 1, 17, 'coal_block'); b.fill(19, 2, 15, 23, 2, 16, 'coal_block'); b.fill(20, 3, 15, 22, 3, 16, 'coal_block');
    b.fill(0, 1, 7, 10, 1, 7, 'rail');
    return b;
  }
},
{
  id: 'd12-mine', region: 'Distrikt 12', name: 'Kohlemine mit Förderturm',
  desc: 'Der Mineneingang von Distrikt 12: Förderturm mit Seilscheibe über dem Schacht, Förderkorb, Schrägstreben zum Maschinenhaus, Lorenschienen und Kohlehalden.',
  build() {
    const b = new Build();
    b.part('Gelände');
    b.fill(0, 0, 0, 32, 0, 22, 'coarse_dirt');
    b.fill(0, 0, 10, 32, 0, 12, 'gravel');
    b.part('Schacht');
    b.walls(8, -8, 9, 12, 0, 13, 'stone_bricks');
    b.fill(9, -8, 10, 11, 0, 12, null);
    b.fill(9, -9, 10, 11, -9, 12, 'coal_ore');
    b.part('Förderkorb');
    b.walls(9, 1, 10, 11, 3, 12, 'iron_bars');
    b.fill(9, 0, 10, 11, 0, 12, 'iron_block');
    b.fill(10, 4, 11, 10, 22, 11, 'chain');
    b.part('Förderturm');
    for (const [x, z] of [[7, 8], [13, 8], [7, 14], [13, 14]]) b.fill(x, 1, z, x, 20, z, 'polished_blackstone');
    for (const y of [7, 14]) b.ring(7, 8, 13, 14, y, 'polished_blackstone');
    for (const y of [4, 10, 17]) b.ring(7, 8, 13, 14, y, 'iron_bars');
    b.fill(6, 21, 7, 14, 21, 15, 'spruce_planks');
    b.ring(6, 7, 14, 15, 22, 'iron_bars');
    b.part('Seilscheibe');
    for (let x = 4; x <= 16; x++) for (let y = 21; y <= 33; y++) {
      const d = Math.hypot(x - 10, y - 27);
      if (d >= 4.5 && d < 5.5) b.set(x, y, 11, 'iron_block');
      else if (d < 4.5 && (x === 10 || y === 27)) b.set(x, y, 11, 'iron_bars');
    }
    b.set(10, 27, 11, 'polished_blackstone');
    b.fill(10, 23, 10, 10, 26, 10, 'polished_blackstone'); b.fill(10, 23, 12, 10, 26, 12, 'polished_blackstone');
    b.part('Schrägstreben');
    b.line(13, 20, 10, 23, 7, 10, 'polished_blackstone');
    b.line(13, 20, 12, 23, 7, 12, 'polished_blackstone');
    b.part('Maschinenhaus');
    b.walls(22, 1, 6, 30, 6, 16, 'bricks');
    winZ(b, [9, 13], 30, [3, 4], 'gray_stained_glass'); winX(b, [25, 28], 16, [3, 4], 'gray_stained_glass');
    b.fill(22, 1, 10, 22, 3, 12, null);
    b.gable(21, 5, 31, 17, 7, 'gray_concrete', 'bricks', 'x', 22, 30);
    b.fill(28, 1, 8, 28, 16, 8, 'bricks');
    b.part('Loren & Halden');
    b.fill(0, 1, 11, 7, 1, 11, 'rail');
    b.set(3, 1, 11, 'coal_block');
    b.fill(1, 1, 1, 6, 1, 6, 'coal_block'); b.fill(2, 2, 2, 5, 2, 5, 'coal_block'); b.fill(3, 3, 3, 4, 3, 4, 'coal_block');
    b.fill(1, 1, 16, 5, 1, 21, 'coal_block'); b.fill(2, 2, 17, 4, 2, 20, 'coal_block');
    for (const [x, z] of [[16, 9], [16, 13]]) { b.set(x, 1, z, 'oak_fence'); b.set(x, 2, z, 'oak_fence'); b.set(x, 3, z, 'lantern'); }
    return b;
  }
},
{
  id: 'd12-zaun', region: 'Distrikt 12', name: 'Der Zaun & die Wiese',
  desc: 'Der Grenzzaun von Distrikt 12 zwischen der Wiese und dem verbotenen Wald: Maschendraht mit Stacheldraht oben, Warnschilder – und die Lücke am Boden, durch die man in den Wald gelangt.',
  build() {
    const b = new Build();
    b.part('Gelände');
    b.fill(0, 0, 0, 40, 0, 22, 'grass_block');
    b.fill(19, 0, 12, 21, 0, 22, 'dirt_path');
    b.part('Zaun');
    for (let x = 0; x <= 40; x++) {
      if (x % 5 === 0) { b.fill(x, 1, 10, x, 6, 10, 'gray_concrete'); b.set(x, 7, 10, 'chain'); }
      else { b.fill(x, 1, 10, x, 5, 10, 'iron_bars'); b.set(x, 6, 10, 'chain'); }
    }
    b.fill(19, 1, 10, 21, 1, 10, null);
    for (const x of [10, 30]) b.fill(x, 3, 11, x, 3, 11, 'yellow_concrete');
    b.part('Wiese');
    const R = rng(12);
    for (let i = 0; i < 40; i++) {
      const x = Math.floor(R() * 41), z = 12 + Math.floor(R() * 11);
      if (x >= 18 && x <= 22) continue;
      b.set(x, 1, z, R() < 0.3 ? 'rose_bush' : 'white_tulip');
    }
    b.part('Wald');
    for (let i = 0; i < 22; i++) {
      const x = 1 + Math.floor(R() * 39), z = 1 + Math.floor(R() * 7);
      if (b.has(x, 1, z) || b.has(x - 1, 1, z) || b.has(x + 1, 1, z)) continue;
      b.tree(x, 1, z, 5 + Math.floor(R() * 3), R() < 0.5 ? 'spruce' : 'oak');
    }
    return b;
  }
},

/* ====================== DISTRIKT 13 ====================== */
{
  id: 'd13-bunker', region: 'Distrikt 13', name: 'Bunkereingang & Landeplatz',
  desc: 'Distrikt 13 lebt unter der Erde. Ein bewachsener Hügel verbirgt das Tor zum Bunker: Betontunnel mit Panzertor und Warnstreifen, Lüftungsschächte, Funkmast und ein Landeplatz für Hovercrafts mit großer „13“.',
  build() {
    const b = new Build();
    const hfn = (x, z) => {
      const d = Math.hypot((x - 22) / 21, (z - 12) / 14);
      if (d >= 1) return 0;
      return 14 * Math.pow(1 - d, 0.9) + Math.sin(x * 0.6) * Math.cos(z * 0.5) * 0.8;
    };
    b.part('Gelände');
    b.fill(0, 0, 0, 44, 0, 44, 'grass_block');
    b.part('Hügel');
    terrainShell(b, hfn, 0, 0, 44, 26, (x, y, z, h) => y === h ? 'grass_block' : 'dirt', 2);
    b.part('Tunnel & Panzertor');
    b.fill(18, 1, 6, 26, 7, 27, null);
    for (let z = 6; z <= 27; z++) {
      b.fill(17, 0, z, 17, 8, z, 'gray_concrete'); b.fill(27, 0, z, 27, 8, z, 'gray_concrete');
      b.fill(17, 8, z, 27, 8, z, 'gray_concrete'); b.fill(18, 0, z, 26, 0, z, 'gray_concrete');
      if (z % 4 === 0) b.set(22, 7, z, 'sea_lantern');
    }
    b.fill(18, 1, 6, 26, 7, 6, 'iron_block');
    b.fill(21, 2, 6, 23, 4, 6, 'black_concrete');
    for (let y = 1; y <= 8; y++) { const t = y % 2 ? 'yellow_concrete' : 'black_concrete'; b.set(16, y, 27, t); b.set(28, y, 27, t); }
    for (let x = 16; x <= 28; x++) b.set(x, 9, 27, x % 2 ? 'yellow_concrete' : 'black_concrete');
    b.fill(18, 1, 26, 21, 7, 26, 'iron_block');
    b.part('Lüftung & Funkmast');
    for (const [x, z] of [[10, 10], [33, 8]]) { const h = Math.round(hfn(x, z)); b.fill(x, 1, z, x + 1, h + 2, z + 1, 'gray_concrete'); b.fill(x, h + 3, z, x + 1, h + 3, z + 1, 'iron_bars'); }
    { const h = Math.round(hfn(28, 14)); b.fill(28, h + 1, 14, 28, h + 12, 14, 'iron_bars'); b.set(28, h + 13, 14, 'redstone_block'); b.fill(27, h + 9, 14, 29, h + 9, 14, 'iron_bars'); }
    b.part('Landeplatz');
    b.fill(6, 0, 30, 38, 0, 44, 'smooth_stone');
    b.ring(6, 30, 38, 44, 0, 'yellow_concrete');
    drawFlat(b, '13', 15, 0, 32, 'yellow_concrete', 2);
    for (const [x, z] of [[6, 30], [38, 30], [6, 44], [38, 44]]) b.set(x, 1, z, 'sea_lantern');
    return b;
  }
},

/* ====================== ARENA ====================== */
{
  id: 'arena-fuellhorn', region: 'Arena', name: 'Das Füllhorn',
  desc: 'Das goldene Füllhorn im Zentrum der Arena: ein gewundenes, hohles Horn aus Goldblöcken voller Vorräte, umringt von den 24 Startplattformen der Tribute, mit See und Waldrand.',
  build() {
    const b = new Build();
    const C = 31;
    b.part('Arenaboden');
    for (let x = 0; x <= 62; x++) for (let z = 0; z <= 62; z++) if (Math.hypot(x - C, z - C) <= 31) b.set(x, 0, z, 'grass_block');
    b.part('See');
    for (let x = 0; x <= 62; x++) for (let z = 0; z <= 62; z++) {
      const d = Math.hypot(x - 48, z - 48);
      if (Math.hypot(x - C, z - C) > 31) continue;
      if (d <= 5) b.set(x, 0, z, 'water'); else if (d <= 6.4) b.set(x, 0, z, 'sand');
    }
    b.part('Füllhorn');
    const mx = 40, mz = C;
    const r = t => 6.5 * (1 - t) + 0.9 * t;
    const c = t => [mx - 21 * t, 1 + r(t) - 0.5 + 10 * Math.pow(t, 2.2), mz - 3 * t * t];
    const S = [];
    for (let i = 0; i <= 200; i++) { const t = i / 200; S.push([t, ...c(t), r(t)]); }
    for (let x = mx - 25; x <= mx; x++) for (let y = 1; y <= 24; y++) for (let z = mz - 12; z <= mz + 9; z++) {
      let best = Infinity;
      for (const [, sx, sy, sz, sr] of S) { const v = Math.hypot(x - sx, y - sy, z - sz) - sr; if (v < best) best = v; }
      if (best <= 0.35 && best > -1.25) b.set(x, y, z, 'gold_block');
    }
    b.part('Vorräte');
    for (const [x, z] of [[39, 30], [38, 33], [36, 29], [35, 32], [33, 31], [37, 31]]) b.set(x, 1, z, 'barrel');
    b.set(38, 2, 33, 'barrel'); b.set(36, 1, 34, 'hay_block');
    for (const [x, z] of [[44, 28], [45, 34], [47, 31], [43, 37]]) b.set(x, 1, z, 'barrel');
    b.part('Startplattformen');
    for (let i = 0; i < 24; i++) {
      const a = i / 24 * Math.PI * 2;
      const x = Math.round(C + 19 * Math.cos(a)), z = Math.round(C + 19 * Math.sin(a));
      b.set(x, 0, z, 'iron_block'); b.set(x, 1, z, 'smooth_stone_slab');
    }
    b.part('Waldrand');
    const R = rng(74);
    for (let i = 0; i < 70; i++) {
      const a = R() * Math.PI * 2, d = 25 + R() * 5;
      const x = Math.round(C + d * Math.cos(a)), z = Math.round(C + d * Math.sin(a));
      if (Math.hypot(x - 48, z - 48) < 8) continue;
      if (b.get(x, 0, z) !== 'grass_block') continue;
      if (b.has(x, 1, z) || b.has(x + 1, 1, z) || b.has(x - 1, 1, z) || b.has(x, 1, z + 1) || b.has(x, 1, z - 1) || b.has(x + 2, 1, z) || b.has(x, 1, z + 2)) continue;
      b.tree(x, 1, z, 5 + Math.floor(R() * 4), R() < 0.55 ? 'spruce' : 'oak');
    }
    return b;
  }
},
];

const REGIONS = [
  { name: 'Kapitol', info: 'Maßstab 1:1 (1 Block = 1 m)' },
  { name: 'Distrikt 1', info: 'Luxusgüter' },
  { name: 'Distrikt 2', info: 'Mauerwerk & Friedenswächter' },
  { name: 'Distrikt 3', info: 'Technik & Elektronik' },
  { name: 'Distrikt 4', info: 'Fischerei' },
  { name: 'Distrikt 5', info: 'Energie' },
  { name: 'Distrikt 6', info: 'Transport' },
  { name: 'Distrikt 7', info: 'Holz & Papier' },
  { name: 'Distrikt 8', info: 'Textilien' },
  { name: 'Distrikt 9', info: 'Getreide' },
  { name: 'Distrikt 10', info: 'Viehzucht' },
  { name: 'Distrikt 11', info: 'Landwirtschaft' },
  { name: 'Distrikt 12', info: 'Kohlebergbau' },
  { name: 'Distrikt 13', info: 'Untergrund (offiziell: Graphit)' },
  { name: 'Arena', info: 'Die Hungerspiele' },
];
