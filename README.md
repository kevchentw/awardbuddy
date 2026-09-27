# Award Buddy

<img src="assets/icons/icon-128.png" alt="" width="64" align="right">

A search panel that sits on top of airline award booking sites and runs searches across several dates and airports at once. Pick origins, destinations, a date range and cabins, and Award Buddy runs every route × date combination through the airline's own site and puts the results in one sortable table.

It runs in your browser on the airline's page, using your own session. There's no server, and it doesn't collect any data.

## Supported programs

| Program | Site | Calendar mode | Session |
|---|---|:---:|---|
| Alaska Airlines (Atmos) | alaskaair.com | ✓ | Not needed |
| American Airlines (AAdvantage) | aa.com | ✓ | Run one search on the page (**Get session**) |
| Air Canada (Aeroplan) | aircanada.com | | Open the award search page |
| ANA | ana.co.jp | | Log in to the award booking page |
| Cathay Pacific | cathaypacific.com | | Open the award booking page |
| EVA Air (Infinity MileageLands) | evaair.com | ✓ | Log in |
| Flying Blue (Air France / KLM) | airfrance.us, klm.com | ✓ | Open the award search page |
| Japan Airlines (JMB) | jal.co.jp | ✓ (JAL flights only) | Log in |
| LifeMiles | lifemiles.com | | Log in |
| Starlux Airlines (COSMILE) | starlux-airlines.com | ✓ | Log in |

When a program needs a session and doesn't have one yet, the panel shows a **Get session** link that takes you to the right page.

### Extra search modes

Some programs have more to search than a plain one-way. These appear as a **Search mode** or carrier dropdown in the panel.

- **Air Canada: one-way with stopover.** Enter one or more stopover cities and the length of stay (for example `3-5, 7` days). Every combination of stopover city × stay length is searched for each route and date.
- **Japan Airlines: partner awards.** Search JMB partner award space for Alaska / Hawaiian, American, British Airways, Cathay Pacific, Fiji Airways, Finnair, Iberia, Malaysia Airlines, Oman Air, Qantas, Qatar Airways, Royal Air Maroc, Royal Jordanian, SriLankan, Air France, Bangkok Airways, Emirates, Garuda Indonesia, Korean Air and LATAM. The airport list changes to match the partner network. Calendar mode only covers JAL's own flights.
- **LifeMiles: carrier filter.** Search all of Star Alliance, use Smart Search, or limit results to one airline: Thai, Avianca + Gol, Aegean, ANA, Lufthansa, Singapore Airlines or United.

## Install

### Userscript (Tampermonkey / Violentmonkey)

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
2. Open [`dist/award-buddy.user.js`](https://raw.githubusercontent.com/kevchentw/awardbuddy/main/dist/award-buddy.user.js) and click **Install**.

The script updates itself from this repo.

### Chrome / Edge extension (unpacked)

1. Clone this repo, or download it as a ZIP and unzip it.
2. Go to `chrome://extensions` (or `edge://extensions`) and turn on **Developer mode**.
3. Click **Load unpacked** and select the `extension/` folder.

## Usage

1. Go to a supported airline site. A ✈ button appears in the corner of the page.
2. Click it to open the panel. If it asks for a session, log in or follow the **Get session** link.
3. Enter one or more origins and destinations, a date range, and optionally the cabins you want.
4. Click **Search**. Results come in as each request finishes. You can sort by date, duration or miles, and filter by cabin, number of stops or day of week. Each row links to the airline's booking page for that flight.

**Calendar mode** (on programs that support it) searches whole months and shows the lowest price per day on a calendar. It needs far fewer requests than searching day by day.

The panel shows roughly how many requests a search will make before you start. Your last route, cabins and options are saved for each site. If you change the inputs while a search is running, it stops and starts over with the new values.

## Notes

- Searches go through the airline's own endpoints, spaced out and run a few at a time. Large searches (many airports × many days) can still get you rate limited or sent to a bot check. If that happens, the panel asks you to refresh the session.
- Airline sites change often. If a program stops working, please [open an issue](https://github.com/kevchentw/awardbuddy/issues).
- Not affiliated with any airline or loyalty program.

## Development

```sh
npm install
npm run build   # → dist/award-buddy.user.js, extension/, dist/award-buddy-extension-<version>.zip
npm test
```

The source is ES modules + [Preact](https://preactjs.com/), bundled with esbuild into a single script. The script runs at `document_start` in the page's main world, so it can intercept the site's own `fetch`/XHR calls to capture session tokens.

```
src/
  entrypoint.js       picks the program for the current hostname and mounts the panel
  common/             shared constants (cabins, airport list) and search helpers
  programs/<id>.js    one module per airline: session handling, request building, response parsing
  ui/                 Preact panel: form, date/month pickers, results table, calendar view
build.cjs             builds the userscript, the unpacked extension and the store ZIP
```

## Contributing

Pull requests are welcome. New airlines, new search modes, fixes for sites that changed, and UI improvements are all useful.

- **Add an airline:** write a module in `src/programs/` that exports a program object (`id`, `name`, `cabins`, `matches`, `onSearch`, plus `onCalendarSearch` and the session hooks if needed). Register it in `src/entrypoint.js` and add the site to `MATCHES` in `build.cjs`.
- **Add a search mode:** give the program `carriers` (shown as a dropdown) and, if the mode needs extra inputs, `optionsFor`. The Air Canada stopover mode in `src/programs/ac.js` is an example.
- **Fix a broken program:** the comments at the top of each module explain how it gets a session and which endpoints it calls. That's usually where to start.

Before you open a PR, run `npm test` and `npm run build`, and commit the rebuilt `dist/award-buddy.user.js` and `extension/` too, since users install straight from those. Keep request pacing gentle so searches don't trip the airline's bot protection.

For bigger changes, you can [open an issue](https://github.com/kevchentw/awardbuddy/issues) first to talk it over.

## License

[MIT](LICENSE)
