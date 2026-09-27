// Adds a "Search in Award Buddy" button to each hotel card on the site's own search results.
// cards: the program's hotelCards spec
//   { selector, code: card → hotel code, name?: card → hotel name, anchor?: card → element to append the button to }
// onPick(code, name) runs on click. Cards render in lazily, so a MutationObserver keeps adding buttons.
// Returns a function that stops watching.
const BTN_ATTR = 'data-award-buddy'

export function watchHotelCards(cards, color, onPick) {
  function inject() {
    for (const card of document.querySelectorAll(cards.selector)) {
      if (card.querySelector(`[${BTN_ATTR}]`)) continue
      const code = cards.code(card)
      if (!code) continue
      const btn = document.createElement('button')
      btn.setAttribute(BTN_ATTR, '')
      btn.type = 'button'
      btn.textContent = '🏨 Search in Award Buddy'
      btn.style.cssText = `display:flex;align-items:center;justify-content:center;gap:4px;width:100%;margin-top:6px;height:36px;
        background:${color};color:#fff;border:none;border-radius:4px;font:600 12px -apple-system,sans-serif;cursor:pointer;`
      btn.addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation()
        onPick(code, cards.name?.(card)?.replace(/\s+/g, ' ').trim())
      })
      ;(cards.anchor?.(card) ?? card).appendChild(btn)
    }
  }
  inject()
  const observer = new MutationObserver(inject)
  observer.observe(document.body, { childList: true, subtree: true })
  return () => observer.disconnect()
}
