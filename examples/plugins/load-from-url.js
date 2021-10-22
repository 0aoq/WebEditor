/*===================================================*
 * 0aoq/WebEditor -- Licensed under the MIT license. *
 * https://github.com/0aoq/WebEditor                 *
 *===================================================*/

// example of a plugin that loads files from a url, created from within the editor

const dir = window.explorer.createDirectory(null, "Load File From URL", `<div class="--input">
    <form id="__load_url_form">
        <input name="url" placeholder="URL to load file from (string)" rows="1" autocomplete="off" type="url"></input>
        <button type="submit" style="display: none;"></button>
    </form>
</div>`)

const __form = window.explorer.plugins.id("__load_url_form")
window.explorer.plugins.on("__load_url_form", "submit", e => {
    let name = __form.url.value.split("/")
    name = name[name.length - 1]

    fetch(__form.url.value)
        .then(data => data.text())
        .then(data => window.explorer.plugins.updateFile(name, data))
})