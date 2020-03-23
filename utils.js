// Created on 22/03/2020 by EssExx

const digitNumber = 10;
const isNumber = (e) => isFinite(e.key);

const keyCodes = ['Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4',
    'Digit5', 'Digit6', 'Digit7', 'Digit8',
    'Digit9', 'KeyG', 'KeyH', 'KeyV', 'KeyX',
    'Tab', 'Backspace', 'Escape'];

const tabsTitlePrefix =
    ['1. ', '2. ', '3. ', '4. ', '5. ',
        '6. ', '7. ', '8. ', '9. ', '0. ',
        '11. ', '22. ', '33. ', '44. ', '55. ',
        '66. ', '77. ', '88. ', '99. ', '00. '];

const isValidUrl = function (str) {
    let pattern = new RegExp('^(https?:\\/\\/)?'+
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+
        '((\\d{1,3}\\.){3}\\d{1,3}))'+
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+
        '(\\?[;&a-z\\d%_.~+=-]*)?'+
        '(\\#[-a-z\\d_]*)?$','i');
    return !!pattern.test(str);
};

const groupBy = key => array =>
    array.reduce((objectsByKeyValue, obj) => {
        const value = obj[key];
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
    }, {});

const groupByWindowId = groupBy('windowId');

const arrayMove = function (array, oldIndex, newIndex) {
    if (newIndex >= array.length) {
        let k = newIndex - array.length + 1;

        while (k--) {
            array.push(undefined);
        }
    }
    array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
};

const getOriginalTitle = function (title) {
    const startLength = tabsTitlePrefix[0].length;
    const endLength = tabsTitlePrefix[tabsTitlePrefix.length - 1].length;

    let index = Math.max(tabsTitlePrefix.indexOf(title.substring(0, startLength)),
        tabsTitlePrefix.indexOf(title.substring(0, endLength)));

    if (index < 0)
        return title;
    else if (index < digitNumber)
        return title.substring(startLength, title.length);
    else
        return title.substring(endLength, title.length)
};

