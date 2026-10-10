// Animations for the long explanations, one per concept. Each registers draw(ctx, w, h, t, theme) on window.MathIllustrations.

// ---- countability ----
;(function () {
(function () {
  // Cantor's zigzag through the grid of fractions p/q (row p, column q).
  // The path runs along the anti-diagonals p + q = 2, 3, ..., 7, alternating direction.
  // Fractions in lowest terms receive the next natural number; the others (2/2, 4/2, 3/3, 2/4)
  // equal a fraction already numbered, so they are greyed and skipped.
  var N = 6;            // grid size shown
  var SMAX = 7;         // last complete diagonal p + q = 7 (it holds 1/6 ... 6/1)
  var T0 = 0.5;         // the path starts at 1/1
  var STEP = 0.385;     // seconds per step; 21 steps end at 8.59 s, then hold
  var MOVE = 0.62;      // fraction of a step spent moving (rest: dwell on the cell)

  function gcd(a, b) { while (b) { var r = a % b; a = b; b = r; } return a; }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function ease(u) { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); }

  // Build the zigzag order once.
  var path = [];        // {p, q, n (0 = skipped), red: "a/b" (lowest terms) for skipped}
  var count = 0;
  for (var s = 2; s <= SMAX; s++) {
    var cells = [];
    for (var p = 1; p < s; p++) cells.push([p, s - p]);  // p ascending: from top-right to bottom-left
    if (s % 2 === 1) { /* odd s: go down-left (p ascending): 1/2 -> 2/1 */ }
    else cells.reverse();                                  // even s: go up-right: 3/1 -> 2/2 -> 1/3
    for (var i = 0; i < cells.length; i++) {
      var pp = cells[i][0], qq = cells[i][1], g = gcd(pp, qq);
      path.push({ p: pp, q: qq, n: g === 1 ? ++count : 0, red: (pp / g) + "/" + (qq / g) });
    }
  }
  // path.length === 21, count === 17. The next cell would be 7/1, just below the grid.

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
  }

  (window.MathIllustrations || (window.MathIllustrations = {}))["countability"] = {
    caption: "A zigzag through the fractions p/q numbers each one 1, 2, 3, …, skipping repeats like 2/4, so every positive rational gets exactly one number.",
    duration: 10,
    still: 9,
    aspect: 0.72,
    draw: function (ctx, w, h, t, theme) {
      ctx.save();
      var pad = 8;
      // grid: 6 columns + room for "⋯" on the right, 6 rows + room for the exit arrow below
      var cw = (w - 2 * pad) / (N + 0.5);
      var ch = (h - 2 * pad - 4) / (N + 0.55);
      var x0 = pad + 0.1 * cw, y0 = pad + 4;
      function cx(q) { return x0 + (q - 0.5) * cw; }
      function cy(p) { return y0 + (p - 0.42) * ch; }

      var fade = 1 - ease((t - 9.6) / 0.4);              // gentle reset at the end of the loop
      var prog = (t - T0) / STEP;                         // 0 at 1/1, 21 at the exit
      var kDone = Math.floor(prog);                       // last node reached (if fractional part >= MOVE)
      function reached(k) { return prog >= k; }

      var fFrac = "12px " + theme.font;
      ctx.font = fFrac; ctx.textAlign = "center"; ctx.textBaseline = "middle";

      // ---- faint fractions beyond the shown diagonals: the grid goes on ----
      ctx.fillStyle = theme.muted;
      ctx.globalAlpha = 0.38;
      for (var p = 1; p <= N; p++) for (var q = 1; q <= N; q++) {
        if (p + q > SMAX) ctx.fillText(p + "/" + q, cx(q), cy(p));
      }
      ctx.globalAlpha = 0.6;
      ctx.fillText("⋯", x0 + (N + 0.2) * cw, cy(1));
      ctx.fillText("⋮", cx(4), cy(N) + 0.62 * ch);
      ctx.globalAlpha = 1;

      // ---- the path, up to the moving head ----
      var col = theme.colors[0];
      var pts = path.map(function (c) { return [cx(c.q), cy(c.p)]; });
      pts.push([cx(1), cy(N) + 0.78 * ch]);               // towards 7/1, below the grid
      var head = null;
      if (prog > 0) {
        ctx.globalAlpha = fade;
        ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.lineJoin = "round"; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        var last = Math.min(kDone, pts.length - 1);
        for (var k = 1; k <= last; k++) ctx.lineTo(pts[k][0], pts[k][1]);
        if (kDone < pts.length - 1) {
          var u = ease((prog - kDone) / MOVE);
          var a = pts[kDone], b = pts[kDone + 1];
          head = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
          ctx.lineTo(head[0], head[1]);
        } else head = pts[pts.length - 1];
        ctx.stroke();
        // arrowhead at the exit once the path leaves the grid
        if (kDone >= pts.length - 1) {
          var e = pts[pts.length - 1], sz = 6;
          ctx.fillStyle = col;
          ctx.beginPath(); ctx.moveTo(e[0], e[1] + 2);
          ctx.lineTo(e[0] - sz * 0.6, e[1] + 2 - sz); ctx.lineTo(e[0] + sz * 0.6, e[1] + 2 - sz);
          ctx.closePath(); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // ---- the moving head (drawn under the halos, so it slides behind each fraction) ----
      if (head && kDone < pts.length - 1) {
        ctx.fillStyle = col; ctx.globalAlpha = fade;
        ctx.beginPath(); ctx.arc(head[0], head[1], 3.2, 0, 2 * Math.PI); ctx.fill();
        ctx.globalAlpha = 1;
      }

      // ---- the fractions on the path, with halos so the line runs between them ----
      var fBadge = "600 11px " + theme.mono;
      for (var j = 0; j < path.length; j++) {
        var c = path[j], x = cx(c.q), y = cy(c.p), txt = c.p + "/" + c.q;
        ctx.font = fFrac;
        var tw = ctx.measureText(txt).width;
        var on = reached(j) && fade > 0;
        roundRect(ctx, x - tw / 2 - 4, y - 8, tw + 8, 16, 5);
        ctx.fillStyle = theme.bg; ctx.fill();
        if (c.n && on) {
          ctx.globalAlpha = fade;
          ctx.fillStyle = theme.surface; ctx.fill();
          ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.stroke();
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = (c.n && on) ? theme.ink : theme.muted;
        if (!c.n) ctx.globalAlpha = 0.75;
        ctx.fillText(txt, x, y + 0.5);
        if (!c.n && on) {                                  // struck out: a repeat
          ctx.globalAlpha = fade * 0.9;
          ctx.strokeStyle = theme.muted; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(x - tw / 2 - 2, y + 4); ctx.lineTo(x + tw / 2 + 2, y - 3); ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // number badge, up-left of the fraction (that direction is never used by the path)
        if (c.n && on) {
          var pop = ease((prog - j) / 0.35);
          var bx = x - tw / 2 - 7, by = y - 10, r = 8 * (0.6 + 0.4 * pop);
          ctx.globalAlpha = fade * pop;
          ctx.fillStyle = col; ctx.beginPath(); ctx.arc(bx, by, r, 0, 2 * Math.PI); ctx.fill();
          ctx.font = fBadge; ctx.fillStyle = theme.bg;
          ctx.fillText(String(c.n), bx, by + 0.5);
          ctx.globalAlpha = 1;
        }
      }

      // ---- while passing a repeat, say which fraction it equals ----
      if (prog > 0 && kDone < path.length && fade > 0) {
        var cur = path[kDone];
        if (!cur.n) {
          var v = clamp(Math.min((prog - kDone) / 0.15, (kDone + 1 - prog) / 0.2), 0, 1);
          var lab = "= " + cur.red, lx = cx(cur.q), ly = cy(cur.p) - 0.5 * ch - 3;
          ctx.font = "11px " + theme.font;
          var lw = ctx.measureText(lab).width;
          ctx.globalAlpha = v;
          roundRect(ctx, lx - lw / 2 - 4, ly - 7, lw + 8, 14, 4);
          ctx.fillStyle = theme.surface; ctx.fill();
          ctx.strokeStyle = theme.muted; ctx.lineWidth = 0.8; ctx.stroke();
          ctx.fillStyle = theme.muted; ctx.fillText(lab, lx, ly + 0.5);
          ctx.globalAlpha = 1;
        }
      }

      ctx.restore();
    }
  };
})();
})();

// ---- euclidean-algorithm ----
;(function () {
(function () {
  // Euclid's algorithm on 42 × 30 as greedy square tiling.
  // 42 = 1·30 + 12  -> one 30-square, leaving a 12 × 30 strip
  // 30 = 2·12 + 6   -> two 12-squares, leaving a 12 × 6 strip
  // 12 = 2·6 + 0    -> two 6-squares, nothing left: gcd(42, 30) = 6
  var A = 42, B = 30;

  // squares in rectangle units (x, y from the top-left corner), with colour index and appear time
  var SQ = [
    { x: 0,  y: 0,  s: 30, c: 0, t: 0.9 },
    { x: 30, y: 0,  s: 12, c: 1, t: 2.5 },
    { x: 30, y: 12, s: 12, c: 1, t: 3.1 },
    { x: 30, y: 24, s: 6,  c: 2, t: 4.6 },
    { x: 36, y: 24, s: 6,  c: 2, t: 5.1 }
  ];
  var GROW = 0.5;

  // equations as coloured tokens: [text, colour index or -1 for ink]
  var EQ = [
    { t: 1.2, parts: [["42", -1], [" = 1·", -1], ["30", 0], [" + ", -1], ["12", 1]] },
    { t: 3.3, parts: [["30", 0], [" = 2·", -1], ["12", 1], [" + ", -1], ["6", 2]] },
    { t: 5.4, parts: [["12", 1], [" = 2·", -1], ["6", 2], [" + 0", -1]] }
  ];
  var T_GRID = 6.4, T_GCD = 6.9, T_FADE = 9.35;

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function smooth(a, b, x) { var u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); }
  function easeOutBack(u) { var c = 1.4; u -= 1; return 1 + (c + 1) * u * u * u + c * u * u; }

  (window.MathIllustrations || (window.MathIllustrations = {}))["euclidean-algorithm"] = {
    caption: "Cut the largest squares from a 42 × 30 rectangle, then from what is left, and so on; the last square size, 6, is gcd(42, 30).",
    duration: 10,
    still: 8,
    aspect: 0.56,
    draw: function (ctx, w, h, t, theme) {
      ctx.save();
      var pad = 8;
      var fs = w < 300 ? 11 : 12;
      var mono = fs + "px " + theme.mono, sans = fs + "px " + theme.font;
      var col = function (i) { return i < 0 ? theme.ink : theme.colors[i]; };

      // ---- layout: rectangle on the left, equations on the right ----
      ctx.font = mono;
      ctx.font = "600 " + mono;
      var textW = ctx.measureText("gcd(42, 30) = 6").width;
      ctx.font = mono;
      var gap = Math.max(12, 0.04 * w);
      var leftLab = fs + 8, topLab = fs + 8;
      var maxRW = w - 2 * pad - leftLab - gap - textW;
      var maxRH = h - 2 * pad - topLab;
      var u = Math.min(maxRW / A, maxRH / B);          // pixels per unit
      var RW = A * u, RH = B * u;
      var blockW = leftLab + RW + gap + textW;
      var x0 = pad + Math.max(0, (w - 2 * pad - blockW) / 2) + leftLab;
      var y0 = pad + topLab + Math.max(0, (h - 2 * pad - topLab - RH) / 2);

      var fade = 1 - smooth(T_FADE, 9.95, t);          // squares fade before the loop restarts

      // ---- squares: fills, then the 6-grid, then edges, then size labels ----
      var FA = theme.dark ? 0.24 : 0.17;                 // fill opacity of a square
      var st = [];
      for (var i = 0; i < SQ.length; i++) {
        var q = SQ[i];
        var p = clamp((t - q.t) / GROW, 0, 1);
        if (p <= 0 || fade <= 0) continue;
        var ss = q.s * u * easeOutBack(p);
        st.push({ q: q, p: p, a: fade * Math.min(1, p * 2), ss: ss,
                  cx: x0 + (q.x + q.s / 2) * u, cy: y0 + (q.y + q.s / 2) * u });
      }
      var r;
      for (i = 0; i < st.length; i++) {
        r = st[i];
        ctx.globalAlpha = r.a * FA; ctx.fillStyle = col(r.q.c);
        ctx.fillRect(r.cx - r.ss / 2, r.cy - r.ss / 2, r.ss, r.ss);
      }

      // the 6-grid: squares of side 6 tile the whole rectangle (42 = 7·6, 30 = 5·6)
      var g = smooth(T_GRID, T_GRID + 0.7, t) * fade;
      if (g > 0) {
        ctx.globalAlpha = g * 0.8;
        ctx.strokeStyle = theme.colors[2]; ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        // dashed lines only where no square edge already is
        for (var gx = 6; gx <= 36; gx += 6) {
          if (gx === 30) continue;
          var X = Math.round(x0 + gx * u) + 0.5;
          ctx.moveTo(X, y0); ctx.lineTo(X, y0 + (gx === 36 ? 24 : B) * u);
        }
        for (var gy = 6; gy <= 24; gy += 6) {
          var Y = Math.round(y0 + gy * u) + 0.5;
          ctx.moveTo(x0, Y); ctx.lineTo(x0 + (gy % 12 === 0 ? 30 : A) * u, Y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.lineJoin = "miter"; ctx.lineWidth = 1.5;
      var inset = 1.25;
      for (i = 0; i < st.length; i++) {
        r = st[i];
        ctx.globalAlpha = r.a; ctx.strokeStyle = col(r.q.c);
        var e2 = Math.max(0, r.ss - 2 * inset);
        ctx.strokeRect(r.cx - e2 / 2, r.cy - e2 / 2, e2, e2);
      }

      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
      for (i = 0; i < st.length; i++) {
        r = st[i];
        if (r.p <= 0.6) continue;
        var la = fade * smooth(0.6, 1, r.p), txt = String(r.q.s), ly = r.cy + 0.5;
        ctx.font = (r.q.s >= 30 ? fs + 1 : fs) + "px " + theme.mono;
        if (g > 0) {
          // a patch the exact colour of the square's fill, so grid lines stop short of the number
          var bw = ctx.measureText(txt).width + 6, bh = fs + 4;
          ctx.globalAlpha = la; ctx.fillStyle = theme.bg; ctx.fillRect(r.cx - bw / 2, ly - bh / 2, bw, bh);
          ctx.globalAlpha = la * FA; ctx.fillStyle = col(r.q.c); ctx.fillRect(r.cx - bw / 2, ly - bh / 2, bw, bh);
        }
        ctx.globalAlpha = la; ctx.fillStyle = col(r.q.c);
        ctx.fillText(txt, r.cx, ly);
      }
      ctx.globalAlpha = 1;

      // ---- outer rectangle and its sides ----
      ctx.strokeStyle = theme.ink; ctx.lineWidth = 1.5;
      ctx.strokeRect(x0, y0, RW, RH);
      ctx.fillStyle = theme.muted; ctx.font = mono;
      ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
      ctx.fillText("42", x0 + RW / 2, y0 - 6);
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText("30", x0 - 5, y0 + RH / 2);

      // ---- equations ----
      var ex = x0 + RW + gap;
      var lh = Math.round(fs * 1.9);
      var eTop = y0 + RH / 2 - 1.5 * lh;               // four lines centred on the rectangle
      ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.font = mono;
      for (var e = 0; e < EQ.length; e++) {
        var a = smooth(EQ[e].t, EQ[e].t + 0.4, t) * fade;
        if (a <= 0) continue;
        ctx.globalAlpha = a;
        var xx = ex + 6 * (1 - a), yy = eTop + e * lh;
        var parts = EQ[e].parts;
        for (var j = 0; j < parts.length; j++) {
          ctx.fillStyle = col(parts[j][1]);
          ctx.fillText(parts[j][0], xx, yy);
          xx += ctx.measureText(parts[j][0]).width;
        }
      }
      // conclusion
      var c = smooth(T_GCD, T_GCD + 0.5, t) * fade;
      if (c > 0) {
        ctx.globalAlpha = c;
        var yy2 = eTop + 3 * lh;
        ctx.strokeStyle = theme.muted; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(ex, yy2 - lh / 2 - 0.5); ctx.lineTo(ex + textW, yy2 - lh / 2 - 0.5); ctx.stroke();
        ctx.font = "600 " + mono;
        ctx.fillStyle = theme.ink;
        ctx.fillText("gcd(42, 30) = ", ex, yy2 + 2);
        var wpre = ctx.measureText("gcd(42, 30) = ").width;
        ctx.fillStyle = theme.colors[2];
        ctx.fillText("6", ex + wpre, yy2 + 2);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  };
})();
})();

// ---- group ----
;(function () {
(function () {
  // The dihedral group D3: the six symmetries of an equilateral triangle.
  // Fixed positions (math angles, y up): 0 = top (90°), 1 = bottom-left (210°), 2 = bottom-right (330°).
  // Corners A, B, C start at positions 0, 1, 2.
  // r  = rotate 120° anticlockwise: position k -> k+1, so (top, BL, BR) reads C, A, B.
  // r² = rotate 240°: reads B, C, A.
  // s₁, s₂, s₃ = reflections in the fixed axes through positions 0, 1, 2 (where A, B, C start):
  //   s₁ reads A, C, B;  s₂ reads C, B, A;  s₃ reads B, A, C.
  // Composition shown at the end: s₁ then r.  s₁: 0→0, 1→2, 2→1; r: k→k+1.
  //   0→0→1, 1→2→0, 2→1→2: fixes position 2 and swaps 0,1, which is s₃.
  //   Arrangement: (A,B,C) -s₁-> (A,C,B) -r-> (B,A,C) = s₃'s arrangement. ✓
  const D2R = Math.PI / 180;
  const POS = [90, 210, 330].map((a) => a * D2R);
  const ELEMS = [
    { sym: "e", name: "identity: do nothing", kind: "rot", ang: 0 },
    { sym: "r", name: "rotate 120°", kind: "rot", ang: 120 * D2R },
    { sym: "r²", name: "rotate 240°", kind: "rot", ang: 240 * D2R },
    { sym: "s₁", name: "reflect in the axis through A", kind: "ref", axis: 0 },
    { sym: "s₂", name: "reflect in the axis through B", kind: "ref", axis: 1 },
    { sym: "s₃", name: "reflect in the axis through C", kind: "ref", axis: 2 },
  ];
  const D = 15, SEG = 1.7, M0 = 0.25, M1 = 1.15;
  const C0 = 6 * SEG; // composition starts at 10.2 s, ends 13.4 s, then hold
  const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ease = (s) => { s = clamp(s); return s * s * (3 - 2 * s); };

  // Unit-circle point of a corner that started at position k, after a transform.
  const home = (k) => [Math.cos(POS[k]), Math.sin(POS[k])];
  const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
  // Flip about the axis through position `ax`, progress s in [0,1]: the perpendicular part scales by cos(πs).
  const flip = ([x, y], ax, s) => {
    const dx = Math.cos(POS[ax]), dy = Math.sin(POS[ax]);
    const along = x * dx + y * dy, px = x - along * dx, py = y - along * dy, c = Math.cos(Math.PI * s);
    return [along * dx + px * c, along * dy + py * c];
  };
  const apply = (el, p, s) => (el.kind === "rot" ? rot(p, el.ang * s) : flip(p, el.axis, s));
  // Final arrangement of each element, as unit-circle points for corners A, B, C.
  const FINAL = ELEMS.map((el) => [0, 1, 2].map((k) => apply(el, home(k), 1)));

  (window.MathIllustrations ||= {})["group"] = {
    caption: "The six symmetries of a triangle, one by one; then a reflection followed by a rotation turns out to be another of the six.",
    duration: D,
    still: 13.8,
    aspect: 0.76,
    draw(ctx, w, h, t, theme) {
      ctx.save();
      const pad = 8;
      const cornerCol = [theme.colors[0], theme.colors[1], theme.colors[2]];
      const LET = ["A", "B", "C"];
      const fs = w < 300 ? 12 : 13;
      ctx.lineCap = "round"; ctx.lineJoin = "round";

      // --- layout ---
      const titleY = pad + 9;
      const cw = (w - 2 * pad) / 6;
      const labY = h - pad - 6; // thumbnail label baseline-centre
      const rt = Math.min(cw * 0.3, 16);
      const thumbCy = labY - 12 - rt * 0.55;
      const stageTop = titleY + 14, stageBot = thumbCy - rt - 10;
      const vr = Math.max(8, Math.min(11, w / 30));
      const R = Math.min((stageBot - stageTop) / 2 - vr - 1, w * 0.3);
      const cx = w / 2, cy = (stageTop + stageBot) / 2;
      const S = ([x, y], ox, oy, rr) => [ox + x * rr, oy - y * rr];

      // --- timeline ---
      let el = null, s = 0, alpha = 1, idx = -1, comp = false, cs1 = 0, cs2 = 0, cu = 0;
      if (t < C0) {
        idx = Math.floor(t / SEG); el = ELEMS[idx];
        const u = t - idx * SEG;
        s = ease((u - M0) / (M1 - M0));
        alpha = Math.min(idx === 0 ? 1 : clamp(u / 0.15), clamp((SEG - u) / 0.18));
      } else {
        comp = true; cu = t - C0;
        alpha = idx === 0 ? 1 : clamp(cu / 0.15);
        cs1 = ease((cu - 0.3) / 0.8); cs2 = ease((cu - 1.35) / 0.8);
      }
      const revealed = (i) => (t >= C0 ? 1 : clamp((t - i * SEG - M1) / 0.25));

      // --- title ---
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const title = (parts) => {
        ctx.font = "600 " + fs + "px " + theme.font;
        let total = 0;
        const ws = parts.map(([txt, bold]) => {
          ctx.font = (bold ? "600 " : "") + fs + "px " + theme.font;
          const m = ctx.measureText(txt).width; total += m; return m;
        });
        let x = cx - total / 2;
        ctx.textAlign = "left";
        parts.forEach(([txt, bold, col], i) => {
          ctx.font = (bold ? "600 " : "") + fs + "px " + theme.font;
          ctx.fillStyle = col; ctx.fillText(txt, x, titleY); x += ws[i];
        });
        ctx.textAlign = "center";
      };
      if (!comp) {
        title([[el.sym, true, theme.accent], ["  " + el.name, false, theme.ink]]);
      } else {
        const done = cu > 2.25;
        const parts = [["s₁", true, theme.accent], [" then ", false, theme.ink], ["r", true, theme.accent]];
        if (done) parts.push([" = ", false, theme.ink], ["s₃", true, theme.accent]);
        ctx.globalAlpha = alpha; title(parts); ctx.globalAlpha = 1;
      }

      // --- ghost triangle (the fixed outline the shape must land on) ---
      const tri = (pts, ox, oy, rr) => {
        ctx.beginPath();
        pts.forEach((p, i) => { const [x, y] = S(p, ox, oy, rr); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
        ctx.closePath();
      };
      const homes = [0, 1, 2].map(home);
      ctx.setLineDash([4, 4]); ctx.strokeStyle = theme.muted; ctx.lineWidth = 1.2;
      tri(homes, cx, cy, R); ctx.stroke(); ctx.setLineDash([]);

      // --- axis or rotation arrow ---
      const axisLine = (ax, a) => {
        const d = home(ax);
        const p0 = S([d[0] * (1 + vr / R + 0.12), d[1] * (1 + vr / R + 0.12)], cx, cy, R);
        const p1 = S([-d[0] * 0.72, -d[1] * 0.72], cx, cy, R);
        ctx.globalAlpha = a; ctx.setLineDash([6, 4]); ctx.strokeStyle = theme.accent; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
      };
      const arcArrow = (a0, sweep, a) => {
        if (sweep < 0.05) return;
        const ra = R * 0.3, a1 = a0 + sweep;
        ctx.globalAlpha = a; ctx.strokeStyle = theme.accent; ctx.fillStyle = theme.accent; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(cx, cy, ra, -a0, -a1, true); ctx.stroke();
        const ex = cx + ra * Math.cos(a1), ey = cy - ra * Math.sin(a1);
        const tx = -Math.sin(a1), ty = -Math.cos(a1), nx = Math.cos(a1), ny = -Math.sin(a1), L = 6;
        ctx.beginPath(); ctx.moveTo(ex + tx * L, ey + ty * L);
        ctx.lineTo(ex - tx * 1 + nx * L * 0.55, ey - ty * 1 + ny * L * 0.55);
        ctx.lineTo(ex - tx * 1 - nx * L * 0.55, ey - ty * 1 - ny * L * 0.55);
        ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 1;
      };

      // --- moving triangle ---
      let pts;
      if (!comp) {
        pts = homes.map((p) => apply(el, p, s));
        if (el.kind === "ref") axisLine(el.axis, alpha * clamp((t - idx * SEG) / 0.2));
      } else {
        pts = homes.map((p) => rot(flip(p, 0, cs1), 120 * D2R * cs2));
        if (cu < 1.3) axisLine(0, alpha * clamp(1 - (cu - 1.1) / 0.2));
        if (cu > 2.25) axisLine(2, clamp((cu - 2.25) / 0.3));
      }
      ctx.globalAlpha = alpha;
      tri(pts, cx, cy, R);
      ctx.fillStyle = theme.accent; ctx.globalAlpha = alpha * 0.1; ctx.fill();
      ctx.globalAlpha = alpha; ctx.strokeStyle = theme.ink; ctx.lineWidth = 1.8; ctx.stroke();
      if (!comp && el.kind === "rot" && el.ang > 0) arcArrow(POS[0], el.ang * s, alpha);
      if (comp && cs2 > 0) arcArrow(POS[0], 120 * D2R * cs2, cu > 2.25 ? clamp(1 - (cu - 2.25) / 0.3) : 1);
      ctx.globalAlpha = alpha;
      ctx.font = "600 " + (vr > 9.5 ? 12 : 11) + "px " + theme.font;
      pts.forEach((p, k) => {
        const [x, y] = S(p, cx, cy, R);
        ctx.fillStyle = cornerCol[k]; ctx.beginPath(); ctx.arc(x, y, vr, 0, 2 * Math.PI); ctx.fill();
        ctx.fillStyle = theme.bg; ctx.fillText(LET[k], x, y + 0.5);
      });
      ctx.globalAlpha = 1;

      // --- thumbnails: the six results ---
      ctx.font = fs + "px " + theme.font;
      ELEMS.forEach((e, i) => {
        const ox = pad + cw * (i + 0.5);
        const a = revealed(i);
        const current = (!comp && i === idx) || (comp && i === 5 && cu > 2.25);
        if (current) {
          const hl = comp ? clamp((cu - 2.25) / 0.3) : 1;
          ctx.globalAlpha = hl; ctx.strokeStyle = theme.accent; ctx.lineWidth = 1.4;
          const bx = ox - cw / 2 + 2, by = thumbCy - rt - 6, bw = cw - 4, bh = labY + 9 - by;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 5); else ctx.rect(bx, by, bw, bh);
          ctx.stroke(); ctx.globalAlpha = 1;
        }
        ctx.strokeStyle = a > 0 ? theme.muted : theme.line; ctx.lineWidth = 1;
        tri(homes, ox, thumbCy, rt); ctx.stroke();
        if (a > 0) {
          ctx.globalAlpha = a;
          const dr = Math.max(3.2, rt * 0.27);
          FINAL[i].forEach((p, k) => {
            const [x, y] = S(p, ox, thumbCy, rt);
            ctx.fillStyle = cornerCol[k]; ctx.beginPath(); ctx.arc(x, y, dr, 0, 2 * Math.PI); ctx.fill();
          });
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = a > 0 ? theme.ink : theme.muted;
        ctx.globalAlpha = a > 0 ? 0.35 + 0.65 * a : 0.6;
        ctx.fillText(e.sym, ox, labY);
        ctx.globalAlpha = 1;
      });
      ctx.restore();
    },
  };
})();
})();

// ---- induction ----
;(function () {
(function () {
  // Induction as a row of dominoes.
  // Each domino tips about its front-bottom edge. While falling freely it rotates by an eased
  // angle; once its front-top corner meets the back face of the next domino it rests on it,
  // so its angle is fixed by the next one's angle (exact contact geometry, see lean()).
  var T0 = 1.0;    // the first domino is tipped at this time (s)
  var TAU = 0.45;  // time from a domino starting to fall to it hitting the next one (s)
  var N_VIS = 10;  // pitches across the visible row
  var N = 14;      // total dominoes (the last few are behind the fade at the right edge)
  var GAP = 4;     // the labelled gap is between domino GAP and GAP+1 (0-based), i.e. "n" and "n+1"

  var cache = { key: "", fade: null };

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function smooth(a, b, x) { var u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); }

  // Turn any CSS colour into an rgba() string with alpha a (via the canvas's own normalisation).
  function withAlpha(ctx, col, a) {
    ctx.fillStyle = col;
    var s = String(ctx.fillStyle), r, g, b, a0 = 1, m;
    if (s.charAt(0) === "#") {
      r = parseInt(s.substr(1, 2), 16); g = parseInt(s.substr(3, 2), 16); b = parseInt(s.substr(5, 2), 16);
    } else if ((m = s.match(/rgba?\(([^)]+)\)/))) {
      var p = m[1].split(",").map(parseFloat); r = p[0]; g = p[1]; b = p[2]; if (p.length > 3) a0 = p[3];
    } else return null;
    return "rgba(" + r + "," + g + "," + b + "," + (a * a0) + ")";
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }

  function arrowHead(ctx, x, y, ang, s) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - s * Math.cos(ang - 0.45), y - s * Math.sin(ang - 0.45));
    ctx.lineTo(x - s * Math.cos(ang + 0.45), y - s * Math.sin(ang + 0.45));
    ctx.closePath(); ctx.fill();
  }

  (window.MathIllustrations || (window.MathIllustrations = {}))["induction"] = {
    caption: "The first domino, P(1), is tipped; each falling domino knocks over the next, P(n) ⇒ P(n+1); so every domino falls: P(n) for all n.",
    duration: 10,
    still: 3.9,
    aspect: 0.48,
    draw: function (ctx, w, h, t, theme) {
      ctx.save();
      var pad = 8;
      var font = "12px " + theme.font, fontI = "italic 12px " + theme.font;

      // ---- layout (everything scales with w; vertical block centred in h) ----
      var leftM = pad + Math.max(22, 0.08 * w);       // room for the push arrow
      var p = (w - pad - leftM) / N_VIS;               // pitch: back face to back face
      var H = 2.3 * p, d = 0.3 * p;                    // domino height and thickness
      var above = 32, below = 40;                      // label room above the tops / below the ground
      var avail = h - 2 * pad - above - below;
      if (H > avail) H = avail;
      var block = above + H + below;
      var top = pad + Math.max(0, (h - 2 * pad - block) / 2) + above;
      var ground = top + H;
      var s = p - d;                                   // free gap between neighbours
      var alpha = Math.asin(s / H);                    // angle at which a domino hits the next

      function backX(k) { return leftM + k * p; }
      function frontX(k) { return leftM + k * p + d; }
      function midX(k) { return leftM + k * p + d / 2; }
      function tStart(k) { return T0 + k * TAU; }

      // free fall angle (eased, with an initial kick from the push / impact)
      function free(k) {
        var u = (t - tStart(k)) / TAU;
        if (u <= 0) return 0;
        return Math.min(Math.PI / 2, alpha * (0.3 * u + 0.7 * u * u));
      }
      // Largest angle domino k can reach when the next domino is at angle th1:
      // its front-top corner lies on the next one's back face  <=>  H sin(th - th1) = p cos(th1) - d.
      function lean(th1) { return th1 + Math.asin(clamp((p * Math.cos(th1) - d) / H, -1, 1)); }

      var th = new Array(N);
      th[N - 1] = free(N - 1);
      for (var k = N - 2; k >= 0; k--) th[k] = Math.min(free(k), lean(th[k + 1]));

      var cBase = theme.colors[1], cStep = theme.colors[0];

      // ---- ground ----
      ctx.strokeStyle = theme.muted; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad, ground + 0.5); ctx.lineTo(w - pad, ground + 0.5); ctx.stroke();

      // ---- dominoes ----
      ctx.lineJoin = "round";
      for (k = 0; k < N; k++) {
        var x = frontX(k);
        if (x - d > w) break;
        var hit = smooth(tStart(k), tStart(k) + 0.12, t); // colour in once it is knocked
        var col = k === 0 ? cBase : cStep;
        ctx.save();
        ctx.translate(x, ground);
        ctx.rotate(th[k]);
        roundRect(ctx, -d, -H, d, H, Math.min(1.6, d / 3));
        ctx.fillStyle = theme.surface; ctx.fill();
        if (hit > 0) { ctx.globalAlpha = hit; ctx.fillStyle = col; ctx.fill(); ctx.globalAlpha = 1; }
        ctx.lineWidth = 1.25;
        ctx.strokeStyle = hit > 0.5 ? col : theme.ink; ctx.stroke();
        // the domino's middle bar
        ctx.strokeStyle = hit > 0.5 ? theme.surface : theme.muted; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-d + 1.5, -H / 2); ctx.lineTo(-1.5, -H / 2); ctx.stroke();
        ctx.restore();
      }

      // ---- fade the row out to the right: it goes on forever ----
      if (cache.key !== theme.bg) { cache.key = theme.bg; cache.c0 = withAlpha(ctx, theme.bg, 0); cache.c1 = withAlpha(ctx, theme.bg, 1); }
      if (cache.c0) {
        var fx0 = w - pad - 2.6 * p, fx1 = w - pad;
        var gr = ctx.createLinearGradient(fx0, 0, fx1, 0);
        gr.addColorStop(0, cache.c0); gr.addColorStop(1, cache.c1);
        ctx.fillStyle = gr; ctx.fillRect(fx0, top - 4, fx1 - fx0, ground - top + 8);
        ctx.fillStyle = cache.c1; ctx.fillRect(fx1, 0, w - fx1, h);
      }

      // ---- the push on domino 1 ----
      var ay = top + 0.16 * H;
      var tipX = backX(0) - 3 - 9 * (1 - smooth(0.3, T0, t));
      var tailX = Math.max(pad, backX(0) - 3 - 0.85 * (leftM - pad));
      ctx.strokeStyle = cBase; ctx.fillStyle = cBase; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(tipX - (backX(0) - 3 - tailX), ay); ctx.lineTo(tipX - 4, ay); ctx.stroke();
      arrowHead(ctx, tipX, ay, 0, 6);

      // ---- labels ----
      ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
      var labY = top - 18;
      ctx.font = font; ctx.fillStyle = cBase;
      ctx.fillText("P(1)", Math.max(pad + 14, midX(0)), labY);

      // curved arrow from domino n to domino n+1, brighter while that gap is being crossed
      var xa = midX(GAP), xb = midX(GAP + 1), ya = top - 4;
      var pulse = Math.exp(-Math.pow((t - tStart(GAP + 1)) / 0.35, 2));
      ctx.globalAlpha = 0.75 + 0.25 * pulse;
      ctx.strokeStyle = cStep; ctx.fillStyle = cStep; ctx.lineWidth = 1.4 + 0.6 * pulse;
      var cx = (xa + xb) / 2, cy = top - 14;
      ctx.beginPath(); ctx.moveTo(xa, ya); ctx.quadraticCurveTo(cx, cy, xb - 1, ya - 1); ctx.stroke();
      arrowHead(ctx, xb, ya, Math.atan2(ya - cy, xb - cx), 5.5);
      ctx.globalAlpha = 1;
      ctx.fillText("P(n) ⇒ P(n+1)", cx, labY);

      // which domino is which
      var idxY = ground + 15;
      ctx.font = fontI; ctx.fillStyle = theme.muted;
      ctx.fillText("1", midX(0), idxY);
      ctx.fillText("n", midX(GAP), idxY);
      ctx.fillText("n+1", midX(GAP + 1) + 3, idxY);

      // conclusion once the fall has run off the visible row
      var done = smooth(6.6, 7.2, t);
      if (done > 0) {
        ctx.globalAlpha = done;
        ctx.font = font; ctx.fillStyle = theme.ink;
        ctx.fillText("so P(n) holds for every n", w / 2, ground + 33);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    }
  };
})();
})();

// ---- modular-arithmetic ----
;(function () {
// Times tables on a clock: N = 200 points around a circle, point k joined to m·k mod N.
// m = 2 draws a cardioid (1 cusp), m = 3 a nephroid (2 cusps), in general m − 1 cusps.
// Between integer stops m slides continuously (chord from angle 2πk/N to 2πmk/N), which agrees
// with k ↦ mk mod N exactly at integers. One chord, k = 70, is highlighted to show the wrap-around:
//   2·70 = 140,  3·70 = 210 ≡ 10,  4·70 = 280 ≡ 80,  5·70 = 350 ≡ 150   (mod 200).
(window.MathIllustrations ||= {})["modular-arithmetic"] = (() => {
  const N = 200, K = 70, TAU = 2 * Math.PI;
  const DUR = 11;
  // [start, end, m0, m1]: holds at m = 2, 3, 4, 5 with 1 s slides between; m = 5 held to the end.
  const SEG = [[0, 2, 2, 2], [2, 3, 2, 3], [3, 5, 3, 3], [5, 6, 3, 4], [6, 8, 4, 4], [8, 9, 4, 5], [9, DUR, 5, 5]];
  const NAME = { 2: "cardioid", 3: "nephroid", 4: "3 cusps", 5: "4 cusps" };
  const ease = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const clamp01 = (u) => (u < 0 ? 0 : u > 1 ? 1 : u);

  const state = (t) => {
    for (const [a, b, m0, m1] of SEG) {
      if (t < b || b === DUR) {
        if (m0 === m1) return { m: m0, show: 1 };
        const u = (t - a) / (b - a);
        // highlighted chord fades out at the start of a slide and back in at the end
        return { m: m0 + (m1 - m0) * ease(u), show: clamp01(Math.max(1 - u / 0.25, (u - 0.75) / 0.25)) };
      }
    }
    return { m: 5, show: 1 };
  };

  return {
    caption: "200 points on a circle, each k joined to m·k mod 200: m = 2 draws a cardioid, m = 3 a nephroid, and so on.",
    duration: DUR,
    still: 4,
    aspect: 0.66,
    draw(ctx, w, h, t, theme) {
      ctx.save();
      const pad = 8, lm = 18;                 // padding, margin for labels around the circle
      const fs = w < 300 ? 11 : 12;
      const font = fs + "px " + theme.font;
      const fontB = "600 " + (fs + 1) + "px " + theme.font;
      ctx.font = font;
      const colW = Math.max(ctx.measureText("k ↦ 5k mod 200").width, ctx.measureText("≡ 150 (mod 200)").width) + 2;
      const gap = 12;
      const r = Math.max(20, Math.min((h - 2 * pad - 2 * lm) / 2, (w - 2 * pad - lm - gap - colW) / 2 - lm / 2));
      const used = lm + 2 * r + lm / 2 + gap + colW;  // centre the circle + text block horizontally
      const cx = pad + Math.max(0, (w - 2 * pad - used) / 2) + lm + r, cy = h / 2;
      const P = (a) => [cx + r * Math.sin(a), cy - r * Math.cos(a)]; // 0 at the top, clockwise

      const { m, show } = state(t);
      const endFade = clamp01((DUR - t) / 0.4);     // fade out just before the loop restarts
      const mi = Math.round(m), isInt = Math.abs(m - mi) < 1e-9;

      // Circle
      ctx.lineWidth = 1;
      ctx.strokeStyle = theme.muted;
      ctx.globalAlpha = 0.7;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();

      // Chords k → m·k
      ctx.globalAlpha = (theme.dark ? 0.6 : 0.55) * endFade;
      ctx.strokeStyle = theme.colors[0];
      ctx.lineWidth = Math.max(0.6, r / 110);
      ctx.beginPath();
      for (let k = 0; k < N; k++) {
        const a = P(TAU * k / N), b = P(TAU * ((m * k) % N) / N);
        ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
      }
      ctx.stroke();

      // Points 0 and the example chord 70 → m·70 mod 200
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.globalAlpha = endFade;
      ctx.fillStyle = theme.muted;
      ctx.font = font;
      const z = P(0);
      ctx.beginPath(); ctx.arc(z[0], z[1], 1.8, 0, TAU); ctx.fill();
      ctx.fillText("0", cx, cy - r - 8);

      const img = (m * K) % N;
      const aK = TAU * K / N, aI = TAU * img / N;
      const hl = show * endFade;
      if (hl > 0.01) {
        const p = P(aK), q = P(aI);
        ctx.globalAlpha = hl;
        ctx.strokeStyle = theme.colors[1]; ctx.fillStyle = theme.colors[1];
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
        for (const s of [p, q]) { ctx.beginPath(); ctx.arc(s[0], s[1], 3, 0, TAU); ctx.fill(); }
        ctx.font = "600 " + fs + "px " + theme.mono;
        // push each label out along its radius until its box clears the circle
        const lab = (a, s) => {
          const sa = Math.sin(a), ca = Math.cos(a);
          const d = r + 5 + (ctx.measureText(s).width / 2) * Math.abs(sa) + (fs / 2) * Math.abs(ca);
          ctx.fillText(s, cx + d * sa, cy - d * ca);
        };
        lab(aK, String(K));
        if (isInt) lab(aI, String(img));
      }

      // Text column
      ctx.globalAlpha = 1;
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      const x0 = cx + r + lm / 2 + gap;
      const lh = fs + 5;
      const lines = 6;
      let y = cy - (lines * lh) / 2 + fs;
      ctx.font = font; ctx.fillStyle = theme.muted;
      ctx.fillText("N = " + N, x0, y); y += lh + 1;
      ctx.font = fontB; ctx.fillStyle = theme.ink;
      ctx.fillText("m = " + (isInt ? String(mi) : m.toFixed(1)), x0, y); y += lh;
      const mn = Math.round(m);                     // nearest integer multiplier (exact during holds)
      ctx.globalAlpha = show;
      ctx.font = font; ctx.fillStyle = theme.muted;
      ctx.fillText(NAME[mn], x0, y); y += lh * 1.5;
      ctx.fillText("k ↦ " + mn + "k mod " + N, x0, y); y += lh;
      ctx.fillStyle = theme.colors[1];
      ctx.fillText(mn + "·" + K + " = " + mn * K, x0, y); y += lh;
      if (mn * K >= N) ctx.fillText("≡ " + ((mn * K) % N) + " (mod " + N + ")", x0, y);
      ctx.restore();
    }
  };
})();
})();
