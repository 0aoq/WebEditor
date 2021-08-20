// Context Menu

const menu = document.querySelector(".context-menu");
let menuVisible = false;

const toggleMenu = command => {
    menu.style.display = command === "show" ? "block" : "none";
    menuVisible = !menuVisible;
};

const setPosition = ({
    top,
    left
}) => {
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    toggleMenu("show");
};

window.addEventListener("mousedown", e => {
    if (menuVisible) setTimeout(() => {
        toggleMenu("hide")
    }, 50);;
});

window.addEventListener("contextmenu", e => {
    e.preventDefault();
    if (!e.target.classList.contains("view-lines") &&
        !e.target.classList.contains("view-line")
    ) {
        document.querySelector(".menu-options").innerHTML = ""

        document.querySelector(".menu-options").insertAdjacentHTML("beforeend", `
<li class="menu-option onhover shadow" context-action="history-back">Back</li>
<li class="menu-option onhover shadow" onclick="window.location.reload()">Reload</li>
        `)

        if (e.target.classList.contains("isFileName")) {
            document.querySelector(".menu-options").insertAdjacentHTML("beforeend", `
<li class="menu-option onhover shadow" onmousedown="renameFile('${e.target.innerText}', '${e.target.id}')">Rename</li>
            `)
        }

        const origin = {
            left: e.pageX,
            top: e.pageY
        };
        setPosition(origin);
    }

    return false;
});