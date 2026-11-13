"""
Prepares every image for the Radar Earth website.
Run from the dancing-with-the-stars folder:

    python scripts/prepare_images.py

Reads:  data/browse/<site>_before.png / <site>_after.png   (NISAR GCOV Lat/Lon browse images)
        data/raw/*GUNW*.h5                                  (NISAR GUNW interferograms)
Writes: website/images/<site>_before.png / _after.png       (cropped to the area of interest)
        website/images/<site>_fringes_raw.png, _fringes_clean.png, _cm.png
        website/js/stats.js                                 (numbers shown on the pages)
"""
import glob
import json
import os

import numpy as np
from PIL import Image
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import h5py

BROWSE = "data/browse"
OUT = "website/images"
os.makedirs(OUT, exist_ok=True)

# Footprint bounding box of each scene (lon_min, lon_max, lat_min, lat_max), from the ASF catalog,
# plus the point of interest and how far around it to crop (km).
GCOV_SITES = {
    "utah":        dict(bbox=(-113.8222, -110.10634, 37.18064, 40.00424), lat=38.73, lon=-112.50, km=55),
    "plaskett":    dict(bbox=(-122.85297, -119.34462, 35.31001, 38.03949), lat=35.93, lon=-121.40, km=24),
    "guadalajara": dict(bbox=(-4.85601, -1.06428, 38.97583, 41.95413), lat=41.10, lon=-3.15, km=32),
    "haor":        dict(bbox=(89.70044, 92.80586, 23.50556, 26.18928), lat=24.77, lon=91.41, km=76),
    "tonlesap":    dict(bbox=(102.62722, 105.39936, 11.53813, 14.15457), lat=12.95, lon=104.00, km=80),
    "niger":       dict(bbox=(-6.09996, -3.31715, 13.49909, 16.17417), lat=14.85, lon=-4.40, km=75),
}
WATER = {"haor", "tonlesap", "niger"}

# GUNW interferograms: which file belongs to which site, and whether to remove the smooth trend
GUNW_SITES = {
    "tokyo":  dict(pattern="*GUNW_*_046_D_070_*.h5", clean=True),
    "flores": dict(pattern="*GUNW_*_003_D_093_*.h5", clean=False),
}

stats = {}


def crop_box(img, site):
    """Find the image area that contains data and map lat/lon into pixels."""
    a = np.asarray(img.convert("L"))
    mask = a > 8
    ys, xs = np.where(mask.any(1))[0], np.where(mask.any(0))[0]
    x0, x1, y0, y1 = xs[0], xs[-1], ys[0], ys[-1]
    lo0, lo1, la0, la1 = site["bbox"]
    px = x0 + (site["lon"] - lo0) / (lo1 - lo0) * (x1 - x0)
    py = y0 + (la1 - site["lat"]) / (la1 - la0) * (y1 - y0)
    px_per_km = (y1 - y0) / ((la1 - la0) * 110.57)
    r = int(site["km"] * px_per_km)
    w, h = img.size
    r = min(r, int(px), int(py), w - int(px), h - int(py))  # stay inside the image
    return int(px - r), int(py - r), int(px + r), int(py + r)


def water_percent(img):
    a = np.asarray(img.convert("RGB")).astype(float)
    lum = a.mean(2)
    valid = a.sum(2) > 15
    return round(100 * ((lum < 35) & valid).sum() / max(valid.sum(), 1), 1)


print("Before/after images")
for sid, site in GCOV_SITES.items():
    paths = [os.path.join(BROWSE, f"{sid}_{w}.png") for w in ("before", "after")]
    if not all(os.path.exists(p) for p in paths):
        print(f"  ! {sid}: missing", [p for p in paths if not os.path.exists(p)])
        continue
    imgs = [Image.open(p).convert("RGB") for p in paths]
    box = crop_box(imgs[0], site)
    crops = [im.crop(box) for im in imgs]
    for w, c in zip(("before", "after"), crops):
        c.save(os.path.join(OUT, f"{sid}_{w}.png"))
    msg = f"  {sid}: cropped {box}"
    if sid in WATER:
        stats[sid] = {"water_before": water_percent(crops[0]), "water_after": water_percent(crops[1])}
        msg += f"  open water {stats[sid]['water_before']}% -> {stats[sid]['water_after']}%"
    print(msg)


print("Interferograms")
WAVELENGTH_CM = 23.84
CYCLE = WAVELENGTH_CM / 2


def save_rgba(arr, cmap, name, vmin=None, vmax=None):
    if vmin is None:
        norm = np.mod(arr, CYCLE) / CYCLE
    else:
        norm = (np.clip(arr, vmin, vmax) - vmin) / (vmax - vmin)
    rgba = plt.get_cmap(cmap)(np.nan_to_num(norm))
    rgba[~np.isfinite(arr), 3] = 0
    plt.imsave(os.path.join(OUT, name), rgba)


for sid, cfg in GUNW_SITES.items():
    files = sorted(glob.glob(os.path.join("data/raw", cfg["pattern"])))
    if not files:
        print(f"  ! {sid}: no file matching data/raw/{cfg['pattern']}")
        continue
    if os.path.getsize(files[-1]) < 1_000_000:
        print(f"  ! {sid}: file is too small - the download did not finish. Run: bash scripts/get_data.sh")
        continue
    found = {}
    with h5py.File(files[-1], "r") as f:
        def look(name, obj):
            if isinstance(obj, h5py.Dataset) and name.endswith("unwrappedPhase") and "p" not in found:
                found["p"] = name
        f.visititems(look)
        phase = f[found["p"]][::4, ::4].astype("float64")
        cname = found["p"].replace("unwrappedPhase", "coherenceMagnitude")
        coh = f[cname][::4, ::4] if cname in f else None
    phase[phase == 0] = np.nan
    if coh is not None and coh.shape == phase.shape:
        phase[coh < 0.35] = np.nan
        print(f"  {sid}: hiding {100 * np.mean(coh < 0.35):.0f}% of pixels with low coherence (water, dense forest)")
    move = phase * WAVELENGTH_CM / (4 * np.pi)
    move -= np.nanmedian(move)
    save_rgba(move, "hsv", f"{sid}_fringes_raw.png")
    p2, p98 = np.nanpercentile(move, [2, 98])
    st = {"range_cm": round(float(p98 - p2))}

    shown = move
    if cfg["clean"]:
        ny, nx = move.shape
        yy, xx = np.mgrid[0:ny, 0:nx]
        ok = np.isfinite(move)
        X, Y = xx / nx, yy / ny
        terms = [np.ones_like(X), X, Y, X * Y, X ** 2, Y ** 2]
        A = np.stack([t[ok] for t in terms], axis=1)
        coef, *_ = np.linalg.lstsq(A, move[ok], rcond=None)
        shown = move - sum(c * t for c, t in zip(coef, terms))
        save_rgba(shown, "hsv", f"{sid}_fringes_clean.png")
        st["clean_cm"] = round(float(np.nanpercentile(np.abs(shown), 98)), 1)

    lim = float(np.nanpercentile(np.abs(shown), 98))
    save_rgba(shown, "RdBu_r", f"{sid}_cm.png", -lim, lim)
    st["cm_limit"] = round(lim, 1)
    stats[sid] = st
    print(f"  {sid}: {st}")

with open("website/js/stats.js", "w") as fh:
    fh.write("// Written by scripts/prepare_images.py\nwindow.STATS = " + json.dumps(stats, indent=1) + ";\n")
print("Done! Open website/index.html in your browser.")
