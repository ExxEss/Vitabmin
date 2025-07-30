// Created on 29/01/2020 by EssExx

const timeout = 230;
let backgroundColor,
    historyPanel = document.createElement('div'),
    isCursorOnPanel = false,
    destineTabId = -1;
    historyPanel.className = 'history_panel';
    backgroundColor = '#1E1E1E';
    hoverColor = '#4B4B4B';

let isSingleKeyEvent = function (e) {
    const activeElement = document.activeElement;

    return !isSelectable(activeElement)
        && !e.shiftKey && !e.altKey &&
        !e.metaKey && !e.ctrlKey;
};

historyPanel.addEventListener("mouseenter", function() {
    isCursorOnPanel = true;
});

historyPanel.addEventListener("mouseleave", function() {
    isCursorOnPanel = false;
});

window.addEventListener('keydown', function (e) {
    if (isSingleKeyEvent(e) && e.key === 'c'
        && !isAlreadyExistsHistoryPanel()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        chrome.runtime.sendMessage({type: "ShowCurrentTabHistory"}, null);
    } else if (isSingleKeyEvent(e) && e.key !== 'x' && (e.key === 'Escape'
        || e.key === 'c' || e.key === 'w'
        || isNumber(e))
        && isAlreadyExistsHistoryPanel()) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (isNumber(e)) {
            let index = keyCodes.indexOf(e.code);
            let len = historyPanel.childNodes.length;
            index = index === 0 ? digitNumber - 1 : index - 1;

            if (len <= index)
                index = len - 1;

            let history = historyPanel.childNodes[index];
            history.style.background = hoverColor;

            if (destineTabId !== -1) {
                chrome.runtime.sendMessage({type: "ExecuteCode",
                    destineTabId: destineTabId,
                    code:  `window.location.href = "${history.childNodes[0].href}"`},
                    () => {destineTabId = -1});
            } else {
                window.location.href = history.childNodes[0].href;
            }
        }
        removeHistoryPanel();
    } else if (isSingleKeyEvent(e) && e.key === 'z') {
        chrome.runtime.sendMessage({type: "Restore"}, null);
    }
},true);

window.addEventListener("click", (e) => {
    if (isAlreadyExistsHistoryPanel() && e.target !== historyPanel) {
        removeHistoryPanel();
    }
});

window.onscroll = () => {
    if (isAlreadyExistsHistoryPanel() && !isCursorOnPanel)
        removeHistoryPanel();
};

chrome.runtime.onMessage.addListener(function (message) {
    if (message.tabHistory !== undefined) {
        historyPanel.innerHTML = '';
    }

    message.tabHistory.pop();

    let count = 1;
    while (message.tabHistory.length > 0) {
        let entry = message.tabHistory.pop();
        historyPanel.appendChild(createHistoryEntry(entry, count++));
    }

    if (message.destineTabId !== undefined) {
        destineTabId = message.destineTabId;
    }

    if (isAlreadyExistsHistoryPanel()) {
        removeHistoryPanel();
    } else {
        popHistoryPanel();
    }
});

window.setInterval(function () {
    if (isValidUrl(document.title)) {
        let h = [document.querySelectorAll("h1")[0],
                document.querySelectorAll("h2")[0],
                document.querySelectorAll("h3")[0],
                document.querySelectorAll("h4")[0],
                document.querySelectorAll("h5")[0],
                document.querySelectorAll("h6")[0]];

        for (let i = 0; i < h.length; i++) {
            if (h[i] !== undefined && h[i].innerText && h[i].innerText !== "") {
                document.title = h[i].innerText;
                chrome.runtime.sendMessage({type: "Title", value: h[i].innerText});
                return;
            }
        }
    }
}, timeout);

let createHistoryEntry = function (entry, count) {
    let history = document.createElement('div');
    let link = document.createElement('a');
    let icon = document.createElement('img');
    let text = document.createElement('div');
    let trashIcon = document.createElement('div');

    history.className = 'history_entry'
    link.className = 'history_link';
    icon.className = 'history_icon';
    text.className = 'history_text';
    trashIcon.className = 'history_trash_icon';

    link.href = entry[0];
    icon.src = entry[2];

    if (count < digitNumber + 1)
        text.innerText = `${count % 10}. ${entry[1]}`;
    else
        text.innerText = entry[1];

    trashIcon.innerHTML = trashIconHtml;
    history.onmouseover = () => { icon.style.background = hoverColor };
    history.onmouseleave = () => { icon.style.background = backgroundColor };
    history.onclick = () => { link.click(); }

    link.onclick = (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (e.metaKey) {
            window.open(link.href);
            removeHistoryPanel();
            return;
        }

        if (destineTabId !== -1) {
            chrome.runtime.sendMessage({
                type: "ExecuteCode",
                destineTabId: destineTabId,
                code: `window.location.href = "${link.href}"`
            }, () => {destineTabId = -1});
        } else {
            window.location.href = link.href;
        }
        removeHistoryPanel();
    }

    trashIcon.onclick = (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        history.parentNode.removeChild(history);
        chrome.runtime.sendMessage({type: "DeleteLink",
            href: link.href,
            tabId: destineTabId
        }, null);

        if (document.getElementsByClassName("history_entry").length === 0)
            removeHistoryPanel();
    }

    link.appendChild(icon);
    link.appendChild(text);
    history.appendChild(link);
    history.appendChild(trashIcon);

    return history;
};

let popHistoryPanel = function () {
    removeVideoInfoPanel();
    document.body.insertBefore(historyPanel, document.body.firstChild);
    historyPanel.style.width = historyPanel.getBoundingClientRect().width + 'px';
};

function removeVideoInfoPanel() {
    let videoInfoDOM = document.getElementsByClassName('videoInfo')[0];
    if (videoInfoDOM !== undefined)
        videoInfoDOM.parentNode.removeChild(videoInfoDOM);
}

let isAlreadyExistsHistoryPanel = function () {
    return document.getElementsByClassName('history_panel').length > 0;
};

let removeHistoryPanel = function () {
    let historyPanel = document.getElementsByClassName('history_panel')[0];
    if (historyPanel !== undefined) {
        historyPanel.style.width = "";
        historyPanel.parentNode.removeChild(historyPanel);
    }
};

