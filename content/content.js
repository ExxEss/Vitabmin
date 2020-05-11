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

document.addEventListener('DOMContentLoaded', updateTabTitle);

setInterval(() => {
    if (window.location.href.includes('youtube.com')
        || window.location.href.includes('reddit.com')
        || window.location.href.includes('zhihu.com')
        || window.location.href.includes('instagram'))
        updateTabTitle()
}, 100);


window.addEventListener('beforeunload', function () {
    document.title = getOriginalTitle(document.title);
    history.replaceState({}, '');
});


function updateTabTitle() {
    chrome.extension.sendMessage({
        type: 'GetTabTitlePrefix'
    }, (response) => {
        document.title = response.prefix + getOriginalTitle(document.title);
    })
}
