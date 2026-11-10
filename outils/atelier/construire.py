"""Fabrique la page de l'atelier Saitora (outils/atelier/index.html) à partir des vraies bases du dépôt.

    python3 outils/atelier/construire.py

L'atelier est une page privée (artifact Claude) : on y choisit le projet, le genre, la composition et les
animations, et elle écrit le prompt à coller dans une session. Elle embarque, au moment de la fabrication :
  - les genres (commun/themes.json) et leur dessin (commun/themes.js), photos réduites incluses ;
  - le catalogue de composition et le registre des sites déjà faits (outils/styles/) ;
  - l'index de la banque d'animations (outils/atelier/mouvements.html).
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

# --- la banque d'animations : numéro, section, nom, technique (lus dans l'index du fichier) + à quoi elle sert
RANGS = {  # numéro : (catégorie, à quoi ça sert, mise en garde)
    1: ("Ouverture", "Un premier écran calme : le titre arrive ligne par ligne.", ""),
    2: ("Défilement", "Les blocs arrivent quand on les regarde. La base de presque tous les sites.", ""),
    3: ("Textes", "Une bande de mots qui passe (métiers, promesses). Jamais des cartes.", ""),
    4: ("Contenu", "Des chiffres qui montent. Seulement avec de vrais chiffres du client.", ""),
    5: ("Au doigt", "Des cartes qui s'inclinent : une carte de restaurant, trois offres.", ""),
    6: ("Au doigt", "Trois façons de donner envie de cliquer sur le bouton principal.", ""),
    7: ("Défilement", "Une rangée qui avance pendant qu'on descend.", "Contraire à la règle « rien ne défile sur le côté »."),
    8: ("Textes", "Une phrase forte qui s'allume mot à mot en descendant.", ""),
    9: ("Décor", "Un dessin au trait qui se trace : un logo, un plan, un pictogramme.", ""),
    10: ("Au doigt", "Un rond de lumière suit le doigt et révèle ce qui est dessous.", ""),
    11: ("Défilement", "Une fine barre en haut qui montre où on en est dans la page.", ""),
    12: ("Ouverture", "Un court écran d'attente avant le site.", ""),
    13: ("Textes", "Un mot qui s'écrit et change (comme sur l'entrée de Saitora).", ""),
    14: ("Textes", "Un titre qui se décode lettre par lettre : technique, moderne.", ""),
    15: ("Navigation", "Les lettres des liens roulent au survol.", ""),
    16: ("Navigation", "Le menu s'ouvre en cercle sur tout l'écran.", ""),
    17: ("Navigation", "Des onglets dont la pastille glisse : carte du midi, du soir.", ""),
    18: ("Contenu", "Des questions qui s'ouvrent en douceur.", ""),
    19: ("Photos", "Les photos se dévoilent comme derrière un rideau.", ""),
    20: ("Photos", "Avant et après, à faire glisser : chantier, soin, rénovation.", ""),
    21: ("Photos", "Des photos qu'on fait défiler du doigt.", "Contraire à la règle « rien ne défile sur le côté »."),
    22: ("Défilement", "Des cartes qui s'empilent en descendant (les réalisations de Saitora).", ""),
    23: ("Photos", "Une photo qui grandit jusqu'à remplir l'écran.", ""),
    24: ("Contenu", "Un prix dont les chiffres roulent quand on change de formule.", ""),
    25: ("Décor", "Une bordure lumineuse qui tourne, et des blocs d'attente.", ""),
    26: ("Contact", "Un formulaire soigné : étiquettes qui montent, bouton qui confirme.", ""),
    27: ("Navigation", "Le thème jour et nuit qui s'ouvre comme un iris.", ""),
    28: ("Ouverture", "Un fond de points reliés qui bouge doucement.", ""),
    29: ("Textes", "Un mot souligné à la main, un mot en dégradé vivant.", ""),
    30: ("Textes", "Les lettres sortent du flou.", ""),
    31: ("Décor", "Des vagues entre deux sections : bord de mer, spa.", ""),
    32: ("Décor", "Une forme douce qui respire derrière une photo.", ""),
    33: ("Défilement", "Une frise qui se remplit : l'histoire de la maison, les étapes.", ""),
    34: ("Au doigt", "Un cœur, un ajout au panier : pour une boutique.", ""),
    35: ("Au doigt", "De petits messages qui s'empilent en bas de l'écran.", ""),
    36: ("Navigation", "Une feuille qui monte du bas sur téléphone : réserver, filtrer.", ""),
    37: ("Contenu", "Des cartes qui se retournent : l'équipe, les services.", ""),
    38: ("Photos", "Une galerie dont la photo touchée s'élargit.", ""),
    39: ("Contenu", "Un compte à rebours à volets : ouverture, événement.", ""),
    40: ("Au doigt", "Un décor en plusieurs plans qui bouge avec le doigt.", ""),
    41: ("Décor", "Une pastille ronde dont le texte tourne en descendant.", ""),
    42: ("Contact", "Un chemin qui se trace jusqu'à l'adresse.", ""),
    43: ("Navigation", "Un volet qui passe d'une page à l'autre.", ""),
    44: ("Contenu", "Des filtres dont les cartes se rangent en glissant.", ""),
}
source = (ICI / "mouvements.html").read_text(encoding="utf8")
animations = []
for ligne in re.search(r"INDEX.*?\n(.*?)-->", source, re.S).group(1).splitlines():
    m = re.match(r"\s*(\d\d(?: · \d\d)?)\s+#\(?(?:barre #)?([\w-]+)\)?\s+(.*?)(?:\s+\[(.*)\])?\s*$", ligne)
    if not m:
        continue
    nums, sec, nom, tech = m.groups()
    nums = [int(n) for n in nums.split(" · ")]
    parts = [p.strip() for p in nom.split(", puis ")] if len(nums) > 1 else [nom]
    for n, p in zip(nums, parts):
        cat, pour, garde = RANGS[n]
        animations.append({"n": n, "sec": sec, "nom": p[0].upper() + p[1:], "tech": tech or "", "cat": cat, "pour": pour, "garde": garde})
assert len(animations) == 44, len(animations)

donnees = {"themes": themes, "familles": [{"id": f, "nom": NOMS[f], "options": catalogue[f]} for f in ordre], "deja": deja,
           "sites": sorted(registre), "chartes": chartes, "animations": animations}
page = (ICI / "modele.html").read_text(encoding="utf8")
page = page.replace("__POLICES__", polices.replace("&", "&amp;"))
page = page.replace("/*__THEMES_JS__*/", (RACINE / "commun" / "themes.js").read_text(encoding="utf8").replace("</script", "<\\/script"))
page = page.replace("/*__DONNEES__*/null", json.dumps(donnees, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/"))
(ICI / "index.html").write_text(page, encoding="utf8")
print(f"index.html : {len(page.encode()) // 1024} Ko, {len(themes)} genres, {len(ordre)} familles, {len(animations)} animations, {len(registre)} sites au registre.")
