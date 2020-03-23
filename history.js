// Created on 29/01/2020 by EssExx

const timeout = 230;
let backgroundColor,
    historyPanel = document.createElement('div'),
    isCursorOnPanel = false;
    historyPanel.className = 'historyPanel';
    backgroundColor = '#1E1E1E';
    hoverColor = '#4B4B4B';

historyPanel.addEventListener("mouseenter", function() {
    isCursorOnPanel=true;
});

historyPanel.addEventListener("mouseout", function() {
    isCursorOnPanel=false;
});

let isSingleKeyEvent = function (e) {
    const activeElement = document.activeElement;

    return !isSelectable(activeElement)
        && !e.shiftKey && !e.altKey &&
        !e.metaKey && !e.ctrlKey;
};

window.addEventListener('keydown', function (e) {
    if (isSingleKeyEvent(e) && e.key === 'c'
        && !isAlreadyExistsHistoryPanel()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        popHistoryPanel();
    } else if (isSingleKeyEvent(e) && (e.key === 'Escape'
        || e.key === 'c') &&
        isAlreadyExistsHistoryPanel()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        removeHistoryPanel();
    } else if (isSingleKeyEvent(e) && e.key === 'z') {
        chrome.extension.sendMessage({type: "Restore"}, null);
    }
},true);

window.addEventListener("click", (e) => {
    if (isAlreadyExistsHistoryPanel() && e.target !== historyPanel) {
        removeHistoryPanel();
    }
});

window.onscroll = (e) => {
    if (isAlreadyExistsHistoryPanel() && e.target !== historyPanel)
    removeHistoryPanel();
};

chrome.extension.onMessage.addListener(function (message) {
    if (message.tabHistory !== undefined) {
        historyPanel.innerHTML = '';
    }

    message.tabHistory.pop();

    while (message.tabHistory.length > 0) {
        let entry = message.tabHistory.pop();
        historyPanel.appendChild(createLink(entry));
    }
});

window.setInterval(function () {
    if (document.title.includes("http://")
        || document.title.includes("https://")) {
        let h = [document.querySelectorAll("h1")[0],
                document.querySelectorAll("h2")[0],
                document.querySelectorAll("h3")[0],
                document.querySelectorAll("h4")[0],
                document.querySelectorAll("h5")[0],
                document.querySelectorAll("h6")[0]];

        for (let i = 0; i < h.length; i++) {
            if (h[i] !== undefined && h[i].innerText && h[i].innerText !== "") {
                document.title = h[i].innerText;
                chrome.extension.sendMessage({type: "Title", value: h[i].innerText});
                return;
            }
        }
    }
}, timeout);

let createLink = function (entry) {
    let link = document.createElement('a');
    let icon = document.createElement('img');
    let text = document.createElement('div');

    link.className = 'link';
    icon.className = 'icon';
    text.className = 'text';

    link.href = entry[0];
    text.innerText = entry[1];
    icon.src = entry[2];

    link.onmouseover = () => { icon.style.background = hoverColor };
    link.onmouseleave = () => { icon.style.background = backgroundColor };

    link.appendChild(icon);
    link.appendChild(text);

    return link;
};

let popHistoryPanel = function () {
    document.body.insertBefore(historyPanel, document.body.firstChild);
};

let isAlreadyExistsHistoryPanel = function () {
    return document.getElementsByClassName('historyPanel').length > 0;
};

let removeHistoryPanel = function () {
    let historyPanel = document.getElementsByClassName('historyPanel')[0];
    historyPanel.parentNode.removeChild(historyPanel);
};



