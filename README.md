# Stillpoint

An interactive personal dashboard with Geist, Tailwind CSS, Motion and DialKit.

**[Play with the live demo](https://jherem19.github.io/stillpoint-dashboard/)**

To run locally, serve this directory with any static server, for example `python3 -m http.server 4173`, then open `http://localhost:4173`.

The **Tune interface** button at the bottom opens the real DialKit editor. It controls the shared Motion transition, entrance stagger and distance, hover lift, press scale, image scale, shadows, borders, and accent. Settings and saved versions persist in this browser. **Replay entrance** previews timing; **Restore defaults** restores the shipped configuration. Escape closes the editor. Radius and padding remain fixed at 24px.

Geist is used throughout. OS reduced-motion preferences override animation timing and disable hover movement.

## Browser location

Click **Use my location** and allow the browser permission. The Location card shows a real OpenStreetMap centered on the visitor's approximate area. Coordinates are rounded to two decimals before being sent to OpenStreetMap; coordinates are never persisted. No API key or backend is needed. HTTPS (or localhost) is required. Permission denial, unavailable position, and timeout all have retry guidance. The map uses third-party OpenStreetMap services; their availability is independent of this demo.

The dashboard does not request location on page load. Notes and DialKit preferences stay in the visitor's browser and are not sent to this repository.

## Files and dependencies

- `index.html`: dashboard markup and original demo interactions.
- `polish.css`: visual refinements and editor shell.
- `reference.css`: compact layout, coastal map treatment, blue weather surface and detailed focus dial inspired by https://x.com/MSchwaibold/status/2096059496812716307. Map is illustrative, not a geographic navigation source.
- `polish.js`: DialKit bindings, Motion animations, and accessible editor controls.
- `location.js`: opt-in browser geolocation, approximate map and recovery states.
- `vendor/dialkit/`: official DialKit 2.0.0 vanilla browser distribution, MIT, https://github.com/joshpuckett/dialkit.
- `vendor/motion/`: official Motion 13.2.0 browser distribution, MIT, https://github.com/motiondivision/motion.

Vendored libraries are served locally. Tailwind CDN, Lucide, Google Fonts, Unsplash and the optional OpenStreetMap embed require internet access. Flight, weather, stories, agents and calendar are sample data; the music player simulates playback progress and is not connected to an audio source. Calendar and story links are visual placeholders. The focus timer, editable note, unread state, location and DialKit editor are interactive.

## GitHub Pages

Publish from the root of the `main` branch using GitHub Pages. The `.nojekyll` file makes this a plain static site. No secrets, environment variables or build step are required.
