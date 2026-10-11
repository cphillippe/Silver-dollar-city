/** Put a story-strip win back at the top so ← Settings stays on screen. */
export function pinStoryPageTop(): void {
  const pin = () => {
    const nodes = [
      document.scrollingElement,
      document.querySelector('.app-body'),
      document.querySelector('.daily-page'),
      document.querySelector('.challenge-page'),
    ]
    for (const node of nodes) {
      if (node) (node as HTMLElement).scrollTop = 0
    }
  }
  pin()
  window.requestAnimationFrame(pin)
}
