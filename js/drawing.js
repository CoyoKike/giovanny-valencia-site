/* The plan: the Massachusetts State House, drawn line by line while the camera flies low over it.
   Like the Sun Stone section on ponceconsulting.org: a tilted, skimming flyover that comes back to the front
   and stands upright at the end. Museum labels appear beside the parts as they are drawn and stay, so the
   finished drawing is an annotated plan; the dome fills with gold at the end. Simplified model, not to scale. */
import * as THREE from 'three';

function init() {
  const section = document.getElementById('drawing');
  const canvas = document.getElementById('drawCanvas');
  if (!section || !canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 1, 3000);
  const WHITE = 0xf4f2ec, GOLD = 0xd9ad4f;

  /* ---------- tiny line-drawing kit ---------- */
  const seg = [];
  const L = (a, b) => seg.push(a[0], a[1], a[2], b[0], b[1], b[2]);
  const rectXY = (x0, y0, x1, y1, z) => { L([x0, y0, z], [x1, y0, z]); L([x1, y0, z], [x1, y1, z]); L([x1, y1, z], [x0, y1, z]); L([x0, y1, z], [x0, y0, z]); };
  const rectZY = (z0, y0, z1, y1, x) => { L([x, y0, z0], [x, y0, z1]); L([x, y0, z1], [x, y1, z1]); L([x, y1, z1], [x, y1, z0]); L([x, y1, z0], [x, y0, z0]); };
  const box = (x0, y0, z0, x1, y1, z1) => {
    const c = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]];
    [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([a, b]) => L(c[a], c[b]));
  };
  const ring = (cx, y, cz, r, n = 48) => { for (let i = 0; i < n; i++) { const t0 = i / n * Math.PI * 2, t1 = (i + 1) / n * Math.PI * 2; L([cx + r * Math.cos(t0), y, cz + r * Math.sin(t0)], [cx + r * Math.cos(t1), y, cz + r * Math.sin(t1)]); } };
  const archXY = (cx, y, z, r, n = 14) => { for (let i = 0; i < n; i++) { const a = Math.PI * i / n, b = Math.PI * (i + 1) / n; L([cx + r * Math.cos(a), y + r * Math.sin(a), z], [cx + r * Math.cos(b), y + r * Math.sin(b), z]); } };
  const parts = [];
  function part(color, from, to, build) {
    seg.length = 0; build();
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(seg.slice(), 3));
    const line = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: color === GOLD ? 1 : .9 }));
    line.geometry.setDrawRange(0, 0); scene.add(line); parts.push({ line, count: seg.length / 3, from, to });
  }

  /* ---------- the building (metres, roughly; the front faces +z, toward the Common) ---------- */
  const W = 54, D = 34, H = 17, PX = 15, PZ0 = D / 2, PZ1 = D / 2 + 6.5;
  part(0x6f6f6f, 0, .1, () => { for (let x = -84; x <= 84; x += 7) L([x, 0, -56], [x, 0, 56]); for (let z = -56; z <= 56; z += 7) L([-84, 0, z], [84, 0, z]); });
  part(WHITE, .08, .3, () => {
    box(-W / 2, 0, -D / 2, W / 2, H, D / 2);
    for (const [y0, y1] of [[2.6, 6.2], [9.4, 14]]) {
      for (let x = -W / 2 + 3; x < -PX - 1.5; x += 4.2) rectXY(x, y0, x + 2, y1, D / 2 + .02);
      for (let x = PX + 2; x < W / 2 - 2.5; x += 4.2) rectXY(x, y0, x + 2, y1, D / 2 + .02);
      for (let z = -D / 2 + 3; z < D / 2 - 2.5; z += 4.4) { rectZY(z, y0, z + 2, y1, W / 2 + .02); rectZY(z, y0, z + 2, y1, -W / 2 - .02); }
      for (let x = -W / 2 + 3; x < W / 2 - 2.5; x += 4.2) rectXY(x, y0, x + 2, y1, -D / 2 - .02);
    }
    L([-W / 2, 8, D / 2 + .02], [-PX, 8, D / 2 + .02]); L([PX, 8, D / 2 + .02], [W / 2, 8, D / 2 + .02]);
  });
  part(WHITE, .28, .42, () => {
    box(-PX, 0, PZ0, PX, 7, PZ1);
    for (let i = 0; i < 7; i++) { const cx = -PX + 2.1 + i * ((2 * PX - 4.2) / 6), r = 1.45;
      L([cx - r, 0, PZ1 + .02], [cx - r, 4, PZ1 + .02]); L([cx + r, 0, PZ1 + .02], [cx + r, 4, PZ1 + .02]); archXY(cx, 4, PZ1 + .02, r); }
  });
  part(WHITE, .4, .55, () => {
    const n = 10, r = .55;
    for (let i = 0; i < n; i++) { const x = -PX + 1.3 + i * ((2 * PX - 2.6) / (n - 1)), z = PZ1 - 1;
      ring(x, 7, z, r, 10); ring(x, 15.6, z, r, 10); L([x - r, 7, z], [x - r, 15.6, z]); L([x + r, 7, z], [x + r, 15.6, z]); L([x, 7, z + r], [x, 15.6, z + r]); }
    box(-PX, 15.6, PZ0, PX, 17.2, PZ1);
  });
  part(WHITE, .53, .62, () => {
    const z = PZ1, top = 22.4;
    L([-PX, 17.2, z], [0, top, z]); L([0, top, z], [PX, 17.2, z]); L([-PX, 17.2, z], [PX, 17.2, z]);
    L([-PX + 2.4, 17.9, z + .01], [0, top - 1.1, z + .01]); L([0, top - 1.1, z + .01], [PX - 2.4, 17.9, z + .01]);
    L([0, top, z], [0, top, PZ0 - 3]); L([-PX, 17.2, z], [-PX, 17.2, PZ0 - 3]); L([PX, 17.2, z], [PX, 17.2, PZ0 - 3]);
    L([-PX, 17.2, PZ0 - 3], [0, top, PZ0 - 3]); L([0, top, PZ0 - 3], [PX, 17.2, PZ0 - 3]);
  });
  part(WHITE, .6, .67, () => {
    for (const [x0, x1] of [[-W / 2, -PX], [PX, W / 2]]) { L([x0, H + 1.4, D / 2], [x1, H + 1.4, D / 2]); for (let x = x0 + .6; x < x1; x += 1.2) L([x, H, D / 2], [x, H + 1.4, D / 2]); }
    L([-W / 2, H + 1.4, -D / 2], [W / 2, H + 1.4, -D / 2]); L([-W / 2, H + 1.4, -D / 2], [-W / 2, H + 1.4, D / 2]); L([W / 2, H + 1.4, -D / 2], [W / 2, H + 1.4, D / 2]);
  });
  const DC = [0, -1], DY = H + 7, DR = 9.5, LY = DY + DR - .4;
  part(WHITE, .65, .74, () => {
    ring(DC[0], H, DC[1], 10.5, 64); ring(DC[0], H + 2, DC[1], 10.5, 64); ring(DC[0], H + 2, DC[1], 9.5, 64); ring(DC[0], H + 7, DC[1], 9.5, 64);
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, x = DC[0] + 9.5 * Math.cos(a), z = DC[1] + 9.5 * Math.sin(a); L([x, H + 2, z], [x, H + 7, z]); }
  });
  part(GOLD, .72, .84, () => {
    for (let k = 1; k <= 6; k++) { const phi = k / 7 * Math.PI / 2; ring(DC[0], DY + DR * Math.sin(phi), DC[1], DR * Math.cos(phi), 56); }
    for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2;
      for (let k = 0; k < 12; k++) { const p0 = k / 12 * Math.PI / 2, p1 = (k + 1) / 12 * Math.PI / 2;
        L([DC[0] + DR * Math.cos(p0) * Math.cos(a), DY + DR * Math.sin(p0), DC[1] + DR * Math.cos(p0) * Math.sin(a)], [DC[0] + DR * Math.cos(p1) * Math.cos(a), DY + DR * Math.sin(p1), DC[1] + DR * Math.cos(p1) * Math.sin(a)]); } }
  });
  part(WHITE, .82, .9, () => {
    ring(DC[0], LY, DC[1], 2.3, 24); ring(DC[0], LY + 3.6, DC[1], 2.3, 24);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, x = DC[0] + 2.3 * Math.cos(a), z = DC[1] + 2.3 * Math.sin(a); L([x, LY, z], [x, LY + 3.6, z]); }
    for (let k = 0; k < 6; k++) { const p0 = k / 6 * Math.PI / 2, p1 = (k + 1) / 6 * Math.PI / 2;
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2;
        L([DC[0] + 2.3 * Math.cos(p0) * Math.cos(a), LY + 3.6 + 2.3 * Math.sin(p0), DC[1] + 2.3 * Math.cos(p0) * Math.sin(a)], [DC[0] + 2.3 * Math.cos(p1) * Math.cos(a), LY + 3.6 + 2.3 * Math.sin(p1), DC[1] + 2.3 * Math.cos(p1) * Math.sin(a)]); } }
    L([DC[0], LY + 5.9, DC[1]], [DC[0], LY + 7.6, DC[1]]);
  });
  const gold = new THREE.Mesh(new THREE.SphereGeometry(DR - .05, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0, depthWrite: false }));
  gold.position.set(DC[0], DY, DC[1]); scene.add(gold);

  /* ---------- page elements ---------- */
  const $$ = s => [...section.querySelectorAll(s)];
  const labels = $$('.mlabel').map(el => ({ el, at: new THREE.Vector3(...el.dataset.at.split(',').map(Number)), show: +el.dataset.show, side: el.dataset.side }));
  const intro = section.querySelector('.draw-intro'), end = section.querySelector('.draw-end');
  const svg = section.querySelector('#mlines'), NS = 'http://www.w3.org/2000/svg';
  labels.forEach(l => {
    l.g = document.createElementNS(NS, 'g'); l.g.setAttribute('class', l.el.classList.contains('gold') ? 'gold' : '');
    l.line = document.createElementNS(NS, 'polyline'); l.dot = document.createElementNS(NS, 'circle'); l.dot.setAttribute('r', '3.5');
    l.g.append(l.line, l.dot); svg.appendChild(l.g);
  });

  /* ---------- scroll ---------- */
  const st = { p: 0, s: 0 };
  ScrollTrigger.create({ trigger: section, start: 'top top', end: 'bottom bottom', onUpdate: t => { st.p = t.progress; } });
  let visible = false; new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(section);
  function size() {
    const w = innerWidth, h = innerHeight, d = Math.min(devicePixelRatio, 2);
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  addEventListener('resize', size); size();

  const ease = t => t * t * (3 - 2 * t), clamp01 = v => Math.max(0, Math.min(1, v)), ss = (a, b, x) => ease(clamp01((x - a) / (b - a)));
  const lerp = THREE.MathUtils.lerp, center = new THREE.Vector3(0, 15, 1), up = new THREE.Vector3(), fwd = new THREE.Vector3(), v = new THREE.Vector3();
  let last = performance.now();

  function frame(now) {
    requestAnimationFrame(frame);
    last = now;
    if (!visible) return;
    st.s += (st.p - st.s) * .07;
    const p = st.s, narrow = innerWidth < 900;
    const draw = clamp01(p / .88);
    parts.forEach(pt => { const k = ease(clamp01((draw - pt.from) / (pt.to - pt.from))); pt.line.geometry.setDrawRange(0, Math.floor(pt.count * k / 2) * 2); });
    gold.material.opacity = .85 * ss(.86, .96, p);

    // camera: high and wide, then a low tilted pass across the front, then home: front, upright, a little above
    const home = ss(.84, .97, p), low = ss(.08, .3, p) * (1 - home);
    const az = lerp(lerp(-1.15, .95, ss(.05, .84, p)) + Math.sin(p * 9) * .06 * low, .18, home);
    const el = lerp(lerp(.85, .1, low), .2, home);
    const dist = lerp(lerp(narrow ? 230 : 170, narrow ? 120 : 82, low), narrow ? 230 : 150, home);
    camera.position.set(center.x + dist * Math.sin(az) * Math.cos(el), center.y + dist * Math.sin(el), center.z + dist * Math.cos(az) * Math.cos(el));
    const look = center.clone().add(new THREE.Vector3(narrow ? 0 : lerp(lerp(-8, 20, low), 2, home), narrow ? lerp(4, 12, home) : lerp(0, 3, home), 0));
    camera.up.set(0, 1, 0); camera.lookAt(look);
    // tilt the horizon during the low pass (camera roll), level again at home
    fwd.subVectors(look, camera.position).normalize();
    up.set(0, 1, 0).applyAxisAngle(fwd, -.32 * low * Math.sin(az + .4)); camera.up.copy(up); camera.lookAt(look);
    renderer.render(scene, camera);

    // museum labels: a tidy column on the right, top to bottom from the dome to the door, each with a thin
    // line to its part; a label appears when its part has been drawn and stays. Phones: only the newest, at the bottom.
    let newest = -1;
    labels.forEach((l, i) => { if (draw > l.show) newest = i; });
    const colX = innerWidth * .78, top = innerHeight * .2, gap = innerHeight * .6 / Math.max(1, labels.length - 1);
    labels.forEach((l, i) => {
      const on = draw > l.show && (narrow ? i === newest : true);
      l.el.classList.toggle('on', on);
      if (narrow) return;
      v.copy(l.at).project(camera);
      const x = (v.x * .5 + .5) * innerWidth, y = (-v.y * .5 + .5) * innerHeight, sy = top + (labels.length - 1 - i) * gap;
      l.el.style.transform = `translate(${colX}px, ${sy}px)`;
      const seen = on && v.z < 1 && x > 0 && x < colX - 30 && y > 60 && y < innerHeight - 40 && (low < .55 || home > .4);
      l.line.setAttribute('points', `${x.toFixed(1)},${y.toFixed(1)} ${(colX - 46).toFixed(1)},${sy.toFixed(1)} ${(colX - 12).toFixed(1)},${sy.toFixed(1)}`);
      l.dot.setAttribute('cx', x.toFixed(1)); l.dot.setAttribute('cy', y.toFixed(1));
      l.g.style.opacity = seen ? 1 : 0;
    });
    intro.style.opacity = String(1 - ss(.04, .1, p) + ss(.88, .96, p));
    end.style.opacity = String(ss(.9, .97, p));
  }
  requestAnimationFrame(frame);
  // this module can start after the horizontal section's pin exists: keep the triggers in page order
  ScrollTrigger.sort(); ScrollTrigger.refresh();
}
if (window.__pageReady) init(); else addEventListener('page-ready', init, { once: true });
