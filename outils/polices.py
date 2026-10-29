"""Héberge les polices Google sur le site (dossier polices/) au lieu de les charger chez Google.
Pour chaque lien fonts.googleapis.com trouvé dans les pages : télécharge les fichiers woff2
(alphabet latin seulement), écrit une feuille polices/<nom>.css et remplace le lien dans la page.
À relancer si on ajoute une police : python3 outils/polices.py

Polices de fonderies indépendantes (Velvetyne, Collletttivo…, licence libre), récupérées par npm (Fontsource) :
    python3 outils/polices.py libre bagnard uncut-sans
écrit polices/<noms>-libre-<code>.css et affiche le lien à mettre dans la page. La liste est dans
outils/styles/polices.json (« _libres »)."""
import hashlib, io, json, pathlib, re, sys, tarfile, urllib.request

RACINE = pathlib.Path(__file__).resolve().parent.parent
DOSSIER = RACINE / "polices"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
GARDER = {"latin", "latin-ext"}   # le français n'a besoin que de ces deux alphabets
LIEN = re.compile(r'<link rel="stylesheet" href="(https://fonts\.googleapis\.com/css2\?[^"]+)">')
PRECONNECT = re.compile(r'<link rel="preconnect" href="https://fonts\.(googleapis|gstatic)\.com"[^>]*>\n?')

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=30).read()

def feuille(url):
    familles = [f.split(":")[0].replace("+", "-").lower() for f in re.findall(r"family=([^&]+)", url)]
    nom = "-".join(familles)[:60] + "-" + hashlib.sha1(url.encode()).hexdigest()[:6]
    css_file = DOSSIER / f"{nom}.css"
    if css_file.exists():
        return css_file.name
    css = get(url.replace("&amp;", "&")).decode()
    sortie = []
    for sous, bloc in re.findall(r"/\* ([\w-]+) \*/\s*(@font-face \{.*?\})", css, re.S):
        if sous not in GARDER:
            continue
        src = re.search(r"url\((https://fonts\.gstatic\.com/[^)]+)\)", bloc).group(1)
        fam = re.search(r"font-family: '([^']+)'", bloc).group(1).replace(" ", "-").lower()
        style = re.search(r"font-style: (\w+)", bloc).group(1)
        poids = re.search(r"font-weight: ([\d ]+)", bloc).group(1).replace(" ", "-")
        fichier = f"{fam}-{poids}-{style}-{sous}.woff2"
        if not (DOSSIER / fichier).exists():
            (DOSSIER / fichier).write_bytes(get(src))
        sortie.append(f"/* {sous} */\n" + bloc.replace(src, fichier))
    css_file.write_text("/* Polices hébergées sur le site (licence SIL Open Font License), générées par outils/polices.py */\n" + "\n".join(sortie) + "\n")
    return css_file.name

def libre(ids):
    """Télécharge les paquets @fontsource/<id> depuis npm et écrit une feuille de styles hébergée sur le site."""
    nom = "-".join(ids)[:60] + "-libre-" + hashlib.sha1(" ".join(ids).encode()).hexdigest()[:6]
    sortie = []
    for i in ids:
        info = json.loads(get(f"https://registry.npmjs.org/@fontsource/{i}/latest"))
        paquet = tarfile.open(fileobj=io.BytesIO(get(info["dist"]["tarball"])))
        lire = lambda chemin: paquet.extractfile(paquet.getmember("package/" + chemin)).read()
        meta = json.loads(lire("metadata.json"))
        for sous in meta["subsets"]:
            if sous not in GARDER:
                continue
            for poids in meta["weights"]:
                for style in meta["styles"]:
                    fichier = f"{i}-{sous}-{poids}-{style}.woff2"
                    try:
                        donnees = lire("files/" + fichier)
                    except KeyError:
                        continue
                    (DOSSIER / fichier).write_bytes(donnees)
                    sortie.append(f"/* {meta['family']} {poids} {style} ({sous}) */\n@font-face {{\n  font-family: '{meta['family']}';\n"
                                  f"  font-style: {style};\n  font-display: swap;\n  font-weight: {poids};\n  src: url({fichier}) format('woff2');\n}}")
        lic = meta["license"]
        sortie.insert(0, f"/* {meta['family']} : {lic['type']}, {lic['attribution']} ({lic['url']}) */")
    (DOSSIER / f"{nom}.css").write_text("/* Polices de fonderies indépendantes hébergées sur le site, générées par outils/polices.py libre */\n" + "\n".join(sortie) + "\n")
    print(f'<link rel="stylesheet" href="polices/{nom}.css">   (préfixer de ../../ pour un site client)')

DOSSIER.mkdir(exist_ok=True)
if sys.argv[1:2] == ["libre"]:
    libre(sys.argv[2:]) if sys.argv[2:] else sys.exit("Préciser les polices : python3 outils/polices.py libre bagnard uncut-sans")
    sys.exit()
for page in sorted(list(RACINE.glob("*.html")) + list(RACINE.glob("outils/**/*.html")) + list(RACINE.glob("clients/**/*.html")) + list(RACINE.glob("essais/**/*.html")) + list(RACINE.glob("saitorapp/*.html"))):
    texte = page.read_text()
    if "fonts.googleapis.com" not in texte:
        continue
    prefixe = "/" if page.name == "404.html" else "../" * (len(page.relative_to(RACINE).parts) - 1)
    texte = LIEN.sub(lambda m: f'<link rel="stylesheet" href="{prefixe}polices/{feuille(m.group(1))}">', texte)
    texte = PRECONNECT.sub("", texte)
    page.write_text(texte)
    print("ok", page.relative_to(RACINE))
