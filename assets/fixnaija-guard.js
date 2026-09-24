/* =====================================================================
   FixNaija form guard — used by register.html, report-issue.html,
   volunteer.html and protect-the-vote.html (any <form data-guard="table_name">).

   1. ALWAYS ON: an invisible "leave this empty" box that only bots fill
      in, and a check that stops forms submitted faster than a human could.
   2. OFF UNTIL YOU PASTE A KEY: Cloudflare Turnstile, a free bot check
      that most people never even see. When it is on, the forms send
      their data through the "secure-submit" edge function, which only
      saves it if Cloudflare says the visitor is human.
      Setup steps: docs/FORM-PROTECTION-SETUP.md

   Nothing here changes WHAT the forms save — only how it is delivered.
   ===================================================================== */
(function () {
  'use strict';

  // ↓↓↓ Paste your Turnstile SITE KEY between the quotes to switch the bot check on ↓↓↓
  var TURNSTILE_SITE_KEY = '';
  // ↑↑↑ Leave it empty ('') to keep the bot check off. ↑↑↑

  var SUBMIT_FUNCTION = 'https://bcdscsjqiqnzsthntutb.supabase.co/functions/v1/secure-submit';
  var PUBLIC_KEY = 'sb_publishable_Cpkk6K0Xyt5GNVXTiur2mA_myhkpiti';
  var GUARDED = /\/rest\/v1\/(registrations|community_reports|volunteers|pu_agents)(?:\?|$)/;
  var MIN_MS = 3000;          // nobody fills these forms in under 3 seconds
  var TOKEN_WAIT_MS = 12000;  // how long to wait for the bot check before sending anyway

  var forms = [].slice.call(document.querySelectorAll('form[data-guard]'));
  if (!forms.length) return;
  var readyAt = Date.now() + MIN_MS;

  function note(form, msg) {
    var n = form.querySelector('.fx-guard-note');
    if (!n) {
      n = document.createElement('p');
      n.className = 'fx-guard-note';
      n.setAttribute('role', 'alert');
      n.style.cssText = 'margin:12px 0;padding:10px 14px;border-radius:8px;background:#fff4ec;border:1px solid #f7c7a3;color:#8a3a0c;font-size:.9rem;line-height:1.45';
      var btn = form.querySelector('[type="submit"]');
      if (btn && btn.parentNode) btn.parentNode.insertBefore(n, btn); else form.appendChild(n);
    }
    n.textContent = msg;
    n.hidden = !msg;
  }

  // ---------- 1 · honeypot + too-fast check ----------------------------------
  forms.forEach(function (f) {
    var trap = document.createElement('div');
    trap.setAttribute('aria-hidden', 'true');
    trap.style.cssText = 'position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden';
    trap.innerHTML = '<label>Leave this box empty <input type="text" name="fx_company_site" value="" tabindex="-1" autocomplete="off"></label>';
    f.appendChild(trap);
  });

  // runs before the page's own submit code (capture phase), so a blocked
  // submission never reaches it
  window.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || !f.getAttribute || !f.hasAttribute('data-guard')) return;
    var trap = f.querySelector('input[name="fx_company_site"]');
    if (trap && trap.value) {                 // only a bot can see and fill this box
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (Date.now() < readyAt) {               // far too fast for a person
      e.preventDefault();
      e.stopPropagation();
      readyAt = 0;                            // a real person's next click goes through
      note(f, 'Please take a second to check your details, then press the button again.');
    }
  }, true);

  // ---------- 2 · Cloudflare Turnstile (only when a site key is set) ---------
  if (!TURNSTILE_SITE_KEY) return;

  var widgets = {};                           // table name → { id, token }

  window.fxTurnstileReady = function () {
    forms.forEach(function (f) {
      var table = f.getAttribute('data-guard');
      var box = document.createElement('div');
      box.className = 'fx-turnstile';
      box.style.margin = '14px 0 4px';
      var btn = f.querySelector('[type="submit"]');
      if (btn && btn.parentNode) btn.parentNode.insertBefore(box, btn); else f.appendChild(box);
      var st = { id: null, token: '' };
      try {
        st.id = window.turnstile.render(box, {
          sitekey: TURNSTILE_SITE_KEY,
          appearance: 'interaction-only',     // invisible unless Cloudflare needs a click
          theme: 'light',
          size: 'flexible',
          'refresh-expired': 'auto',
          callback: function (t) { st.token = t; },
          'expired-callback': function () { st.token = ''; },
          'error-callback': function () { st.token = ''; }
        });
      } catch (err) { console.warn('[FixNaija guard] Turnstile did not start', err); }
      widgets[table] = st;
    });
  };
  var s = document.createElement('script');
  s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=fxTurnstileReady';
  s.async = true;
  s.defer = true;
  document.head.appendChild(s);

  function waitForToken(table) {
    return new Promise(function (resolve) {
      var t0 = Date.now();
      (function poll() {
        var st = widgets[table];
        if (st && st.token) return resolve(st.token);
        if (Date.now() - t0 > TOKEN_WAIT_MS) return resolve('');
        setTimeout(poll, 150);
      })();
    });
  }
  function resetWidget(table) {               // a token only works once
    var st = widgets[table];
    if (!st) return;
    st.token = '';
    try { if (st.id != null) window.turnstile.reset(st.id); } catch (_) {}
  }
  function formFor(table) {
    return document.querySelector('form[data-guard="' + table + '"]');
  }

  var realFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    var method = String((init && init.method) || (input && input.method) || 'GET').toUpperCase();
    var m = method === 'POST' ? url.match(GUARDED) : null;
    if (!m) return realFetch(input, init);

    var table = m[1];
    var form = formFor(table);
    if (form) note(form, '');                 // a fresh attempt: clear old messages
    return waitForToken(table).then(function (token) {
      if (!token) {
        // bot check could not load (blocked network, old browser…): send the
        // normal way. Once the tables are locked this will be refused.
        return realFetch(input, init);
      }
      var row;
      try { row = JSON.parse(init && init.body); } catch (_) { row = null; }
      return realFetch(SUBMIT_FUNCTION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': PUBLIC_KEY },
        body: JSON.stringify({ table: table, row: row, token: token })
      }).then(function (res) {
        if (res.status === 403 && form) {
          note(form, 'The security check did not go through. Please wait a moment and press the button again.');
        }
        return res;
      });
    }).finally(function () { resetWidget(table); });
  };
})();
