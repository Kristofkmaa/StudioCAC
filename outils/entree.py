#!/usr/bin/env python3
"""index.html (la racine du site) est la copie de accueil.html : la même page, avec l'écran d'entrée (la porte)
posé par-dessus. À relancer après chaque modification de accueil.html :  python3 outils/entree.py"""
import pathlib
racine = pathlib.Path(__file__).resolve().parent.parent
s = (racine / "accueil.html").read_text(encoding="utf-8")
vieux = '<meta property="og:url" content="https://saitora.fr/accueil.html">'
assert s.count(vieux) == 1
s = s.replace(vieux, '<meta property="og:url" content="https://saitora.fr/">')
s = s.replace("<!doctype html>\n", "<!doctype html>\n<!-- Fichier fabriqué par outils/entree.py à partir de accueil.html : ne pas le modifier à la main. -->\n", 1)
(racine / "index.html").write_text(s, encoding="utf-8")
print("index.html refait depuis accueil.html")
