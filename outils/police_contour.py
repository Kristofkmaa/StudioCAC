"""Enlève les chevauchements de contours d'une police, pour les lettres en contour seul (-webkit-text-stroke).

    pip install fonttools brotli skia-pathops
    python3 outils/police_contour.py polices/inter-tight-500-normal-latin.woff2 polices/inter-tight-500-contour-latin.woff2 500

Une police variable est d'abord figée à la graisse demandée."""
import sys
from fontTools.ttLib import TTFont
from fontTools.ttLib.removeOverlaps import removeOverlaps
from fontTools.varLib.instancer import instantiateVariableFont
src, dst, wght = sys.argv[1], sys.argv[2], int(sys.argv[3])
f = TTFont(src)
if "fvar" in f:
    print("axes :", [(a.axisTag, a.minValue, a.maxValue) for a in f["fvar"].axes])
    f = instantiateVariableFont(f, {"wght": wght})
removeOverlaps(f)
f.flavor = "woff2"
f.save(dst)
print("écrit", dst)
