/* Location stays in memory. Only rounded coordinates are sent to OpenStreetMap. */
(() => {
  const button = document.getElementById('locateButton');
  const title = document.getElementById('location-title');
  const detail = document.getElementById('locationDetail');
  const status = document.getElementById('locationStatus');
  const map = document.getElementById('locationMap');
  const link = document.getElementById('locationLink');
  const card = button.closest('article');
  let watchdog;
  let request = 0;

  function fail(code) {
    clearTimeout(watchdog);
    button.disabled = false;
    button.textContent = 'Try again ↗';
    card.removeAttribute('aria-busy');
    status.textContent = code === 1
      ? 'Location is blocked. Allow it in your browser’s site settings, then try again.'
      : code === 3
        ? 'Location took too long. Check your connection and try again.'
        : 'Location is unavailable. Enable device location services and try again.';
  }

  button.addEventListener('click', () => {
    if (!window.isSecureContext) {
      status.textContent = 'Open the HTTPS version of this page to use location.';
      return;
    }
    if (!navigator.geolocation) {
      status.textContent = 'This browser does not support location. Try another browser.';
      return;
    }
    const currentRequest = ++request;
    button.disabled = true;
    button.textContent = 'Finding you…';
    status.textContent = 'Allow location in the browser prompt.';
    card.setAttribute('aria-busy', 'true');
    // Also cover browsers that leave a permission prompt unanswered indefinitely.
    watchdog = setTimeout(() => { if (request === currentRequest) { request++; fail(3); } }, 30000);
    navigator.geolocation.getCurrentPosition(position => {
      if (request !== currentRequest) return;
      clearTimeout(watchdog);
      const { latitude, longitude, accuracy } = position.coords;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) { fail(2); return; }
      const lat = Math.round(latitude * 100) / 100;
      const lon = Math.round(longitude * 100) / 100;
      const extent = Math.max(.025, Math.min(.25, (Number.isFinite(accuracy) ? accuracy : 1000) / 111000));
      const south = Math.max(-85, Math.min(85, lat - extent));
      const north = Math.max(-85, Math.min(85, lat + extent));
      const west = Math.max(-180, lon - extent);
      const east = Math.min(180, lon + extent);
      const params = new URLSearchParams({ bbox: [west, south, east, north].join(','), layer: 'mapnik' });
      const frame = document.createElement('iframe');
      frame.title = 'OpenStreetMap of your approximate area';
      frame.src = `https://www.openstreetmap.org/export/embed.html?${params}`;
      frame.loading = 'eager';
      frame.referrerPolicy = 'no-referrer';
      map.replaceChildren(frame);
      map.hidden = false;
      card.classList.add('has-location');
      title.textContent = 'Around you';
      detail.textContent = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'} · ${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? 'E' : 'W'}`;
      status.textContent = 'Approximate area · Not saved';
      const attribution = document.createElement('a');
      attribution.href = 'https://www.openstreetmap.org/copyright';
      attribution.target = '_blank';
      attribution.rel = 'noopener noreferrer';
      attribution.textContent = '© OpenStreetMap contributors';
      attribution.className = 'map-attribution';
      card.querySelector('.map-attribution')?.remove();
      card.append(attribution);
      link.href = `https://www.openstreetmap.org/#map=13/${lat}/${lon}`;
      link.hidden = false;
      button.textContent = 'Refresh ↗';
      button.disabled = false;
      card.removeAttribute('aria-busy');
    }, error => { if (request === currentRequest) fail(error.code); }, { enableHighAccuracy: false, maximumAge: 60000, timeout: 15000 });
  });
})();
