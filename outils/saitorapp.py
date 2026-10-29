"""Saitorapp : fabrique l'appli personnalisée de chaque site (son nom, sa couleur, son icône, les modules de son métier).

    python3 outils/saitorapp.py                       # refait toutes les applis listées dans saitorapp/sites.json
    python3 outils/saitorapp.py ajoute coiffure-lisa --nom "Coiffure Lisa" --metier institut --accent "#7A4E3B" \
        --logo clients/coiffure-lisa/images/logo.png --site ../../clients/coiffure-lisa/
    python3 outils/saitorapp.py metiers               # la liste des métiers et de leurs modules

Chaque appli est dans saitorapp/<id>/ : index.html, manifest.webmanifest (nom et icône sur l'écran d'accueil du téléphone),
icônes tirées du logo (ou une initiale sur la couleur du site). saitorapp/index.html liste toutes les applis pour Saitora.
Un nouveau site part sans données de démonstration ("demo": false)."""
import argparse, html, json, pathlib, re, sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
APP = RACINE / "saitorapp"
LISTE = APP / "sites.json"
METIERS = {"boutique", "institut", "hebergement", "restaurant", "artisan", "vitrine"}


def icones(site, dossier):
    """Toutes les applis ont la même icône sur l'écran d'accueil : le symbole de Saitora (saitorapp/icone-*.png)."""
    import shutil
    for taille in (180, 192, 512):
        shutil.copy(APP / f"icone-{taille}.png", dossier / f"icone-{taille}.png")


def icones_du_logo(site, dossier):
    """La vignette du client dans la liste de Saitora : son logo, ou ses initiales sur sa couleur."""
    from PIL import Image, ImageDraw, ImageFont
    fond = (255, 255, 255)
    for taille in (192,):
        im = Image.new("RGB", (taille, taille), fond)
        logo = RACINE / site["logo"] if site.get("logo") else None
        if logo and logo.exists():
            lg = Image.open(logo).convert("RGBA")
            c = int(taille * 0.84)
            lg.thumbnail((c, c), Image.LANCZOS)
            im.paste(lg, ((taille - lg.width) // 2, (taille - lg.height) // 2), lg)
        else:
            im = Image.new("RGB", (taille, taille), site["accent"])
            d = ImageDraw.Draw(im)
            police = None
            for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf", "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"):
                if pathlib.Path(p).exists():
                    police = ImageFont.truetype(p, int(taille * 0.5)); break
            lettres = "".join(m[0] for m in re.findall(r"[A-ZÀ-Ý]\w*", site["nom"]))[:2] or site["nom"][:1].upper()
            d.text((taille / 2, taille / 2), lettres, fill="#FFFFFF", font=police, anchor="mm")
        im.save(dossier / "apercu.png", optimize=True)


def version():
    """Une empreinte de app.js, app.css et sites.js : le navigateur recharge l'appli dès qu'elle change."""
    import hashlib
    h = hashlib.sha1()
    for f in ("app.js", "app.css", "sites.js"):
        h.update((APP / f).read_bytes())
    return h.hexdigest()[:8]


def page(site):
    s = {k: site.get(k) for k in ("id", "nom", "court", "metier", "accent", "site", "racine", "demo", "contenu", "modules", "photo", "fond", "marque")}
    scripts = "".join(f'<script src="{html.escape(x)}"></script>\n' for x in site.get("scripts", []))
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<title>{html.escape(site["court"])}</title>
<meta name="robots" content="noindex">
<meta name="theme-color" content="#FFFFFF">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="{html.escape(site["court"])}">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icone-192.png">
<link rel="apple-touch-icon" href="icone-180.png">
<link rel="stylesheet" href="../app.css?v={version()}">
<style>:root{{--accent:{site["accent"]}}}</style>
</head>
<body>
<div class="ouverture" id="ouverture" aria-hidden="true"><div class="o-in"><svg width="76" height="76" viewBox="246 251 740 740"><path d="M262 901L624 341L695 456L407 901Z M725 504L970 901L828 901L653 613Z" fill="currentColor"/><circle cx="620" cy="818" r="55" fill="#B174B2"/></svg><span>{html.escape(site["court"])}</span></div></div>
<div id="appli"></div>
<script>window.SITE = {json.dumps(s, ensure_ascii=False)};</script>
{scripts}<script src="../sites.js?v={version()}"></script>
<script src="../app.js?v={version()}"></script>
</body>
</html>
"""


def manifeste(site):
    return json.dumps({
        "name": site["nom"], "short_name": site["court"], "lang": "fr", "start_url": "./", "scope": "./", "display": "standalone",
        "background_color": "#FFFFFF", "theme_color": "#FFFFFF",
        "icons": [{"src": f"icone-{t}.png", "sizes": f"{t}x{t}", "type": "image/png"} for t in (192, 512)] +
                 [{"src": "icone-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]
    }, ensure_ascii=False, indent=2)


def lanceur(sites):
    lignes = "".join(f"""<a class="ligne" href="{s["id"]}/"><img src="{s["id"]}/apercu.png" alt="" width="48" height="48"><span><b>{html.escape(s["nom"])}</b><small>{html.escape(s["metier_nom"])}{" · démo" if s.get("demo") else ""}</small></span><svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 1l6 6-6 6"/></svg></a>""" for s in sites)
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<title>Saitorapp</title>
<meta name="robots" content="noindex">
<meta name="theme-color" content="#FFFFFF">
<link rel="icon" href="symbole.svg" type="image/svg+xml">
<link rel="stylesheet" href="app.css?v={version()}">
</head>
<body class="lanceur">
<main class="page">
  <header class="grand-titre"><img src="symbole.svg" alt="" width="40" height="40"><h1>Saitorapp</h1><p>Une appli par site, faite pour son métier.</p></header>
  <p class="entete-groupe">Les applis des clients</p>
  <nav class="groupe">{lignes}</nav>
  <p class="pied-groupe">Chaque appli s'installe sur le téléphone du commerçant avec son nom et son logo. Nouvelle appli : <code>python3 outils/saitorapp.py ajoute …</code></p>
</main>
</body>
</html>
"""


def construire():
    sites = json.loads(LISTE.read_text(encoding="utf-8"))
    sys.path.insert(0, str(RACINE / "outils"))
    noms = {"boutique": "Boutique, créatrice", "institut": "Coiffure, institut, soins", "hebergement": "Gîte, chambres d'hôtes, hôtel",
            "restaurant": "Restaurant, café", "artisan": "Artisan, dépannage", "vitrine": "Site vitrine simple"}
    for s in sites:
        d = APP / s["id"]
        d.mkdir(exist_ok=True)
        (d / "index.html").write_text(page(s), encoding="utf-8")
        (d / "manifest.webmanifest").write_text(manifeste(s), encoding="utf-8")
        icones(s, d)
        icones_du_logo(s, d)
        s["metier_nom"] = noms.get(s["metier"], s["metier"])
        print("ok", f"saitorapp/{s['id']}/")
    (APP / "index.html").write_text(lanceur(sites), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("action", nargs="?", default="construire", choices=["construire", "ajoute", "metiers"])
    ap.add_argument("id", nargs="?")
    ap.add_argument("--nom"); ap.add_argument("--court"); ap.add_argument("--metier", choices=sorted(METIERS))
    ap.add_argument("--accent", default="#1D1F20"); ap.add_argument("--logo", default=""); ap.add_argument("--site", default="")
    ap.add_argument("--photo", default="", help="la grande photo du haut de l'appli, chemin vu depuis saitorapp/<id>/ (ex. ../../clients/<id>/images/vitrine.webp)")
    a = ap.parse_args()
    if a.action == "metiers":
        print("boutique : commandes, produits et stock\ninstitut : agenda, clientèle, prestations\nhebergement : séjours, chambres\nrestaurant : tables, carte (bientôt)\nartisan : demandes de devis (bientôt)\nvitrine : mon site seulement")
        return
    if a.action == "ajoute":
        if not (a.id and a.nom and a.metier):
            sys.exit("Il faut l'identifiant, --nom et --metier.")
        sites = json.loads(LISTE.read_text(encoding="utf-8"))
        sites = [s for s in sites if s["id"] != a.id] + [{"id": a.id, "nom": a.nom, "court": a.court or a.nom[:14], "metier": a.metier, "accent": a.accent,
                                                         "logo": a.logo, "site": a.site, "racine": a.site, "scripts": [], "demo": False, "contenu": {},
                                                         "photo": a.photo, "fond": "", "marque": ("../../" + a.logo) if a.logo else ""}]
        LISTE.write_text(json.dumps(sites, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    construire()


if __name__ == "__main__":
    main()
