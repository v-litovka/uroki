import re
h=open('ulica-domikov.html',encoding='utf8').read()
o=open('index.html',encoding='utf8').read()
fonts=o[o.index('<style>')+7:o.index('html,body{height:100%}')]
h=re.sub(r'<link rel="preconnect"[^\n]*\n<link href="https://fonts.googleapis.com[^\n]*\n','',h)
h=h.replace('window.__TEST__={CARDS,MH,SPECIAL,BASE,divHack};\n','')
h=h.replace('<style>','<style>'+fonts,1).replace('html,body{height:100%}','html,body{height:100%}\nbody{margin:0}\n[hidden]{display:none!important}\nimg{max-width:100%}',1)
i=h.index('</style>')+8
out='<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'+h[:i]+'\n</head>\n<body>\n'+h[i:]+'\n</body>\n</html>\n'
open('index.html','w',encoding='utf8').write(out);open('/mnt/user-data/outputs/index.html','w',encoding='utf8').write(out)
print(len(out),out.count('@font-face'))
