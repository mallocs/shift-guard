import browser from "webextension-polyfill";

const browserAction =
  typeof browser.action === "undefined"
    ? browser.browserAction
    : browser.action;

function startApp() {
  browser.storage.local.set({
    status: appStatusRunning,
  });
  browserAction.setBadgeText({ text: "ON" });
  browserAction.setBadgeBackgroundColor({ color: "#008000" });
}

function stopApp() {
  browser.storage.local.set({
    status: appStatusStopped,
  });
  browserAction.setBadgeText({ text: "OFF" });
  browserAction.setBadgeBackgroundColor({ color: "#FF0000" });
}

async function isRunning() {
  const storedStatus = await browser.storage.local.get(appStorageStatusKey);
  return storedStatus.status !== appStatusStopped;
}

async function getStoredDelay() {
  const storedDelay = await browser.storage.local.get(appStorageDelayKey);
  return storedDelay.delay || defaultDelay;
}

export const defaultDelay = 500;
export const appStatusStopped = "stopped";
export const appStatusRunning = "";
export const appStorageDelayKey = "delay";
export const appStorageStatusKey = "status";
export { stopApp, startApp, isRunning, getStoredDelay };
