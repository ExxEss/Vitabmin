// Created on 20/11/2019 by EssExx

const unselectableTypes = ['button', 'checkbox', 'color', 'file',
    'hidden', 'image', 'radio', 'reset', 'submit'];

const isSelectable = function(element) {
    if (!(element instanceof Element))
        return false;

    return (element.nodeName.toLowerCase() === 'input' &&
        unselectableTypes.indexOf(element.type) === -1) ||
        element.nodeName.toLowerCase() === 'textarea' ||
        element.isContentEditable;
};

const keyCodes = ['Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5',
    'Digit6', 'Digit7', 'Digit8', 'Digit9', 'KeyG', 'KeyH', 'KeyV', 'KeyX', 'Tab', 'Backspace'];

window.addEventListener('keydown', function (e) {
    const activeElement = document.activeElement;

    if (!isSelectable(activeElement) && !e.shiftKey) {
        let type = null,
            target = keyCodes.indexOf(e.code);

        if (target > -1) {
            e.preventDefault();
            e.stopImmediatePropagation();

            if (target < 10)
                type = 'Digit';
            else
                type = e.code;

            target = keyCodes.indexOf(e.code);
            chrome.extension.sendMessage({ type: type, target: target }, null);
        }
    }
}, true);
