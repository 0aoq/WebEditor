/*===================================================*
 * 0aoq/WebEditor -- Licensed under the MIT license. *
 * https://github.com/0aoq/WebEditor                 *
 *===================================================*/

// 0aoq/WebEditor Lua Language

monaco.languages.registerCompletionItemProvider("lua", { // Or any other language...
    provideCompletionItems: (model, position) => {
        return {
            suggestions: [{
                    label: "local",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: "local",
                    preselect: true
                },
                {
                    label: "function",
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: "function",
                    preselect: true
                },
            ]
        }
    }
})