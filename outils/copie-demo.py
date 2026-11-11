"""Copie autonome d'une démo pour une page Claude : python3 copie.py <demo> <dossier>. Affiche la carte des fichiers."""
import re,shutil,os,json,sys
demo,A=sys.argv[1],sys.argv[2].rstrip('/')+'/'
shutil.rmtree(A,ignore_errors=True); os.makedirs(A+'polices')
s=open(demo,encoding='utf8').read()
for css in re.findall(r'href="(polices/[^"]+\.css)"',s):
    c=open(css).read(); shutil.copy(css,A+css)
    for f in sorted(set(re.findall(r'url\(["\']?([^"\')]+)',c))): shutil.copy('polices/'+f,A+'polices/'+f)
for d in sorted(set(re.findall(r'images/([\w-]+)/',s))):
    shutil.copytree('images/'+d,A+'images/'+d)
s=s.replace('href="accueil.html"','href="https://saitora.fr/accueil.html"')
open(A+'index.html','w',encoding='utf8').write(s)
m={}
for d,_,ff in os.walk(A):
    for f in ff:
        p=os.path.relpath(os.path.join(d,f),A)
        if p!='index.html' and not p.endswith('.txt'): m[p]=p
print(json.dumps(m)); print(sum(os.path.getsize(A+p) for p in m)//1024,'K',file=sys.stderr)
