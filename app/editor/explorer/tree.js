/*=========================================*
 * AUTO ICON SERVICE                       *
 *=========================================*/

const fileIcons = [
    { extension: "js", icon: "logo-javascript" },
    { extension: "jsx", icon: "logo-react" },
    { extension: "css", icon: "logo-css3" },
    { extension: "html", icon: "logo-html5" },
    { extension: "md", icon: "logo-markdown" },
    { extension: "py", icon: "logo-python" },
    { extension: "mjs", icon: "logo-nodejs" },
    { extension: "ts", icon: "logo-javascript" },

    { extension: "npmignore", icon: "logo-npm" },
    { extension: "gitignore", icon: "git-branch-outline" },

    { extension: "sh", icon: "terminal" },
    { extension: "cmd", icon: "terminal" },
    { extension: "bash", icon: "terminal" },

    { extension: "none", icon: "document-text-outline" },
]

const getFileIcon = function(extension) {
    for (let datapoint of fileIcons) {
        if (datapoint.extension === extension) {
            return datapoint.icon
        }
    }

    return fileIcons[fileIcons.length - 1].icon
}

/*=========================================*
 * MAIN EXPLORER SERVICE                   *
 *=========================================*/

window.explorer = {
    createOptionNode: function(name, __id, canDelete, padding = 28) {
        const datapoint = {
            name: name,
            __id: __id,
            fullName: name
        }

        const $array1 = datapoint.name.split(".")
        const extension = $array1[$array1.length - 1]

        function __canDelete() {
            if (canDelete) { return `canDeleteFile` } else { return `` }
        }

        datapoint.name = window.explorer.splitPath(name).fileName

        return {
            html: `<li class="explorer-option" style="padding-left: ${padding + "px" || "0"} !important;" id="wrapper:${datapoint.__id || 0}">
            <a data-file="${datapoint.fullName}" id="button:${datapoint.__id || 0}">
                <ion-icon name="${getFileIcon(extension)}"></ion-icon>
                <span class="isFileName ${__canDelete()}" id="label:${datapoint.__id || 0}">${datapoint.name}</span>
            </a>`,
            id: `button:${datapoint.__id || 0}`
        }
    },
    createDirectory: function(parent, name, content, padding = 15, addLine = true, insertWhere = `beforeend`) {
        function __addLine() {
            if (addLine) { return `<div style="border-bottom: 1px solid rgba(185, 185, 185, 0.192);"></div>` } else { return `` }
        }

        function __addLine1() {
            if (addLine) { return `<summary>
                    <li class="explorer-outside-item" style="display: flex; padding-left: ${padding + "px" || "15px"};">
                        <ion-icon name="folder"></ion-icon>
                        <span>${name}</span>
                    </li>
                </summary>` } else {
                return `<summary style="border-bottom: none !important;">
                    <li class="explorer-outside-item" style="display: flex; padding-left: ${padding + "px" || "15px"};">
                        <ion-icon name="folder"></ion-icon>
                        <span>${name}</span>
                    </li>
                </summary>`
            }
        }

        parent.insertAdjacentHTML(insertWhere, `<li class="explorer-outside-item">
        <details id="tempid">
            ${__addLine1()}
            <div id="${name}">${content}</div>
            ${__addLine()}
        </details>
    </li>`)

        const div = document.getElementById("tempid")
        return div
    },
    renderExplorer: function(files) {
        let defaultPadding = 15
        document.getElementById("fileList").innerHTML = ""

        for (let datapoint of files) {
            if (datapoint.active && datapoint.name !== "settings.json") {
                if (datapoint.folders) {
                    let NEXT_FOLDER_PADDING_ADD = 5 // the amount to add to the padding of the NEXT folder rendered

                    for (let folder of datapoint.folders) {
                        // calculate the padding
                        let padding = defaultPadding + ((datapoint.folders.indexOf(folder) * 10) + 10) - 3

                        // find parent node
                        let parent
                        if (datapoint.folders.indexOf(folder) > 0) {
                            parent = document.getElementById(datapoint.folders[datapoint.folders.indexOf(folder) - 1]) // the folder just before
                        } else { parent = document.getElementById("fileList") }

                        // calculate extra padding
                        for (let i = 1; i < 100; i++) {
                            if (
                                parent === document.getElementById(
                                    datapoint.folders[datapoint.folders.indexOf(folder) - i]
                                )
                            ) {
                                padding += i * 5
                                if (padding !== 37) {
                                    padding += NEXT_FOLDER_PADDING_ADD
                                    NEXT_FOLDER_PADDING_ADD += 5
                                }
                            }
                        }

                        if (padding < 25) { padding = 25 } // align first folder

                        // remove extra nodes with same id
                        if (document.getElementById(`wrapper:${datapoint.__id}`)) { document.getElementById(`wrapper:${datapoint.__id}`).remove() }

                        // create folder
                        let button = window.explorer.createOptionNode(datapoint.name, datapoint.__id, true, padding + 15)
                        if (!document.getElementById(folder)) {
                            const $div = window.explorer.createDirectory(
                                parent,
                                folder,

                                // create option
                                `
                                    ${button.html}
                                `,

                                padding,
                                false,
                                "afterbegin"
                            )

                            setTimeout(() => {
                                setOpenValue($div)
                            }, 100);
                        } else {
                            // add file to folder if it already exists
                            document.getElementById(folder).innerHTML +=
                                button.html
                        }
                    }
                } else {
                    // create normal file
                    let padding = defaultPadding + 10
                    document.getElementById("fileList").innerHTML +=
                        window.explorer.createOptionNode(datapoint.name, datapoint.__id, true, padding).html
                }
            }
        }
    },
    getFileIcon: getFileIcon,
    splitPath: function(string) {
        const ____ = string.split("/")
        const file = ____[____.length - 1] // the last item should always be the file

        let paths = []
        for (let path of ____) { if (path !== file) { paths.push(path) } }
        if (!paths[0]) { paths = null }

        return {
            paths: paths,
            fileName: file
        }
    }
}

// quick functions for session storage
const $get = function(key) { return window.sessionStorage.getItem(key) }
const $set = function(key, value) { return window.sessionStorage.setItem(key, value) }

// Folder/directory icon (open and close)

let __details_index = 0
let __indexed_details = []

const toBool = function(string) {
    return string === "true"
}

const setOpenValue = function(element) {
    let get = $get(`tree.open>${element.id}`)
    if (get !== null && !toBool(get)) {
        $set(`tree.open>${element.id}`, false)
        console.log("Set empty details list to false.")
    } else {
        const icon = document.querySelector(`details#${element.id} ion-icon`)
        if (toBool(get) === true) { element.setAttribute("open", "") } else { element.removeAttribute("open") }
        if (icon) { icon.setAttribute("name", "folder-open") }
    }
}

setTimeout(() => {
    document.querySelectorAll("details").forEach((element) => {
        setOpenValue(element)
    })
}, 1000);

setInterval(() => {
    document.querySelectorAll("details").forEach((element) => {
        if (!__indexed_details.includes(element)) {
            __details_index++
            element.id = "detailsList-" + __details_index
            storage.push(element.id)
            __indexed_details.push(element)
        }
    })

    document.querySelectorAll("details").forEach((element) => {
        document.querySelector(`details#${element.id} ion-icon`).setAttribute("name", "folder") // closed icon

        if (element.getAttribute("open") === "") {
            $set(`tree.open>${element.id}`, true)
            document.querySelector(`details[open]#${element.id} ion-icon`).setAttribute("name", "folder-open")

            element.addEventListener("click", () => {
                $set(`tree.open>${element.id}`, false)
            })
        }
    })

    // reset list
    __details_index = 0
    __indexed_details = []
}, 100);