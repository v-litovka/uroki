set -e
cd /tmp/claude-0/-home-claude/d0e6d958-b3c0-5104-9cd2-c1cfd6909a4b/scratchpad
python3 - <<'PY'
d='en/';s=open(d+'shell.html').read()
js='\n'.join(open(d+f).read() for f in ['data.js','cats.js','app.js','grammar.js'])
open(d+'english.html','w').write(s.replace('/*JS*/',js))
PY
python3 build2.py en/english.html en/english-off.html >/dev/null
mkdir -p /home/claude/uroki/english
python3 - <<'PY'
s=open('en/english-off.html').read()
meta='<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="Игры">\n<meta name="theme-color" content="#7A4FE0">\n<link rel="apple-touch-icon" href="../icon-180.png">\n<link rel="manifest" href="../manifest.webmanifest">\n'
s=s.replace('<meta charset="utf-8">\n','<meta charset="utf-8">\n'+meta,1)
open('/home/claude/uroki/english/index.html','w').write(s)
PY
python3 nbsp.py /home/claude/uroki/english/index.html >/dev/null
echo built
