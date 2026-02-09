const ENABLE_ATTR = 'data-codex-dark';

function setEnabled() {
  document.documentElement.setAttribute(ENABLE_ATTR, '1');
}

function clearEnabled() {
  document.documentElement.removeAttribute(ENABLE_ATTR);
}

function isEnabled() {
  return document.documentElement.hasAttribute(ENABLE_ATTR);
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || !message.type) {
    return;
  }

  if (message.type === 'get-dark-mode-status') {
    sendResponse({ enabled: isEnabled() });
  }

  if (message.type === 'set-dark-mode-enabled') {
    setEnabled();
    sendResponse({ enabled: true });
  }

  if (message.type === 'clear-dark-mode-enabled') {
    clearEnabled();
    sendResponse({ enabled: false });
  }
});
