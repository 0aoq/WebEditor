import * as files from './content/files.js'

const actions = [{
    id: "reload",
    label: "Reload Page",
    contextMenuOrder: 0,
    contextMenuGroupId: "browser-operation",
    keybindings: [
        // eslint-disable-next-line no-bitwise
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_R,
    ],
    run: function() {
        window.location.reload()
    },
}, {
    id: "load-document",
    label: "Load Document",
    contextMenuOrder: 0,
    contextMenuGroupId: "file-operation",
    keybindings: [
        // eslint-disable-next-line no-bitwise
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_L,
    ],
    run: function() {
        files.file_reader__readFile()
    },
}, {
    id: "write-document",
    label: "Prompt Save File",
    contextMenuOrder: 0,
    contextMenuGroupId: "file-operation",
    keybindings: [
        // eslint-disable-next-line no-bitwise
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_S,
    ],
    run: function() {
        files.file_reader__writeFile(editor.getValue())
    },
}, {
    id: "write-local",
    label: "Write Local File",
    contextMenuOrder: 0,
    contextMenuGroupId: "file-operation",
    keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KEY_S,
    ],
    run: function() {
        editor.getValue().split(/\r?\n/).forEach((line) => {
            line = line.replaceAll("    ", "")
            if (line.split(": ")[0] === `"localSaveAs`) {
                console.log("localSaveAs tag found")
                files.loadFile(editor.getValue(), editor.getModel().getLanguageIdentifier().language, line.split(": ")[1].split('"')[0])
            }
        })
    },
}, {
    id: "clear-local-storage",
    label: "Clear Files",
    contextMenuOrder: 0,
    contextMenuGroupId: "file-operation",
    keybindings: [
        // eslint-disable-next-line no-bitwise
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_C,
    ],
    run: function() {
        window.localStorage.setItem("currentFile", null)
        window.localStorage.setItem("previewopen", false)

        for (let action of JSON.parse(window.localStorage.getItem("fileactions"))) {
            window.localStorage.removeItem(action.name)
        }

        window.localStorage.removeItem("fileactions")
        window.localStorage.setItem("filesint", 0)
        window.location.reload()
    },
}, {
    id: "open-blank",
    label: "Create New",
    contextMenuOrder: 0,
    contextMenuGroupId: "filesystem",
    keybindings: [
        // eslint-disable-next-line no-bitwise
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_N,
    ],
    run: function() {
        let name = 'Untitled',
            type = 'plaintext'
        window.localStorage.setItem("currentFile", name)
        document.getElementById("currentFile").innerText = name
        document.title = `Untitled - [0aoq/WebEditor]`
        editor.setValue(window.localStorage.getItem(name) || '')
        monaco.editor.setModelLanguage(editor.getModel(), type)
        action$(false, false, `Updated content of editor to the requested file`)
        action$(false, false, `Changed language to ${type}`)
        files.WORKER__MAIN_CHECKS()
        files.WORKER__FILE_LOADING()
    },
}, {
    id: "create-terminal",
    label: "Create Terminal",
    contextMenuOrder: 0,
    contextMenuGroupId: "xterm",
    keybindings: [
        // eslint-disable-next-line no-bitwise
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KEY_T,
    ],
    run: function() {
        createTerminal()
    },
}, {
    id: "create-project",
    label: "Create Project Settings File",
    run: function() {
        files.loadFile(`[
    {
        "files": [
            {
                "name": "index.html",
                "type": "document"
            },
            {
                "name": "styles.css",
                "type": "stylesheet"
            },
            {
                "name": "index.js",
                "type": "script"
            }
        ]
    }
]`, "json", "project_settings.json", true, false)
    },
}]

for (let action of actions) {
    editor.addAction(action)
}