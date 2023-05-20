import NavigationMenu from './nav.js'

const navToggleButton = document.querySelector(".mobile-nav-toggle")
const navMenu = document.querySelector("#primary-navigation")

new NavigationMenu(navMenu, navToggleButton)
