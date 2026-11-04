/* 3D-Ansicht der Blöcke mit three.js (InstancedMesh, eigene Kamerasteuerung). */
class Viewer {
  constructor(container) {
    this.el = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x50505a, 0.75));
    const sun = new THREE.DirectionalLight(0xffffff, 0.65); sun.position.set(0.6, 1, 0.35); this.scene.add(sun);
    const fill = new THREE.DirectionalLight(0xffffff, 0.2); fill.position.set(-0.5, 0.3, -0.8); this.scene.add(fill);
    this.texture = this._makeTexture();
    this.root = new THREE.Group(); this.scene.add(this.root);
    this.meshes = [];
    this.theta = Math.PI / 4; this.phi = 1.0; this.dist = 60; this.target = new THREE.Vector3();
    this._controls();
    this._resize();
    new ResizeObserver(() => this._resize()).observe(container);
    const loop = () => { requestAnimationFrame(loop); if (this.dirty) { this._render(); this.dirty = false; } };
    loop();
  }
  _makeTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 16;
    const g = c.getContext('2d');
    let s = 1234;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const v = 215 + Math.floor(r() * 40);
      g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, y, 1, 1);
    }
    g.fillStyle = 'rgba(0,0,0,0.28)';
    g.fillRect(0, 0, 16, 1); g.fillRect(0, 0, 1, 16);
    g.fillStyle = 'rgba(0,0,0,0.14)';
    g.fillRect(0, 15, 16, 1); g.fillRect(15, 0, 1, 16);
    const t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter;
    return t;
  }
  _geom(shape) {
    switch (shape) {
      case 'slab': { const g = new THREE.BoxGeometry(1, 0.5, 1); g.translate(0, -0.25, 0); return g; }
      case 'carpet': { const g = new THREE.BoxGeometry(1, 0.0625, 1); g.translate(0, -0.47, 0); return g; }
      case 'fence': return new THREE.BoxGeometry(0.3, 1, 0.3);
      case 'plant': { const g = new THREE.BoxGeometry(0.45, 0.6, 0.45); g.translate(0, -0.2, 0); return g; }
      case 'small': { const g = new THREE.BoxGeometry(0.4, 0.5, 0.4); g.translate(0, -0.25, 0); return g; }
      default: return new THREE.BoxGeometry(1, 1, 1);
    }
  }
  setBuilding(data) {
    for (const m of this.meshes) { this.root.remove(m); m.geometry.dispose(); m.material.dispose(); }
    this.meshes = [];
    if (this.outline) { this.root.remove(this.outline); this.outline.geometry.dispose(); this.outline = null; }
    this.data = data;
    const groups = new Map();
    data.blocks.forEach((bl, i) => {
      const info = BLOCKS[bl.t];
      const key = (info.shape || 'full') + (info.t ? '|t' : '');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(i);
    });
    const col = new THREE.Color();
    for (const [key, idx] of groups) {
      const [shape, tr] = key.split('|');
      const mat = new THREE.MeshLambertMaterial({ map: this.texture, transparent: !!tr, opacity: tr ? 0.55 : 1, depthWrite: !tr });
      const mesh = new THREE.InstancedMesh(this._geom(shape), mat, idx.length);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.userData.idx = idx;
      mesh.userData.base = idx.map(i => {
        const bl = data.blocks[i];
        col.set(BLOCKS[bl.t].c);
        const h = ((bl.x * 73856093) ^ (bl.y * 19349663) ^ (bl.z * 83492791)) >>> 0;
        const f = 0.94 + (h % 1000) / 1000 * 0.1;
        return [col.r * f, col.g * f, col.b * f];
      });
      if (tr) mesh.renderOrder = 1;
      this.meshes.push(mesh); this.root.add(mesh);
    }
    const s = data.size;
    this.center = new THREE.Vector3(s.x / 2, 0, s.z / 2);
    const og = new THREE.EdgesGeometry(new THREE.BoxGeometry(s.x + 0.06, 1.06, s.z + 0.06));
    this.outline = new THREE.LineSegments(og, new THREE.LineBasicMaterial({ color: 0xffb300 }));
    this.root.add(this.outline);
    this.fit();
  }
  fit() {
    const s = this.data.size;
    this.target.set(0, s.y * 0.35, 0);
    this.dist = Math.hypot(s.x, s.y, s.z) * 1.05 + 8;
    this.theta = Math.PI / 4; this.phi = 1.05;
    this._lastKey = null;
    this._cam();
  }
  /**
   * state: { layer, mode: 'all'|'upto'|'only', explode: 'none'|'layers'|'parts', gap, hiddenParts:Set, highlight }
   */
  update(state) {
    if (!this.data) return;
    const m4 = new THREE.Matrix4(), col = new THREE.Color();
    const parts = this.data.parts;
    let maxLift = 0;
    for (const mesh of this.meshes) {
      const { idx, base } = mesh.userData;
      for (let k = 0; k < idx.length; k++) {
        const bl = this.data.blocks[idx[k]];
        let visible = !state.hiddenParts.has(bl.p);
        if (state.mode === 'upto' && bl.y > state.layer) visible = false;
        if (state.mode === 'only' && bl.y !== state.layer) visible = false;
        let lift = 0;
        if (state.explode === 'layers') lift = bl.y * state.gap;
        else if (state.explode === 'parts') lift = parts.indexOf(bl.p) * state.gap * 4;
        maxLift = Math.max(maxLift, lift);
        if (visible) {
          m4.makeTranslation(bl.x - this.center.x + 0.5, bl.y + 0.5 + lift, bl.z - this.center.z + 0.5);
        } else m4.makeScale(0, 0, 0);
        mesh.setMatrixAt(k, m4);
        const dim = state.mode === 'upto' && state.highlight && bl.y < state.layer ? 0.55 : 1;
        col.setRGB(base[k][0] * dim, base[k][1] * dim, base[k][2] * dim);
        mesh.setColorAt(k, col);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
    this.outline.visible = state.mode !== 'all';
    const lift = state.explode === 'layers' ? state.layer * state.gap : 0;
    this.outline.position.set(0, state.layer + 0.5 + lift, 0);
    const key = state.explode + ':' + state.gap;
    if (this._lastKey !== key) {
      this._lastKey = key;
      const h = this.data.size.y + (state.explode === 'none' ? 0 : maxLift);
      this.target.y = h * 0.35;
      this.dist = Math.max(this.dist, Math.max(this.data.size.x, h * 1.3, this.data.size.z) * 1.4);
    }
    this._cam();
  }
  _cam() {
    const t = this.target;
    this.camera.position.set(
      t.x + this.dist * Math.sin(this.phi) * Math.cos(this.theta),
      t.y + this.dist * Math.cos(this.phi),
      t.z + this.dist * Math.sin(this.phi) * Math.sin(this.theta));
    this.camera.lookAt(t);
    this.dirty = true;
  }
  _resize() {
    const w = this.el.clientWidth, h = this.el.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.dirty = true;
  }
  _render() { this.renderer.render(this.scene, this.camera); }
  _controls() {
    const el = this.renderer.domElement;
    const ptrs = new Map();
    let last = null, pinch = null, mode = 'rot';
    el.addEventListener('contextmenu', e => e.preventDefault());
    el.addEventListener('pointerdown', e => {
      el.setPointerCapture(e.pointerId);
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      mode = (e.button === 2 || e.shiftKey) ? 'pan' : 'rot';
      last = { x: e.clientX, y: e.clientY };
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); }
    });
    el.addEventListener('pointermove', e => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) this.zoom(pinch / d);
        pinch = d; return;
      }
      const dx = e.clientX - last.x, dy = e.clientY - last.y;
      last = { x: e.clientX, y: e.clientY };
      if (mode === 'rot') {
        this.theta += dx * 0.008;
        this.phi = Math.min(Math.PI - 0.05, Math.max(0.05, this.phi - dy * 0.008));
      } else {
        const s = this.dist * 0.0015;
        const right = new THREE.Vector3(-Math.sin(this.theta), 0, Math.cos(this.theta));
        this.target.addScaledVector(right, -dx * s);
        this.target.y += dy * s;
      }
      this._cam();
    });
    const up = e => { ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null; };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', e => { e.preventDefault(); this.zoom(e.deltaY > 0 ? 1.1 : 0.9); }, { passive: false });
  }
  zoom(f) { this.dist = Math.min(600, Math.max(4, this.dist * f)); this._cam(); }
  rotate(d) { this.theta += d; this._cam(); }
}
