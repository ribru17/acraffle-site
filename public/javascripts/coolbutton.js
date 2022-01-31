let coolButton = document.getElementsByClassName("coolButton")[0]
coolButton.addEventListener('click', (e) => {
	let relX = e.offsetX
	let relY = e.offsetY
	let span = coolButton.getElementsByTagName('span')[0]
	span.style.top = relY + "px"
	span.style.left = relX + "px"
	let width = coolButton.getBoundingClientRect().width
	span.style.width = (width * 2) + "px"
	span.style.height = (width * 2) + "px"
	coolButton.style.color = 'black'
	setTimeout(() => {
		span.style.width = "0px"
		span.style.height = "0px"
		coolButton.style.color = 'white'
	}, 1000)
})