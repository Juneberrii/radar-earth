#!/bin/bash
# Downloads all NISAR images Radar Earth needs. Run from the dancing-with-the-stars folder:
#     bash scripts/get_data.sh
# Needs your Earthdata login in ~/.netrc (you set this up earlier).
cd "$(dirname "$0")/.." || exit 1
mkdir -p data/browse data/raw

# 1. Move the images you already have into data/browse (only if not done yet)
[ -f website/images/fire_before.png ]  && [ ! -f data/browse/utah_before.png ] && mv website/images/fire_before.png  data/browse/utah_before.png
[ -f website/images/fire_after.png ]   && [ ! -f data/browse/utah_after.png ]  && mv website/images/fire_after.png   data/browse/utah_after.png
[ -f website/images/water_before.png ] && [ ! -f data/browse/haor_before.png ] && mv website/images/water_before.png data/browse/haor_before.png
[ -f website/images/water_after.png ]  && [ ! -f data/browse/haor_after.png ]  && mv website/images/water_after.png  data/browse/haor_after.png

# 2. Download the browse images for the new places (skips files you already have)
B=https://nisar.asf.earthdatacloud.nasa.gov/BROWSE/NISAR_L2_GCOV_PROVISIONAL_V1
get() {
  if [ -s "data/browse/$1" ] && file "data/browse/$1" | grep -q PNG; then echo "have $1"; return; fi
  echo "downloading $1"
  curl -n -L -c /tmp/ed_cookies -b /tmp/ed_cookies -sS -o "data/browse/$1" "$B/$2/$2_LATLON.png"
}
get plaskett_before.png    NISAR_L2_PR_GCOV_028_042_D_070_4005_DHDH_A_20260816T025639_20260816T025713_P05023_N_F_J_001
get plaskett_after.png     NISAR_L2_PR_GCOV_032_042_D_070_4005_DHDH_A_20261003T025638_20261003T025713_P05023_N_F_J_001
get guadalajara_before.png NISAR_L2_PR_GCOV_024_095_D_068_2005_DHDH_A_20260702T190926_20260702T191004_P05023_N_F_J_001
get guadalajara_after.png  NISAR_L2_PR_GCOV_028_095_D_068_2005_DHDH_A_20260819T190923_20260819T191000_P05023_N_F_J_001
get tonlesap_before.png    NISAR_L2_PR_GCOV_023_083_A_008_2005_DHDH_M_20260619T223637_20260619T223711_P05023_N_F_J_001
get tonlesap_after.png     NISAR_L2_PR_GCOV_032_083_A_008_2005_DHDH_M_20261005T223633_20261005T223708_P05023_N_F_J_001
get niger_before.png       NISAR_L2_PR_GCOV_023_145_A_009_2005_DHDH_A_20260624T055000_20260624T055035_P05023_N_F_J_001
get niger_after.png        NISAR_L2_PR_GCOV_032_145_A_009_2005_DHDH_A_20261010T054957_20261010T055031_P05023_N_F_J_001

# 3. Download the Flores earthquake interferogram (about 2.4 GB – this takes a while)
G=NISAR_L2_PR_GUNW_028_003_D_093_029_4000_SH_20260813T101400_20260813T101435_20260825T101400_20260825T101435_P05023_N_F_J_001
if [ -s "data/raw/$G.h5" ] && [ "$(stat -f%z "data/raw/$G.h5" 2>/dev/null || stat -c%s "data/raw/$G.h5")" -gt 100000000 ]; then
  echo "have Flores interferogram"
else
  echo "downloading Flores interferogram (2.4 GB)..."
  curl -n -L -c /tmp/ed_cookies -b /tmp/ed_cookies --progress-bar -o "data/raw/$G.h5" \
    "https://nisar.asf.earthdatacloud.nasa.gov/NISAR/NISAR_L2_GUNW_PROVISIONAL_V1/$G/$G.h5"
fi

echo
echo "Check – every line below should say PNG image data:"
file data/browse/*.png
ls -lh data/raw/*.h5
