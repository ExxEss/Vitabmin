// Created on 29/01/2020 by EssExx

let backgroundColor = '#1E1E1E';
    hoverColor = '#4B4B4B';

let historyPanel = document.createElement('div');
    historyPanel.className = 'historyPanel';

const unselectableTypes = ['button', 'checkbox', 'color', 'file',
    'hidden', 'image', 'radio', 'reset', 'submit'];

const isSelectable = function(element) {
    if (!(element instanceof Element))
        return false;

    return (element.nodeName.toLowerCase() === 'input' &&
        unselectableTypes.indexOf(element.type) === -1) ||
        element.nodeName.toLowerCase() === 'textarea' ||
        element.isContentEditable;
};

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

// window.onscroll = (e) => {
//     if (isAlreadyExistsHistoryPanel() && e.target !== historyPanel)
//     removeHistoryPanel();
// };

chrome.extension.onMessage.addListener(function (message) {
    if (message.history !== undefined)
        historyPanel.innerHTML = '';

    while (message.history.length > 0) {
        let entry = message.history.pop();
        historyPanel.appendChild(createLink(entry));
    }
});

let createLink = function (entry) {
    let link = document.createElement('a');
    let icon = document.createElement('img');
    let text = document.createElement('div');

    link.className = 'link';
    icon.className = 'icon';
    text.className = 'text';

    link.href = entry[0];
    icon.src = entry[2];
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



