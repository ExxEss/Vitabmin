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


window.addEventListener('keydown', function (e) {
    const activeElement = document.activeElement;

    if (!isSelectable(activeElement) && !e.shiftKey) {
        let type = null,
            target = keyCodes.indexOf(e.code);

        if (target > -1 && !isAlreadyExistsHistoryPanel()) {
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
