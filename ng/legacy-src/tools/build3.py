import re,sys
src,dst=sys.argv[1],sys.argv[2]
h=open(src,encoding='utf8').read()
o=open('index.html',encoding='utf8').read()
fonts=o[o.index('<style>')+7:o.index('html,body{height:100%}')]
h=re.sub(r'<link rel="preconnect"[^\n]*\n<link href="https://fonts.googleapis.com[^\n]*\n','',h)
h=re.sub(r'window\.__TEST__=\{[^}]*\};\n','',h)
h=h.replace('<style>','<style>'+fonts,1).replace('html,body{height:100%}','html,body{height:100%}\nbody{margin:0}\n[hidden]{display:none!important}\nimg{max-width:100%}',1)
i=h.index('</style>')+8
out='<!doctype html>\n<html lang="be">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'+h[:i]+'\n</head>\n<body>\n'+h[i:]+'\n</body>\n</html>\n'
open(dst,'w',encoding='utf8').write(out);print(dst,len(out),out.count('@font-face'))
