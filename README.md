# Award Buddy

<img src="assets/icons/icon-128.png" alt="" width="64" align="right">

A search panel that sits on top of airline and hotel award booking sites and searches many dates at once.

- **Flights:** pick origins, destinations, a date range and cabins. Award Buddy runs every route × date combination through the airline's own site and puts the results in one sortable table.
- **Hotels:** pick hotels by name, city or from the page you're on, and a range of months. Award Buddy finds the points per night for every date and shows them on a calendar and in a table.

It runs in your browser on the airline's or hotel's page, using your own session. There's no server, and it doesn't collect any data.

## Supported programs

### Airlines

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

### Hotels

| Program | Site | Session |
|---|---|---|
| IHG One Rewards | ihg.com | Not needed |
| Marriott Bonvoy | marriott.com | Not needed |
| Hilton Honors | hilton.com | Not needed |
| World of Hyatt | hyatt.com | Not needed |
| Choice Privileges | choicehotels.com | Not needed |
| I Prefer (Preferred Hotels & Resorts) | iprefer.com | Not needed |
| Preferred Hotels & Resorts (I Prefer or Choice points) | preferredhotels.com; Choice points also on choicehotels.com | Not needed to search; Choice login to book with Choice points |

More hotel chains are planned.

When a program needs a session and doesn't have one yet, the panel shows a **Get session** link that takes you to the right page.

### Extra search modes

Some programs have more to search than a plain one-way (or, for hotels, their own chain). These appear as a **Search mode** or carrier dropdown in the panel.

- **Air Canada: one-way with stopover.** Enter one or more stopover cities and the length of stay (for example `3-5, 7` days). Every combination of stopover city × stay length is searched for each route and date.
- **Choice: Preferred Hotels & Resorts.** Search the 300+ Preferred Hotels bookable with Choice Privileges points, from any page on choicehotels.com. Each night costs the hotel's flat points rate plus taxes and fees in cash (shown in the Room column). Searching needs no login, but booking does: click **Start booking** on Choice's [Preferred Hotels partner page](https://www.choicehotels.com/ascend/preferred-hotels-partner) while logged in, and the **Book** links then open the hotel on preferredhotels.com (pick the dates there).
- **Japan Airlines: partner awards.** Search JMB partner award space for Alaska / Hawaiian, American, British Airways, Cathay Pacific, Fiji Airways, Finnair, Iberia, Malaysia Airlines, Oman Air, Qantas, Qatar Airways, Royal Air Maroc, Royal Jordanian, SriLankan, Air France, Bangkok Airways, Emirates, Garuda Indonesia, Korean Air and LATAM. The airport list changes to match the partner network. Calendar mode only covers JAL's own flights.
- **LifeMiles: carrier filter.** Search all of Star Alliance, use Smart Search, or limit results to one airline: Thai, Avianca + Gol, Aegean, ANA, Lufthansa, Singapore Airlines or United.
- **Preferred Hotels: I Prefer or Choice points.** On preferredhotels.com, pick **I Prefer points** (as on iprefer.com) or **Choice Privileges points** (as in the Choice mode above; picked by default on the /choicepoints portal). **Pick from hotels on this page** lists the search results, the hotel page you're on, or the hotel you're booking.

## Install

### Userscript (Tampermonkey / Violentmonkey)

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
2. Open [`dist/award-buddy.user.js`](https://raw.githubusercontent.com/kevchentw/awardbuddy/main/dist/award-buddy.user.js) and click **Install**.

The script updates itself from this repo.

### Chrome / Edge extension (unpacked)

1. Download `award-buddy-extension-<version>.zip` from the [latest release](https://github.com/kevchentw/awardbuddy/releases/latest) and unzip it. (Or clone this repo and use the `extension/` folder.)
2. Go to `chrome://extensions` (or `edge://extensions`) and turn on **Developer mode**.
3. Click **Load unpacked** and select the unzipped folder.

## Usage

Go to a supported site. A button appears in the corner of the page (✈ on airline sites, 🏨 on hotel sites). Click it to open the panel. If it asks for a session, log in or follow the **Get session** link.

### Flights

1. Enter one or more origins and destinations, a date range, and optionally the cabins you want.
2. Click **Search**. Results come in as each request finishes. You can sort by date, duration or miles, and filter by cabin, number of stops or day of week. Each row links to the airline's booking page for that flight.

**Calendar mode** (on programs that support it) searches whole months and shows the lowest price per day on a calendar. It needs far fewer requests than searching day by day.

### Hotels

1. Add hotels:
   - Type a hotel name, city or airport. Picking a hotel adds it; picking a place lists the hotels nearby (nearest first) to tick. (I Prefer finds hotels, cities, states and countries only — no airports; a state or country lists its hotels by name.)
   - Or click **Pick from hotels on this page** to choose from the hotels on the site's search results, or the hotel page you're on.
   - Or type a hotel code (for example IHG's `TPEKM`, Marriott's `TPEDM`, Hilton's `TYOCICI`, Hyatt's `TYOPH`, Choice's `JP056` or I Prefer's `PARHD`) and press Enter.
2. Pick a range of months and click **Search**. There's one request per hotel per month.
3. The calendar shows the lowest points per night for each day, one color per hotel. Click a day to see its rates in the table. The table lists every reward-night rate (by room type and with rooms left, where the site gives them), and can be sorted by date or points and filtered by hotel or day of week.

Hotel search covers reward nights paid in points only (standard rewards; Hilton also shows Premium Room Rewards when that's the night's lowest, and a **Reward** filter keeps Standard or Premium nights only). Marriott, Hilton, Choice and I Prefer give only the lowest rate per night. Marriott's rows link to the hotel's rate calendar and Hilton's to its room list for that night. Hyatt lists every room type with points that night (Standard Room, Club Access, Standard and Premium Suite) with its off-peak / peak level, a **Room** filter keeps one room type only, and its rows link to the hotel's award rooms for that night. Choice's rows link to the hotel page for that night with the points rate picked, and I Prefer's to the hotel page for that night with points pricing on. I Prefer lists only hotels bookable with points, and one request covers every month for a hotel. IHG has no booking link; book on IHG's site.

The panel shows roughly how many requests a search will make before you start. Your last search is saved for each site. If you change the inputs while a search is running, it stops and starts over with the new values.

## Notes

- Searches go through the airline's or hotel's own endpoints, spaced out and run a few at a time. Large searches (many airports × many days, or many hotels × many months) can still get you rate limited or sent to a bot check. If that happens, the panel asks you to refresh the session or the page.
- Airline and hotel sites change often. If a program stops working, please [open an issue](https://github.com/kevchentw/awardbuddy/issues).
- Not affiliated with any airline, hotel or loyalty program.

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
  common/             shared constants (cabins, airport list), search and hotel-result helpers
  programs/<id>.js    one module per airline or hotel chain: session handling, request building, response parsing
  ui/                 Preact panel: flight and hotel forms, hotel picker, date/month pickers, results tables, calendars
build.cjs             builds the userscript, the unpacked extension and the store ZIP
```

## Contributing

Pull requests are welcome. New airlines and hotel chains, new search modes, fixes for sites that changed, and UI improvements are all useful.

- **Add an airline:** write a module in `src/programs/` that exports a program object (`id`, `name`, `cabins`, `matches`, `onSearch`, plus `onCalendarSearch` and the session hooks if needed). Register it in `src/entrypoint.js` and add the site to `MATCHES` in `build.cjs`.
- **Add a hotel chain:** write a module with `kind: 'hotel'` and `onHotelSearch({ hotel, start, end })`, which returns the reward-night rates for one hotel over one month. Register it and add the site the same way as an airline. `src/programs/ihg.js` is an example. The comments at the top of `src/ui/HotelSearch.jsx` and `src/ui/HotelPicker.jsx` list the optional hotel-finding functions (name search, hotels nearby, hotels on the page).
- **Add a search mode:** give the program `carriers` (shown as a dropdown) and, if the mode needs extra inputs, `optionsFor`. The Air Canada stopover mode in `src/programs/ac.js` is an example.
- **Fix a broken program:** the comments at the top of each module explain how it gets a session and which endpoints it calls. That's usually where to start.

Before you open a PR, run `npm test` and `npm run build`, and commit the rebuilt `dist/award-buddy.user.js` and `extension/` too, since users install straight from those. Keep request pacing gentle so searches don't trip the site's bot protection.

For bigger changes, you can [open an issue](https://github.com/kevchentw/awardbuddy/issues) first to talk it over.

## Releasing

1. Bump `version` in `package.json`, run `npm run build`, and commit the result.
2. Tag and push: `git tag v<version> && git push origin main v<version>`.

The [Release workflow](.github/workflows/release.yml) checks that the tag matches `package.json`, runs the tests, makes sure the committed build is up to date, and publishes a GitHub release with `award-buddy.user.js` and the extension ZIP attached.

## License

[MIT](LICENSE)
