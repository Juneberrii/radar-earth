// Shared bits on every page: live UTC clock in the status bar + NISAR telemetry panel
(function () {
  const LAUNCH = Date.UTC(2025, 6, 30, 12, 10);   // 30 July 2025, GSLV-F16 (approx. launch time)
  const ORBIT_MIN = 99.8;                          // ≈ orbit period at 747 km altitude (calculated)

  const clock = document.getElementById('utc-clock');
  const day = document.getElementById('tm-day');
  const orbits = document.getElementById('tm-orbits');

  function update() {
    const now = new Date();
    if (clock) clock.textContent = 'UTC ' + now.toISOString().slice(11, 19);
    const ms = now.getTime() - LAUNCH;
    if (day) day.textContent = Math.floor(ms / 86400000).toLocaleString('en-US');
    if (orbits) orbits.textContent = '≈ ' + (ms / 60000 / ORBIT_MIN).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  }
  update();
  setInterval(update, 1000);
})();
