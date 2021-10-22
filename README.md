# ubiquitous-engine

(This README file is out of date, and will be updated soon.)

This was just a random test I did of the [monaco editor](https://github.com/microsoft/monaco-editor). Simple documentation is below.

## Use Documentation

To set the language mode of any file, define it in the top of the file.
```
"using: LANGUAGE_NAME"
```
It is preferred that you surround that block in the multiple line comment style of your language.

To define a local save name (for saving to localStorage and not to machine), define it at the top of the file.
```
"using: LANGUAGE_NAME"
"localSaveAs: FILE_NAME"
```
The localSaveAs setting should only be used from creating a new file within the editor.

### HTML Example

```html
<!--
"using: html"
"localSaveAs: index.html"
-->

<h1>Saved locally as "index.html" to window.localStorage!</h1>
```
An HTML project can be setup with `Create Project Settings File`

To run this command, open the command palette with F1, type `Create Project Settings File`, and then run the command. This will generate a file named `package_settings.json` where you can choose what files will be run with the HTML preview.

After initializing a project, you will have the option to run and stop the preview from the context menu, and from the command palette.

## Notice

File saving to the user machine is currently disabled, please only use local saves for now. All local saves are stored in localStorage, and can be reset with `CTRL + Shift + C` (Clear localStorage). Local files are automatically saved whenever their content is changed.

Type `Open FILE_NAME` into the command palette to open a file, and `Delete FILE_NAME` into the command palette to remove a file from localStorage.