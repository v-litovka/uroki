set -e
cd /tmp/claude-0/-home-claude/d0e6d958-b3c0-5104-9cd2-c1cfd6909a4b/scratchpad
python3 - <<'PY'
d='dz/';s=open(d+'shell.html').read()
js='\n'.join(open(d+f).read() for f in ['schemes.js','engine.js','content.js','pages28.js','builders.js','pages_rest.js','fixK.js','pages36.js','lib38.js','pages38.js','pages48.js','whys.js','app.js'])
s=s.replace('/*JS*/',js)
for t in ['<!doctype html>\n','<html lang="ru">\n','<head>\n','<meta charset="utf-8">\n','<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n','</head>\n','<body>\n','</body>\n','</html>\n']: s=s.replace(t,'',1)
open(d+'domashka.html','w').write(s)
PY
python3 build2.py dz/domashka.html dz/domashka-off.html >/dev/null
mkdir -p /home/claude/uroki/domashka
python3 - <<'PY'
s=open('dz/domashka-off.html').read()
meta='<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="Игры">\n<meta name="theme-color" content="#7A4FE0">\n<link rel="apple-touch-icon" href="../icon-180.png">\n<link rel="manifest" href="../manifest.webmanifest">\n'
s=s.replace('<meta charset="utf-8">\n','<meta charset="utf-8">\n'+meta,1)
s=s.replace('</style>','.hub{display:inline-block;margin:2px 0 6px;font-family:var(--body,system-ui);font-size:15px;font-weight:900;color:var(--ink);text-decoration:none;border:2px solid var(--ink);border-radius:10px;padding:4px 10px;background:var(--paper,#fff)}\n</style>',1)
open('/home/claude/uroki/domashka/index.html','w').write(s)
PY
python3 nbsp.py /home/claude/uroki/domashka/index.html >/dev/null
echo built
