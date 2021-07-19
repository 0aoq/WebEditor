export const action$ = function(failed, side, action) {
    if (side) {
        if (failed) {
            console.warn(`[Side Action Failed] ${action}`)
        } else {
            console.log(`[Side Action Success] ${action}`)
        }
    } else {
        if (failed) {
            console.warn(`[Action Failed] ${action}`)
        } else {
            console.log(`[Action Success] ${action}`)
        }
    }
}

export let addFilesToContextMenu = true

function testLang(lang) {
    if (
        lang == "video/mp4" ||
        lang == "video/webm" ||
        lang == "video/mov" ||
        lang == "image/png" ||
        lang == "image/jpg" ||
        lang == "image/jpeg"
    ) {
        return false
    } else {
        return true
    }
}

let currentFileLanguage

export const loadFile = function(content, lang, name, addToContext = true, autoswitch = true) {
    if (testLang(lang)) {
        if (lang == "application/x-javascript") {
            action$(false, true, `Expanded language type from "${lang}" to "javascript"`)
            lang = "javascript"
        } else if (lang == "application/x-typescript") {
            action$(false, true, `Expanded language type from "${lang}" to "typescript"`)
            lang = "typescript"
        }

        const parsed = JSON.parse(window.localStorage.getItem("fileactions"))

        if (window.localStorage.getItem(name) == null) {
            parsed.push({
                id: "open-file-" + name.replaceAll(".", ""),
                label: "Open " + name,
                name: name,
                lang: lang,
                active: true,
                addToContext: addToContext
            })

            window.localStorage.setItem(name, content)
            window.localStorage.setItem("fileactions", JSON.stringify(parsed))
        }

        if (autoswitch) {
            window.location.href = "?" + name
        }
    } else {
        editor.getModel().setValue("ERROR: File type is not supported.")
        monaco.editor.setModelLanguage(editor.getModel(), "plaintext");
        action$(true, false, `Unsupported file type detected`)
    }
}

export const file_reader__readFile = function() { // load files
    let input = document.createElement('input')
    input.type = 'file'
    input.multiple = 'multiple'

    input.onchange = e => {
        for (let file of e.target.files) {
            let reader = new FileReader();
            reader.readAsText(file, 'UTF-8');

            reader.onload = readerEvent => {
                let content = readerEvent.target.result

                let lang = file.type
                currentFileLanguage = file.type

                document.title = `${file.name} - Monaco Test`
                loadFile(content, lang, file.name, addFilesToContextMenu, true)
            }
        }
    }

    input.click();
}

export const file_reader__writeFile = function(content) {
    var blob = new Blob([content], { type: currentFileLanguage })
    var anchor = document.createElement("a")
    anchor.download = "demo.txt"
    anchor.url = window.URL.createObjectURL(blob)
    anchor.click()
}

const getGeneratedPageURL = ({ html, css, js }) => {
        const getBlobURL = (code, type) => {
            const blob = new Blob([code], { type })
            return URL.createObjectURL(blob)
        }

        const cssURL = getBlobURL(css, 'text/css')
        const jsURL = getBlobURL(js, 'text/javascript')

        const source = `
<!DOCTYPE html>
<html lang="en">

<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    ${css && `<link rel="stylesheet" type="text/css" href="${cssURL}" />`}
</head>
<body>
    ${html || ''}
    ${js && `<script src="${jsURL}"></script>`}
    </body>
</html>
`

    return getBlobURL(source, 'text/html')
}

export const loadPreviewFile = function() {
    // run file preview
    const $settings = JSON.parse(window.localStorage.getItem("project_settings.json"))
    const $files = $settings[0].files

    let url = {
        'html': '',
        'css': '',
        'js': ''
    }

    for (let file of $files) {
        if (file.type == "stylesheet") {
            url.css += `${window.localStorage.getItem(file.name)}// ============================ //\n`
        } else if (file.type == "script") {
            url.js += `${window.localStorage.getItem(file.name)}/* ============================ */\n`
        } else if (file.type == "document") {
            url.html = `${window.localStorage.getItem(file.name)}<!-- ============================ -->\n`
        }
    }

    url = getGeneratedPageURL(url)

    previewIframe(url)
    loadPreview()
}

export default {
    file_reader__readFile,
    file_reader__writeFile,
    action$,
    loadPreviewFile,
    addFilesToContextMenu
}

if (window.localStorage.getItem("fileactions") == null) {
    window.localStorage.setItem("fileactions", JSON.stringify([]))
}

const id = window.location.search.slice(1)

if (id && window.localStorage.getItem("fileactions") != null) {
    for (let action of JSON.parse(window.localStorage.getItem("fileactions"))) {
        if (action.name == id) {
            editor.setValue(window.localStorage.getItem(action.name))
            monaco.editor.setModelLanguage(editor.getModel(), action.lang)
            action$(false, false, `Updated content of editor to the requested file`)
            action$(false, false, `Changed language to ${action.lang}`)
        }
    }
}

if (window.localStorage.getItem("project_settings.json")) {
    editor.addAction({
        id: "run-files",
        label: "Run Project",
        contextMenuOrder: 1,
        contextMenuGroupId: "filesystem",
        keybindings: [
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KEY_R,
        ],
        run: function() {
            window.localStorage.setItem("previewopen", true)
            loadPreviewFile()
        }
    })

    editor.addAction({
        id: "end-run-files",
        label: "End Project Run Process",
        contextMenuOrder: 1,
        contextMenuGroupId: "filesystem",
        keybindings: [
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KEY_R,
        ],
        run: function() {
            window.localStorage.setItem("previewopen", false)
            window.location.reload()
        }
    })
}

if (window.localStorage.getItem("settings.json") == null) {
    loadFile(`[
    {
        "minimapOpen": true,
        "addFilesToContextMenu": true
    }
]`, "json", "settings.json", false)
    window.location.reload()
} else {
    const settings = JSON.parse(window.localStorage.getItem("settings.json"))[0]

    if (settings) {
        editor.updateOptions({
            minimap: {
                enabled: settings.minimapOpen
            }
        })

        addFilesToContextMenu = settings.addFilesToContextMenu
    }
}

let lastTyped = 0
let lastUpdated = 0

if (window.localStorage.getItem("previewopen") != null && window.localStorage.getItem("previewopen") == "true") {
    loadPreviewFile()

    editor.onDidChangeModelContent(() => { // update preview on input
        lastTyped++
        if (window.localStorage.getItem("previewopen") != null && window.localStorage.getItem("previewopen") == "true") {
            let open = true
            setInterval(() => {
                if (lastTyped >= 1) {
                    lastUpdated++
                }
            }, 1000);

            setTimeout(() => { 
                if (lastTyped >= 1 && open == true && lastUpdated > 5) {
                    if (lastUpdated > 0) {
                        lastTyped = 0
                        loadPreviewFile()
                        lastUpdated = 0
                    }
                }

                open = false
            }, 2000);
        }
    })
}