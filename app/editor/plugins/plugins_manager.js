// 0aoq/WebEditor plugin manager

window.checkSecurity = function(contents) {
    // file security
    const UNSAFE_TERMS = ["document", "body", "inner", "<", ">", "script", "class", "console", "alert"]
    const REQUIRED_TERMS = ["window.explorer.createDirectory", "window.explorer.newButton"]

    let match_terms = []
    let needed_terms = []

    for (let term of UNSAFE_TERMS) { if (contents.match(term)) { match_terms.push(term) } }
    for (let term of REQUIRED_TERMS) { if (!contents.match(term)) { needed_terms.push(term) } }

    return {
        match: match_terms,
        needed: needed_terms,
        return: `Failed to create plugin: Unsafe file! File contains unsafe characters: \n\n${JSON.stringify(match_terms)}
        \nAnd does not contain the following required keywords:\n\n${JSON.stringify(needed_terms)}`
    }
}

const create_plugin_url = (code, type) => {
    const blob = new Blob([code], { type })
    return URL.createObjectURL(blob)
}

const convert_file_dir = window.explorer.createDirectory(document.getElementById("plugins"), "Save Plugin", `
<div class="--input">
    <form id="savePluginForm">
        <input name="filePath" placeholder="File Name (string) to save as a plugin" rows="1" autocomplete="off"></input>
        <button type="submit" style="display: none;"></button>
    </form>
</div>`)

const savePluginForm = document.getElementById("savePluginForm")
if (!savePluginForm) { console.warn("Plugin creation form doesn't exist!") }

const ls = { // quick object for local storage
    s: function(key, value) { return window.localStorage.setItem(key, value) },
    g: function(key) { return window.localStorage.getItem(key) }
}

if (!ls.g("editor.plugins")) { ls.s("editor.plugins", JSON.stringify([])) }

savePluginForm.addEventListener("submit", e => {
    e.preventDefault()
    e.stopImmediatePropagation()

    const FILE_DATA = ls.g(savePluginForm.filePath.value)
    const scan_results = window.checkSecurity(FILE_DATA)
    if (scan_results.match.length !== 0 || scan_results.needed.length !== 0) {
        alert(scan_results.return)
        console.warn(scan_results.return)
        return
    } else {
        // plugin is safe
        let exists;

        // push to array
        let $ = JSON.parse(ls.g("editor.plugins"))

        for (let plugin of $) { if (plugin.name === savePluginForm.filePath.value) { exists = plugin } }
        if (exists === null || exists === undefined) {
            $.push({
                name: savePluginForm.filePath.value,
                blob: create_plugin_url(FILE_DATA, 'text/javascript') || "?"
            })
        } else {
            exists.blob = create_plugin_url(FILE_DATA, 'text/javascript') || "?"
        }

        ls.s("editor.plugins", JSON.stringify($))
    }
})

function runPlugins() {
    let $ = JSON.parse(ls.g("editor.plugins"))
    for (let plugin of $) {
        let FILE_DATA = ls.g(plugin.name)
        let scan_results = window.checkSecurity(FILE_DATA)
        if (scan_results.match.length !== 0 || scan_results.needed.length !== 0) { console.warn(`Skipping plugin "${plugin.name}; Malicious plugin`) }
    }
}

runPlugins()