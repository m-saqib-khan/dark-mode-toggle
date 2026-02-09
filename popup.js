const toggleButton = document.getElementById('toggle');
const statusEl = document.getElementById('status');
let currentEnabled = false;

function updateUi(enabled) {
  currentEnabled = enabled;
  toggleButton.disabled = false;
  if (enabled) {
    toggleButton.textContent = 'Disable Dark Mode';
    statusEl.textContent = 'Active on this page';
  } else {
    toggleButton.textContent = 'Enable Dark Mode';
    statusEl.textContent = 'Not active';
  }
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function sendMessageToActiveTab(message) {
  const tab = await getActiveTab();
  if (!tab || !tab.id) {
    return { error: true };
  }
  try {
    return await chrome.tabs.sendMessage(tab.id, message);
  } catch (error) {
    return { error: true };
  }
}

async function insertCss(tabId) {
  await chrome.scripting.insertCSS({
    target: { tabId, allFrames: true },
    files: ['styles.css']
  });
}

async function removeCss(tabId) {
  await chrome.scripting.removeCSS({
    target: { tabId, allFrames: true },
    files: ['styles.css']
  });
}

function setUnavailable() {
  toggleButton.disabled = true;
  toggleButton.textContent = 'Unavailable';
  statusEl.textContent = 'Open a regular webpage';
}

async function refreshStatus() {
  const response = await sendMessageToActiveTab({ type: 'get-dark-mode-status' });
  if (response && response.error) {
    setUnavailable();
    return;
  }
  if (response && typeof response.enabled === 'boolean') {
    updateUi(response.enabled);
  }
}

toggleButton.addEventListener('click', async () => {
  const tab = await getActiveTab();
  if (!tab || !tab.id) {
    setUnavailable();
    return;
  }

  if (!currentEnabled) {
    try {
      await insertCss(tab.id);
    } catch (error) {
      setUnavailable();
      return;
    }

    const response = await sendMessageToActiveTab({
      type: 'set-dark-mode-enabled'
    });
    if (response && response.error) {
      setUnavailable();
      return;
    }
    updateUi(true);
    return;
  }

  try {
    await removeCss(tab.id);
  } catch (error) {
    setUnavailable();
    return;
  }

  const response = await sendMessageToActiveTab({ type: 'clear-dark-mode-enabled' });
  if (response && response.error) {
    setUnavailable();
    return;
  }
  updateUi(false);
});

refreshStatus();
