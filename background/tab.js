let previousTab,
    currentTab;

function updateTabProperty(tab, property) {
    chrome.tabs.update(tabs[i].id, {property: true});
}
function activeTab(tabNumber) {

}

function switchToParentTab(tab) {

}

function switchTo(tab) {
    previousTab = currentTab;
    currentTab = tab;
    activeTab(currentTab);
}

function moveTabTo(numberFrom, numberTo) {

}

function moveCurrentTabTo(number) {
    moveTabTo(currentTab, number);
}

function closeTab(tab) {
    chrome.tabs.remove(tab.id, () => {
        if (tab === currentTab)
            switchToParentTab(tab);
    });
}

function closeCurrentTab() {
    closeTab(currentTab);
}

function closeTabsBetween(startTab, endTab) { }

function closeGivenNumberTabsToLeft(number) { }

function closeGivenNumberTabsToRight(number) { }

function closeAllTabsToLeft() { }

function closeAllTabsToRight() { }

function closeCurrentTabAndGoLeft() { }

function closeCurrentTabAndGoRight() { }

function restoreLastClosedTab() { }

function toggleMutedTab(tab) { }

function toggleMutedCurrentTab() { }

function togglePinedTab(tab) { }

function togglePinedCurrentTab() { }

function togglePlayingTab(tab) { }

function togglePlayingCurrentTab() { }

function refreshCurrentTab() { }

function refreshCurrentTabAndBackToTop() { }

function refreshAllTabs() { }

function goNextLeftTab() { }

function goNextRightTab() { }





