const ThemeColors = {
    theme_desaturated_gray: '#7f85a3',
    theme_dark_blue: '#3e68d7',
    theme_blue: '#82aaff',
    theme_sky_blue: '#65bcff',
    theme_cyan: '#86e1fc',
    theme_red: '#ff757f',
    theme_dark_red: '#ff5370',
    theme_light_red: '#ff98a4',
    theme_yellow: '#ffc777',
    theme_orange: '#ff966c',
    theme_dark_orange: '#fc7b7b',
    theme_teal: '#4fd6be',
    theme_green: '#c3e88d',
    theme_purple: '#c099ff',
    theme_pink: '#fca7ea',
    theme_indigo: '#7a88cf',
    theme_bright_cyan: '#b4f9f8',

    theme_gray_10_alt: '#bcc4d6',
    theme_gray_10: '#c8d3f5',
    theme_gray_9: '#b4c2f0',
    theme_gray_8: '#a9b8e8',
    theme_gray_7: '#828bb8',
    theme_gray_6: '#444a73',
    theme_gray_5: '#2f334d',
    theme_gray_4: '#222436',
    theme_gray_3: '#1e2030',
    theme_gray_2: '#191a2a',
    theme_gray_1: '#131421'
}

const __ = function(name) {
    if (ThemeColors[name]) {
        return ThemeColors[name]
    } else {
        console.warn(`Color "${name}" doesn't exist!`)
        return '#fff'
    }
}