// All locations on Radar Earth. Edit text here – every page and the globe read from this file.
// Apostrophes inside '...' need a backslash: it\'s
// notes: little markers on the radar images. x and y are percent from the left and top of the image.
//   Tip: open a page with ?notes at the end of the address (e.g. fire.html?notes#utah) and click the
//   image – it shows the x/y numbers to copy here.
window.TYPES = {
  fire:   { label: 'Burn Scars',          sub: 'Forests after wildfires',        color: '#FF8A4C', page: 'fire.html' },
  water:  { label: 'Floods & Wetlands',   sub: 'Water that comes and goes',      color: '#4CC9D9', page: 'water.html' },
  ground: { label: 'Ground Motion',       sub: 'Centimeter shifts of the land',  color: '#B9A3FF', page: 'ground.html' }
};

window.SITES = [
  // ---------------- Burn Scars ----------------
  {
    id: 'utah', type: 'fire', name: 'Widemouth 2 Fire', place: 'Utah, USA', lat: 38.73, lon: -112.50,
    before: 'Jul 19, 2026', after: 'Sep 17, 2026',
    text: 'On July 27, 2026, lightning sparked the Widemouth 2 Fire near Kanosh in central Utah. It became the state\'s largest fire of the season. Before the fire, the forested mountains in the middle glow bright white-green; afterwards the same slopes turn darker and purple – the canopy is gone.',
    stats: [['Area burned', '≈ 130,000 acres'], ['That\'s about', '525 km²'], ['Fire started', 'Jul 27, 2026'], ['Cause', 'Lightning']],
    notes: [
      { x: 45, y: 55, text: 'Fire area near Kanosh – the fire began here on July 27.' },
      { x: 68, y: 32, text: 'Forested mountains: bright before the fire, darker after it.' },
      { x: 14, y: 75, text: 'Farm fields in the valley – they barely change.' }
    ],
    why: 'Lightning struck during a hot, dry summer, and the fire spread through timber, dead needles and undergrowth. In the radar image the change comes from the trees themselves: a leafy canopy scatters the signal around and sends a lot of it back, especially in the cross-polarized HV channel. Once the canopy burns, there is little left to scatter, so the slopes turn dark. (Rain from summer storms can also brighten soil, which is why the whole scene shows some patchy changes.)',
    matters: 'Smoke grounds aircraft and blinds normal satellites, but radar maps the burn anyway. Knowing which slopes lost their forest helps crews plan where rain could cause erosion and mudflows, where to protect water supplies, and where to replant.',
    source: 'NISAR L2 GCOV, track 157 descending, frame 69. Fire size: public wildfire reports (129,742 acres).'
  },
  {
    id: 'plaskett', type: 'fire', name: 'Plaskett Fire', place: 'Big Sur, California, USA', lat: 35.90, lon: -121.41,
    before: 'Aug 16, 2026', after: 'Oct 3, 2026',
    text: 'The Plaskett Fire started on August 26, 2026, in the Los Padres National Forest above California\'s Big Sur coast. It burned through steep, heavily vegetated terrain – some of it had not burned in more than 50 years. Look for forested slopes where the bright green glow fades after the fire.',
    stats: [['Area burned', '≈ 30,100 acres'], ['That\'s about', '122 km²'], ['Fire started', 'Aug 26, 2026'], ['Forest', 'Los Padres NF']],
    notes: [
      { x: 44, y: 56, text: 'The Plaskett Fire started near here on August 26.' }
    ],
    why: 'The fire burned steep, rugged slopes with heavy dead and down fuel – some areas had not burned in over 50 years, so decades of fuel had built up. Like in Utah, the radar signal drops where the canopy and shrubs are gone, because there is less vegetation to scatter the signal back.',
    matters: 'Burned, steep slopes above the Highway 1 corridor are prone to landslides and debris flows when winter rains arrive. Radar can watch these slopes every 12 days through fog and clouds – common on the Big Sur coast – and track how the vegetation recovers.',
    source: 'NISAR L2 GCOV, track 42 descending, frame 70. Fire details: CAL FIRE incident page.'
  },
  {
    id: 'guadalajara', type: 'fire', name: 'Sierra Norte Fire', place: 'Guadalajara, Spain', lat: 41.10, lon: -3.15,
    before: 'Jul 2, 2026', after: 'Aug 19, 2026',
    text: 'On July 16, 2026, a fire started near La Mierla in the Sierra Norte of Guadalajara, Spain. It burned more than 34,000 hectares of woodland and pasture and forced evacuations in dozens of villages – the most destructive fire in the province\'s history. Compare how the hills lose their bright vegetation signal.',
    stats: [['Area burned', '> 34,000 ha'], ['That\'s about', '340 km²'], ['Fire started', 'Jul 16, 2026'], ['Region', 'Castilla-La Mancha']],
    notes: [
      { x: 45, y: 50, text: 'Inside the Sierra Norte burn area.' }
    ],
    why: 'The fire broke out in a summer of extreme heat across southern Europe. A likely driver is that many rural villages in this region have emptied over the decades, so fewer fields are farmed and fewer woods are grazed or cleared – leaving more continuous fuel. In the radar, burned woodland loses its bright vegetation signal.',
    matters: 'With over 34,000 hectares burned, the region now faces erosion, loss of grazing land and a long recovery. Radar maps of the burn scar help plan restoration and show, season by season, whether the vegetation is coming back.',
    source: 'NISAR L2 GCOV, track 95 descending, frame 68. Fire details: regional news reports (infoCLM, Oct 2026).'
  },

  // ---------------- Floods & Wetlands ----------------
  {
    id: 'haor', type: 'water', name: 'Haor Wetlands', place: 'Sylhet region, Bangladesh', lat: 24.6, lon: 91.2,
    before: 'Sep 12, 2026', after: 'Oct 30, 2026', beforeTag: 'FLOODED', afterTag: 'DRAINING',
    text: 'In northeast Bangladesh, huge low basins called haors fill with monsoon rain every summer and turn into an inland sea. In autumn the water drains away and farmers plant rice in the fertile mud. Slide to October and watch the black water shrink.',
    stats: [['Season', 'Monsoon → dry'], ['Time between images', '7 weeks']],
    notes: [
      { x: 46, y: 52, text: 'The haor basin – black means open water.' },
      { x: 30, y: 6, text: 'Forested hills to the north – they hardly change.' }
    ],
    why: 'Monsoon rain pours off the hills just to the north – among the wettest places on Earth – and rivers overflow into the low haor basins until they join into one inland sea. After the monsoon the water slowly drains, so the black area of open water shrinks between September and October.',
    matters: 'Farmers plant their main rice crop in the mud as the water retreats, and an early flash flood can wipe out a whole harvest. Tracking the water every 12 days, day and night and through monsoon clouds, can support planting decisions and flood warnings for millions of people.',
    source: 'NISAR L2 GCOV, track 91 descending, frame 76. The October scene uses a newer processing version; compared visually.'
  },
  {
    id: 'tonlesap', type: 'water', name: 'Tonle Sap Lake', place: 'Cambodia', lat: 12.85, lon: 104.10,
    before: 'Jun 19, 2026', after: 'Oct 5, 2026', beforeTag: 'LOW WATER', afterTag: 'FLOOD SEASON',
    text: 'Tonle Sap is Southeast Asia\'s largest freshwater lake. In the rainy season the Mekong River swells so much that water flows backwards up into the lake, which grows several times larger and floods the surrounding forests and fields. NISAR saw it in June, near its lowest, and again in October, near its peak.',
    stats: [['Season', 'Dry → flood'], ['Time between images', '15 weeks']],
    notes: [
      { x: 45, y: 50, text: 'Tonle Sap lake – watch the black water spread.' }
    ],
    why: 'In the rainy season the Mekong River rises so high that its tributary, the Tonle Sap River, reverses direction and flows back into the lake. The lake then spreads far over the surrounding forests and fields. In the radar, open water is dark, and NISAR measured the open water in this view rising from about 1% in June to about 9% in October. Flooded forest can even turn bright, because the signal bounces off the water and then off the tree trunks.',
    matters: 'This flood pulse feeds one of the most productive freshwater fisheries in the world, which millions of people depend on for food. Dams and climate change upstream on the Mekong can weaken the pulse – radar lets us check it every year, even under constant monsoon clouds.',
    source: 'NISAR L2 GCOV, track 83 ascending, frame 8.'
  },
  {
    id: 'niger', type: 'water', name: 'Inner Niger Delta', place: 'Mali', lat: 14.9, lon: -4.2,
    before: 'Jun 24, 2026', after: 'Oct 10, 2026', beforeTag: 'DRY PLAIN', afterTag: 'FLOODED',
    text: 'In Mali, the Niger River spreads out into one of Africa\'s largest wetlands. Rain that falls far upstream in Guinea arrives months later: from August the river overflows and turns the dry plain into a maze of lakes and channels that feeds fish, cattle and millions of birds.',
    stats: [['Season', 'Dry → flood'], ['Time between images', '15 weeks']],
    why: 'Rain falls on the highlands of Guinea from June to September, and the flood wave travels slowly down the Niger River. It reaches this inland delta months later and spreads into a maze of lakes and channels. NISAR saw the open water in this view grow from about 6% in June to about 13% in October.',
    matters: 'Herders, fishers and rice farmers all live by the timing of this flood, and it is one of the most important wetlands for migratory birds in Africa. Upstream dams, irrigation and drought change how far the water spreads – radar can measure it every year, even in the cloudy rainy season.',
    source: 'NISAR L2 GCOV, track 145 ascending, frame 9.'
  },

  // ---------------- Ground Motion ----------------
  {
    id: 'tokyo', type: 'ground', name: 'Tokyo Region', place: 'Japan', lat: 35.69, lon: 139.69,
    before: 'Sep 21, 2026', after: 'Oct 3, 2026',
    text: 'A quiet 12 days around Tokyo – and a lesson in reading radar. The wide, smooth color bands in the raw image are far too large and smooth to be the ground moving; they come mostly from the sky, where the ionosphere and air delayed the signal differently on the two dates. Removing that smooth trend shrinks the signal a lot. The blotches that remain are still mostly patchy weather in the air, not the ground: Tokyo moves only millimeters per year. That is why scientists stack many radar passes before trusting a small signal.',
    views: ['raw', 'clean', 'cm'],
    stats: [['Time between passes', '12 days'], ['Story', 'Sky vs ground']],
    why: 'Tokyo once sank fast because too much groundwater was pumped out, but since pumping was restricted decades ago the ground has been almost stable. So in 12 days there is no real dance to see. What we do see are delays in the radar signal caused by the ionosphere and by moisture in the air on the two dates.',
    matters: 'Knowing what is NOT ground motion is just as important as finding it. With a pass every 12 days, NISAR can stack many images to cancel out the sky and measure millimeters per year – enough to watch sinking coasts, cities, dams and bridges.',
    source: 'NISAR L2 GUNW, track 46 descending, frame 70. Processed by our team: phase → centimeters, then a smooth best-fit surface removed to take out the effect of the sky.'
  }
];
