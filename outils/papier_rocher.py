"""Fabrique une texture « papier rocher » (le papier froissé des crèches, la paroi d'une grotte) qui se répète sans couture.

Le relief est un bruit fractal « à arêtes » (des plis nets comme du papier froissé), calculé de façon périodique,
puis éclairé en lumière rasante. La sortie est une image à transparence : de la lumière blanche et de l'ombre noire
très légères, à poser par-dessus n'importe quel fond sombre.

    python3 outils/papier_rocher.py sortie.webp [--taille 768] [--graine 7] [--force 1.0] [--fond "#161411"]
"""
import argparse

import numpy as np
from PIL import Image


def bruit_periodique(n, frequence, rng):
    """Bruit lisse et périodique : un spectre aléatoire limité autour d'une fréquence, revenu dans l'espace."""
    fx = np.fft.fftfreq(n) * n
    r = np.hypot(*np.meshgrid(fx, fx))
    filtre = np.exp(-((r - frequence) ** 2) / (2 * (frequence * 0.45) ** 2))
    spectre = (rng.normal(size=(n, n)) + 1j * rng.normal(size=(n, n))) * filtre
    b = np.real(np.fft.ifft2(spectre))
    return b / (np.abs(b).max() + 1e-9)


def relief(n, rng):
    """Somme d'octaves « à arêtes » (1 - |bruit|) : des plis nets, de grandes bosses et un grain fin."""
    h = np.zeros((n, n))
    poids = 1.0
    for frequence in (2, 4, 8, 16, 32, 64):
        h += poids * (1 - np.abs(bruit_periodique(n, frequence, rng))) ** 2
        poids *= 0.55
    return (h - h.min()) / (h.max() - h.min())


def eclaire(h, hauteur=7.0):
    """Lumière rasante venant d'en haut à gauche ; les dérivées sont prises en boucle pour garder la tuile sans couture."""
    dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * hauteur
    dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * hauteur
    normale = np.stack([-dx, -dy, np.ones_like(h)])
    normale /= np.linalg.norm(normale, axis=0)
    lumiere = np.array([-0.55, -0.6, 0.58])
    lumiere /= np.linalg.norm(lumiere)
    return np.tensordot(lumiere, normale, axes=1)


def main():
    a = argparse.ArgumentParser()
    a.add_argument("sortie")
    a.add_argument("--taille", type=int, default=768)
    a.add_argument("--graine", type=int, default=7)
    a.add_argument("--force", type=float, default=1.0)
    a.add_argument("--fond", help="couleur du fond (#161411) : image pleine, bien plus légère qu'avec la transparence")
    o = a.parse_args()
    rng = np.random.default_rng(o.graine)
    h = relief(o.taille, rng)
    e = eclaire(h)
    e = e - np.median(e)                      # autour de zéro : au-dessus, de la lumière ; en dessous, de l'ombre
    e /= np.percentile(np.abs(e), 99)
    e = np.clip(e, -1, 1)
    creux = (1 - h) ** 2                      # les creux un peu plus sombres, comme le fond d'une paroi
    lum = np.clip(e, 0, 1) * 0.10 * o.force
    omb = np.clip(-e, 0, 1) * 0.30 * o.force + creux * 0.16 * o.force
    rgba = np.zeros((o.taille, o.taille, 4), dtype=np.uint8)
    blanc = lum > omb
    rgba[..., :3] = np.where(blanc[..., None], 255, 0)
    rgba[..., 3] = np.clip(np.where(blanc, lum - omb, omb - lum) * 255, 0, 255).astype(np.uint8)
    img = Image.fromarray(rgba, "RGBA")
    if o.fond:
        f = o.fond.lstrip("#")
        fond = Image.new("RGBA", img.size, tuple(int(f[i:i + 2], 16) for i in (0, 2, 4)) + (255,))
        img = Image.alpha_composite(fond, img).convert("RGB")
    img.save(o.sortie, quality=80, method=6)
    print(o.sortie)


if __name__ == "__main__":
    main()
