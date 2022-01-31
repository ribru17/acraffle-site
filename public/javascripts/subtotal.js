const subtotal = document.getElementById("subtotal")
const amount = document.getElementById("amount")

amount.addEventListener("keyup", () => {
	let val = amt.value
	if (val.indexOf('e') != -1 || val === '') {
		subtotal.innerText = 'Please enter a valid value.'
		return
	}
	subtotal.innerText = `Subtotal: $${amt.value}.00`
})