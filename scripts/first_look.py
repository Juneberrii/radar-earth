import glob, h5py, numpy as np, matplotlib.pyplot as plt

# Finds the newest GUNW .h5 file in data/raw automatically
path = sorted(glob.glob("data/raw/*GUNW*.h5"))[-1]
print("Opening:", path)

found = {}
with h5py.File(path, "r") as f:
    def look(name, obj):
        if isinstance(obj, h5py.Dataset) and name.endswith("unwrappedPhase") and "unwrappedPhase" not in found:
            found["unwrappedPhase"] = name
    f.visititems(look)
    print("Movement layer:", found.get("unwrappedPhase"))
    phase = f[found["unwrappedPhase"]][::4, ::4].astype("float32")

phase[phase == 0] = np.nan                         # treat 0 as "no data"
wavelength_m = 0.2384                              # NISAR L-band
move_cm = phase * wavelength_m / (4 * np.pi) * 100 # phase -> centimeters
move_cm -= np.nanmedian(move_cm)                   # make the scene's typical pixel = 0

fig, ax = plt.subplots(1, 2, figsize=(14, 7))
ax[0].imshow(np.mod(move_cm, wavelength_m / 2 * 100), cmap="hsv")
ax[0].set_title("Rainbow fringes (one cycle = about 12 cm)")
lim = np.nanpercentile(np.abs(move_cm), 98)
im = ax[1].imshow(move_cm, cmap="RdBu_r", vmin=-lim, vmax=lim)
ax[1].set_title("Movement toward/away from satellite (cm)")
fig.colorbar(im, ax=ax[1], label="cm")
plt.tight_layout()
plt.savefig("data/processed/tokyo_first_look.png", dpi=150)
plt.show()
