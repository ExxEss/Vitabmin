// Created on 29/01/2020 by EssExx

const timeout = 230;
let backgroundColor,
    historyPanel = document.createElement('div'),
    isCursorOnPanel = false;
    historyPanel.className = 'historyPanel';
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

historyPanel.addEventListener("mouseout", function() {
    isCursorOnPanel = false;
});

window.addEventListener('keydown', function (e) {
    if (isSingleKeyEvent(e) && e.key === 'c'
        && !isAlreadyExistsHistoryPanel()) {

        e.preventDefault();
        e.stopImmediatePropagation();
        popHistoryPanel();
    } else if (isSingleKeyEvent(e) && (e.key === 'Escape' || e.key === 'c' || isNumber(e))
        && isAlreadyExistsHistoryPanel()) {

        e.preventDefault();
        e.stopImmediatePropagation();

        if (isNumber(e)) {
            let index = keyCodes.indexOf(e.code);
            let len = historyPanel.childNodes.length;
            index = index === 0 ? digitNumber - 1 : index - 1;

            if (len <= index)
                index = len - 1;

            let link = historyPanel.childNodes[index];
            link.style.background = hoverColor;
            window.location.href = link.href;
        } else
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

    let count = 1;
    while (message.tabHistory.length > 0) {
        let entry = message.tabHistory.pop();
        historyPanel.appendChild(createLink(entry, count++));
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
                chrome.extension.sendMessage({type: "Title", value: h[i].innerText});
                return;
            }
        }
    }
}, timeout);

let createLink = function (entry, count) {
    let link = document.createElement('a');
    let icon = document.createElement('img');
    let text = document.createElement('div');

    link.className = 'history_link';
    icon.className = 'history_icon';
    text.className = 'history_text';

    link.href = entry[0];
    icon.src = entry[2];

    if (count < digitNumber + 1)
        text.innerText = `${count % 10}. ${entry[1]}`;
    else
        text.innerText = entry[1];


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



