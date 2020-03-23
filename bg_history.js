// 04/02/2020 by EssExx

let history = new Map(),
    titles = new Map(),
    recentlyClosedTabsHistory = [],
    restoredTabIndex = -1;



const isValidUrl = function (str) {
    let pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
};

let updateTabHistory = function (tab) {
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

                if (title) {
                    newHistoryEntry[1] = title;
                }
                tabHistory.push(newHistoryEntry);
            } else if (!isValidUrl(originalTitle) && urlIndex > -1) {
                tabHistory.splice(urlIndex, 1);
                tabHistory.push(newHistoryEntry);
            } else if (urlIndex > -1 && urlIndex < len - 1 && len > 1) {
                arrayMove(tabHistory, urlIndex, len - 1);
            } else if (titleIndex > -1 && titleIndex < len - 1 && len > 1) {
                arrayMove(tabHistory, titleIndex, len - 1);
            } else if (urlIndex < 0 && titleIndex < 0) {
                tabHistory.push(newHistoryEntry);
            }
        } else {
            history.set(tab.id, [newHistoryEntry]);
        }
    }
    // let tabHistory = removeDuplicatedEntry(history.get(tab.id));
    // history.set(tab.id, tabHistory);
    chrome.tabs.sendMessage(tab.id, {tabHistory: history.get(tab.id)}, null);
};

let removeDuplicatedEntry = function (tabHistory) {
    let len = tabHistory.length;

    for (let i = 0; i < len; i++) {
        for (let j = i; j < len; j++) {
            if (tabHistory[i][1] === tabHistory[j][1]) {
                tabHistory = tabHistory.splice(i, 1);
                return tabHistory;
            }
        }
    }
};

let updateClosedTabHistory = function (tabId) {
    recentlyClosedTabsHistory.push(history.get(tabId));
};

let _updateTabHistory = function (tabId, changeInfo, tab) {
    updateTabHistory(tab);
};

chrome.extension.onMessage.addListener(function (message, sender) {
    if (message.type === "Restore") {
        chrome.sessions.getRecentlyClosed((sessions) => {
            restoredTabIndex = sessions[0].tab.index;
        });
        chrome.sessions.restore(chrome.sessions[0]);
    } else if (message.type === "Title") {
        titles.set(sender.id, message.value);
    }
});

chrome.tabs.onCreated.addListener(updateTabHistory);
chrome.tabs.onUpdated.addListener(_updateTabHistory);
chrome.tabs.onRemoved.addListener(updateClosedTabHistory);
