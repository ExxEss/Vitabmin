// Created on 19/11/2019 by EssExx

let isRemovingTab = false,
    isRemovingTabs = false,
    isMovingTab = false,
    showCrossTabHistory = false,
    playVideo = false,
    muteTab = false,
    lastDigitTarget = null,
    previousTab = null,
    currentTab = null,
    startTabIndex = -1,
    parentTabMap = new Map(),
    pageChanged = false;

chrome.commands.onCommand.addListener(function (command) {
    if (command === 'reload') {
        chrome.tabs.query( {}, function (tabs) {
            for (let i = 0; i < tabs.length; i++)
                chrome.tabs.reload(tabs[i].id, {bypassCache: true});
        });
    }
});

chrome.extension.onMessage.addListener(function (message, sender, sendResponse) {
    let target = message.target;
    currentTab = sender.tab;

    switch (message.type) {
        case 'PageChanged':
            pageChanged = true;
            break;
        case 'GetTabTitlePrefix':
            let prefix = sender.tab.index < tabsTitlePrefix.length
                ? tabsTitlePrefix[sender.tab.index]
                : '';

            sendResponse({prefix: prefix});
            break;
        case 'Escape':
            if (!hasModifiers(message))
                setOperationStatus(false, false, false,
                    false, false, false);
            break;
        case 'Digit':
            if (!hasModifiers(message)) {
                if (isRemovingTab)
                    alterTab('Digit', 'removeTab', target, sender);
                else if (isRemovingTabs)
                    alterTab('Digit', 'removeTabs', target, sender);
                else if (isMovingTab)
                    alterTab('Digit', 'moveTab', target, sender);
                else if (showCrossTabHistory)
                    alterTab('Digit', 'showCrossTabHistory', target, sender);
                else if (playVideo)
                    alterTab('Digit', 'playVideo', target, sender);
                else if (muteTab)
                    alterTab('Digit', 'muteTab', target, sender);
                else
                    alterTab('Digit', 'jumpTab', target, sender);
            }
            break;
        case 'Tab':
            if (!hasModifiers(message))
                alterTab('Tab', 'moveTabToward', null, sender);
            break;
        case 'Backspace':
            if (!hasModifiers(message))
                alterTab('Backspace', 'moveTabBackward', null, sender);
            break;
        case 'KeyG':
            if (!hasModifiers(message))
                setOperationStatus(true, false, false,
                    false, false, false);
            break;
        case 'KeyV':
            if (!hasModifiers(message))
                setOperationStatus(false, true, false,
                    false, false, false);
            break;
        case 'KeyH':
            if (!hasModifiers(message))
                setOperationStatus(false, false, true,
                    false, false, false);
            break;
        case 'KeyX':
            if (!hasModifiers(message)) {
                let parentTabId = parentTabMap.get(sender.tab.id);
                chrome.tabs.remove(sender.tab.id, () => {
                    if (parentTabId)
                        chrome.tabs.update(parentTabId, {active: true});
                    else
                        chrome.tabs.update(lastActiveTab.id, {active: true});
                });
            }

            setOperationStatus(false, false, false,
                false, false, false);

            break;
        case 'KeyR':
            if (!hasModifiers(message))
                chrome.tabs.executeScript(sender.tab.id,
                    {code: 'window.location.href = window.location.href'},
                    _ => {
                        return chrome.runtime.lastError
                    });
            break;
        case 'Minus':
            chrome.tabs.query({'currentWindow': true}, function (tabs) {
                tabOperations('jumpTab', null, tabs.length - 1, tabs);
            });
            break;
        case 'KeyW':
           if (!hasModifiers(message))
               setOperationStatus(false, false, false,
                   true, false, false);
           break;
        case 'KeyQ':
            if (!hasModifiers(message))
                setOperationStatus(false, false, false,
                    false, true, false);
            break;
        case 'KeyU':
            if (!hasModifiers(message))
                setOperationStatus(false, false, false,
                    false, false, true);
            else if (hasGivenModifiers(message, ['shiftKey']))
                chrome.tabs.update(sender.tab.id, {muted: !sender.tab.mutedInfo.muted}, null);
            break;
        default:
            break;
    }
});

function hasModifiers(message) {
    let modifiers = message.modifiers;
    return modifiers &&
        (modifiers['shiftKey'] ||
        modifiers['ctrlKey'] ||
        modifiers['altKey'] ||
        modifiers['metaKey']);
}

function hasGivenModifiers(message, modifiers) {
    modifiers.forEach((modifier) => {
        if (!message.modifiers[modifier])
            return false;
    });
    return true;
}

function setOperationStatus(_isRemovingTab, _isRemovingTabs, _isMovingTab,
                            _showCrossTabHistory, _playVideo, _muteTab) {
    isRemovingTab = _isRemovingTab;
    isRemovingTabs = _isRemovingTabs;
    isMovingTab = _isMovingTab;
    showCrossTabHistory = _showCrossTabHistory;
    playVideo = _playVideo;
    muteTab = _muteTab;
}

function alterTab(key, operation, target, sender) {
    chrome.tabs.query({}, function (tabs) {
        const groupedTabs = groupByWindowId(tabs);
        const windowTabs = groupedTabs[sender.tab.windowId];
        const len = windowTabs.length;
        let index = null;

        if (target !== null && (target === 0 || len < target + digitNumber)) {
            if (target === 0 && len < digitNumber || len <= target)
                index = len - 1;
            else if (target === 0)
                index = digitNumber - 1;
            else
                index = target - 1;

            tabOperations(operation, sender, index, windowTabs);
        } else {
            doubleClickHandler(key, operation, target, sender, windowTabs);
        }
    });
}

let doubleClickKeys = ['Digit', 'Tab', 'Backspace'];
let timestamps = {'Digit': 0, 'Tab': 0, 'Backspace': 0};
const timeout = 230;

function doubleClickHandler(key, operation, target, sender, tabs) {
    let newTimestamp = new Date().getTime(),
        index = null;

    if (newTimestamp - timestamps[key] < timeout) {
        if (key === doubleClickKeys[0] && target === lastDigitTarget)
            index = target === 0 ? 2 * digitNumber - 1 : digitNumber + target - 1;
        else if (key === doubleClickKeys[1])
            index = sender.tab.index === 0 ? tabs.length - 1 : sender.tab.index - 1;
        else if (key === doubleClickKeys[2])
            index = (sender.tab.index + 1) % tabs.length;

        tabOperations(operation, sender, index, tabs);
    } else {
        window.setTimeout(() => {
            if (new Date().getTime() - timestamps[key] > timeout) {
                if (key === doubleClickKeys[0])
                    index = target === 0 ? digitNumber - 1 : target - 1;
                else if (key === doubleClickKeys[1])
                    index = (sender.tab.index + 1) % tabs.length;
                else if (key === doubleClickKeys[2])
                    index = sender.tab.index === 0 ? tabs.length - 1 : sender.tab.index - 1;

                tabOperations(operation, sender, index, tabs);
            }
        }, timeout);
    }

    if (key === doubleClickKeys[0])
        lastDigitTarget = target;

    timestamps[key] = newTimestamp;
}

function tabOperations(operation, sender, index, tabs) {
    let tabId = tabs[index].id;
    isRemovingTab = false;
    isMovingTab = false;
    showCrossTabHistory = false;
    playVideo = false;
    muteTab = false;

    switch (operation) {
        case 'showCrossTabHistory':
            chrome.tabs.sendMessage(sender.tab.id,
                {tabHistory: history.get(tabId),
                    destineTabId: tabId,
                    currentPage: false},
                null);
            break;
        case 'playVideo':
            chrome.tabs.executeScript(tabId,
                {code: playVideoCode},
                _=> {return chrome.runtime.lastError});
            break;
        case 'muteTab':
            chrome.tabs.update(tabId, {muted: !tabs[index].mutedInfo.muted}, null);
            break;
        case 'removeTab':
            chrome.tabs.remove(tabId, null);
            break;
        case 'removeTabs':
            if (startTabIndex !== -1) {
                startTabIndex = Math.min(startTabIndex, index);
                index = Math.max(startTabIndex, index);

                for (let i = startTabIndex; i < index + 1; i++)
                    chrome.tabs.remove(tabs[i].id, null);

                startTabIndex = -1;
                isRemovingTabs = false;
            } else
                startTabIndex = index;
            break;
        case 'moveTab':
            chrome.tabs.move(sender.tab.id, {index: index});
            break;
        case 'jumpTab':
            if (currentTab.id === tabs[index].id && previousTab !== null) {
                let id = previousTab.id;
                previousTab = currentTab;
                chrome.tabs.update(id, {active: true});
            } else {
                previousTab = currentTab;
                currentTab = tabs[index];
                chrome.tabs.update(tabId, {active: true});
            }
            break;
        case 'moveTabToward':
            chrome.tabs.update(tabId, {active: true});
            break;
        case 'moveTabBackward':
            chrome.tabs.update(tabId, {active: true});
            break;
    }
}

function updateTabsTitle() {
    chrome.tabs.query({}, function (tabs) {
        chrome.windows.getAll(function (windows) {
            const groupedTabs = groupByWindowId(tabs);
            windows.forEach(window => {
                const windowTabs = groupedTabs[window.id];

                if (windowTabs === undefined)
                    return

                const len = windowTabs.length;

                let title = null,
                    prefix = null;

                for (let i = 0; i < len; i++) {
                    if (i < tabsTitlePrefix.length) {
                        title = windowTabs[i].title;
                        prefix = tabsTitlePrefix[i];
                        title = prefix + getOriginalTitle(title.replace(/"/g, " "));
                    }

                    chrome.tabs.executeScript(windowTabs[i].id,
                        {code: `document.title = "${title}"`},
                        () => {
                            return chrome.runtime.lastError;
                        });
                }
            });
        });
    });
}


let lastActiveTab = null;

setInterval(() => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true },
        function(tabs) {
        lastActiveTab = tabs[0];
    });
    updateTabsTitle();
}, timeout);

let setParentTab = function (newTab) {
    parentTabMap.set(newTab.id, lastActiveTab.id);
    updateTabsTitle();
};

let url = null,
    previousTabTitle = null;
let updateNoPageChangedTabTitle = function (tabId, changeInfo, tab) {
    if (tab.title === null) return;
    if (!pageChanged && previousTabTitle !== tab.title
        && getOriginalTitle(tab.title).length > 0
        && !tabsTitlePrefix.includes(tab.title + ' ')) {
        updateTabsTitle();
        url = tab.url;
        previousTabTitle = tab.title;
    } else if (isValidUrl(tab.title) || url !== tab.url && previousTabTitle !== tab.title) {
        pageChanged = false;
        url = null;
    }
}

chrome.tabs.onCreated.addListener(setParentTab);
chrome.tabs.onRemoved.addListener(updateTabsTitle);
chrome.tabs.onMoved.addListener(updateTabsTitle);
chrome.tabs.onAttached.addListener(updateTabsTitle);
chrome.tabs.onDetached.addListener(updateTabsTitle);
chrome.tabs.onUpdated.addListener(updateNoPageChangedTabTitle);
