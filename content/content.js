// Created on 20/11/2019 by EssExx

window.addEventListener('beforeunload', function () {
    window.stop();
    chrome.runtime.sendMessage({
        type: 'PageChanged',
    }, null);

    document.title = getOriginalTitle(document.title);
    history.replaceState({}, '');
});

window.addEventListener("auxclick", function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (event.which === 2) {
        chrome.runtime.sendMessage({
            type: 'KeyX',
            target: null,
            modifiers: null
        }, null);
    } else if (event.which === 4) {
        document.dispatchEvent(
            new KeyboardEvent("keydown", {
                key: "Enter", keyCode: 13, code: "Enter", which: 13,
                shiftKey: true, ctrlKey: false,  metaKey: false
            }));
    } else if (event.which === 5) {
        document.dispatchEvent(
            new KeyboardEvent("keydown", {
                key: "b", keyCode: 66, code: "KeyB", which: 66,
                shiftKey: true, ctrlKey: false,  metaKey: false
            }));
    }
}, true);


window.addEventListener('keydown', function (e) {
    const activeElement = document.activeElement;

    if (document.location.href.includes("agar.io") && e.key === "w")
        return;

    if (!isSelectable(activeElement) && !e.metaKey) {
        let type = null,
            target = keyCodes.indexOf(e.code);
        if (target > -1) {
            if (!isAlreadyExistsHistoryPanel() && keyCodes[target] !== 'Escape') {
                if (target < 10)
                    type = 'Digit';
                else
                    type = e.code;

                if (keyCodes[target] !== 'KeyQ') {
                  e.preventDefault();
                  e.stopImmediatePropagation();
                }
            } else if (keyCodes[target] !== 'Escape') {
                if (target >= 10) {
                    type = e.code;

                    if (keyCodes[target] !== 'KeyQ') {
                      e.preventDefault();
                      e.stopImmediatePropagation();
                    } 
                }
            } else if (keyCodes[target] === 'Escape')
                type = e.code;

            chrome.runtime.sendMessage({
                type: type,
                target: target,
                modifiers: getKeyEventModifiers(e)
            }, null);
        }
    }
}, true);
