// Markdown supplies the figure; Gatsby calls this after each navigation.
export function enableClockifyKeyboard() {
  const figure = document.querySelector(".clockify-recap")
  if (!figure) return
  const days = [...figure.querySelectorAll(".cr-day")]
  figure.onkeydown = (event) => {
    const current = days.indexOf(event.target)
    if (current === -1) return
    let next
    switch (event.key) {
      case "ArrowRight":
        next = Math.min(current + 1, days.length - 1)
        break
      case "ArrowLeft":
        next = Math.max(current - 1, 0)
        break
      case "Home":
        next = 0
        break
      case "End":
        next = days.length - 1
        break
      default:
        return
    }
    event.preventDefault()
    days.find((day) => day.tabIndex === 0).tabIndex = -1
    days[next].tabIndex = 0
    days[next].focus()
  }
}
