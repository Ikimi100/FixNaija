/* FixNaija · passport photo helper (protect-the-vote.html and admin.html)
   Turns any photo — camera or gallery, any size — into a passport-shaped
   JPEG (7:9, at most 700 × 900 px, usually 60–150 KB) inside the browser,
   before it is uploaded. Every agent photo ends up the same shape, uploads
   stay quick on mobile data, and the original file never leaves the phone.

   FXPhoto.prepare(file) → Promise<{ blob, url, width, height }>
     rejects with err.code = 'TYPE' | 'BIG' | 'SMALL' | 'DECODE'
   FXPhoto.newPath()     → 'agents/<random-uuid>.jpg'
   FXPhoto.BUCKET        → 'agent-photos'  (private Supabase Storage bucket)   */
(function () {
  'use strict';
  var OUT_W = 700, OUT_H = 900, RATIO = OUT_W / OUT_H, MIN_SIDE = 240;

  function fail(code, msg) { var e = new Error(msg || code); e.code = code; return e; }

  function decode(file) {
    function viaImg() {
      return new Promise(function (ok, no) {
        var u = URL.createObjectURL(file), i = new Image();
        i.onload = function () { ok(i); };
        i.onerror = function () { URL.revokeObjectURL(u); no(fail('DECODE')); };
        i.src = u;
      });
    }
    if (window.createImageBitmap) {
      // phones store photos sideways + a rotate flag: apply it
      return createImageBitmap(file, { imageOrientation: 'from-image' }).catch(viaImg);
    }
    return viaImg();
  }

  function prepare(file) {
    if (!file) return Promise.reject(fail('NONE'));
    if (file.type && !/^image\//i.test(file.type)) return Promise.reject(fail('TYPE'));
    if (file.size > 30 * 1024 * 1024) return Promise.reject(fail('BIG'));
    return decode(file).then(function (img) {
      var sw = img.naturalWidth || img.width, sh = img.naturalHeight || img.height;
      if (!sw || !sh) throw fail('DECODE');
      if (Math.min(sw, sh) < MIN_SIDE) throw fail('SMALL');
      // crop to the passport shape: trim the sides of wide photos (face is
      // usually central) and trim tall photos mostly from the bottom (keeps the head)
      var cw, ch, cx, cy;
      if (sw / sh > RATIO) { ch = sh; cw = sh * RATIO; cx = (sw - cw) / 2; cy = 0; }
      else { cw = sw; ch = sw / RATIO; cx = 0; cy = (sh - ch) * 0.3; }
      var scale = Math.min(1, OUT_W / cw);
      var ow = Math.round(cw * scale), oh = Math.round(ch * scale);
      var c = document.createElement('canvas'); c.width = ow; c.height = oh;
      var x = c.getContext('2d');
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, ow, oh);           // transparent PNGs → white
      x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
      x.drawImage(img, cx, cy, cw, ch, 0, 0, ow, oh);
      if (img.close) try { img.close(); } catch (_) {}
      return new Promise(function (ok, no) {
        c.toBlob(function (b) {
          if (!b) return no(fail('DECODE'));
          ok({ blob: b, url: URL.createObjectURL(b), width: ow, height: oh });
        }, 'image/jpeg', 0.86);
      });
    });
  }

  function uuid() {
    if (window.crypto && crypto.randomUUID) { try { return crypto.randomUUID(); } catch (_) {} }
    var b = new Uint8Array(16);
    (window.crypto || window.msCrypto).getRandomValues(b);
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = Array.prototype.map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }

  window.FXPhoto = {
    prepare: prepare,
    newPath: function () { return 'agents/' + uuid() + '.jpg'; },
    BUCKET: 'agent-photos'
  };
})();
