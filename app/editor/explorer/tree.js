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
    createOptionNode: function(name, __id, canDelete) {
        const datapoint = {
            name: name,
            __id: __id
        }

        const $array1 = datapoint.name.split(".")
        const extension = $array1[$array1.length - 1]

        function __canDelete() {
            if (canDelete) { return `
        <a href="javascript:" class="glow-btn" data-delete-file="${datapoint.name}"><ion-icon name="close-circle-outline"></ion-icon></a>` } else {
                return ``
            }
        }

        return `<li class="explorer-option" style="padding-left: 50px;" id="wrapper:${datapoint.__id || 0}">
        <a data-file="${datapoint.name}" id="button:${datapoint.__id || 0}">
            <ion-icon name="${getFileIcon(extension)}"></ion-icon>
            <span class="isFileName" id="label:${datapoint.__id || 0}">${datapoint.name}</span>
            ${__canDelete()}
        </a>`
    },
    createDirectory: function(parent, name, content) {
        parent.innerHTML += `<li class="explorer-outside-item">
        <!-- Files -->
        <details>
            <summary>
                <li class="explorer-outside-item" style="display: flex; padding-left: 25px;">
                    <ion-icon name="folder"></ion-icon>
                    <span>${name}</span>
                </li>
            </summary>

            ${content}

            <div style="border-bottom: 1px solid rgba(185, 185, 185, 0.192);"></div>
        </details>
    </li>`
    },
    renderExplorer: function(files) {
        document.getElementById("fileList").innerHTML = ""

        for (let datapoint of files) {
            if (datapoint.active && datapoint.name !== "settings.json") {
                document.getElementById("fileList").innerHTML +=
                    window.explorer.createOptionNode(datapoint.name, datapoint.__id, true)
            }
        }
    },
    getFileIcon: getFileIcon
}

// Folder/directory icon (open and close)

let __details_index = 0
let __indexed_details = []

setInterval(() => {
    document.querySelectorAll("details").forEach((element) => {
        if (!__indexed_details.includes(element)) {
            __details_index++
            element.id = "detailsList-" + __details_index
            __indexed_details.push(element)
        }
    })

    document.querySelectorAll("details").forEach((element) => {
        document.querySelector(`details#${element.id} ion-icon`).setAttribute("name", "folder") // closed icon

        const openIcon = document.querySelector(`details[open]#${element.id} ion-icon`)
        if (openIcon) { openIcon.setAttribute("name", "folder-open") }
    })
}, 0.0001);