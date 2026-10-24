set -e
cd /tmp/claude-0/-home-claude/d0e6d958-b3c0-5104-9cd2-c1cfd6909a4b/scratchpad
python3 - <<'PY'
d='rab/';s=open(d+'shell.html').read()
cats=open('en/cats.js').read();cats=cats[:cats.index('const CAT_OK')]
js=cats+'\n'+open(d+'app.js').read()
open(d+'rab.html','w').write(s.replace('/*JS*/',js))
PY
python3 build2.py rab/rab.html rab/rab-off.html >/dev/null
mkdir -p /home/claude/uroki/rabota
python3 - <<'PY'
s=open('rab/rab-off.html').read()
meta='<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="Игры">\n<meta name="theme-color" content="#7A4FE0">\n<link rel="apple-touch-icon" href="../icon-180.png">\n<link rel="manifest" href="../manifest.webmanifest">\n'
s=s.replace('<meta charset="utf-8">\n','<meta charset="utf-8">\n'+meta,1)
open('/home/claude/uroki/rabota/index.html','w').write(s)
PY
python3 nbsp.py /home/claude/uroki/rabota/index.html >/dev/null
echo built
