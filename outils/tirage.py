"""Tire le style d'un nouveau site pour qu'il ne ressemble pas aux précédents.

    python3 outils/tirage.py vitrier-prince                       # tire une composition, écrit la fiche
    python3 outils/tirage.py vitrier-prince --comme libecciu      # reprend tout le style d'un autre site
    python3 outils/tirage.py vitrier-prince --comme libecciu --garder ouverture,rythme   # seulement ces familles
    python3 outils/tirage.py vitrier-prince --imposer signature=estimateur,formes=organiques
    python3 outils/tirage.py vitrier-prince --exclure preuves=citations   # écarter un choix (ex. pas encore de vrais avis)
    python3 outils/tirage.py vitrier-prince --refaire              # refaire un site : s'éloigner aussi de sa version précédente
    python3 outils/tirage.py vitrier-prince --charte Élégante      # tire aussi la paire de polices pour ce style de charte
    python3 outils/tirage.py vitrier-prince --enregistrer         # note le dernier tirage dans le registre

Pour chaque famille du catalogue (ouverture, navigation, services…), on garde les options les moins
utilisées par les sites du registre, puis on en tire une au hasard. Le genre passe en premier : il décide
de la grille, des tailles, des espacements et du ton, et toutes les autres familles s'y plient.
Les couleurs et le logo viennent de la charte du client ; avec --charte <style>, la paire de polices est
tirée parmi celles qui vont avec ce style (outils/styles/polices.json), en évitant celles déjà vues.
La fiche est écrite dans clients/<nom>/style.md (ou à l'endroit donné par --fiche).
"""
import json, pathlib, random, sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
DOSSIER = RACINE / "outils" / "styles"
CATALOGUE = json.loads((DOSSIER / "catalogue.json").read_text())
# la famille « genre » vient de la base des thèmes (themes.json, à la racine) : elle passe en premier
THEMES = json.loads((RACINE / "themes.json").read_text())["themes"]
CATALOGUE = {"genre": [[t["id"], t["nom"], t["recette"]] for t in THEMES], "_genre": {t["id"]: t["va_avec"] for t in THEMES}, **CATALOGUE}
REGISTRE_F = DOSSIER / "registre.json"
POLICES = json.loads((DOSSIER / "polices.json").read_text())
FAMILLES = [k for k in CATALOGUE if not k.startswith("_")]
NOMS = {"genre": "Genre (il décide de tout le reste)", "ouverture": "Ouverture", "navigation": "Navigation", "services": "Services", "preuves": "Réalisations", "a_propos": "À propos",
        "contact": "Contact", "formes": "Formes", "photos": "Photos", "rythme": "Rythme des couleurs", "titres": "Titres",
        "appoint": "Police d'appoint", "texture": "Texture", "arrivee": "Arrivée des éléments", "decoupes": "Passage entre les sections",
        "boutons": "Boutons", "pied": "Pied de page", "ornement": "Ornement", "signature": "L'idée originale"}

def options(f):
    return {o[0]: o for o in CATALOGUE[f]}

def arg(nom):
    a = sys.argv
    return a[a.index(nom) + 1] if nom in a and a.index(nom) + 1 < len(a) else None

def main():
    if len(sys.argv) < 2 or sys.argv[1].startswith("--"):
        sys.exit(__doc__)
    site = sys.argv[1]
    registre = json.loads(REGISTRE_F.read_text())
    sites = registre["sites"]
    fiche = pathlib.Path(arg("--fiche") or RACINE / "clients" / site / "style.md")
    dernier = fiche.with_suffix(".json")

    if "--enregistrer" in sys.argv:
        if not dernier.exists():
            sys.exit(f"Pas de tirage pour {site} : lancez d'abord le tirage.")
        sites[site] = json.loads(dernier.read_text())
        REGISTRE_F.write_text(json.dumps(registre, ensure_ascii=False, indent=2) + "\n")
        print(f"{site} ajouté au registre ({len(sites)} sites).")
        return

    # --refaire : la nouvelle version doit aussi s'éloigner de l'ancienne (elle compte deux fois)
    autres = {k: v for k, v in sites.items() if k != site}
    if "--refaire" in sys.argv and site in sites:
        autres[site + " (ancienne version)"] = sites[site]
        autres[site + " (ancienne version, bis)"] = sites[site]
    choix = {}
    # reprendre le style d'un site existant (« comme tel site »)
    modele = arg("--comme")
    if modele:
        if modele not in sites:
            sys.exit(f"{modele} n'est pas dans le registre. Sites connus : {', '.join(sites)}")
        garder = (arg("--garder") or ",".join(FAMILLES)).split(",")
        choix.update({f: sites[modele][f] for f in garder if f in sites[modele] and sites[modele][f] in options(f)})
    # imposer certains choix
    for paire in filter(None, (arg("--imposer") or "").split(",")):
        f, v = paire.split("=")
        if f not in FAMILLES or v not in options(f):
            sys.exit(f"Choix inconnu : {paire}")
        choix[f] = v
    permis = CATALOGUE.get("_genre", {}).get(choix.get("genre"), {})
    for f, v in choix.items():
        if f in permis and v not in permis[f]:
            print(f"Remarque : {f}={v} ne va pas d'habitude avec le genre {choix['genre']}.")
    # écarter des choix impossibles pour ce client (pas d'avis réels, pas de photos de la personne…)
    exclus = {tuple(p.split("=")) for p in filter(None, (arg("--exclure") or "").split(","))}
    # tirer le reste : parmi les options les moins utilisées
    hasard = random.Random(arg("--graine") or site)
    for f in FAMILLES:  # le genre est la première famille : il est tiré avant les autres
        if f in choix:
            continue
        # le genre limite les autres familles à ce qui va avec lui (themes.json, champ « va_avec »)
        permis = CATALOGUE.get("_genre", {}).get(choix.get("genre"), {}).get(f)
        compte = {o: 0 for o in options(f) if (f, o) not in exclus and (not permis or o in permis)}
        for v in autres.values():
            if v.get(f) in compte:
                compte[v[f]] += 1
        moins = min(compte.values())
        choix[f] = hasard.choice(sorted(o for o, n in compte.items() if n == moins))

    # la paire de polices, selon le style de titres choisi dans la charte
    style = arg("--charte")
    if style:
        if style not in POLICES:
            sys.exit(f"Style de charte inconnu : {style}. Styles : {', '.join(k for k in POLICES if not k.startswith('_'))}")
        vues = [v.get("police") for v in autres.values()]
        paires = [" + ".join(p) for p in POLICES[style]]
        moins = min(vues.count(p) for p in paires)
        choix["police"] = hasard.choice([p for p in paires if vues.count(p) == moins])

    lignes = [f"# Fiche de style : {site}", "",
              "Tirée par `outils/tirage.py` pour que ce site ne ressemble pas aux précédents.",
              "Les couleurs, les polices et le logo viennent de la charte du client ; cette fiche décide de la composition.",
              "Règles communes à tous les sites : page aérée, deux polices de charte (plus la police d'appoint si tirée), photos d'un même ton, une seule idée originale, lisible sur téléphone.",
              "Le code de chaque option est dans outils/styles/recettes.md.", ""]
    ordre = [f for f in NOMS if f in FAMILLES] + [f for f in FAMILLES if f not in NOMS]
    for f in ordre:
        _, nom, desc = options(f)[choix[f]]
        lignes += [f"## {NOMS.get(f, f)} : {nom}", desc, ""]
    if "police" in choix:
        titre, texte = choix["police"].split(" + ")
        libres = POLICES.get("_libres", {})
        google = [p for p in dict.fromkeys((titre, texte)) if p not in libres]
        codes = [libres[p] for p in dict.fromkeys((titre, texte)) if p in libres]
        comment = ([f"Lien Google Fonts pour {', '.join(google)}, puis python3 outils/polices.py."] if google else []) + \
                  ([f"Fonderie indépendante : python3 outils/polices.py libre {' '.join(codes)} (lien affiché à mettre dans la page)."] if codes else [])
        lignes += [f"## Polices : {choix['police']}", f"Titres en {titre}, texte en {texte} (style « {style} » de la charte). " + " ".join(comment), ""]
    lignes += ["## Avant de livrer", "Mettre le premier écran à côté de ceux des autres sites (media/apercus et clients/*) : s'il ressemble à l'un d'eux, changer ce qui fait la ressemblance.", ""]
    deja = [s for s, v in autres.items() if sum(v.get(f) == choix[f] for f in FAMILLES) >= 4]
    if deja and not modele:
        lignes += [f"Attention : proche de {', '.join(deja)} sur au moins quatre familles.", ""]
    fiche.parent.mkdir(parents=True, exist_ok=True)
    fiche.write_text("\n".join(lignes))
    dernier.write_text(json.dumps(choix, ensure_ascii=False, indent=2) + "\n")
    print("\n".join(lignes))
    print(f"(fiche écrite dans {fiche.relative_to(RACINE) if fiche.is_relative_to(RACINE) else fiche} ; une fois le site fait : python3 outils/tirage.py {site} --enregistrer)")

if __name__ == "__main__":
    main()
