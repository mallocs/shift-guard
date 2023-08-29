import "../lib/browser-polyfill.js";
import "../lib/shared.js";

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
