import * as files from './content/files.js'
import * as utility from './content/utility.js'

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
    label: "Write Document to File",
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
        window.location.href = "?"
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
        window.location.href = "?"
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
]`, "json", "project_settings.json")
    },
}]

for (let action of actions) {
    editor.addAction(action)
}

// file opening/deletion

const id = window.localStorage.getItem('currentFile')

if (window.localStorage.getItem("fileactions") != null) {
    for (let action of JSON.parse(window.localStorage.getItem("fileactions"))) {
        if (action.active == true) {
            if (action.addToContext == true && files.addFilesToContextMenu == true) {
                editor.addAction({
                    id: action.id,
                    label: action.label,
                    contextMenuOrder: 2,
                    contextMenuGroupId: "filesystem",
                    run: function() {
                        window.localStorage.setItem("currentFile", action.name)
                        editor.setValue(window.localStorage.getItem(action.name))
                        monaco.editor.setModelLanguage(editor.getModel(), action.lang);
                    }
                })
            } else {
                editor.addAction({
                    id: action.id,
                    label: action.label,
                    run: function() {
                        window.localStorage.setItem("currentFile", action.name)
                        editor.setValue(window.localStorage.getItem(action.name))
                        monaco.editor.setModelLanguage(editor.getModel(), action.lang);
                        // window.location.href = "?" + action.name
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
                                window.localStorage.setItem("previewopen", false)
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
                        } else {
                            alert("Cannot delete current file.")
                        }
                    }
                })
            }
        }
    }
}