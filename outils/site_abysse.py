"""Fabrique la version test « abysse » du site (d'après la fiche Auros) à partir des pages en ligne.

    python3 outils/site_abysse.py

Pages fabriquées : abysse-tarifs.html, abysse-devis.html, abysse-charte.html, abysse-photos.html,
abysse-cgv.html, abysse-mentions-legales.html (relire après chaque changement d'une page en ligne).
L'écran d'entrée (abysse-index.html) et l'accueil (abysse-accueil.html) sont écrits à la main.
Pour chaque page : couleurs abysse.css à la place de theme.css, retouches abysse-fin.css, police Inter Tight,
plus de bouton clair / sombre, transition « plongée » (abysse-transition.js), liens vers les pages abysse-*,
et noindex (version de test).
"""
import pathlib, re

RACINE = pathlib.Path(__file__).resolve().parent.parent
PAGES = ["tarifs", "devis", "charte", "photos", "cgv", "mentions-legales"]
TOUTES = ["index", "accueil"] + PAGES

def remplace(html, avant, apres, page, compte=1):
    if avant not in html:
        raise SystemExit(f"{page} : repère introuvable : {avant[:60]}")
    return html.replace(avant, apres, compte)

def fabrique(page):
    html = (RACINE / f"{page}.html").read_text(encoding="utf-8")
    html = remplace(html, '<link rel="stylesheet" href="theme.css?v=2">', '<link rel="stylesheet" href="abysse.css">', page)
    html = remplace(html, "</head>", '<link rel="stylesheet" href="abysse-fin.css">\n<meta name="robots" content="noindex">\n</head>', page)
    html = re.sub(r'<meta name="robots" content="[^"]*">\n(?=.*<meta name="robots" content="noindex">)', "", html, flags=re.S)
    html = re.sub(r'<meta name="theme-color" content="[^"]*">', '<meta name="theme-color" content="#012624">', html)
    html = re.sub(r"html\.sc-pending,html\.sc-pending body\{background:#[0-9A-Fa-f]+\}html\[data-theme=dark\]\.sc-pending,html\[data-theme=dark\]\.sc-pending body\{background:#[0-9A-Fa-f]+\}",
                  "html.sc-pending,html.sc-pending body{background:#012624}", html)
    html = re.sub(r'<button class="theme-toggle"[\s\S]*?</button>', "", html)
    html = re.sub(r'<script src="theme\.js[^"]*"[^>]*></script>\n?', "", html)
    html = html.replace('src="transition.js?v=13"', 'src="abysse-transition.js"')
    # liens entre les pages du site : vers leur version abysse (pas les adresses complètes https://saitora.fr/…)
    html = re.sub(r'(?<![\w/.-])(' + "|".join(TOUTES) + r')\.html', r'abysse-\1.html', html)
    (RACINE / f"abysse-{page}.html").write_text(html, encoding="utf-8")
    print(f"abysse-{page}.html")

for p in PAGES:
    fabrique(p)
