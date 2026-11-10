"""Fabrique la page de l'atelier Saitora (outils/atelier/index.html) à partir des vraies bases du dépôt.

    python3 outils/atelier/construire.py

L'atelier est une page privée (artifact Claude) : on y choisit le projet, le genre, la composition et les
animations, et elle écrit le prompt à coller dans une session. Elle embarque, au moment de la fabrication :
  - les genres (commun/themes.json) et leur dessin (commun/themes.js), photos réduites incluses ;
  - le catalogue de composition et le registre des sites déjà faits (outils/styles/) ;
  - l'index de la banque d'animations (animations/mouvements.html, 100 mouvements).
À relancer quand une de ces bases change, puis republier la page.
"""
import base64, io, json, pathlib, re

from PIL import Image

ICI = pathlib.Path(__file__).resolve().parent
RACINE = ICI.parent.parent
lis = lambda p: json.loads((RACINE / p).read_text(encoding="utf8"))

# --- les genres, avec une petite photo incluse dans la page
themes = lis("commun/themes.json")["themes"]
for t in themes:
    im = Image.open(RACINE / t["photo"]).convert("RGB")
    im.thumbnail((520, 520))
    b = io.BytesIO()
    im.save(b, "WEBP", quality=62)
    t["photo"] = "data:image/webp;base64," + base64.b64encode(b.getvalue()).decode()

# les polices des genres : Google Fonts (une seule graisse pour celles qui n'en ont qu'une)
UNE_GRAISSE = {"Italiana", "Anton", "DM Serif Display", "Saira Stencil One", "Instrument Serif"}
PAS_GOOGLE = {"Redaction"}
noms = []
for t in themes:
    for n in (t["polices"]["titres"], t["polices"]["texte"]):
        if n not in noms and n not in PAS_GOOGLE:
            noms.append(n)
polices = "https://fonts.googleapis.com/css2?" + "&".join(
    "family=" + n.replace(" ", "+") + ("" if n in UNE_GRAISSE else ":wght@400;700") for n in noms) + "&display=swap"

# --- la composition : les familles, et combien de fois chaque option a déjà servi
catalogue = lis("outils/styles/catalogue.json")
familles = [k for k in catalogue if not k.startswith("_")]
registre = lis("outils/styles/registre.json")["sites"]
deja = {f: {} for f in familles + ["genre"]}
for s in registre.values():
    for f in deja:
        if s.get(f):
            deja[f][s[f]] = deja[f].get(s[f], 0) + 1
NOMS = {"ouverture": "Ouverture", "navigation": "Navigation", "services": "Services", "preuves": "Réalisations", "a_propos": "À propos",
        "contact": "Contact", "formes": "Formes", "photos": "Photos", "rythme": "Rythme des couleurs", "titres": "Titres",
        "appoint": "Police d'appoint", "texture": "Texture", "arrivee": "Arrivée des éléments", "decoupes": "Passage entre les sections",
        "boutons": "Boutons", "pied": "Pied de page", "ornement": "Ornement", "signature": "L'idée originale"}
ordre = ["signature"] + [f for f in familles if f != "signature"]
chartes = [k for k in lis("outils/styles/polices.json") if not k.startswith("_")]

# --- la banque d'animations : animations/mouvements.html (100 mouvements, en packs). On en extrait l'index.
BANQUE = RACINE / "animations" / "mouvements.html"
source = BANQUE.read_text(encoding="utf8")
index = json.loads(list(re.finditer(r'<script type="application/json" id="mvm-index">(.*?)</script>', source, re.S))[-1].group(1))
packs = {m.group(1): {"nom": m.group(2), "groupe": m.group(3), "numeros": m.group(4)}
         for m in re.finditer(r'<template data-pack="([^"]+)" data-name="([^"]+)" data-group="([^"]+)" data-range="([^"]+)"', source)}
(RACINE / "animations" / "index.json").write_text(json.dumps({
    "_note": "Index de la banque d'animations (animations/mouvements.html), extrait par outils/atelier/construire.py. n : numéro ; p : pack ; t : section dans le pack (END : pied de page) ; s : styles ; g : déclencheurs ; e : emplacement.",
    "packs": packs, "animations": index}, ensure_ascii=False, indent=1) + "\n", encoding="utf8")
COTE = {7, 21, 50, 58}  # elles font défiler sur le côté : contraire à la règle de la maison
animations = [{"n": a["n"], "p": a["p"], "t": a["t"], "nom": a["title"], "pour": a["d"], "s": a["s"], "g": a["g"], "e": a["e"],
               "niveau": "basique" if a["p"] in ("bases", "bases2") else "premium",
               "garde": "Contraire à la règle « rien ne défile sur le côté »." if a["n"] in COTE else ""} for a in sorted(index, key=lambda a: a["n"])]
styles = []
for a in animations:
    for x in a["s"]:
        if x not in styles:
            styles.append(x)
metiers = [[k, v["nom"]] for k, v in packs.items() if v["groupe"] == "Par métier"]
# la page d'aperçu de l'atelier : la banque, plus de quoi ouvrir une seule animation (apercu.html?voir=NN). Fichier fabriqué, non suivi.
AJOUT = """<script>
/* Ajout de l'atelier Saitora : ?voir=NN ouvre le pack de l'animation NN et descend jusqu'à elle.
   Placé avant le lanceur, pour garder le vrai setTimeout (le lanceur surveille les minuteries des packs). */
(function(){var m=/voir=(\\d+)/.exec(location.search||"");if(!m)return;var T=window.setTimeout.bind(window),n=0;
T(function va(){var M=window.__mvm;if(!M||document.readyState!=="complete"){if(++n<80)T(va,100);return}var a=M.data.filter(function(x){return x.n===+m[1]})[0];if(a)M.go(a.p,a.t,a)},200);})();
</script>
"""
k = source.rindex("<script>")
(ICI / "apercu.html").write_text(source[:k] + AJOUT + source[k:], encoding="utf8")

donnees = {"themes": themes, "familles": [{"id": f, "nom": NOMS[f], "options": catalogue[f]} for f in ordre], "deja": deja,
           "sites": sorted(registre), "chartes": chartes, "animations": animations, "styles": styles, "metiers": metiers, "packs": {k: v["nom"] for k, v in packs.items()}}
page = (ICI / "modele.html").read_text(encoding="utf8")
page = page.replace("__POLICES__", polices.replace("&", "&amp;"))
page = page.replace("/*__THEMES_JS__*/", (RACINE / "commun" / "themes.js").read_text(encoding="utf8").replace("</script", "<\\/script"))
page = page.replace("/*__DONNEES__*/null", json.dumps(donnees, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/"))
(ICI / "index.html").write_text(page, encoding="utf8")
print(f"index.html : {len(page.encode()) // 1024} Ko, {len(themes)} genres, {len(ordre)} familles, {len(animations)} animations, {len(registre)} sites au registre.")
