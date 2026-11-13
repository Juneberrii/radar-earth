# Radar Earth
by June Rosenthal · NASA Space Apps Challenge 2026 · "Dancing with the Stars"

An interactive globe showing three kinds of Earth surface change seen by the NASA–ISRO NISAR radar satellite (L-band, provisional data, 2026):

- **Burn Scars** – Widemouth 2 Fire (Utah), Plaskett Fire (California), Sierra Norte Fire (Spain) – NISAR L2 GCOV
- **Floods & Wetlands** – Haor wetlands (Bangladesh), Tonle Sap (Cambodia), Inner Niger Delta (Mali) – NISAR L2 GCOV
- **Ground Motion** – Tokyo region (Japan) – NISAR L2 GUNW, processed from phase to centimeters

Data: NASA–ISRO NISAR via the Alaska Satellite Facility (ASF DAAC). Scene names are listed on the website under "Data".

`scripts/get_data.sh` downloads the data, `scripts/prepare_images.py` crops the images, measures open water and converts the interferogram to centimeters.
