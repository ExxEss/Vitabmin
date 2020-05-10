// Created on 20/11/2019 by EssExx

window.addEventListener('keydown', function (e) {
    const activeElement = document.activeElement;

    if (!isSelectable(activeElement) && !e.metaKey) {
        let type = null,
            target = keyCodes.indexOf(e.code);

        if (target > -1 && !isAlreadyExistsHistoryPanel()) {
            if (keyCodes[target] !== 'Escape') {
                e.preventDefault();
                e.stopImmediatePropagation();
            }

            if (target < 10)
                type = 'Digit';
            else
                type = e.code;

            target = keyCodes.indexOf(e.code);
            chrome.extension.sendMessage({
                type: type,
                target: target,
                modifiers: getKeyEventModifiers(e)
            }, null);
        }
    }
}, true);
