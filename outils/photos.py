"""Télécharge les photos des démos depuis Pixabay (licence libre, usage commercial autorisé) et les recadre en WebP.

    PIXABAY_API_KEY=… python3 outils/photos.py            # télécharge celles qui manquent
    PIXABAY_API_KEY=… python3 outils/photos.py --tout     # les refait toutes
    python3 outils/photos.py --liste                      # affiche la liste, sans rien télécharger

La clé est lue dans la variable d'environnement PIXABAY_API_KEY : elle n'est jamais écrite dans le dépôt.
Pour chaque photo : une recherche, la première image assez grande parmi les plus appréciées, recadrée au format voulu.
Les sources sont notées dans images/<démo>/SOURCES.txt. Pour changer une photo, changer sa recherche ou ajouter
« choix » (rang du résultat à prendre, 0 par défaut) puis relancer avec le nom du fichier : photos.py mer.webp
"""
import io, json, os, pathlib, sys, urllib.parse, urllib.request
from PIL import Image

RACINE = pathlib.Path(__file__).resolve().parent.parent
# fichier : (recherche en anglais, orientation, largeur, hauteur[, choix])
PHOTOS = {
    # libecciu : photos choisies à la main dans Pixabay (voir images/libecciu/SOURCES.txt)
    # zia-rosa : photos choisies à la main dans Pixabay (voir images/zia-rosa/SOURCES.txt)
    "funtana": {   # les photos de coiffure sont déjà là (reprises de l'ancienne démo du salon)
        "hammam.webp": ("hammam", "all", 1600, 1000, 11),
        "galets.webp": ("hot stones massage", "all", 1200, 900, 2),
        "huile.webp": ("spa towels stones", "all", 1000, 1000, 7),
        "ciseaux.webp": ("hair salon", "all", 1200, 900, 7),
        "bacs.webp": ("hair salon", "all", 1200, 900, 14),
        "rue.webp": ("ajaccio", "all", 900, 1200, 9),
        "golfe.webp": ("ajaccio", "all", 1600, 1000, 1),
        "fontaine.webp": ("ajaccio", "all", 1600, 1000, 9),
        "massage.webp": ("back massage oil spa", "horizontal", 1600, 1000),
        "immortelle.webp": ("helichrysum flowers", "vertical", 800, 1000),
    },
    # castagnetu : photos choisies à la main dans Pixabay (voir images/castagnetu/SOURCES.txt)
}

# Pixabay refuse l'agent par défaut de Python (403) : on se présente comme curl
def ouvre(url, timeout):
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "curl/8"}), timeout=timeout)

def cherche(cle, q, orientation):
    params = {"key": cle, "q": q, "image_type": "photo", "orientation": orientation, "safesearch": "true", "per_page": 20, "order": "popular", "min_width": 1000}
    with ouvre("https://pixabay.com/api/?" + urllib.parse.urlencode(params), 30) as r:
        return json.load(r).get("hits", [])

def recadre(data, w, h):
    im = Image.open(io.BytesIO(data)).convert("RGB")
    k = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))

def main():
    args = sys.argv[1:]
    if "--liste" in args:
        for demo, photos in PHOTOS.items():
            for f, (q, *_r) in photos.items():
                print(f"{demo}/{f}: {q}")
        return
    cle = os.environ.get("PIXABAY_API_KEY")
    if not cle:
        sys.exit("Variable PIXABAY_API_KEY absente : ajoutez-la aux réglages de l'environnement.")
    tout, seuls = "--tout" in args, [a for a in args if not a.startswith("--")]
    for demo, photos in PHOTOS.items():
        dossier = RACINE / "images" / demo; dossier.mkdir(parents=True, exist_ok=True)
        sources = dossier / "SOURCES.txt"
        notes = dict(l.split(" | ", 1) for l in sources.read_text().splitlines() if " | " in l) if sources.exists() else {}
        for f, (q, orientation, w, h, *choix) in photos.items():
            cible = dossier / f
            if seuls and f not in seuls: continue
            if cible.exists() and not tout and not seuls: continue
            hits = [x for x in cherche(cle, q, orientation) if x["imageWidth"] >= w and x["imageHeight"] >= h] or cherche(cle, q, "all")
            if not hits:
                print(f"rien trouvé pour {demo}/{f} ({q})"); continue
            hit = hits[min(choix[0] if choix else 0, len(hits) - 1)]
            with ouvre(hit["largeImageURL"], 60) as r:
                recadre(r.read(), w, h).save(cible, "WEBP", quality=80, method=6)
            notes[f] = f"{hit['pageURL']} (photo de {hit['user']}, licence Pixabay)"
            print(f"ok {demo}/{f}  {hit['pageURL']}")
        sources.write_text("".join(f"{k} | {v}\n" for k, v in sorted(notes.items())))

if __name__ == "__main__":
    main()
