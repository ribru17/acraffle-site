let title = document.getElementsByClassName("acraffleTitle")[0]
let dropdown = document.getElementById("dropdown")
let isShown = false
dropdown.style.width = title.getBoundingClientRect().width + "px"

for (let i = 0, l = dropdown.children.length; i < l; i++) {
	dropdown.children[i].addEventListener('click', () => {
		if (window.location.pathname !== dropdown.children[i].dataset.url) {
			window.location = dropdown.children[i].dataset.url
		}
	})
}

title.addEventListener('click', () => {
	let rect = dropdown.children[0].getBoundingClientRect()
	let margin = parseInt(window.getComputedStyle(dropdown.children[0]).getPropertyValue("margin-top"))
	let height = parseInt(rect.height)
	let totalHeight = (margin + height) * dropdown.children.length + margin
	if (isShown) {
		dropdown.style.height = "0px"
		dropdown.style.borderBottomLeftRadius = '0px'
		dropdown.style.borderBottomRightRadius = '0px'
		isShown = false
	} else {
		dropdown.style.height = `${totalHeight.toString()}px`
		dropdown.style.borderBottomLeftRadius = '15px'
		dropdown.style.borderBottomRightRadius = '15px'
		isShown = true
	}
})

window.addEventListener('click', (e) => {
	if (!event.target.matches('.acraffleTitle') && !event.target.matches('#menusvg')) {
		dropdown.style.height = "0px"
		dropdown.style.borderBottomLeftRadius = '0px'
		dropdown.style.borderBottomRightRadius = '0px'
		isShown = false
	}
})