/*===================================================*
 * 0aoq/WebEditor -- Licensed under the MIT license. *
 * https://github.com/0aoq/WebEditor                 *
 *===================================================*/

// 0aoq/WebEditor Lua Language

monaco.languages.registerCompletionItemProvider("lua", { // Or any other language...
    provideCompletionItems: (model, position) => {
        let build = []

        let keywords = [
            'and',
            'break',
            'do',
            'else',
            'elseif',
            'end',
            'false',
            'for',
            'function',
            'goto',
            'if',
            'in',
            'local',
            'nil',
            'not',
            'or',
            'repeat',
            'return',
            'then',
            'true',
            'until',
            'while'
        ]

        for (let keyword of keywords) {
            build.push({
                label: keyword,
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: keyword,
                preselect: true
            })
        }

        return {
            suggestions: build
        }
    }
})