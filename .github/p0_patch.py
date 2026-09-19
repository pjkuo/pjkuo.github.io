# -*- coding: utf-8 -*-
import hashlib
s = open('index.html', encoding='utf-8').read()
ri = s.find('AE Router'); rj = s.find('</script>', ri)
router_before = hashlib.md5(s[ri:rj].encode()).hexdigest()

def rep(old, new, n=1):
    global s
    assert s.count(old) == n, 'anchor not unique: %r' % old[:60]
    s = s.replace(old, new, n)

css = """
/* ===== P0 今天要做什麼（s4）與更多平台摺疊 ===== */
.s4-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:920px}
@media(max-width:760px){.s4-grid{grid-template-columns:repeat(2,1fr)}}
.s4-btn{display:flex;flex-direction:column;gap:4px;background:#fff;color:#0f172a;border-radius:14px;padding:14px 16px;text-decoration:none;box-shadow:0 2px 10px rgba(15,23,42,.08);border:2px solid #e2e8f0;transition:.15s}
.s4-btn:hover{border-color:#0891b2;transform:translateY(-2px)}
.s4-btn b{font-size:17px}
.s4-ic{font-size:22px;line-height:1}
.s4-d{font-size:12.5px;color:#475569}
.more-tools{margin:26px 0;border:1.5px dashed #cbd5e1;border-radius:14px;padding:12px 16px;background:#f8fafc}
.more-tools>summary{cursor:pointer;font-weight:800;font-size:15.5px;color:#0f172a}
.more-tools .mt-hint{font-weight:500;font-size:12.5px;color:#64748b;margin-left:8px}
"""
i = s.find('</style>')
assert i > 0
s = s[:i] + css + s[i:]

s4 = """  <section id="today">
    <div class="sec-head">
      <span class="bar"></span>
      <div><h2>今天要做什麼？<span class="en">Start Here</span></h2>
        <p id="s4week">📅 四顆按鈕就是你的日常——自己看、自己做、自己查。</p></div>
    </div>
    <div class="s4-grid" aria-label="今天要做什麼">
      <a class="s4-btn" href="ai-empower/ioc.html"><span class="s4-ic">🖥</span><b>本週學習</b><span class="s4-d">IOC 單元：模擬 → 講義 → 小測</span></a>
      <a class="s4-btn" href="AI-empower-platform/"><span class="s4-ic">🎨</span><b>專題創作</b><span class="s4-d">四步驟，想法變作品</span></a>
      <a class="s4-btn" href="ai-empower/weekly.html"><span class="s4-ic">📈</span><b>我的學習週報</b><span class="s4-d">看進度、拿下一步建議</span></a>
      <a class="s4-btn" href="ai-empower/manual.html"><span class="s4-ic">🧭</span><b>新手上路</b><span class="s4-d">手冊＋3 分鐘導覽影片</span></a>
    </div>
  </section>

"""
rep('</section>\n\n  <section class="fresh"', '</section>\n\n' + s4 + '  <section class="fresh"')

rep('\n  <section id="platforms">',
    '\n  <details class="more-tools" id="more">\n    <summary>📦 更多平台與資源<span class="mt-hint">課程平台原始入口・專題工具・影片教學（進階／教師）</span></summary>\n\n  <section id="platforms">')
rep('</section>\n\n  <section id="access">', '</section>\n  </details>\n\n  <section id="access">')

wk = """<script>
/* P0：週次提示（semStart 2026-09-14） */
(function(){try{
  var el=document.getElementById('s4week'); if(!el) return;
  var st=new Date('2026-09-14T00:00:00+08:00'), w=Math.floor((Date.now()-st.getTime())/604800000)+1;
  if(w>=1&&w<=18){
    el.innerHTML='📅 第 '+w+' 週 · 今天要做什麼？'+(w<=2?' <a href="ai-empower/presurvey.html">新生請先完成課前評量 →</a>':'');
  }else if(w<1){ el.innerHTML='📅 開學倒數 · 新生請先完成 <a href="ai-empower/presurvey.html">課前評量 →</a>'; }
}catch(e){}})();
</script>
</body>"""
rep('</body>', wk)

ri = s.find('AE Router'); rj = s.find('</script>', ri)
assert hashlib.md5(s[ri:rj].encode()).hexdigest() == router_before, 'ROUTER BLOCK CHANGED'
assert '請輸入學號' in s
open('index.html','w',encoding='utf-8').write(s)
print('OK', len(s))
