import browser from "webextension-polyfill";

if (typeof browser.action === "undefined") {
  browser.action = browser.browserAction;
}
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
  return storedDelay.delay || defaultDelay;
}

export const defaultDelay = 600;
export const appStatusStopped = "stopped";
export const appStatusRunning = "";
export const appStorageDelayKey = "delay";
export const appStorageStatusKey = "status";
export { stopApp, startApp, isRunning, getStoredDelay };
