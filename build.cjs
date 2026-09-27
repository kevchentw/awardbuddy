#!/usr/bin/env node
// Bundles src/entrypoint.js (ES modules) into:
//   - dist/award-buddy.user.js: a single self-contained Tampermonkey userscript
//   - extension/: an unpacked Chrome extension (MV3) running the same bundle in the page's MAIN world
//   - dist/award-buddy-extension-<version>.zip: extension/ zipped for the Chrome Web Store / Edge Add-ons
// Usage: npm run build

const fs = require('fs')
const path = require('path')

const NAME = 'Award Buddy'
const VERSION = require('./package.json').version
const REPO_URL = 'https://github.com/kevchentw/awardbuddy'
// Tampermonkey checks this for a higher @version to auto-update
const USERSCRIPT_URL = 'https://raw.githubusercontent.com/kevchentw/awardbuddy/main/dist/award-buddy.user.js'
const DESCRIPTION = 'Multi-date × multi-airport award search overlay — Alaska Airlines, LifeMiles, Cathay Pacific, EVA Air, Flying Blue, Starlux Airlines, Japan Airlines, ANA, Air Canada & American Airlines, plus IHG hotels'
const ICON_SIZES = [16, 32, 48, 128]  // assets/icons/icon-<size>.png, shared with ../award-buddy
const MATCHES = [
  'https://www.alaskaair.com/*',
  'https://www.lifemiles.com/*',
  'https://www.cathaypacific.com/*',
  'https://book.cathaypacific.com/*',
  'https://*.evaair.com/*',
  'https://wwws.airfrance.us/*',
  'https://www.klm.com/*',
  'https://www.starlux-airlines.com/*',
  'https://*.jal.co.jp/*',
  'https://*.ana.co.jp/*',
  'https://www.aircanada.com/*',
  'https://www.aa.com/*',
  'https://www.ihg.com/*',
]

const HEADER = `// ==UserScript==
// @name         ${NAME}
// @namespace    ${REPO_URL}
// @version      ${VERSION}
// @description  ${DESCRIPTION}
// @homepageURL  ${REPO_URL}
// @supportURL   ${REPO_URL}/issues
// @updateURL    ${USERSCRIPT_URL}
// @downloadURL  ${USERSCRIPT_URL}
${MATCHES.map(m => `// @match        ${m}`).join('\n')}
// @grant        none
// @run-at       document-start
// ==/UserScript==
`

// The code patches the page's own fetch/XMLHttpRequest and reads its storage, so it runs in the MAIN
// world (like @grant none) rather than the isolated content-script world
const MANIFEST = {
  manifest_version: 3,
  name: NAME,
  version: VERSION,
  homepage_url: REPO_URL,
  icons: Object.fromEntries(ICON_SIZES.map(s => [s, `icons/icon-${s}.png`])),
  description: 'Multi-date × multi-airport award search overlay on airline and hotel award booking sites',  // ≤ 132 chars
  content_scripts: [{
    matches: MATCHES,
    js: ['award-buddy.js'],
    run_at: 'document_start',
    world: 'MAIN',
  }],
}

const esbuild = require('esbuild')
const options = {
  entryPoints: [path.join(__dirname, 'src', 'entrypoint.js')],
  bundle: true,
  format: 'iife',
  target: 'es2020',
  jsx: 'automatic',
  jsxImportSource: 'preact',
}

const userscriptPath = path.join(__dirname, 'dist', 'award-buddy.user.js')
esbuild.buildSync({ ...options, banner: { js: HEADER }, outfile: userscriptPath })
console.log(`Built → ${userscriptPath}  (${(fs.statSync(userscriptPath).size / 1024).toFixed(1)} KB)`)

const extDir = path.join(__dirname, 'extension')
esbuild.buildSync({ ...options, outfile: path.join(extDir, 'award-buddy.js') })
fs.writeFileSync(path.join(extDir, 'manifest.json'), JSON.stringify(MANIFEST, null, 2) + '\n')
fs.mkdirSync(path.join(extDir, 'icons'), { recursive: true })
for (const s of ICON_SIZES) {
  fs.copyFileSync(path.join(__dirname, 'assets', 'icons', `icon-${s}.png`), path.join(extDir, 'icons', `icon-${s}.png`))
}
console.log(`Built → ${extDir}/  (load unpacked in chrome://extensions)`)

const zipPath = path.join(__dirname, 'dist', `award-buddy-extension-${VERSION}.zip`)
fs.rmSync(zipPath, { force: true })
require('child_process').execFileSync('zip', ['-qr', '-X', zipPath, '.'], { cwd: extDir })
console.log(`Built → ${zipPath}  (upload to the Chrome Web Store / Edge Add-ons)`)
