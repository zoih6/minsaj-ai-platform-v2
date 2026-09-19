// Minsaj v3 Geometry Audit — measures REAL DOM geometry, no guessing.
// Detects: viewport overflow, parent overflow, edge-hugging, overlaps, contrast, fixed elements.
(() => {
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const docW = document.documentElement.scrollWidth;
  const out = {
    viewport: { w: vw, h: vh, docW, horizontalScroll: docW > vw + 1 },
    pageOverflowX: docW - vw,
    hScrollElements: [],      // elements wider than viewport
    parentOverflows: [],      // elements exceeding parent rect
    edgeHuggers: [],          // interactive/visible elements < 4px from viewport edge
    overlaps: [],             // visible element pairs intersecting
    contrast: [],             // text nodes failing WCAG
    fixedCount: 0,
    absCount: 0,
  };
  const all = Array.from(document.querySelectorAll('*'));
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    // viewport clipping: exclude off-canvas drawers/translated elements (±300px grace)
    if (r.left < -300 || r.right > vw + 300 || r.top < -300) return false;
    const s = getComputedStyle(el);
    if (s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0') {
      // ensure an ancestor hasn't translated it away
      return true;
    }
    return false;
  };
  const label = (el) => {
    const id = el.id ? '#' + el.id : '';
    const cls = (typeof el.className === 'string' ? el.className : '').trim().split(/\s+/).slice(0, 2).join('.');
    return `${el.tagName.toLowerCase()}${id}${cls ? '.' + cls : ''}`;
  };
  // scrollClipped: element is (partially) outside an ancestor that clips
  // (overflow != visible) — visually hidden by design (scroll rails).
  const scrollClipped = (el) => {
    let p = el.parentElement;
    while (p && p !== document.body) {
      const s = getComputedStyle(p);
      const clips = ['auto', 'hidden', 'scroll', 'clip'].includes(s.overflowX) || ['auto', 'hidden', 'scroll', 'clip'].includes(s.overflow);
      if (clips) {
        const pr = p.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        if (r.left < pr.left - 2 || r.right > pr.right + 2) return true;
      }
      p = p.parentElement;
    }
    return false;
  };

  // 1. fixed/absolute census
  for (const el of all) {
    const s = getComputedStyle(el);
    if (s.position === 'fixed') out.fixedCount++;
    if (s.position === 'absolute') out.absCount++;
  }

  // 2. horizontal scroll + edge hugging + parent overflow
  const interactiveSel = 'a,button,input,select,textarea,[role=button],[role=tab],[onclick]';
  for (const el of all) {
    if (!visible(el)) continue;
    if (scrollClipped(el)) continue; // inside a clipping scroll rail — by design
    const r = el.getBoundingClientRect();
    if (r.width > vw + 2) out.hScrollElements.push({ el: label(el), w: Math.round(r.width) });
    // parent overflow check
    const p = el.parentElement;
    if (p && p !== document.body && p.tagName !== 'HTML') {
      const pr = p.getBoundingClientRect();
      const ps = getComputedStyle(p);
      const overRight = r.right - pr.right;
      const overLeft = pr.left - r.left;
      const clipOK = ['auto', 'hidden', 'scroll', 'clip'].includes(ps.overflow + '') || ['auto','hidden','scroll','clip'].includes(ps.overflowX);
      if (!clipOK && (overRight > 6 || overLeft > 6) && pr.width > 5) {
        out.parentOverflows.push({
          el: label(el), parent: label(p),
          overRight: Math.round(overRight), overLeft: Math.round(overLeft),
        });
      }
    }
    // edge hugging (only interactive or text-bearing, not full-bleed wrappers)
    if (el.matches(interactiveSel) || el.children.length === 0) {
      if (r.width < vw - 8) { // skip full-width blocks
        if (r.left < 4 && r.left > -50) out.edgeHuggers.push({ el: label(el), left: Math.round(r.left), w: Math.round(r.width) });
        else if (r.right > vw - 4 && r.right < vw + 50) out.edgeHuggers.push({ el: label(el), right: Math.round(vw - r.right), w: Math.round(r.width) });
      }
    }
  }
  out.hScrollElements = out.hScrollElements.slice(0, 12);
  out.parentOverflows = out.parentOverflows.slice(0, 15);
  out.edgeHuggers = out.edgeHuggers.slice(0, 12);

  // 3. overlaps: visible "leaf-ish" interactive elements intersecting each other
  const inter = all.filter(el => visible(el) && !scrollClipped(el) && el.matches(interactiveSel) && el.offsetParent !== null);
  for (let i = 0; i < inter.length && out.overlaps.length < 15; i++) {
    for (let j = i + 1; j < inter.length && out.overlaps.length < 15; j++) {
      const a = inter[i], b = inter[j];
      if (a.contains(b) || b.contains(a)) continue;
      const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      const ix = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
      const iy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
      if (ix > 4 && iy > 4) {
        const za = getComputedStyle(a).zIndex, zb = getComputedStyle(b).zIndex;
        out.overlaps.push({ a: label(a), b: label(b), ix: Math.round(ix), iy: Math.round(iy), za, zb });
      }
    }
  }

  // 4. contrast (text elements) — WCAG AA needs 4.5:1 (3:1 for >= 24px)
  const lum = (rgb) => {
    const [r, g, b] = rgb.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map(v => {
      v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const alphaOf = (c) => { const m = c.match(/rgba?\([^)]*?,\s*([\d.]+)\)/); return m ? parseFloat(m[1]) : 1; };
  const composite = (top, bottom) => {
    // one-layer alpha composite, returns opaque rgb string
    const a = alphaOf(top);
    if (a >= 1) return top;
    const t = top.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
    const b = bottom.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
    const out = t.map((v, i) => Math.round(v * a + b[i] * (1 - a)));
    return `rgb(${out.join(', ')})`;
  };
  const bgOf = (el) => {
    // walk ancestors, compositing translucent layers over the first opaque bg
    let layers = [];
    let e = el;
    while (e && e !== document.documentElement) {
      const bg = getComputedStyle(e).backgroundColor;
      if (bg && !bg.includes('rgba(0, 0, 0, 0')) layers.push(bg);
      if (layers.length && alphaOf(layers[layers.length - 1]) === 1) break;
      e = e.parentElement;
    }
    if (!layers.length) return 'rgb(255, 255, 255)';
    let acc = layers[layers.length - 1];
    if (alphaOf(acc) < 1) acc = composite(acc, 'rgb(255, 255, 255)');
    for (let i = layers.length - 2; i >= 0; i--) acc = composite(layers[i], acc);
    return acc;
  };
  const textEls = all.filter(el => visible(el) && el.children.length === 0 && el.textContent.trim().length > 1);
  for (const el of textEls) {
    const s = getComputedStyle(el);
    // gradient-clipped text (background-clip:text): flat-color contrast math
    // does not apply; gradient stops verified separately (palette-verify.py,
    // hero stops 6.4–8.3:1). Skip — documented, not guessed.
    if (s.webkitTextFillColor === 'transparent' || (s.color === 'rgba(0, 0, 0, 0)' && s.backgroundImage !== 'none')) continue;
    const fg = s.color, bg = bgOf(el);
    if (fg === bg) continue;
    try {
      const L1 = lum(fg), L2 = lum(bg);
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const size = parseFloat(s.fontSize);
      const big = size >= 24 || (size >= 18.66 && (s.fontWeight >= 700));
      const need = big ? 3 : 4.5;
      if (ratio < need - 0.05) out.contrast.push({
        el: label(el), text: el.textContent.trim().slice(0, 25), fg, bg,
        ratio: +ratio.toFixed(2), need, size: Math.round(size * 10) / 10,
      });
    } catch (e) { /* skip */ }
  }
  out.contrast = out.contrast.slice(0, 15);
  out.textChecked = textEls.length;
  out.interactiveChecked = inter.length;

  // 5. active tab state check
  out.activeTabs = Array.from(document.querySelectorAll('.is-active, [aria-current="page"], .active'))
    .filter(visible).map(el => ({ el: label(el), text: el.textContent.trim().slice(0, 20), cls: el.className.toString().slice(0, 60) }));

  // 6. bottom-nav occlusion probe (async-free approximation):
  //    elements whose click area sits inside the fixed nav band while at
  //    current scroll AND that would remain there at page end are unreachable.
  const navEl = Array.from(document.querySelectorAll('nav, [class*="mobile-nav"], [class*="tabbar"], [class*="tab-bar"]'))
    .filter(el => { const s = getComputedStyle(el); return s.position === 'fixed' && el.getBoundingClientRect().height > 30 && el.getBoundingClientRect().bottom > vh - 20; })[0];
  out.bottomNav = navEl ? { h: Math.round(navEl.getBoundingClientRect().height), top: Math.round(navEl.getBoundingClientRect().top) } : null;

  return JSON.stringify(out);
})()
