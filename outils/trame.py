"""Transforme une photo en trame de points (« halftone ») aux couleurs d'une charte : des points de la couleur
de la trame, plus gros là où la photo est claire (ou sombre, avec --sombre), posés sur un dégradé de deux couleurs (de bas-gauche vers haut-droite).

    python3 outils/trame.py <photo> <sortie.webp> --largeur 1200 --pas 12 --fond1 "#524ae9" --fond2 "#fc5000" --point "#fc5000"
"""
import argparse
from PIL import Image, ImageDraw, ImageOps, ImageFilter

def hexa(c): c = c.lstrip("#"); return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))

def trame(src, dst, largeur, pas, fond1, fond2, point, contraste, hauteur=None, sombre=False):
    im = Image.open(src).convert("L")
    if hauteur:
        im = ImageOps.fit(im, (largeur, hauteur), Image.LANCZOS)
    else:
        im = im.resize((largeur, round(im.height * largeur / im.width)), Image.LANCZOS)
    if sombre: im = ImageOps.invert(im)            # les parties sombres de la photo deviennent les gros points
    im = ImageOps.autocontrast(im, cutoff=2).filter(ImageFilter.GaussianBlur(pas / 4))
    W, H = im.size
    # le fond : dégradé de fond1 (bas-gauche) vers fond2 (haut-droite)
    a, b = hexa(fond1), hexa(fond2)
    gw, gh = max(2, W // 8), max(2, H // 8)
    grad = Image.new("L", (gw, gh))
    grad.putdata([round(255 * (((x / (gw - 1)) + (1 - y / (gh - 1))) / 2) ** 3) for y in range(gh) for x in range(gw)])   # l'orange ne gagne que le coin haut-droit
    grad = grad.resize((W, H), Image.BILINEAR)
    fond = Image.composite(Image.new("RGB", (W, H), b), Image.new("RGB", (W, H), a), grad)
    sc = 4                                         # dessin 4 fois plus grand puis réduit : points bien ronds
    big = fond.resize((W * sc, H * sc))
    d = ImageDraw.Draw(big)
    c = hexa(point)
    for y in range(pas // 2, H, pas):
        for x in range(pas // 2, W, pas):
            v = (im.getpixel((min(x, W - 1), min(y, H - 1))) / 255) ** contraste
            r = v * pas * .62
            if r < .35: continue
            d.ellipse([(x - r) * sc, (y - r) * sc, (x + r) * sc, (y + r) * sc], fill=c)
    big.resize((W, H), Image.LANCZOS).save(dst, quality=82, method=6)

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("src"); p.add_argument("dst")
    p.add_argument("--largeur", type=int, default=1200); p.add_argument("--hauteur", type=int)
    p.add_argument("--pas", type=int, default=12)
    p.add_argument("--fond1", default="#524ae9"); p.add_argument("--fond2", default="#fc5000"); p.add_argument("--point", default="#fc5000")
    p.add_argument("--contraste", type=float, default=1.1)
    p.add_argument("--sombre", action="store_true", help="dessine les parties sombres de la photo (sujet foncé sur fond clair)")
    a = p.parse_args()
    trame(a.src, a.dst, a.largeur, a.pas, a.fond1, a.fond2, a.point, a.contraste, a.hauteur, a.sombre)
