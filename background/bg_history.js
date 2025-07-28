// 04/02/2020 by EssExx

let history = new Map(),
    titles = new Map(),
    recentlyClosedTabsHistory = [],
    restoredTabIndex = -1;

function updateTabHistory (tab) {
    if (restoredTabIndex > -1) {
        history.set(tab.id, recentlyClosedTabsHistory.pop());
        restoredTabIndex = -1;
    } else {
        if (tab.url === undefined
            || tab.title === undefined
            || tab.favIconUrl === undefined
            || tab.favIconUrl === "")
            return;

        let newHistoryEntry = [tab.url, getOriginalTitle(tab.title), tab.favIconUrl];

        if (history.has(tab.id)) {
            let tabHistory = history.get(tab.id);
            let len = tabHistory.length;
            let originalTitle = getOriginalTitle(tab.title);

            // Get index of an existed url of tabHistory
            let urlIndex = tabHistory.map(
                (entry) => entry[0]).indexOf(
                newHistoryEntry[0]);

            let titleIndex = tabHistory.map(
                (entry) => entry[1]).indexOf(
                newHistoryEntry[1]);

            if (isValidUrl(originalTitle) && urlIndex < 0
                && tab.status === 'complete') {

                let title = titles.get(tab.id);

                if (title)
                    newHistoryEntry[1] = title;

                tabHistory.push(newHistoryEntry);
            } else if (!isValidUrl(originalTitle) && urlIndex > -1) {
                tabHistory.splice(urlIndex, 1);
                tabHistory.push(newHistoryEntry);
            } else if (urlIndex > -1 && urlIndex < len - 1 && len > 1)
                arrayMove(tabHistory, urlIndex, len - 1);
            else if (titleIndex > -1 && titleIndex < len - 1 && len > 1)
                arrayMove(tabHistory, titleIndex, len - 1);
            else if (urlIndex < 0 && titleIndex < 0)
                tabHistory.push(newHistoryEntry);
        } else
            history.set(tab.id, [newHistoryEntry]);
    }
}

function updateClosedTabHistory (tabId) {
    recentlyClosedTabsHistory.push(history.get(tabId));
}

function _updateTabHistory (tabId, changeInfo, tab) {
    updateTabHistory(tab);
}

chrome.extension.onMessage.addListener(function (message, sender) {
    if (message.type === "Restore") {
        chrome.sessions.getRecentlyClosed((sessions) => {
            restoredTabIndex = sessions[0].tab.index;
        });
        chrome.sessions.restore(chrome.sessions[0]);
    } else if (message.type === "Title") {
        titles.set(sender.id, message.value);
    } else if (message.type === "ShowCurrentTabHistory") {
        chrome.tabs.sendMessage(sender.tab.id, {tabHistory: history.get(sender.tab.id), destineTabId: -1, currentPage: true}, null);
    } else if (message.type === "ExecuteCode") {
        chrome.tabs.executeScript(message.destineTabId,
            {code: message.code},
            () => {
                return chrome.runtime.lastError;
            });
    } else if (message.type === "DeleteLink") {
        let tabHistory = message.tabId === -1 ? history.get(sender.tab.id):history.get(message.tabId);

        for (let i = 0; i < tabHistory.length; i++) {
            if (tabHistory[i][0] === message.href)
                tabHistory.splice(i, 1);
        }

    }
});

chrome.tabs.onCreated.addListener(updateTabHistory);
chrome.tabs.onUpdated.addListener(_updateTabHistory);
chrome.tabs.onRemoved.addListener(updateClosedTabHistory);
