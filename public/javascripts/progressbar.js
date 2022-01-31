let navbar = document.getElementsByClassName("navigationBar")[0]
let navbarHeight = parseInt(window.getComputedStyle(navbar).getPropertyValue("padding-top")) + parseInt(window.getComputedStyle(navbar).getPropertyValue("padding-bottom")) + parseInt(window.getComputedStyle(navbar).getPropertyValue("height")) //total height of navigation bar (actual height + top padding + bottom padding)

let progressbarcont = document.getElementById("progressbarcont")
progressbarcont.style.top = navbarHeight + "px"
let progressbar = document.getElementById("progressbar")
progressbar.style.top = navbarHeight + "px"

// updateProgress()

window.addEventListener("scroll", () => {
	updateProgress()
})

function updateProgress() {
  var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  var scrolled = (winScroll / height) * 100;
  progressbar.style.width = scrolled + "%";
}