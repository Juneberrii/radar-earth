# Radar Earth
by June Rosenthal · NASA Space Apps Challenge 2026 · "Dancing with the Stars"

An interactive globe showing three kinds of Earth surface change seen by the NASA–ISRO NISAR radar satellite (L-band, provisional data, 2026):

- **Burn Scars** – Widemouth 2 Fire (Utah), Plaskett Fire (California), Sierra Norte Fire (Spain) – NISAR L2 GCOV
- **Floods & Wetlands** – Haor wetlands (Bangladesh), Tonle Sap (Cambodia), Inner Niger Delta (Mali) – NISAR L2 GCOV
- **Ground Motion** – Tokyo region (Japan) – NISAR L2 GUNW, processed from phase to centimeters

Data: NASA–ISRO NISAR via the Alaska Satellite Facility (ASF DAAC). Scene names are listed on the website under "Data".

`scripts/get_data.sh` downloads the data, `scripts/prepare_images.py` crops the images, measures open water and converts the interferogram to centimeters.

## AI disclosure
This project was built with help from Claude (Anthropic), an AI assistant:
- Code: most of the website code (HTML, CSS, JavaScript) and the Python processing scripts were written with the AI. I ran, tested and adjusted them on my own computer with the real NISAR data.
- Research & texts: the AI helped find suitable NISAR scenes and explain radar concepts, and drafted the explanatory texts, which I reviewed and edited.
- My own work: choosing the topic, places and design, downloading and processing the data, checking the results, editing the texts, recording the demo video and publishing the site.
All images are real NISAR radar data. No AI-generated images, video or audio are used.
