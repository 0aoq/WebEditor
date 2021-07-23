let id = window.location.search.slice(1) || window.localStorage.getItem("currentFile")

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
        if (lang === "application/x-javascript" || lang === "js") {
            action$(false, true, `Expanded language type from "${lang}" to "javascript"`)
            lang = "javascript"
        } else if (lang === "application/x-typescript" || lang === "ts") {
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
            openFile(name, lang)
        }

        WORKER__MAIN_CHECKS()
        WORKER__FILE_LOADING()
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

const getGeneratedPageURL = ({ html, css, js, md }) => {
        const getBlobURL = (code, type) => {
            const blob = new Blob([code], { type })
            return URL.createObjectURL(blob)
        }

        const cssURL = getBlobURL(css, 'text/css')
        const jsURL = getBlobURL(js, 'text/javascript')
        const mdURL = getBlobURL(md, 'text/md')

        let add_md = null

        if (md) {
            add_md = `<script type="module" src="https://cdn.jsdelivr.net/gh/zerodevx/zero-md@2/dist/zero-md.min.js"></script>
<zero-md src="${mdURL}"></zero-md>`
        }

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
    ${add_md || ''}
    ${js && `<script src="${jsURL}"></script>`}
    </body>
</html>
`

    return getBlobURL(source, 'text/html')
}

export const loadPreviewFile = function() {
    // run file preview
    let $settings

    try {
        $settings = JSON.parse(window.localStorage.getItem("project_settings.json"))
    } catch(err) {
        openFile('project_settings.json', 'json')
        console.error(err)
    }

    const $files = $settings[0].files

    let html = false
    let documentRender = false

    let url = {
        'html': '',
        'css': '',
        'js': '',
        'md': ''
    }

    for (let file of $files) {
        if (file.type == "stylesheet") {
            url.css += `${window.localStorage.getItem(file.name)}\n// ============================ //\n`
        } else if (file.type == "script") {
            url.js += `${window.localStorage.getItem(file.name)}\n/* ============================ */\n`
        } else if (file.type == "document") {
            documentRender = true
            let switchCode = `<script>
    setTimeout(() => {
        function query(__element) {
            document.querySelectorAll(__element).forEach(function(element) {
                function action() {
                    element.href = "javascript://"
                    element.addEventListener('click', () => {
                        document.querySelectorAll("document").forEach(function(element) {
                            element.style.display = "none"
                        })
        
                        document.getElementById("file:///${file.name}").style.display = "block"
                    })
                }

                if (element.href === "${file.name}") {
                    action()
                } else if (__element == "button") {
                    action()
                }
            })
        }
        
        query("a"); query("button")
    }, 100)
</script>`
            if (html) {
                url.html += `
<document id="file:///${file.name}" style="display: none;">
${window.localStorage.getItem(file.name)}
${switchCode}
</document>\n<!-- ============================ -->\n`
            } else {
                html = true
                url.html += `
<document id="file:///${file.name}" style="display: block;">
${window.localStorage.getItem(file.name)}
${switchCode}
</document>\n<!-- ============================ -->\n`
            }
        } else if (file.type == "markdown") {
            documentRender = true
            url.md += `${window.localStorage.getItem(file.name)}\n<!-- ============================ -->\n`
        }
    }

    if (!documentRender) {
        url.md += `# Project Run Preview
Project run preview is currently only supported for HTML projects. To create a project with preview support, try the example on the
[github](https://github.com/0aoq/ubiquitous-engine/tree/main/examples/multiple-page-html-preview).

Below is a list of supported file types for the HTML preview and their file extensions:
- document (html)
- stylesheet (css)
- script (js)`
    }

    url = getGeneratedPageURL(url)

    previewIframe(url)
    loadPreview()
}

let run = false
export const WORKER__MAIN_CHECKS = function() {
    if (window.localStorage.getItem("project_settings.json") && !run) {
        run = true
        editor.addAction({
            id: "run-files",
            label: "Run Project",
            contextMenuOrder: 1,
            contextMenuGroupId: "filesystem",
            keybindings: [
                monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KEY_R,
            ],
            run: function() {
                window.sessionStorage.setItem("previewopen", true)
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
                window.sessionStorage.setItem("previewopen", false)
                window.location.reload()
            }
        })
    }
    
    // settings file
    if (window.localStorage.getItem("settings.json") == null) {
        loadFile(`[
    {
        "minimapEnabled": true,
        "addFilesToContextMenu": true,
        "topbarEnabled": true
    }
]`, "json", "settings.json", false, false)
        window.location.reload()
    } else {
        const settings = JSON.parse(window.localStorage.getItem("settings.json"))[0]
    
        if (settings) {
            settings.minimapEnabled = settings.minimapEnabled || true
            settings.topbarEnabled = settings.topbarEnabled || true
            settings.addFilesToContextMenu = settings.addFilesToContextMenu || true
    
            editor.updateOptions({
                minimap: {
                    enabled: settings.minimapEnabled
                }
            })
    
            if (!settings.topbarEnabled) {
                document.getElementById("titlebar").style.display = "none"
            }
    
            addFilesToContextMenu = settings.addFilesToContextMenu
        }
    }
    
    // preview updates
    /* let lastTyped = 0
    let lastUpdated = 0
    
    if (window.sessionStorage.getItem("previewopen") != null && window.sessionStorage.getItem("previewopen") == "true") {
        loadPreviewFile()
    
        editor.onDidChangeModelContent(() => { // update preview on input
            lastTyped++
            if (window.sessionStorage.getItem("previewopen") != null && window.sessionStorage.getItem("previewopen") == "true") {
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
    } */
}

// file opening/deletion

let __indexed = []

function WORKER__FILE_LOADING() {
    if (window.localStorage.getItem("fileactions") != null) {
        for (let action of JSON.parse(window.localStorage.getItem("fileactions"))) {
            if (!__indexed.includes(action.name) && action.active == true) {
                __indexed.push(action.name)
                if (action.addToContext == true && addFilesToContextMenu == true) {
                    editor.addAction({
                        id: action.id,
                        label: action.label,
                        contextMenuOrder: 2,
                        contextMenuGroupId: "filesystem",
                        run: function() {
                            openFile(action.name, action.lang)
                        }
                    })
                } else {
                    editor.addAction({
                        id: action.id,
                        label: action.label,
                        run: function() {
                            openFile(action.name, action.lang)
                        }
                    })
                }

                const reservedFiles = ['settings.json']
                if (!reservedFiles.includes(action.name)) {
                    editor.addAction({
                        id: "delete-file-" + action.id.split("open-file-")[1],
                        label: "Delete " + action.label.split("Open ")[1],
                        run: function() {
                            if (id != action.name) {
                                if (action.name == "project_settings.json") {
                                    window.sessionStorage.setItem("previewopen", false)
                                }

                                window.localStorage.removeItem(action.name)

                                const parsed = JSON.parse(window.localStorage.getItem("fileactions"))

                                for (let __$ of parsed) {
                                    if (__$.name == action.name) {
                                        __$.active = false
                                        __$.name = ""
                                        __$.id = ""
                                        __$.label = ""
                                    }
                                }

                                window.localStorage.setItem("fileactions", JSON.stringify(parsed))

                                window.location.reload()
                            } else {
                                alert("Cannot delete current file.")
                            }
                        }
                    })
                }
            }
        }
    }

    if (id) {
        if (id.split('.').includes('js') || id.split('.').includes('ts')) {
            function js_snippet(name, snippet) {
                editor.addAction({
                    id: `'js-snippet-${name.toLowerCase().replaceAll(' ', '-')}'`,
                    label: `JS Snippet: ${name}`,
                    run: function() {
                        insertCode(snippet)
                    }
                })
            }

            js_snippet('Insert For Loop', `for (let i = 0; i < 10; i++) {
    // do whatever
}`)
        }
    }
}

function insertCode(code) {
    editor.executeEdits("editorMain", [
        { 
            identifier: { 
                major: 1, 
                minor: 1 
            }, 
            range: editor.getSelection(), 
            text: code, 
            forceMoveMarkers: true 
        }
    ])
}

export async function openFile (name, type) {
    if (window.localStorage.getItem(name)) {
        window.localStorage.setItem("currentFile", name)
        document.getElementById("currentFile").innerText = name
        document.title = `${name} - Monaco Test`
        editor.setValue(window.localStorage.getItem(name))
        monaco.editor.setModelLanguage(editor.getModel(), type)
        id = window.location.search.slice(1) || window.localStorage.getItem("currentFile")
        action$(false, false, `Updated content of editor to the requested file`)
        action$(false, false, `Changed language to ${type}`)
        WORKER__MAIN_CHECKS()
        WORKER__FILE_LOADING()
    } else {
        loadFile("This is a new file!", name.split(".")[name.split(".").length - 1], name, true, true)
    }
}

if (window.localStorage.getItem("fileactions") == null) {
    window.localStorage.setItem("fileactions", JSON.stringify([]))
}

// run options
if (id && window.localStorage.getItem("fileactions") != null) {
    for (let action of JSON.parse(window.localStorage.getItem("fileactions"))) {
        if (action.name == id) {
            openFile(action.name, action.lang)
        }
    }
}

// extra titlebar buttons
document.querySelectorAll("a").forEach((element) => {
    if (element.getAttribute("data-file")) {
        const extensions = element.getAttribute("data-file").split(".")

        element.addEventListener('click', () => {
            openFile(element.getAttribute("data-file"), extensions[extensions.length - 1])
        })
    }
})

export default {
    file_reader__readFile,
    file_reader__writeFile,
    action$,
    loadPreviewFile,
    addFilesToContextMenu,
    openFile,
    WORKER__MAIN_CHECKS
}