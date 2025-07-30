# Vitabmin Manifest V3 Migration Notes

## Changes Made

### 1. Manifest.json Updates
- Updated `manifest_version` from 2 to 3
- Replaced `background.scripts` with `background.service_worker`
- Changed `browser_action` to `action`
- Moved host permissions from `permissions` to `host_permissions`
- Updated `content_security_policy` format
- Added `scripting` permission for chrome.scripting API
- Removed deprecated permissions: `nativeMessaging`, `debugger`, `background`

### 2. Service Worker Creation
- Combined `background.js`, `bg_history.js`, and `utils.js` into `service_worker.js`
- Replaced `chrome.extension.onMessage` with `chrome.runtime.onMessage`
- Replaced `chrome.tabs.executeScript` with `chrome.scripting.executeScript`
- Updated all global state management for service worker context

### 3. Content Script Updates
- Replaced all `chrome.extension.sendMessage` with `chrome.runtime.sendMessage`
- Replaced `chrome.extension.onMessage` with `chrome.runtime.onMessage`

### 4. API Replacements
- `chrome.tabs.executeScript()` → `chrome.scripting.executeScript()`
- `chrome.extension.sendMessage()` → `chrome.runtime.sendMessage()`
- `chrome.extension.onMessage` → `chrome.runtime.onMessage`

## Testing Instructions

1. Load the extension in Chrome developer mode
2. Test basic functionality:
   - Tab switching with number keys
   - Tab closing with 'x' key
   - Tab history with 'c' key
   - Video play/pause functionality
   - Tab moving operations

## Known Issues to Watch For

1. Service workers have limited lifetime - state may be lost
2. `importScripts()` may need adjustment depending on utils.js content
3. Some timing-dependent operations may behave differently
4. Cross-frame operations may need additional testing

## Files Modified

- `manifest.json` - Updated to V3 format
- `background/service_worker.js` - New service worker (combines old background scripts)
- `content/content.js` - Updated messaging API calls
- `content/history.js` - Updated messaging API calls

## Files Preserved

- All CSS, HTML, and image files remain unchanged
- `lib/utils.js` - No changes needed (imported by service worker)
- Original background scripts preserved for reference