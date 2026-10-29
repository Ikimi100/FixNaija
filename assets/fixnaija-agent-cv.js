/* FixNaija · polling agent CV pack (used by admin.html)
   Builds a print-ready A4 document of agents, each with their passport
   photograph, in a new tab — then opens the print window, where the admin
   picks "Save as PDF". Two layouts:
     cv    — one agent per page: photo, contacts, polling unit, profile,
             coordinator's notes and signature lines
     sheet — six agents per page, for submissions and quick checks
   Agents are ordered by state → LGA → ward → polling unit → name, and a
   cover page lists everyone with their agent ID.

   FXAgentCV.open({ rows, layout: 'cv'|'sheet', sign: async paths => Map(path → url), scope: 'text' })
   The photos come from the private "agent-photos" bucket through short-lived
   signed links (sign), so they only load for a signed-in admin.            */
(function () {
  'use strict';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var tc = function (s) { return String(s || '').toLowerCase().replace(/(^|[\s\/\-\(])\w/g, function (c) { return c.toUpperCase(); }); };
  var val = function (s) { return s == null || s === '' ? '—' : String(s); };
  var day = function (s) { return s ? new Date(s).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'; };
  var STATUS = { 'new': 'New', contacted: 'Contacted', trained: 'Trained', assigned: 'Assigned', declined: 'Declined' };
  function shortState(s) { var t = tc(s); return /^federal capital territory$/i.test(t) ? 'FCT' : t; }
  function agentId(r) { return 'FXA-' + String(r.id || '').replace(/[^0-9a-f]/gi, '').slice(0, 8).toUpperCase(); }
  function cmp(a, b) { return String(a || '￿').localeCompare(String(b || '￿'), 'en', { numeric: true, sensitivity: 'base' }); }
  function sortRows(rows) {
    return rows.slice().sort(function (a, b) {
      return cmp(a.state, b.state) || cmp(a.lga, b.lga) || cmp(a.ward, b.ward) ||
        cmp(a.delimitation || a.polling_unit, b.delimitation || b.polling_unit) || cmp(a.full_name, b.full_name);
    });
  }

  var CSS = [
    '@page{size:A4;margin:0}',
    '*{box-sizing:border-box;margin:0;padding:0}',
    'html{-webkit-print-color-adjust:exact;print-color-adjust:exact}',
    'body{background:#e7e4dc;font-family:Poppins,"Segoe UI",Arial,sans-serif;color:#1f2a22;font-size:10pt}',
    '.bar{position:sticky;top:0;z-index:9;display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;padding:12px 22px;background:#0d140f;color:#dfe9e2;font-size:13px}',
    '.bar b{font-family:Archivo,Arial,sans-serif;font-size:15px;color:#fff}',
    '.bar button{height:38px;padding:0 18px;border:0;border-radius:7px;background:#00a651;color:#fff;font:600 14px Poppins,Arial,sans-serif;cursor:pointer}',
    '.bar button:disabled{background:#3b4a40;color:#9fb3a6;cursor:wait}',
    '.bar .tip{color:#9fb3a6;font-size:12px}',
    'main{padding:22px 0}',
    '.page{position:relative;width:210mm;height:297mm;margin:0 auto 18px;background:#fff;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 28px rgba(0,0,0,.18);break-after:page;page-break-after:always}',
    '.page.flow{height:auto;min-height:297mm;overflow:visible}',
    '.page:last-child{break-after:auto;page-break-after:auto}',
    '@media print{body{background:#fff}.bar{display:none}main{padding:0}.page{margin:0;box-shadow:none}}',
    /* header + flag + footer */
    '.ph{display:flex;align-items:center;gap:10px;padding:8mm 14mm 5mm}',
    '.ph .lg{width:13mm;height:13mm;border-radius:50%;border:1px solid #e3e0d6;background:#fff;object-fit:contain;padding:.6mm}',
    '.ph .bn{font-family:Archivo,Arial,sans-serif;font-weight:800;font-size:13pt;color:#0d140f;line-height:1.1}',
    '.ph .bs{font-family:Archivo,Arial,sans-serif;font-weight:700;font-size:6.5pt;letter-spacing:.24em;color:#00663a;margin-top:1mm}',
    '.ph .r{margin-left:auto;display:flex;align-items:center;gap:4mm;text-align:right}',
    '.ph .doc{font-family:Archivo,Arial,sans-serif;font-weight:800;font-size:8pt;letter-spacing:.2em;color:#00663a;text-transform:uppercase;line-height:1.35}',
    '.ph .doc small{display:block;font-weight:700;color:#8a928b;letter-spacing:.12em;font-size:6.5pt}',
    '.ph .sdp{height:11mm;width:auto;border-radius:1.5mm}',
    '.flag{display:flex;height:1.6mm}.flag i{flex:1}.flag i:nth-child(1){background:#00663a}.flag i:nth-child(2){background:#e8e5dc}.flag i:nth-child(3){background:#f26a1b}',
    '.pf{margin-top:auto;display:flex;justify-content:space-between;gap:8mm;padding:4mm 14mm 6mm;border-top:1px solid #ece9e1;font-size:7pt;color:#8a928b}',
    /* cover */
    '.cover{padding:10mm 14mm 8mm}',
    '.cover .eyebrow{font-family:Archivo,Arial,sans-serif;font-weight:700;font-size:8pt;letter-spacing:.24em;text-transform:uppercase;color:#00663a}',
    '.cover h1{font-family:Archivo,Arial,sans-serif;font-weight:800;font-size:30pt;line-height:1;letter-spacing:-.03em;margin:3mm 0 2mm;color:#0d140f}',
    '.cover .scope{color:#5d665f;font-size:9.5pt;margin-bottom:6mm}',
    '.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;margin-bottom:7mm}',
    '.stat{border:1px solid #e3e0d6;border-radius:2mm;padding:3.5mm 4mm}',
    '.stat b{display:block;font-family:Archivo,Arial,sans-serif;font-weight:800;font-size:17pt;color:#0d140f;line-height:1}',
    '.stat span{font-size:7.5pt;color:#6b746c}',
    '.idx{width:100%;border-collapse:collapse;font-size:8pt}',
    '.idx thead{display:table-header-group}',
    '.idx th{text-align:left;font-family:Archivo,Arial,sans-serif;font-size:6.8pt;letter-spacing:.12em;text-transform:uppercase;color:#6b746c;border-bottom:1.5px solid #0d140f;padding:2mm 1.6mm}',
    '.idx td{border-bottom:1px solid #ece9e1;padding:1.6mm 1.6mm;vertical-align:top}.idx .nw{white-space:nowrap}',
    '.idx tr{break-inside:avoid;page-break-inside:avoid}',
    '.idx .no{color:#8a928b;width:8mm}.idx .id{font-family:Archivo,Arial,sans-serif;font-weight:700;color:#00663a;white-space:nowrap}',
    '.idx .ok{color:#00663a;font-weight:700}.idx .miss{color:#d9530b;font-weight:700}',
    /* one-agent CV */
    '.cv{padding:9mm 14mm 0;display:flex;flex-direction:column;flex:1}',
    '.top{display:grid;grid-template-columns:47mm 1fr;gap:9mm;align-items:start}',
    '.photo{position:relative;width:47mm;height:60.4mm;border-radius:2mm;overflow:hidden;background:#f3f1ea;border:1px solid #d6d1c4}',
    '.photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}',
    '.photo .none{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2mm;text-align:center;color:#b07a52;font-family:Archivo,Arial,sans-serif;font-weight:700;font-size:7.5pt;letter-spacing:.14em;text-transform:uppercase;padding:4mm}',
    '.photo .none svg{width:20mm;height:24mm;color:#ddd8cc}',
    '.photo img~.none{display:none}.photo.broken img{display:none}.photo.broken .none{display:flex}',
    '.role{display:inline-block;font-family:Archivo,Arial,sans-serif;font-weight:700;font-size:7.5pt;letter-spacing:.2em;text-transform:uppercase;color:#00663a;background:#e8f3ed;border-radius:1.2mm;padding:1.2mm 2.4mm}',
    '.who h1{font-family:Archivo,Arial,sans-serif;font-weight:800;font-size:24pt;line-height:1.02;letter-spacing:-.025em;color:#0d140f;margin:3mm 0 2.5mm;word-break:break-word}',
    '.ids{display:flex;flex-wrap:wrap;gap:1.5mm 5mm;font-size:8.5pt;color:#6b746c;margin-bottom:5mm}',
    '.ids b{color:#0d140f}',
    '.st{font-weight:700;border-radius:1.2mm;padding:.3mm 2mm;background:#f3f1ea;color:#4d564e}',
    '.st.trained{background:#e6effa;color:#1f5fbf}.st.assigned{background:#e8f3ed;color:#00663a}.st.declined{background:#fdecea;color:#b3261e}',
    '.kv{display:grid;grid-template-columns:34mm 1fr;border-top:1px solid #ece9e1}',
    '.kv dt,.kv dd{padding:2.2mm 0;border-bottom:1px solid #ece9e1;font-size:9.5pt}',
    '.kv dt{color:#6b746c;font-size:8.5pt}',
    '.kv dd{color:#0d140f;font-weight:500;word-break:break-word}',
    '.cv h2{font-family:Archivo,Arial,sans-serif;font-weight:700;font-size:8pt;letter-spacing:.22em;text-transform:uppercase;color:#00663a;margin:8mm 0 1.5mm;display:flex;align-items:center;gap:3mm}',
    '.cv h2::before{content:"";width:6mm;height:1mm;background:linear-gradient(90deg,#00663a 50%,#f26a1b 50%)}',
    '.cv .two{display:grid;grid-template-columns:1fr 1fr;gap:0 9mm}',
    '.cv .two .kv{grid-template-columns:30mm 1fr}',
    '.notes{border:1px solid #e3e0d6;border-radius:2mm;min-height:24mm;padding:3mm 4mm;font-size:9pt;color:#2e372f;background:repeating-linear-gradient(transparent 0 7.4mm,#ece9e1 7.4mm 7.6mm)}',
    '.sign{display:grid;grid-template-columns:1fr 1fr;gap:12mm;margin:12mm 0 6mm}',
    '.sign i{display:block;border-bottom:1px solid #0d140f;height:11mm}',
    '.sign span{display:block;font-size:7.5pt;color:#6b746c;margin-top:1.5mm}',
    /* six-per-page sheet */
    '.sheet{flex:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(3,1fr);gap:4mm;padding:6mm 12mm 4mm}',
    '.card{display:grid;grid-template-columns:29mm 1fr;gap:4mm;align-content:start;border:1px solid #e3e0d6;border-radius:2.5mm;padding:4mm;overflow:hidden}',
    '.card .photo{width:29mm;height:37.3mm}',
    '.card .photo .none svg{width:13mm;height:15mm}',
    '.card .role{font-size:6pt;padding:.8mm 1.8mm;letter-spacing:.16em}',
    '.card .nm{display:block;font-family:Archivo,Arial,sans-serif;font-weight:800;font-size:12pt;line-height:1.1;color:#0d140f;margin:2mm 0 2mm;word-break:break-word}',
    '.card dl{display:grid;grid-template-columns:15mm 1fr;gap:.9mm 2mm;font-size:7.4pt;line-height:1.35}',
    '.card dt{color:#8a928b}.card dd{color:#0d140f;font-weight:500;word-break:break-word}',
    '.card .aid{grid-column:1/-1;margin-top:1mm;font-family:Archivo,Arial,sans-serif;font-weight:700;font-size:7pt;letter-spacing:.08em;color:#00663a}'
  ].join('\n');

  var SILHOUETTE = '<svg viewBox="0 0 100 120" aria-hidden="true"><circle cx="50" cy="38" r="24" fill="currentColor"/><path d="M6 120c2-30 20-46 44-46s42 16 44 46z" fill="currentColor"/></svg>';

  function photoBox(r, urls) {
    var u = r.photo_path && urls.get(r.photo_path);
    if (u) return '<figure class="photo"><img src="' + esc(u) + '" alt="' + esc(r.full_name) + '"><div class="none">' + SILHOUETTE + 'Photo unavailable</div></figure>';
    return '<figure class="photo"><div class="none">' + SILHOUETTE + 'Photo needed</div></figure>';
  }
  function header(docTitle, sub) {
    return '<header class="ph"><img class="lg" src="images/logo.png" alt=""><div><div class="bn">FixNaija Movement</div><div class="bs">ADEBAYO · BUGAJE · 2027</div></div>' +
      '<div class="r"><div class="doc">' + esc(docTitle) + '<small>' + esc(sub) + '</small></div><img class="sdp" src="images/sdp-logo-header.webp" alt="SDP"></div></header><div class="flag"><i></i><i></i><i></i></div>';
  }
  function footer(left, right) { return '<footer class="pf"><span>' + esc(left) + '</span><span>' + esc(right) + '</span></footer>'; }
  var PRIVATE = 'Confidential — personal data for party-agent nomination only. Do not post or share publicly.';

  function cover(rows, opts, made) {
    var withPhoto = rows.filter(function (r) { return r.photo_path; }).length;
    var pus = {}, states = {};
    rows.forEach(function (r) { if (r.delimitation) pus[r.delimitation] = 1; if (r.state) states[String(r.state).toUpperCase()] = 1; });
    var trs = rows.map(function (r, i) {
      return '<tr><td class="no">' + (i + 1) + '</td><td><b>' + esc(r.full_name) + '</b></td><td class="nw">' + esc(r.role || '') + '</td>' +
        '<td>' + esc(tc(r.lga)) + ', ' + esc(shortState(r.state)) + '</td><td class="nw">' + esc(r.delimitation || '—') + '</td>' +
        '<td class="nw">' + esc(r.phone || '') + '</td><td class="id">' + agentId(r) + '</td>' +
        '<td class="' + (r.photo_path ? 'ok">✓' : 'miss">Needed') + '</td></tr>';
    }).join('');
    return '<section class="page flow">' + header('Polling agents', made) +
      '<div class="cover"><div class="eyebrow">Protect the vote · Saturday 16 January 2027</div>' +
      '<h1>' + (opts.layout === 'sheet' ? 'Agent photo sheet' : 'Agent CV pack') + '</h1>' +
      '<p class="scope">' + esc(opts.scope || 'All agents') + '</p>' +
      '<div class="stats"><div class="stat"><b>' + rows.length.toLocaleString() + '</b><span>agents in this pack</span></div>' +
      '<div class="stat"><b>' + withPhoto.toLocaleString() + '</b><span>with a passport photo</span></div>' +
      '<div class="stat"><b>' + (rows.length - withPhoto).toLocaleString() + '</b><span>photos still needed</span></div>' +
      '<div class="stat"><b>' + Object.keys(pus).length.toLocaleString() + '</b><span>polling units · ' + Object.keys(states).length + ' states</span></div></div>' +
      '<table class="idx"><thead><tr><th>#</th><th>Name</th><th>Role</th><th>LGA, state</th><th>PU code</th><th>Phone</th><th>Agent ID</th><th>Photo</th></tr></thead><tbody>' + trs + '</tbody></table>' +
      '</div>' + footer(PRIVATE, 'fixnaijamovement.com.ng') + '</section>';
  }

  function cvPage(r, urls, i, n, made) {
    var st = r.status || 'new';
    var kv = function (pairs) { return '<dl class="kv">' + pairs.map(function (p) { return '<dt>' + esc(p[0]) + '</dt><dd>' + esc(val(p[1])) + '</dd>'; }).join('') + '</dl>'; };
    return '<section class="page">' + header('Polling agent profile', made) +
      '<div class="cv"><div class="top">' + photoBox(r, urls) +
      '<div class="who"><span class="role">' + esc(r.role || 'Agent') + '</span><h1>' + esc(r.full_name || '') + '</h1>' +
      '<div class="ids"><span>Agent ID <b>' + agentId(r) + '</b></span><span>Signed up <b>' + day(r.created_at) + '</b></span><span class="st ' + esc(st) + '">' + esc(STATUS[st] || st) + '</span></div>' +
      kv([['Phone', r.phone], ['WhatsApp', r.whatsapp || r.phone], ['Email', r.email]]) + '</div></div>' +
      '<h2>Assignment</h2>' + kv([['State', tc(r.state)], ['LGA', tc(r.lga)], ['Ward / RA', tc(r.ward)], ['Polling unit', tc(r.polling_unit)], ['Polling unit code', r.delimitation]]) +
      '<h2>Profile</h2><div class="two">' + kv([['Votes at this unit', r.registered_here], ['Agent before', r.experience]]) +
      kv([['Smartphone', r.has_smartphone ? 'Yes — can send result photos' : 'No'], ['Status', STATUS[st] || st]]) + '</div>' +
      '<h2>Coordinator’s notes</h2><div class="notes">' + esc(r.admin_notes || '') + '</div>' +
      '<div class="sign"><div><i></i><span>Agent’s signature &amp; date</span></div><div><i></i><span>Coordinator’s name, signature &amp; date</span></div></div>' +
      '</div>' + footer(PRIVATE, 'Agent ' + (i + 1) + ' of ' + n) + '</section>';
  }

  function sheetPages(rows, urls, made) {
    var out = [], per = 6, pages = Math.ceil(rows.length / per);
    for (var p = 0; p < pages; p++) {
      var cards = rows.slice(p * per, p * per + per).map(function (r) {
        var d = function (k, v) { return '<dt>' + k + '</dt><dd>' + esc(val(v)) + '</dd>'; };
        return '<article class="card">' + photoBox(r, urls) + '<div><span class="role">' + esc(r.role || 'Agent') + '</span><b class="nm">' + esc(r.full_name || '') + '</b>' +
          '<dl>' + d('Phone', r.phone) + d('WhatsApp', r.whatsapp || r.phone) + d('PU', tc(r.polling_unit)) + d('PU code', r.delimitation) +
          d('Ward', tc(r.ward)) + d('LGA', tc(r.lga) + (r.state ? ', ' + tc(r.state) : '')) + '<span class="aid">' + agentId(r) + '</span></dl></div></article>';
      }).join('');
      out.push('<section class="page">' + header('Polling agents', made) + '<div class="sheet">' + cards + '</div>' +
        footer(PRIVATE, 'Sheet ' + (p + 1) + ' of ' + pages) + '</section>');
    }
    return out.join('');
  }

  var PAGE_SCRIPT = '(' + function () {
    var st = document.getElementById('fxSt'), pr = document.getElementById('fxPrint');
    var imgs = [].slice.call(document.querySelectorAll('.photo img'));
    var loaded = imgs.map(function (i) {
      return new Promise(function (ok) {
        function bad() { i.closest('.photo').classList.add('broken'); ok(); }
        if (i.complete) { if (!i.naturalWidth) bad(); else ok(); return; }
        i.addEventListener('load', ok); i.addEventListener('error', bad);
      });
    });
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    var timeout = new Promise(function (ok) { setTimeout(ok, 30000); });
    Promise.race([Promise.all(loaded.concat([fonts])), timeout]).then(function () {
      var broken = document.querySelectorAll('.photo.broken').length;
      st.textContent = 'Ready' + (broken ? ' — ' + broken + ' photo(s) could not load' : '');
      pr.disabled = false;
      setTimeout(function () { window.print(); }, 350);
    });
    pr.addEventListener('click', function () { window.print(); });
  } + ')();';

  function build(rows, urls, opts) {
    var now = new Date();
    var made = 'Made ' + now.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
    var title = 'FixNaija polling agents — ' + (opts.layout === 'sheet' ? 'photo sheet' : 'CV pack') + ' — ' + now.toISOString().slice(0, 10);
    var body = cover(rows, opts, made) +
      (opts.layout === 'sheet' ? sheetPages(rows, urls, made) : rows.map(function (r, i) { return cvPage(r, urls, i, rows.length, made); }).join(''));
    return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><base href="' + esc(opts.origin || location.origin) + '/">' +
      '<title>' + esc(title) + '</title><meta name="robots" content="noindex">' +
      '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
      '<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800&family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">' +
      '<style>' + CSS + '</style></head><body>' +
      '<div class="bar"><b>' + esc(opts.layout === 'sheet' ? 'Agent photo sheet' : 'Agent CV pack') + '</b><span>' + rows.length.toLocaleString() + ' agents</span>' +
      '<span id="fxSt">Loading photos…</span><button id="fxPrint" disabled>Save as PDF</button>' +
      '<span class="tip">In the print window choose “Save as PDF” as the printer, and paper size A4.</span></div>' +
      '<main>' + body + '</main><script>' + PAGE_SCRIPT + '<\/script></body></html>';
  }

  function open(opts) {
    var w = window.open('', '_blank');
    if (!w) { alert('Please allow pop-ups for this page, then try again — the CV pack opens in a new tab.'); return null; }
    w.document.write('<!DOCTYPE html><title>Preparing…</title><body style="font:15px Poppins,Arial,sans-serif;padding:40px;color:#334">Preparing the agent pack…</body>');
    var rows = sortRows(opts.rows || []);
    var paths = rows.map(function (r) { return r.photo_path; }).filter(Boolean);
    return Promise.resolve(paths.length && opts.sign ? opts.sign(paths) : new Map())
      .catch(function (e) { console.warn('[FixNaija CV] photo links', e); return new Map(); })
      .then(function (urls) {
        var html = build(rows, urls || new Map(), opts);
        w.document.open(); w.document.write(html); w.document.close();
        return w;
      });
  }

  window.FXAgentCV = { open: open, build: build, sortRows: sortRows, agentId: agentId };
})();
