const button = document.getElementById("shopButton")
let lastcolor = window.getComputedStyle(button).getPropertyValue("color")
let animation
//rainbow hover button code (must be in js sadly bc vanilla CSS doesn't support transitioning out of animations)
button.addEventListener("mouseover", () => {
	animation = button.animate([
  { // from
    color: window.getComputedStyle(button).getPropertyValue("color"),
	borderColor: window.getComputedStyle(button).getPropertyValue("color")
  },
  { // to
    color: "pink",
	borderColor: "pink"
  },
  { // to
    color: "darkslateblue",
	borderColor: "darkslateblue"
  },
  { // to
    color: "salmon",
	borderColor: "salmon"
  },
  { // to
    color: "aqua",
	borderColor: "aqua"
  }
], {
  // timing options
  duration: 8000,
  iterations: Infinity,
//   direction: 'alternate'
});
})

button.addEventListener("mouseout", () => {
	button.animate([
  { // from
    color: window.getComputedStyle(button).getPropertyValue("color"),
	borderColor: window.getComputedStyle(button).getPropertyValue("color")
  },
  { // to
    color: "aqua",
	borderColor: "aqua"
  }
], {
  // timing options
  duration: 2000,
});
	animation.cancel()
})