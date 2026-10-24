import sys
SNIP='''<script>/* неразрывные пробелы: 8 · 8 = 64 и «64 кг» не переносятся по частям */
(function(){var OP=/(\\S) ([·:+−=×<>]) (?=\\S)/g,UN=/(\\d) (?=(кг|км|см|дм|мм|м|г|ч|мин|р\\.|т|ц|га|м²|дм²|см²|км\\/ч|м\\/мин|м\\/с|см\\/мин)(?![а-яё]))/g;
function fix(root){try{var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n,a=[];while(n=w.nextNode())a.push(n);
a.forEach(function(t){var v=t.nodeValue,v2=v.replace(OP,'$1\\u00a0$2\\u00a0').replace(OP,'$1\\u00a0$2\\u00a0').replace(UN,'$1\\u00a0');if(v2!==v)t.nodeValue=v2;});}catch(e){}}
function go(){fix(document.body);try{new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(x){if(x.nodeType===1)fix(x);else if(x.nodeType===3&&x.parentNode)fix(x.parentNode);});});}).observe(document.body,{childList:true,subtree:true});}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();})();</script>
'''
for f in sys.argv[1:]:
    s=open(f,encoding='utf8').read()
    if 'неразрывные пробелы' in s: continue
    i=s.rfind('</body>')
    s=s[:i]+SNIP+s[i:] if i>=0 else s+SNIP
    open(f,'w',encoding='utf8').write(s)
    print('ok',f)
