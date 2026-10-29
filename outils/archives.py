"""Cherche des images d'archives libres (cartes postales anciennes, vieilles cartes, gravures, photos d'époque)
sur Wikimedia Commons et Europeana, seulement sous une licence qui permet l'usage commercial et la retouche
(domaine public, CC0, CC BY, CC BY-SA). Une vieille carte postale de la rue du client vaut mieux qu'une photo de banque.

    python3 outils/archives.py cherche "Ajaccio carte postale"             # les deux sources, 12 résultats chacune
    python3 outils/archives.py cherche "Bastia port" --source europeana --n 20 --planche /chemin/planche.jpg
    python3 outils/archives.py prends <ref> clients/<nom>/images/rue.webp [--taille 1600x1000]
    python3 outils/archives.py credits clients/<nom>/images             # la ligne de crédits pour le pied de page

<ref> est la référence affichée par « cherche » (wm:File:… ou eu:/…). « --planche » télécharge les vignettes
dans une image de contrôle pour les regarder avant de choisir. « prends » recadre en WebP et note la source,
l'auteur et la licence dans SOURCES.txt, à côté de l'image.
Europeana demande une clé gratuite (variable EUROPEANA_API_KEY) ; sans elle, la clé de démonstration publique sert.
Une image d'archives montre le monde du client (sa ville, son métier autrefois) : jamais présentée comme la sienne.
"""
import io, json, os, pathlib, re, sys, urllib.parse, urllib.request
from html import unescape

UA = "SaitoraArchives/1.0 (https://saitora.fr; contact@saitora.fr)"   # Wikimedia exige un agent identifiable
LIBRES = re.compile(r"^(public domain|pd|cc0|cc[- ]by(-sa)?([- ][\d.]+)?)", re.I)
INTERDITS = re.compile(r"\b(nc|nd)\b|noncommercial|noderiv", re.I)

def get(url, timeout=30):
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=timeout).read()

def texte(html):
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", "", html or ""))).strip()

def licence_libre(nom):
    return bool(nom) and bool(LIBRES.match(nom.strip())) and not INTERDITS.search(nom)

# --- Wikimedia Commons -----------------------------------------------------------------------------------------

def wikimedia(q, n):
    params = {"action": "query", "format": "json", "generator": "search", "gsrsearch": f"{q} filetype:bitmap",
              "gsrnamespace": 6, "gsrlimit": min(n * 3, 50), "prop": "imageinfo",
              "iiprop": "url|size|extmetadata", "iiurlwidth": 400}
    data = json.loads(get("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)))
    pages = sorted(data.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 0))
    sortie = []
    for p in pages:
        info = (p.get("imageinfo") or [{}])[0]
        meta = {k: v.get("value", "") for k, v in info.get("extmetadata", {}).items()}
        lic = texte(meta.get("LicenseShortName"))
        if not licence_libre(lic):
            continue
        sortie.append({"ref": "wm:" + p["title"], "titre": texte(meta.get("ObjectName")) or p["title"][5:],
                       "auteur": texte(meta.get("Artist")) or "auteur inconnu", "date": texte(meta.get("DateTimeOriginal"))[:40],
                       "licence": lic, "taille": f"{info.get('width')}x{info.get('height')}",
                       "page": info.get("descriptionurl", ""), "image": info.get("url", ""), "vignette": info.get("thumburl", "")})
        if len(sortie) >= n:
            break
    return sortie

def wikimedia_un(titre):
    params = {"action": "query", "format": "json", "titles": titre, "prop": "imageinfo", "iiprop": "url|size|extmetadata"}
    page = next(iter(json.loads(get("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)))["query"]["pages"].values()))
    info = page["imageinfo"][0]
    meta = {k: v.get("value", "") for k, v in info.get("extmetadata", {}).items()}
    return {"titre": texte(meta.get("ObjectName")) or titre[5:], "auteur": texte(meta.get("Artist")) or "auteur inconnu",
            "licence": texte(meta.get("LicenseShortName")), "page": info["descriptionurl"], "image": info["url"]}

# --- Europeana -------------------------------------------------------------------------------------------------

def cle_europeana():
    return os.environ.get("EUROPEANA_API_KEY") or "api2demo"

def licence_europeana(url):
    # les droits sont donnés par une adresse : creativecommons.org/publicdomain/mark/1.0/, …/licenses/by-sa/4.0/
    u = (url or "").lower()
    if "publicdomain/mark" in u: return "Public domain"
    if "publicdomain/zero" in u: return "CC0"
    m = re.search(r"/licenses/(by(?:-sa)?)/([\d.]+)", u)
    return f"CC {m.group(1).upper()} {m.group(2)}" if m else ""

def europeana_fiche(it):
    lic = licence_europeana((it.get("rights") or [""])[0])
    return {"titre": texte((it.get("title") or ["sans titre"])[0]), "auteur": texte((it.get("dcCreator") or ["auteur inconnu"])[0]),
            "date": str((it.get("year") or [""])[0]), "licence": lic, "fournisseur": texte((it.get("dataProvider") or [""])[0]),
            "page": it.get("guid", ""), "image": (it.get("edmIsShownBy") or [""])[0], "vignette": (it.get("edmPreview") or [""])[0]}

def europeana(q, n):
    params = [("wskey", cle_europeana()), ("query", q), ("reusability", "open"), ("media", "true"),
              ("qf", "TYPE:IMAGE"), ("rows", min(n * 2, 100)), ("profile", "rich")]
    data = json.loads(get("https://api.europeana.eu/record/v2/search.json?" + urllib.parse.urlencode(params)))
    sortie = []
    for it in data.get("items", []):
        f = europeana_fiche(it)
        if not licence_libre(f["licence"]) or not f["image"]:
            continue
        sortie.append({"ref": "eu:" + it["id"], "taille": "?", **f})
        if len(sortie) >= n:
            break
    return sortie

def europeana_un(ident):
    params = {"wskey": cle_europeana(), "query": f'europeana_id:"{ident}"', "profile": "rich", "rows": 1}
    it = json.loads(get("https://api.europeana.eu/record/v2/search.json?" + urllib.parse.urlencode(params)))["items"][0]
    return europeana_fiche(it)

# --- commandes -------------------------------------------------------------------------------------------------

def planche(resultats, chemin):
    from PIL import Image, ImageDraw
    cote, cols = 300, 4
    lignes = (len(resultats) + cols - 1) // cols
    feuille = Image.new("RGB", (cote * cols, (cote + 24) * lignes), "white")
    d = ImageDraw.Draw(feuille)
    for i, r in enumerate(resultats):
        x, y = (i % cols) * cote, (i // cols) * (cote + 24)
        try:
            im = Image.open(io.BytesIO(get(r["vignette"] or r["image"], 30))).convert("RGB")
            im.thumbnail((cote - 8, cote - 8))
            feuille.paste(im, (x + (cote - im.width) // 2, y + (cote - im.height) // 2))
        except Exception:
            d.text((x + 10, y + 10), "vignette absente", fill="gray")
        d.text((x + 6, y + cote + 4), f"{i + 1}. {r['ref'][:44]}", fill="black")
    feuille.save(chemin, quality=85)
    print("planche :", chemin)

def cherche(args):
    q = args[0]
    source = args[args.index("--source") + 1] if "--source" in args else "les deux"
    n = int(args[args.index("--n") + 1]) if "--n" in args else 12
    resultats = []
    for nom, f in (("wikimedia", wikimedia), ("europeana", europeana)):
        if source not in ("les deux", nom):
            continue
        try:
            resultats += f(q, n)
        except Exception as e:
            print(f"{nom} injoignable ({e}) : autoriser le domaine dans les réglages réseau de l'environnement.")
    for i, r in enumerate(resultats, 1):
        print(f"{i:>2}. {r['titre'][:70]}\n    {r['auteur'][:50]} · {r['date']} · {r['licence']} · {r['taille']}\n    {r['ref']}\n    {r['page']}")
    if not resultats:
        print("rien trouvé : essayer en anglais, en italien ou avec le nom ancien du lieu.")
    if "--planche" in args and resultats:
        planche(resultats, args[args.index("--planche") + 1])

def recadre(data, w, h):
    from PIL import Image
    im = Image.open(io.BytesIO(data)).convert("RGB")
    k = max(w / im.width, h / im.height)
    if k > 1:
        print(f"attention : image d'origine {im.width}x{im.height}, agrandie pour faire {w}x{h} (moins nette).")
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))

def prends(args):
    ref, cible = args[0], pathlib.Path(args[1])
    w, h = map(int, (args[args.index("--taille") + 1] if "--taille" in args else "1600x1000").split("x"))
    fiche = wikimedia_un(ref[3:]) if ref.startswith("wm:") else europeana_un(ref[3:])
    if not licence_libre(fiche["licence"]):
        sys.exit(f"licence « {fiche['licence']} » : pas utilisable sur un site commercial.")
    cible.parent.mkdir(parents=True, exist_ok=True)
    recadre(get(fiche["image"], 90), w, h).save(cible, "WEBP", quality=80, method=6)
    sources = cible.parent / "SOURCES.txt"
    notes = dict(l.split(" | ", 1) for l in sources.read_text().splitlines() if " | " in l) if sources.exists() else {}
    notes[cible.name] = f"{fiche['page']} (« {fiche['titre']} », {fiche['auteur']}, {fiche['licence']}, archives)"
    sources.write_text("".join(f"{k} | {v}\n" for k, v in sorted(notes.items())))
    print(f"ok {cible}  {fiche['licence']}  {fiche['page']}")

def credits(args):
    sources = pathlib.Path(args[0]) / "SOURCES.txt"
    lignes = [l for l in sources.read_text().splitlines() if "archives)" in l] if sources.exists() else []
    morceaux = []
    for l in lignes:
        m = re.search(r"\(« (.*?) », (.*?), (.*?), archives\)", l)
        if m:
            morceaux.append(f"« {m.group(1)} », {m.group(2)} ({m.group(3)})")
    print("Images d'archives : " + " ; ".join(morceaux) + "." if morceaux else "aucune image d'archives notée.")

if __name__ == "__main__":
    a = sys.argv[1:]
    commandes = {"cherche": cherche, "prends": prends, "credits": credits}
    if len(a) < 2 or a[0] not in commandes:
        sys.exit(__doc__)
    commandes[a[0]](a[1:])
