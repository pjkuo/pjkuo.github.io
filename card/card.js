(function(){
  /* 名片正式網址（公開，GitHub Pages）：QR、NFC、vCard 一律指向這裡 */
  var CARD_URL = 'https://pjkuo.github.io/card/';
  var PORTAL = 'https://pjkuo.github.io/';
  var EMAIL = 'pjkuo@npust.edu.tw';
  var URL_ = CARD_URL;
  var onPublicSite = false;
  try{ onPublicSite = /github\.io$/.test(location.hostname || ''); }catch(e){}

  var lines = ['BEGIN:VCARD','VERSION:3.0','N:郭;博仁;;;','FN:郭博仁 Po-Jen Kuo',
    'ORG:國立屏東科技大學;資訊管理系','TITLE:兼任講師／中華電信數據分公司 高級工程師',
    'EMAIL;TYPE=INTERNET,WORK:' + EMAIL, 'URL:' + URL_];
  if(URL_ !== PORTAL) lines.push('URL:' + PORTAL);
  lines.push('X-SOCIALPROFILE;TYPE=youtube:https://www.youtube.com/@paulkuo4106');
  lines.push('NOTE:住在海邊的資管人');
  lines.push('END:VCARD');
  var VCARD = lines.join('\r\n');

  function u8(s){ try{ return new TextEncoder().encode(s).length; }catch(e){ return unescape(encodeURIComponent(s)).length; } }
  /* NDEF 估算：URI 記錄（https:// 縮成 1 byte）與 MIME text/vcard 記錄，含 TLV 與結尾 */
  function uriRecord(url){ var rest = url.replace(/^https:\/\//,''); var p = 1 + u8(rest); return (p < 256 ? 4 : 7) + p; }
  function vcardRecord(v){ var p = u8(v); return (p < 256 ? 3 : 6) + 10 + p; }
  function onTag(ndef){ return ndef + (ndef < 255 ? 2 : 4) + 1; }
  var needUrl = onTag(uriRecord(URL_));
  var needVcard = onTag(vcardRecord(VCARD));
  var needBoth = onTag(uriRecord(URL_) + vcardRecord(VCARD));
  var chips = [['NTAG213',144],['NTAG215',504],['NTAG216',888]];
  function fit(n){ for(var i=0;i<chips.length;i++) if(n <= chips[i][1]) return chips[i][0]; return '超過 NTAG216'; }

  function $(id){ return document.getElementById(id); }
  $('cardUrl').textContent = URL_;
  $('needUrl').textContent = '網址 ≈ ' + needUrl + ' B';
  $('needVcard').textContent = 'vCard ≈ ' + needVcard + ' B';
  $('needBoth').textContent = '兩筆 ≈ ' + needBoth + ' B';
  $('backSpec').textContent = '90 × 54 mm · ' + fit(needUrl);
  $('vcardBytes').textContent = 'vCard ' + u8(VCARD) + ' bytes · 寫入 NFC 需 ' + fit(needVcard);
  $('vcardText').textContent = VCARD;
  var pick = fit(needUrl) === 'NTAG213' ? 'row213' : 'row215';
  $(pick).classList.add('pick');

  function qrSvg(text, ecl, label){
    if(typeof qrcode !== 'function') return null;
    try{
      if(qrcode.stringToBytesFuncs && qrcode.stringToBytesFuncs['UTF-8']) qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
      var q = qrcode(0, ecl); q.addData(text, 'Byte'); q.make();
      var n = q.getModuleCount(), m = 4, s = n + 2*m, d = '';
      for(var r=0;r<n;r++) for(var c=0;c<n;c++) if(q.isDark(r,c)) d += 'M'+(c+m)+' '+(r+m)+'h1v1h-1z';
      return '<svg viewBox="0 0 '+s+' '+s+'" role="img" aria-label="'+label+'" shape-rendering="crispEdges"><rect width="'+s+'" height="'+s+'" fill="var(--qr-bg)"/><path d="'+d+'" fill="var(--qr-fg)"/></svg>';
    }catch(e){ return null; }
  }
  var fail = '<span style="display:grid;place-items:center;height:100%;padding:8px;font-size:11px;text-align:center;color:var(--back-sub)">QR 未載入<br>請改用網址</span>';
  $('cardQr').innerHTML = qrSvg(URL_, 'M', '名片網址 QR 碼') || fail;

  var vcardDrawn = false;
  function drawVcard(){ if(vcardDrawn) return; $('vcardQr').innerHTML = qrSvg(VCARD, 'L', 'vCard 聯絡人 QR 碼') || fail; vcardDrawn = true; }

  var statusEl = $('status'), tmr;
  function say(t){ statusEl.textContent = t; clearTimeout(tmr); tmr = setTimeout(function(){ statusEl.textContent=''; }, 3200); }
  function selectEl(el){
    try{ var wasHidden = el.hidden; if(wasHidden) el.hidden = false;
      var r = document.createRange(); r.selectNodeContents(el); var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
    }catch(e){}
  }
  function copy(text, fallbackEl, okMsg){
    function fb(){ selectEl(fallbackEl); say('已選取文字，請按 Ctrl+C 或長按複製'); }
    try{ navigator.clipboard.writeText(text).then(function(){ say(okMsg); }, fb); }catch(e){ fb(); }
  }
  $('mailBtn').addEventListener('click', function(){ copy(EMAIL, $('mailText'), '已複製 Email：' + EMAIL); });
  $('urlCopy').addEventListener('click', function(){ copy(URL_, $('cardUrl'), '已複製名片網址'); });
  $('vcardCopy').addEventListener('click', function(){ copy(VCARD, $('vcardText'), '已複製 vCard 文字'); });

  var panel = $('vcardPanel'), vbtn = $('vcardBtn');
  function setPanel(open){ if(open) drawVcard(); panel.hidden = !open; vbtn.setAttribute('aria-expanded', String(open)); }
  vbtn.addEventListener('click', function(){ setPanel(panel.hidden); });

  var card = $('card'), front = $('front'), back = $('back'), flipBtn = $('flipBtn');
  function setFlip(f){
    card.classList.toggle('flipped', f); card.setAttribute('aria-pressed', String(f));
    front.setAttribute('aria-hidden', String(f)); back.setAttribute('aria-hidden', String(!f));
    flipBtn.textContent = f ? '看正面' : '看背面 QR';
  }
  card.addEventListener('click', function(){ setFlip(!card.classList.contains('flipped')); });
  flipBtn.addEventListener('click', function(){ setFlip(!card.classList.contains('flipped')); });

  if(onPublicSite){
    $('vcfLink').hidden = false;
    $('vcardHint').textContent = '在這支手機上：點「本機下載聯絡人」；幫別人存：讓對方用相機掃描 QR。';
  }
  try{ if(location.hash === '#vcard'){ setPanel(true); } }catch(e){}
})();
