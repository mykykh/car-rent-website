export default class NavigationMenu {
    constructor(navElement, toggleElement) {
        this.navElement = navElement
        this.toggleElement = toggleElement


        this.toggleElement.addEventListener("click", () => {
            const visibility = this.navElement.getAttribute("data-visible")

            this.navElement.setAttribute("data-visible", !(visibility === "true"))
            this.toggleElement.setAttribute("data-visible", !(visibility === "true"))
        })
    }
}
