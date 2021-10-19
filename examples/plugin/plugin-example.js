// Example of a plugin with 2 buttons

const dir = window.explorer.createDirectory(null, "My Plugin", `
${window.explorer.newButton("perms_1", "Approve", "checkmark-circle")}
${window.explorer.newButton("perms_1", "Decline", "close-circle")}`)