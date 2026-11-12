#!/usr/bin/env python3
"""Fabrique la bande-son de la vidéo de présentation de Saitora, entièrement en synthèse (aucun son pris ailleurs),
puis la pose sur le film.   python3 outils/video-son.py      (numpy, scipy et ffmpeg requis)

Entrée : media/saitora-presentation.mp4 (le film muet sorti de outils/video.js).
Sortie : le même fichier, avec le son (l'image n'est pas réencodée ; relancer le script remplace l'ancien son).
Les instants ci-dessous suivent media/video-saitora/composition.html : si le montage change, les revoir.
Les sons : une nappe très douce sur toute la durée, des souffles pour ce qui bouge, des notes claires pour ce qui naît,
les touches du clavier pendant qu'on code, un carillon quand le site est en ligne."""
import pathlib, subprocess, wave
import numpy as np
from scipy.signal import butter, sosfilt

RACINE = pathlib.Path(__file__).resolve().parent.parent
FILM = RACINE / "media" / "saitora-presentation.mp4"
F, DUREE = 44100, 38.0
N = int(F * DUREE)
piste = np.zeros((N, 2))
alea = np.random.default_rng(7)

def pose(son, t, vol=1.0, cote=0.0):
    """Ajoute un son à l'instant t (secondes). cote : -1 à gauche, 1 à droite."""
    i = int(t * F); j = min(N, i + len(son))
    if i >= N or j <= i: return
    g, d = np.cos((cote + 1) * np.pi / 4), np.sin((cote + 1) * np.pi / 4)
    piste[i:j, 0] += son[:j - i] * vol * g * 1.414; piste[i:j, 1] += son[:j - i] * vol * d * 1.414

def env(n, attaque=.01, chute=.2):
    t = np.arange(n) / F; return np.minimum(1, t / max(attaque, 1e-4)) * np.exp(-np.maximum(0, t - attaque) / chute)

def filtre(x, bas=None, haut=None):
    if bas and haut: s = butter(2, [bas, haut], btype="band", fs=F, output="sos")
    elif haut: s = butter(2, haut, btype="low", fs=F, output="sos")
    else: s = butter(2, bas, btype="high", fs=F, output="sos")
    return sosfilt(s, x)

def souffle(duree, f0, f1, creux=.5):
    """Un souffle : du bruit dont la couleur glisse de f0 à f1, qui enfle puis retombe."""
    n = int(duree * F); b = alea.standard_normal(n); out = np.zeros(n); blocs = 24
    for k in range(blocs):
        a, z = k * n // blocs, (k + 1) * n // blocs; fc = f0 * (f1 / f0) ** (k / (blocs - 1))
        seg = filtre(np.pad(b[a:z], 200), fc * .6, min(fc * 1.7, F / 2 - 500))[200:-200]; out[a:z] = seg
    t = np.linspace(0, 1, n); forme = np.sin(np.pi * t ** creux) ** 2
    return out * forme * .5

def note(freq, duree=.9, chute=.28, brillance=.35):
    """Une note claire, comme une petite cloche de verre."""
    n = int(duree * F); t = np.arange(n) / F
    x = np.sin(2 * np.pi * freq * t) + brillance * np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-t / .08) + .18 * np.sin(2 * np.pi * freq * 3.02 * t) * np.exp(-t / .05)
    return x * env(n, .004, chute) * .32

def touche():
    """Une touche de clavier : un petit choc sec, jamais deux fois le même."""
    n = int(.045 * F); x = filtre(alea.standard_normal(n), 1400 + alea.uniform(0, 900), 5200 + alea.uniform(0, 1500))
    return x * env(n, .0008, .008 + alea.uniform(0, .004)) * .5

def choc(freq=70, duree=.5):
    """Un coup sourd et court, pour ce qui se pose."""
    n = int(duree * F); t = np.arange(n) / F
    return np.sin(2 * np.pi * (freq * (1 + 1.4 * np.exp(-t / .03))) * t) * env(n, .002, .12) * .6

def clic():
    n = int(.03 * F); return filtre(alea.standard_normal(n), 2500, 7000) * env(n, .0005, .004) * .7

def nappe():
    """Une nappe tenue, très basse dans le mixage : un accord qui respire, plus clair quand l'écran s'éclaire."""
    t = np.arange(N) / F; out = np.zeros(N)
    for f, v, lent in [(73.42, .5, .07), (110, .42, .09), (146.83, .34, .11), (220, .2, .13), (277.18, .12, .17), (329.63, .1, .19)]:
        out += v * np.sin(2 * np.pi * f * t + 1.3 * np.sin(2 * np.pi * lent * t)) * (.75 + .25 * np.sin(2 * np.pi * lent * .6 * t + f))
    out = filtre(out, haut=900)
    forme = np.minimum(1, t / 2.5) * np.minimum(1, (DUREE - t) / 2.2)
    return out * forme * .05

DO = 261.63
gamme = [DO * 2 ** (k / 12) for k in (2, 5, 9, 12, 14, 17, 21, 24)]   # ré, fa, la, do, ré… : les notes qui vont avec la nappe

# ——— la nappe
n = nappe(); piste[:, 0] += n; piste[:, 1] += n

# ——— 1. la nuit : le point naît, les deux lignes montent, le point grandit jusqu'à devenir l'écran
pose(note(gamme[2] * 2, .8, .22), .28, .55)
pose(souffle(.6, 900, 2600), .68, .16, -.2); pose(souffle(.6, 900, 2600), 1.03, .16, .2)
pose(souffle(1.25, 220, 3800, .8), 2.25, .5); pose(note(gamme[0], 2.2, .9, .2), 3.1, .5)
# ——— 2. le jour : deux lignes, puis le volet sombre
pose(souffle(.55, 1200, 3000), 3.2, .15, -.3); pose(souffle(.55, 1200, 3000), 3.42, .15, .3)
pose(souffle(1.2, 2400, 240, .6), 5.5, .42)
# ——— 3. les métiers : les rangs filent, la bande claire s'ouvre et se referme
pose(souffle(1.1, 500, 1800), 6.25, .2, -.5); pose(souffle(1.1, 500, 1800), 6.4, .2, .5)
pose(souffle(.5, 1500, 4200), 7.88, .28); pose(note(gamme[3], .9, .3), 8.12, .42)
pose(souffle(.8, 3000, 500), 9.5, .3)
# ——— 4. la galerie : elle s'allume, trois sites arrivent, un reflet passe, on les dépasse
pose(souffle(1.5, 300, 5200, .9), 10.1, .34)
for k, f in enumerate(gamme[:6]): pose(note(f * 2, .7, .2, .2), 10.25 + k * .17, .16, -.6 + k * .24)
for t0, cote, f in [(10.9, -.7, gamme[1]), (11.2, .7, gamme[2]), (11.75, 0, gamme[4])]:
    pose(souffle(1.2, 320, 2200, .7), t0, .3, cote); pose(note(f, 1.1, .35), t0 + 1.25, .4, cote)
pose(souffle(.9, 3500, 7500), 13.05, .2); pose(souffle(.6, 1200, 3200), 12.7, .14)
pose(souffle(.9, 600, 4200, 1.4), 14.2, .4)
# ——— 4 bis. la fenêtre : elle se construit, puis change de peau deux fois
D = 4.9
pose(souffle(.9, 400, 2000), 10.2 + D, .26)
for k, t0 in enumerate([10.5, 10.75, 10.95, 11.2]): pose(note(gamme[k + 1], .5, .14), t0 + D, .26, -.3)
pose(souffle(.55, 1200, 3000), 10.5 + D, .13, .4)
for t0, f in [(11.9, gamme[3]), (13.1, gamme[5])]: pose(souffle(.6, 700, 3600), t0 + D - .05, .32); pose(note(f, .9, .3), t0 + D + .3, .36)
pose(souffle(.7, 2600, 500), 14.25 + D, .3)
# ——— 5. le grand moment : on code, chaque ligne envoie une étincelle ; on publie ; le site prend l'écran, défile ; clic ; téléphone
LIGNES = [(15.7, .42, 27), (16.3, .5, 36), (16.95, .42, 24), (17.55, .45, 32), (18.15, .42, 21), (18.75, .4, 24), (19.4, .5, 24)]
pose(souffle(.9, 400, 1900), 14.9 + D, .26, -.4); pose(souffle(.9, 400, 1900), 15.05 + D, .26, .4)
for k, (d, duree, lettres) in enumerate(LIGNES):
    for c in range(lettres):
        pose(touche(), d + D + duree * c / lettres + alea.uniform(-.004, .004), .34 + alea.uniform(0, .1), -.45)
    fin = d + duree + D
    pose(souffle(.36, 1800, 6500, .7), fin - .04, .22, 0)                     # l'étincelle traverse
    pose(note(gamme[k % 7 + 1] * 2, .8, .24, .5), fin + .3, .44, .45)          # elle touche : le morceau du site naît
pose(souffle(.6, 1200, 3000), 16.1 + D, .12)
fin = 19.4 + .5 + .3 + D                                                       # « publier » : le site est en ligne
for k, f in enumerate([gamme[1], gamme[3], gamme[5], gamme[7]]): pose(note(f * 2, 1.4, .5, .3), fin + .12 + k * .09, .3, .3)
pose(souffle(1.3, 260, 3200, .8), 20 + D, .46); pose(choc(62), 21.05 + D, .5)
pose(souffle(2.6, 500, 900, .5), 21 + D, .12)                                  # le site défile
pose(souffle(.6, 900, 2200), 22.9 + D, .12, .5); pose(clic(), 23.75 + D, .6, -.2); pose(note(gamme[4] * 2, .5, .12), 23.8 + D, .3, -.2)
pose(souffle(1.0, 2600, 600), 24 + D, .3, -.4); pose(souffle(1.0, 350, 2200, .7), 24.35 + D, .32, .7); pose(choc(80, .4), 25.25 + D, .3, .6)
pose(souffle(.55, 1200, 3000), 24.7 + D, .13); pose(souffle(.8, 2400, 400), 26.05 + D, .34)
# ——— 6. jour et nuit : le disque s'ouvre, tourne, se referme
U = 12.0
pose(souffle(1.1, 300, 2600, .8), 19.3 + U, .36); pose(note(gamme[0], 2.6, 1.1, .15), 19.5 + U, .42)
pose(souffle(.55, 1200, 3000), 19.6 + U, .13, -.3); pose(souffle(.55, 1200, 3000), 19.8 + U, .13, .3)
pose(souffle(2.2, 420, 700, .5), 19.9 + U, .1); pose(souffle(.7, 2600, 500), 21.95 + U, .32)
# ——— 7. le logo : les deux formes s'assemblent, le point tombe, le nom arrive, un trait de lumière, le bouton
pose(souffle(.8, 500, 3000, .7), 22.5 + U, .3, -.7); pose(souffle(.8, 500, 3000, .7), 22.65 + U, .3, .7)
pose(choc(58, .7), 23.28 + U, .7); pose(note(gamme[2] * 2, 1.4, .5), 23.3 + U, .5)
pose(souffle(.8, 700, 2600), 23.3 + U, .24)
pose(souffle(1.0, 3000, 8000), 23.75 + U, .16)
for k, f in enumerate([gamme[0], gamme[2], gamme[4], gamme[7]]): pose(note(f, 2.6, 1.0, .2), 24.0 + U + k * .07, .34, -.3 + k * .2)

# ——— le mixage : un écho léger, puis on borne le volume
def echo(x, retard=.11, gain=.22, passes=3):
    y = x.copy()
    for k in range(1, passes + 1):
        d = int(retard * k * F); y[d:] += x[:-d] * gain ** k
    return y
piste = np.stack([echo(piste[:, 0], .113), echo(piste[:, 1], .127)], axis=1)
pic = np.max(np.abs(piste)); piste = np.tanh(piste / pic * 1.25) * .82
wav = RACINE / "media" / "video-saitora" / "bande-son.wav"
with wave.open(str(wav), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(F); w.writeframes((piste * 32767).astype("<i2").tobytes())

tmp = FILM.with_suffix(".tmp.mp4")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(FILM), "-i", str(wav), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", str(tmp)], check=True)
tmp.replace(FILM)
wav.unlink()
print("son posé :", FILM.name, round(FILM.stat().st_size / 1024), "Ko, pic", round(float(pic), 2))
