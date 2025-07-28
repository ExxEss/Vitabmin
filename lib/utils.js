// Created on 22/03/2020 by EssExx

const digitNumber = 10;
const isNumber = (e) => isFinite(e.key);

const playVideoCode = `
(function() {
    let video = document.querySelector('video');
    
    let isVideoPlaying = function(video) {
        return video.currentTime > 0 && !video.paused &&
            !video.ended && video.readyState > 2;
    }; 
    
    if (video !== null) {
        if (isVideoPlaying(video)) {
            video.pause();
        } else {
            video.play();
        }
    }
})(); `;

const trashIconHtml =  `
        <svg viewBox="0 0 24 24" focusable="false" 
        class="trash_icon_svg">
            <g>
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z">
                </path>
            </g>
        </svg>`;

const keyCodes = ['Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4',
    'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'KeyG', 'KeyH',
    'KeyV', 'KeyX', 'KeyR', 'KeyW', 'KeyQ', 'KeyU',
    'Tab', 'Backspace', 'Minus', 'Escape'];

const tabsTitlePrefix =
    ['1. ', '2. ', '3. ', '4. ', '5. ',
        '6. ', '7. ', '8. ', '9. ', '0. ',
        '11. ', '22. ', '33. ', '44. ', '55. ',
        '66. ', '77. ', '88. ', '99. ', '00. '];

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

const isValidUrl = function(string) {
    let url;
    
    try {
      url = new URL(string);
    } catch (_) {
      return false;  
    }
  
    return url.protocol === "http:" || url.protocol === "https:";
};

const groupBy = key => array =>
    array.reduce((objectsByKeyValue, obj) => {
        const value = obj[key];
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
    }, {});

const groupByWindowId = groupBy('windowId');

const arrayMove = function (array, oldIndex, newIndex) {
    if (newIndex >= array.length) {
        let k = newIndex - array.length + 1;

        while (k--) {
            array.push(undefined);
        }
    }
    array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
};

const getKeyEventModifiers = function (e) {
    return {'shiftKey': e.shiftKey, 'ctrlKey': e.ctrlKey, 'altKey': e.altKey, 'metaKey': e.metaKey};
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
