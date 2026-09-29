import { ipreferPointsProgram, ipreferDirectory, ipreferPageHotels, bookableWithPoints } from './iprefer.js'
import { preferredChoiceProgram, takesChoicePoints } from './preferred-choice.js'

// I Prefer / Preferred Hotels & Resorts, on iprefer.com and preferredhotels.com – the same hotels, booked
// with either points, as two search modes:
//   I Prefer points   iprefer.js; Book links open the hotel on iprefer.com
//   Choice points     preferred-choice.js; picked by default on preferredhotels.com/choicepoints (the Choice
//                     Privileges portal), and booking needs the Choice session that portal is entered with
// Hotel pages (/hotels/<country>/<slug>, the same paths on both sites) and the portal's booking pages
// (/choicepoints/book/hotel/<synxisId>) are matched to codes through the directory, and search result
// cards (the same markup on both sites) by name.

// SynXis id from a portal booking page URL: /choicepoints/book/hotel/26919
export function preferredSynxisFromUrl(url) {
  return new URL(url).pathname.match(/^\/choicepoints\/book\/hotel\/(\d+)\/?$/)?.[1] ?? null
}

// Search result cards, plus the hotel page or booking page the user is on, as codes; bookableIf keeps the
// hotels a mode can book
export function preferredPageHotels(doc, directory, url, bookableIf) {
  const bookable = (directory ?? []).filter(bookableIf)
  const path = new URL(url).pathname.replace(/\/$/, '')
  const synxisId = preferredSynxisFromUrl(url)
  const current = bookable.find(h => synxisId ? h.synxisId === synxisId : h.path === path)?.code
  return ipreferPageHotels(doc, bookable, current)
}

const pageHotelsFor = bookableIf => async () => preferredPageHotels(document, await ipreferDirectory(), location.href, bookableIf)

const ipreferMode = { ...ipreferPointsProgram, pageHotels: pageHotelsFor(bookableWithPoints) }
const choiceMode = { ...preferredChoiceProgram, currentHotel: ipreferPointsProgram.currentHotel, pageHotels: pageHotelsFor(takesChoicePoints) }

export const ipreferProgram = {
  ...ipreferMode,
  id: 'preferred',
  name: 'I Prefer',
  color: '#1B2A3A',
  matchHost: h => h === 'iprefer.com' || h === 'preferredhotels.com',
  modes: [
    { code: 'iprefer', name: 'I Prefer points', program: ipreferMode },
    {
      code: 'choice', name: 'Choice Privileges points', program: choiceMode,
      tip: 'The Book links open the hotel on preferredhotels.com (pick the dates there).',
    },
  ],
  // The Choice points portal lives under /choicepoints
  pageMode: () => location.pathname.startsWith('/choicepoints') ? 'choice' : null,
}
