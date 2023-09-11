import browser from "webextension-polyfill";
import {
  stopApp,
  startApp,
  appStatusStopped,
  appStorageStatusKey,
} from "../lib/shared.js";

browser.storage.onChanged.addListener((changes, namespace) => {
  if (namespace !== "local") {
    return;
  }
  if (
    changes.hasOwnProperty(appStorageStatusKey) &&
    changes.status.newValue !== changes.status.oldValue
  ) {
    changes.status.newValue === appStatusStopped ? stopApp() : startApp();
  }
});

browser.runtime.onInstalled.addListener(startApp);
