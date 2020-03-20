// 04/02/2020 by EssExx

let history = new Map(),
    recentlyClosedTabsHistory = [],
    restoredTabIndex = -1;

let array_move = function(array, oldIndex, newIndex) {
    if (newIndex >= array.length) {
        let k = newIndex - array.length + 1;

        while (k--) {
            array.push(undefined);
        }
    }
    array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
};

let updateTabHistory = function (tab) {
    if (restoredTabIndex > -1) {
        history.set(tab.id, recentlyClosedTabsHistory.pop());
        restoredTabIndex = -1;
    } else {
        if (tab.url === undefined
            || tab.title === undefined
            || tab.title.includes("http")
            || tab.favIconUrl === undefined)
            return;

        let newHistoryEntry = [tab.url, tab.title, tab.favIconUrl];

        if (history.has(tab.id)) {
            let tabHistory = history.get(tab.id);
            let len = tabHistory.length;
            let index = tabHistory.map(
                (entry) => entry[0]).indexOf(
                newHistoryEntry[0]);

            if (index >= 0 && index < len - 1 && len > 1) {
                array_move(tabHistory, index, len - 1);
            } else if (index < 0) {
                tabHistory.push(newHistoryEntry);
            }
        } else {
            history.set(tab.id, [newHistoryEntry]);
        }
    }
    chrome.tabs.sendMessage(tab.id, {history: history.get(tab.id)}, null);
    console.log(tab.id, history.get(tab.id));
};

let _updateTabHistory = function (tabId, changeInfo, tab) {
    updateTabHistory(tab);
};

let updateClosedTabHistory = function (tabId) {
    recentlyClosedTabsHistory.push(history.get(tabId));
};

chrome.extension.onMessage.addListener(function (message) {
    if (message.type === "Restore") {
        chrome.sessions.getRecentlyClosed((sessions) => {
            restoredTabIndex = sessions[0].tab.index;
        });
        chrome.sessions.restore(chrome.sessions[0]);
    }
});

chrome.tabs.onCreated.addListener(updateTabHistory);
chrome.tabs.onUpdated.addListener(_updateTabHistory);
chrome.tabs.onRemoved.addListener(updateClosedTabHistory);
