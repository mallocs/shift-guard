function startApp() {
  browser.storage.local.set({
    status: appStatusRunning,
  });
  browser.action.setBadgeText({ text: "ON" });
  browser.action.setBadgeBackgroundColor({ color: "#008000" });
}

function stopApp() {
  browser.storage.local.set({
    status: appStatusStopped,
  });
  browser.action.setBadgeText({ text: "OFF" });
  browser.action.setBadgeBackgroundColor({ color: "#FF0000" });
}

async function isRunning() {
  const storedStatus = await browser.storage.local.get(appStorageStatusKey);
  return storedStatus.status !== appStatusStopped;
}

async function getStoredDelay() {
  const storedDelay = await browser.storage.local.get(appStorageDelayKey);
  return storedDelay.delay || 800;
}

globalThis.stopApp = stopApp;
globalThis.startApp = startApp;
globalThis.isRunning = isRunning;
globalThis.getStoredDelay = getStoredDelay;
globalThis.appStatusStopped = "stopped";
globalThis.appStatusRunning = "";
globalThis.appStorageDelayKey = "delay";
globalThis.appStorageStatusKey = "status";
