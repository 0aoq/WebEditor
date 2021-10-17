// Roblox open cloud place publish support

window.explorer.createDirectory(document.getElementById("plugins"), "rbxlx", `
${window.explorer.createOptionNode("rbxlx_place.json", "label:rbxlx-1", false, 28, true).html}
<li class="explorer-option" style="padding-left: 28px !important;">
    <a id="publish_rbxlx">
        <ion-icon name="cloud-upload"></ion-icon>
        <span class="glow-btw">Publish</span>
    </a>
</li>`)