let storage = []

monaco.editor.defineTheme('theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [{
        background: __('theme_gray_4')
    }],
    colors: {
        // Misc

        "foreground": __('theme_gray_10'),
        "focusBorder": __('theme_blue'),
        "contrastBorder": __('theme_gray_2'),
        "editorCursor.foreground": __('theme_blue'),
        "editorRuler.foreground": __('theme_gray_6'),
        "scrollbar.shadow": "#00000022",
        "tree.indentGuidesStroke": __('theme_gray_7'),
        "editorLink.activeForeground": __('theme_gray_10'),
        "selection.background": __('theme_gray_10'),
        "progressBar.background": __('theme_blue'),
        "textLink.foreground": __('theme_sky_blue'),
        "textLink.activeForeground": "#b2dfff",

        // Editor

        "editorLineNumber.foreground": __('theme_gray_6'),
        "editorLineNumber.activeForeground": __('theme_gray_7'),
        "editorBracketMatch.border": __('theme_blue'),
        "editorBracketMatch.background": __('theme_gray_4'),
        "editorWhitespace.foreground": __('theme_gray_1'),
        "editor.background": __('theme_gray_4'),
        "editor.foreground": __('theme_gray_10'),
        "editor.lineHighlightBackground": __('theme_gray_5'),
        "editor.selectionBackground": __('theme_gray_7'),
        "editor.selectionHighlightBackground": __('theme_gray_6'),
        "editor.findMatchBackground": __('theme_gray_6'),
        "editor.findMatchBorder": __('theme_cyan'),
        "editor.findMatchHighlightBackground": __('theme_gray_6'),

        "editorOverviewRuler.findMatchForeground": __('theme_cyan'),
        "editorOverviewRuler.errorForeground": __('theme_red'),
        "editorOverviewRuler.infoForeground": __('theme_sky_blue'),
        "editorOverviewRuler.warningForeground": __('theme_yellow'),
        "editorOverviewRuler.modifiedForeground": __('theme_blue'),
        "editorOverviewRuler.addedForeground": __('theme_green'),
        "editorOverviewRuler.deletedForeground": __('theme_light_red'),
        "editorOverviewRuler.bracketMatchForeground": __('theme_dark_blue'),
        "editorOverviewRuler.border": __('theme_gray_4'),

        "editorHoverWidget.background": "#1b1d2c",
        "editorHoverWidget.border": "#000000aa",

        "editorIndentGuide.background": __('theme_gray_6'),
        "editorIndentGuide.activeBackground": __('theme_gray_7'),

        "editorGroupHeader.tabsBackground": __('theme_gray_3'),
        "editorGroup.border": __('theme_gray_2'),

        "editorGutter.modifiedBackground": __('theme_blue'),
        "editorGutter.addedBackground": __('theme_green'),
        "editorGutter.deletedBackground": __('theme_dark_red'),

        // Context Menu
        "menu.background": __('theme_gray_3'),
        "menu.foreground": __('theme_gray_10'),
        "menu.selectionBackground": __('theme_gray_4'),
        "menu.selectionForeground": __('theme_sky_blue'),
        // "menu.selectionBorder": "#00000030",
        "menu.separatorBackground": __('theme_gray_10'),

        // misc
        "editorSuggestWidget.background": __('theme_gray_2'),
        "editorSuggestWidget.foreground": __('theme_gray_8'),
        "editorSuggestWidget.highlightForeground": __('theme_cyan'),
        "editorSuggestWidget.selectedBackground": __('theme_gray_5'),
        "editorSuggestWidget.border": "#00000033",
        "editorWidget.background": __('theme_gray_3'),
        "editorWidget.resizeBorder": __('theme_blue'),
        "input.background": __('theme_gray_2'),
        "input.foreground": __('theme_gray_10'),
        "input.placeholderForeground": __('theme_gray_10'),
        "input.border": "#00000066",
        "inputValidation.errorBackground": "#c53b53",
        "inputValidation.errorForeground": "#ffffff",
        "inputValidation.errorBorder": __('theme_dark_red'),
        "inputValidation.infoBackground": "#446bbb",
        "inputValidation.infoForeground": "#ffffff",
        "inputValidation.infoBorder": __('theme_blue'),
        "inputValidation.warningBackground": "#ad7c43",
        "inputValidation.warningForeground": "#ffffff",
        "inputValidation.warningBorder": __('theme_yellow'),
    }
})

if (window.location.href !== "https://0aoq.github.io/ubiquitous-engine/app/") {
    console.log("Emmet enabled!")
    emmetMonaco.emmetHTML()
    emmetMonaco.emmetCSS()
    emmetMonaco.emmetJSX()
}

let editor = monaco.editor.create(document.getElementById('editor'), {
    value: [
        'Welcome! Files can be loaded with "CTRL + SHIFT + L"',
        'Once a file is loaded, it can be selected through the context menu (RMB), or through the command palette (F1), just type "Open " and then the file name!'
    ].join('\n'),
    language: 'plaintext',
    theme: 'theme',
    fontSize: "14px",
    minimap: {
        enabled: false
    },
    dragAndDrop: true,
    automaticLayout: true,
    fontWeight: "525",
    formatOnType: true,
    formatOnPaste: true,
    autoClosingDelete: 'always',
});

const getLineCount = function() {
    // returns the full line count of the monaco editor
    let i = 0
    for (let _ of editor.getValue().split(/\r?\n/)) {
        i++
    }

    return i
}

// state save
editor.onDidChangeModelContent((event) => {
    const id = window.localStorage.getItem("currentFile")

    if (id) {
        if (window.localStorage.getItem("fileactions") != null) {
            for (let action of JSON.parse(window.localStorage.getItem("fileactions"))) {
                if (action.name == id) {
                    window.localStorage.setItem(action.name, editor.getValue())
                }
            }
        }
    }
})

// explorer
window.explorer.createDirectory(document.querySelector("#explorer details"), "Files", `<div id="fileList"></div>`) // create file system directory
window.explorer.createDirectory(document.querySelector("#explorer details"), "System Files", `<div>
    ${window.explorer.createOptionNode("settings.json", "label:settings.json-1", false).html}
</div>`) // create system files directory

// extra windows
const createTerminal = function() {
    document.getElementById("terminal").classList.add("active")
    document.getElementById("editor").classList.add("terminalActive")
    document.getElementById("terminal").style.background = __('theme_gray_3')
}

const loadPreview = function() {
    document.getElementById("preview").classList.add("active")
    document.getElementById("editor").classList.add("previewActive")
}

const previewIframe = function(url) {
    document.getElementById("preview-iframe").src = url
}

const updateBottomBar = function(name, extension) {
    // update the bottom bar on the page
    document.getElementById("bottombar").innerHTML = `<span style="background: #476685;"><ion-icon name="${window.explorer.getFileIcon(extension)}"></ion-icon></span>
    <span class="--editor-bottombar-info1">${name}</span> 
    <!-- #1: LINE NUMBER, #2: COLUMN NUMBER -->
    <span class="--editor-bottombar-info2">${editor.getPosition().lineNumber || 0}/${getLineCount() || 0}</span>
    <span class="--editor-bottombar-info2">${editor.getPosition().column || 0}</span>`
}

// files
const renameFile = function(file, id) {
    let ls = window.localStorage.getItem(file)
    document.getElementById(id).setAttribute("contenteditable", true)
    document.getElementById(`button:${id.split(":")[1]}`).removeAttribute("data-file")
}

const deleteFile1 = function(name) {
    let id = window.localStorage.getItem("currentFile")
    const action = { name: name }
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

// language options
const languages = [
    'javascript',
    'lua',
    'markdown',
    'plaintext',
    'css',
    'csharp',
    'html',
    'typescript',
    'cpp'
]

let currentLanguage = null

const detectLanguage = function() {
    for (let language of languages) {
        editor.getValue().split(/\r?\n/).forEach((line) => {
            line = line.replaceAll("    ", "")
            if (line == `"using: ${language}"`) {
                if (currentLanguage != language) {
                    monaco.editor.setModelLanguage(editor.getModel(), language)
                    console.log(`[Action Success] Changed language to ${language}`)
                    currentLanguage = language
                }
            }
        })
    }
}

editor.onDidChangeModelContent((event) => {
    detectLanguage()
})

setTimeout(() => {
    detectLanguage()
}, 1);