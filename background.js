// Created on 19/11/2019 by EssExx

const digitNumber = 10;
// const isDigit = n => !isNaN(n);

const tabsTitlePrefix = ['1. ', '2. ', '3. ', '4. ', '5. ',
    '6. ', '7. ', '8. ',  '9. ', '0. ',
    '11. ','22. ','33. ', '44. ', '55. ',
    '66. ', '77. ','88. ', '99. ','00. '];

const groupBy = key => array =>
    array.reduce((objectsByKeyValue, obj) => {
        const value = obj[key];
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
    }, {});

const groupByWindowId = groupBy('windowId');

let isRemovingTab = false,
    isMovingTab = false,
    lastDigitTarget = null,
    previousTab = null,
    currentTab = null;

chrome.extension.onMessage.addListener(function( message, sender) {
    let target = message.target;
    currentTab = sender.tab;

    switch (message.type) {
        case 'Digit':
            if (isRemovingTab)
                alterTab('Digit','removeTab', target, sender);
            else if (isMovingTab)
                alterTab('Digit', 'moveTab', target, sender);
            else
                alterTab('Digit', 'jumpTab', target, sender);
            break;
        case 'Tab':
            alterTab('Tab', 'moveTabToward', null, sender);
            break;
        case 'Backspace':
            alterTab('Backspace', 'moveTabBackward', null, sender);
            break;
        case 'KeyG':
            isRemovingTab = true;
            isMovingTab = false;
            break;
        case 'KeyH':
            isRemovingTab = false;
            isMovingTab = true;
            break;
        default:
            return;
    }
});

let alterTab = function (key, operation, target, sender) {
    chrome.tabs.query( {}, function (tabs) {
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
        } else { doubleClickHandler(key, operation, target, sender, windowTabs); }
    });
};

let doubleClickKeys = ['Digit', 'Tab', 'Backspace'];
let timestamps = {'Digit': 0, 'Tab': 0, 'Backspace': 0};
const timeout = 200;

let doubleClickHandler = function (key, operation, target, sender, tabs) {
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
};

let tabOperations = function (operation, sender, index, tabs) {
    let tabId = tabs[index].id;
    isRemovingTab = false;
    isMovingTab = false;

    switch (operation) {
        case 'removeTab':
            chrome.tabs.remove(tabId, null);
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
};

let updateTabsTitle = function () {
    chrome.tabs.query( {}, function (tabs) {
        chrome.windows.getAll(function (windows) {
            const groupedTabs = groupByWindowId(tabs);

            windows.forEach(window => {
                const windowTabs = groupedTabs[window.id];
                const len = windowTabs.length;

                let title = null,
                    prefix = null;

                for (let i = 0; i < len; i++) {
                    if (i < tabsTitlePrefix.length) {
                        title = windowTabs[i].title;
                        prefix = tabsTitlePrefix[i];
                        title = prefix + getOriginalTitle(title);
                    }

                    chrome.tabs.executeScript(windowTabs[i].id,
                        {code: `document.title = "${title}"`},
                        () => { return chrome.runtime.lastError; });
                }
            });
        });
    });
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

chrome.tabs.onRemoved.addListener(() => {updateTabsTitle()});
chrome.tabs.onMoved.addListener(() => updateTabsTitle());
chrome.tabs.onAttached.addListener(() => updateTabsTitle());
chrome.tabs.onDetached.addListener(() => updateTabsTitle());
chrome.tabs.onUpdated.addListener(() => {updateTabsTitle()});