/*
 * Kleiner Voxel-Baukasten. Jedes Gebäude wird Block für Block in ganzzahligen
 * Koordinaten erzeugt (x = Ost, y = Höhe, z = Süd). Jeder gesetzte Block
 * entspricht exakt einem Block in Minecraft (Maßstab 1:1).
 */
class Build {
  constructor() {
    this.map = new Map();
    this.curPart = 'Fundament';
    this.parts = ['Fundament'];
  }
  part(name) {
    this.curPart = name;
    if (!this.parts.includes(name)) this.parts.push(name);
    return this;
  }
  _k(x, y, z) { return x + ',' + y + ',' + z; }
  set(x, y, z, t) {
    x = Math.round(x); y = Math.round(y); z = Math.round(z);
    const k = this._k(x, y, z);
    if (!t || t === 'air') { this.map.delete(k); return this; }
    if (!BLOCKS[t]) throw new Error('Unbekannter Block: ' + t);
    this.map.set(k, { x, y, z, t, p: this.curPart });
    return this;
  }
  get(x, y, z) { const b = this.map.get(this._k(x, y, z)); return b ? b.t : null; }
  has(x, y, z) { return this.map.has(this._k(x, y, z)); }
  /** Quader (inklusive Grenzen) füllen. t = null/'air' löscht. */
  fill(x1, y1, z1, x2, y2, z2, t) {
    const [ax, bx] = x1 <= x2 ? [x1, x2] : [x2, x1];
    const [ay, by] = y1 <= y2 ? [y1, y2] : [y2, y1];
    const [az, bz] = z1 <= z2 ? [z1, z2] : [z2, z1];
    for (let x = ax; x <= bx; x++) for (let y = ay; y <= by; y++) for (let z = az; z <= bz; z++) this.set(x, y, z, t);
    return this;
  }
  /** Nur Außenwände eines Quaders (ohne Boden/Decke). */
  walls(x1, y1, z1, x2, y2, z2, t) {
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) { this.set(x, y, z1, t); this.set(x, y, z2, t); }
      for (let z = z1; z <= z2; z++) { this.set(x1, y, z, t); this.set(x2, y, z, t); }
    }
    return this;
  }
  /** Rahmen (Ring) auf einer Ebene. */
  ring(x1, z1, x2, z2, y, t) { return this.walls(x1, y, z1, x2, y, z2, t); }
  /** Zylinder (senkrecht). hollow: nur Wand (1 Block dick). */
  cyl(cx, cz, r, y1, y2, t, hollow = false) {
    const R = r + 0.5, Ri = r - 0.5;
    for (let x = Math.floor(cx - r - 1); x <= Math.ceil(cx + r + 1); x++)
      for (let z = Math.floor(cz - r - 1); z <= Math.ceil(cz + r + 1); z++) {
        const d = Math.hypot(x - cx, z - cz);
        if (d > R - 0.15) continue;
        if (hollow && d < Ri - 0.15) continue;
        for (let y = y1; y <= y2; y++) this.set(x, y, z, t);
      }
    return this;
  }
  /** Halbkugel / Kugel. */
  sphere(cx, cy, cz, r, t, { hollow = false, topOnly = false } = {}) {
    for (let x = Math.floor(cx - r - 1); x <= Math.ceil(cx + r + 1); x++)
      for (let y = Math.floor(topOnly ? cy : cy - r - 1); y <= Math.ceil(cy + r + 1); y++)
        for (let z = Math.floor(cz - r - 1); z <= Math.ceil(cz + r + 1); z++) {
          const d = Math.hypot(x - cx, y - cy, z - cz);
          if (d > r + 0.4) continue;
          if (hollow && d < r - 0.6) continue;
          this.set(x, y, z, t);
        }
    return this;
  }
  /** Gerade Linie zwischen zwei Punkten. */
  line(x1, y1, z1, x2, y2, z2, t) {
    const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), Math.abs(z2 - z1), 1);
    for (let i = 0; i <= n; i++) this.set(x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n, z1 + (z2 - z1) * i / n, t);
    return this;
  }
  /**
   * Satteldach. axis 'x': First verläuft entlang x. Die Dachfläche läuft von z1/z2 nach innen.
   * gableT: Material für die Giebeldreiecke an den Enden gx1/gx2 (Wandflucht).
   */
  gable(x1, z1, x2, z2, y, roofT, gableT, axis = 'x', gx1 = null, gx2 = null, ridgeT = null) {
    if (axis === 'x') {
      for (let k = 0; ; k++) {
        const a = z1 + k, b = z2 - k;
        if (a > b) break;
        const last = a === b || a + 1 === b;
        for (let x = x1; x <= x2; x++) {
          this.set(x, y + k, a, last && ridgeT ? ridgeT : roofT);
          this.set(x, y + k, b, last && ridgeT ? ridgeT : roofT);
        }
        if (gableT) for (let z = a + 1; z <= b - 1; z++) {
          this.set(gx1 ?? x1 + 1, y + k, z, gableT);
          this.set(gx2 ?? x2 - 1, y + k, z, gableT);
        }
      }
    } else {
      for (let k = 0; ; k++) {
        const a = x1 + k, b = x2 - k;
        if (a > b) break;
        const last = a === b || a + 1 === b;
        for (let z = z1; z <= z2; z++) {
          this.set(a, y + k, z, last && ridgeT ? ridgeT : roofT);
          this.set(b, y + k, z, last && ridgeT ? ridgeT : roofT);
        }
        if (gableT) for (let x = a + 1; x <= b - 1; x++) {
          this.set(x, y + k, gx1 ?? z1 + 1, gableT);
          this.set(x, y + k, gx2 ?? z2 - 1, gableT);
        }
      }
    }
    return this;
  }
  /** Stufenpyramide / Walmdach. */
  hip(x1, z1, x2, z2, y, t, fillT = null) {
    for (let k = 0; ; k++) {
      const ax = x1 + k, bx = x2 - k, az = z1 + k, bz = z2 - k;
      if (ax > bx || az > bz) break;
      this.ring(ax, az, bx, bz, y + k, t);
      if (fillT && ax + 1 <= bx - 1 && az + 1 <= bz - 1 && (ax + 2 > bx - 2 || az + 2 > bz - 2))
        this.fill(ax + 1, y + k, az + 1, bx - 1, y + k, bz - 1, fillT);
    }
    return this;
  }
  /** Einfacher Baum. kind: 'oak' | 'spruce' | 'apple' */
  tree(x, y, z, h, kind = 'oak') {
    if (kind === 'spruce') {
      for (let i = 0; i < h; i++) this.set(x, y + i, z, 'spruce_log');
      for (let i = 2; i <= h; i++) {
        const r = Math.max(0, Math.round((h - i) / 2.2)) + (i === h ? 0 : 0);
        for (let dx = -r; dx <= r; dx++) for (let dz = -r; dz <= r; dz++) {
          if (Math.abs(dx) + Math.abs(dz) > r + (r > 1 ? 1 : 0)) continue;
          if (dx === 0 && dz === 0 && i < h) continue;
          if (!this.has(x + dx, y + i, z + dz)) this.set(x + dx, y + i, z + dz, 'spruce_leaves');
        }
      }
      this.set(x, y + h, z, 'spruce_leaves');
      this.set(x, y + h + 1, z, 'spruce_leaves');
      return this;
    }
    for (let i = 0; i < h; i++) this.set(x, y + i, z, 'oak_log');
    const top = y + h - 1;
    for (let dy = -2; dy <= 1; dy++) {
      const r = dy >= 0 ? 1 : 2;
      for (let dx = -r; dx <= r; dx++) for (let dz = -r; dz <= r; dz++) {
        if (r === 2 && Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
        if (dy === 1 && Math.abs(dx) + Math.abs(dz) > 1) continue;
        if (!this.has(x + dx, top + dy, z + dz)) this.set(x + dx, top + dy, z + dz, 'oak_leaves');
      }
    }
    if (kind === 'apple') {
      this.set(x + 2, top - 1, z, 'red_wool');
      this.set(x - 1, top - 2, z + 2, 'red_wool');
      this.set(x, top, z - 1, 'red_wool');
    }
    return this;
  }
  /** Ergebnis: auf Ursprung (0,0,0) verschobene Blockliste. */
  finish() {
    let mx = Infinity, my = Infinity, mz = Infinity, Mx = -Infinity, My = -Infinity, Mz = -Infinity;
    for (const b of this.map.values()) {
      mx = Math.min(mx, b.x); my = Math.min(my, b.y); mz = Math.min(mz, b.z);
      Mx = Math.max(Mx, b.x); My = Math.max(My, b.y); Mz = Math.max(Mz, b.z);
    }
    const blocks = [];
    for (const b of this.map.values()) blocks.push({ x: b.x - mx, y: b.y - my, z: b.z - mz, t: b.t, p: b.p });
    blocks.sort((a, b) => a.y - b.y || a.z - b.z || a.x - b.x);
    const usedParts = this.parts.filter(p => blocks.some(b => b.p === p));
    return { blocks, parts: usedParts, size: { x: Mx - mx + 1, y: My - my + 1, z: Mz - mz + 1 } };
  }
}

/** Deterministischer Zufall – damit jeder Bauplan immer identisch ist. */
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
