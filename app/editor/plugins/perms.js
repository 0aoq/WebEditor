// Permission module

const dir = window.explorer.createDirectory(document.getElementById("plugins"), "Permissions", `
<div class="--input">
    <input disabled value="[!] Plugin Disabled: Work in progress and not published."></input>
</div>

${window.explorer.createExplorerButton("perms_1", "Approve", "checkmark-circle")}
${window.explorer.createExplorerButton("perms_1", "Decline", "close-circle")}`)