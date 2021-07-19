export const removeFromArray = function(array, indexOf) {
    for (var i = 0; i < array.length; i++) {
        if (i === indexOf) {
            array.splice(i, 1);
        }
    }

    return array
}

export default {
    removeFromArray
}