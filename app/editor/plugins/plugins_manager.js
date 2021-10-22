/*===================================================*
 * 0aoq/WebEditor -- Licensed under the MIT license. *
 * https://github.com/0aoq/WebEditor                 *
 *===================================================*/

// 0aoq/WebEditor plugin manager

window.checkSecurity = function(contents) {
    // file security
    const UNSAFE_TERMS = ["document", "inner", "script", "alert", "var", "remove"]
    const REQUIRED_TERMS = ["window.explorer.createDirectory", "window.explorer"]

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
            })
        }

        ls.s("editor.plugins", JSON.stringify($))
        window.location.reload()
    }
})

function runPlugins() {
    let $ = JSON.parse(ls.g("editor.plugins"))
    for (let plugin of $) {
        let FILE_DATA = ls.g(plugin.name)
        let scan_results = window.checkSecurity(FILE_DATA)

        let __CAN_RUN = false
        if (scan_results.match.length !== 0 || scan_results.needed.length !== 0) {
            console.warn(`Skipping plugin "${plugin.name}"; Malicious plugin`)
        } else {
            __CAN_RUN = true
        }

        if (__CAN_RUN) {
            console.log("Loaded plugin: @" + plugin.name)

            // replace all variables with "NAME_at_external_FILE_NAME"
            for (let line of FILE_DATA.split(/\r?\n/)) {
                const cnst = line.split("const ")
                if (cnst[1]) {
                    const $_ = cnst[1].split(" ")[0]
                    FILE_DATA = FILE_DATA.replaceAll($_, `${$_}_at_external_${plugin.name.replaceAll(".", "_")}`)
                }
            }

            // create script tag
            const script = document.createElement('script')
            script.src = create_plugin_url(FILE_DATA, "text/javascript")
            script.setAttribute("async", "async")
            script.id = `script_at_external_${plugin.name.replaceAll(".", "_")}`
            document.head.append(script)
        }
    }
}

runPlugins()