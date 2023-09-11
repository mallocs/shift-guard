import browser from "webextension-polyfill";
import {
  appStatusStopped,
  appStorageStatusKey,
  appStorageDelayKey,
  defaultDelay,
} from "../lib/shared.js";

let mutationLog = [];
let shiftLog = [];

let delay = defaultDelay;
browser.storage.local.get(appStorageDelayKey).then((res) => {
  delay = res.delay || defaultDelay;
});

// mutates input log
// log entry should be [Date, logEntry]
function pruneLog(log) {
  const time = Date.now();
  let left = 0,
    right = log.length;
  while (left < right) {
    const middle = left + Math.floor((right - left) / 2);
    if (log[middle][0] + delay <= time) {
      left = middle + 1;
    } else {
      right = middle;
    }
  }
  return log.slice(left);
}
const performanceObserver = new PerformanceObserver((list) => {
  shiftLog = pruneLog(shiftLog);
  list.getEntries().forEach((entry) => {
    entry.sources.forEach((source) => {
      shiftLog.push([Date.now(), source]);
    });
  });
});

let watchSelectors;
function setupClassSets() {
  watchSelectors = new Set();

  for (const styleSheet of document.styleSheets) {
    try {
      const cssRules = styleSheet.cssRules;
      for (const rule of cssRules) {
        if (!rule.selectorText) {
          continue;
        }
        if (
          rule.selectorText.startsWith(".") ||
          rule.selectorText.startsWith("#")
        ) {
          if (
            "display" in rule.style &&
            ["block", "inline-block", "none"].includes(rule.style.display)
          ) {
            watchSelectors.add(rule.selectorText);
          }
          if (
            "visibility" in rule.style &&
            ["visible", "hidden"].includes(rule.style.visibility)
          ) {
            watchSelectors.add(rule.selectorText);
          }
        }
      }
    } catch (err) {
      console.log(`Can't read stylesheet. ${err}`);
    }
  }
}

const mutationObserver = new MutationObserver((mutationList) => {
  mutationLog = pruneLog(mutationLog);

  for (const mutation of mutationList) {
    if (!watchSelectors) {
      setupClassSets();
    }
    if (mutation.type === "childList") {
      mutationLog.push([Date.now(), mutation]);
    } else if (mutation.type === "attributes") {
      if (mutation.attributeName === "style") {
        const style = mutation.target.style;
        if (
          style.display === "block" ||
          style.display === "inline-block" ||
          style.visibility === "visible"
        ) {
          mutationLog.push([Date.now(), mutation]);
        }
      } else if (
        (mutation.attributeName === "class" &&
          mutation.oldValue !==
            mutation.target.attributes.getNamedItem("class").value) ||
        (mutation.attributeName === "id" &&
          mutation.oldValue !==
            mutation.target.attributes.getNamedItem("id").value)
      ) {
        // TODO: only matches when mutation target exactly matches the rule selectorText
        // Should match the difference of old -> current and use that to check if
        // any future clicked element completes the selector.
        for (const selectorText of watchSelectors) {
          if (
            mutation.target.matches(selectorText) ||
            "." + mutation.oldValue === selectorText
          ) {
            mutationLog.push([Date.now(), mutation]);
          }
        }
      }
    }
  }
});

function isEventInRect(event, rect) {
  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  );
}

function stopEvent(e) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  window.addEventListener("click", captureClick, true);
}
function captureClick(e) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  window.removeEventListener("click", captureClick, true);
}

const mousedownHandlerFn = (e) => {
  // mutations sometimes happen in response to mousedown events but those are
  // triggered by the user and shouldn't be stopped, so we have to check
  // mutations when mousedown events happen and use that to cancel click events

  mutationLog = pruneLog(mutationLog);
  for (const [logTime, logEntry] of mutationLog) {
    if (logEntry.type === "childList" && logEntry.addedNodes.length) {
      logEntry.addedNodes.forEach((node) => {
        if (node.contains(e.target)) {
          stopEvent(e);
          return;
        }
      });
    } else if (
      logEntry.type === "attributes" &&
      logEntry.oldValue !==
        logEntry.target.attributes.getNamedItem(logEntry.attributeName).value &&
      logEntry.target.contains(e.target)
    ) {
      stopEvent(e);
      return;
    }
  }

  shiftLog = pruneLog(shiftLog);
  for (const [logTime, logEntry] of shiftLog) {
    if (
      logEntry.node &&
      isEventInRect(e, logEntry.node.getBoundingClientRect())
    ) {
      stopEvent(e);
      return;
    }
  }
};

function start() {
  performanceObserver.observe({ type: "layout-shift", buffered: true });
  mutationObserver.observe(document.body, {
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ["class", "style", "id"],
    childList: true,
    subtree: true,
  });
  document.addEventListener("mousedown", mousedownHandlerFn, true);
}

function stop() {
  performanceObserver.disconnect();
  mutationObserver.disconnect();
  document.removeEventListener("mousedown", mousedownHandlerFn, true);
}

browser.storage.local.get(appStorageStatusKey).then((res) => {
  if (res.status !== appStatusStopped) {
    start();
  }
});

browser.storage.onChanged.addListener((changes, namespace) => {
  if (namespace !== "local") {
    return;
  }
  if (changes.hasOwnProperty(appStorageDelayKey)) {
    delay = changes.delay.newValue;
  } else if (changes.hasOwnProperty(appStorageStatusKey)) {
    changes.status.newValue === appStatusStopped ? stop() : start();
  }
});

// function getCssRulesByClassName(className) {
//   let rules = [];
//   for (let i = 0; i < document.styleSheets.length; i++) {
//     let styleSheet = document.styleSheets[i];
//     try {
//       let cssRules = styleSheet.cssRules || styleSheet.rules;
//       for (let j = 0; j < cssRules.length; j++) {
//         let rule = cssRules[j];
//         if (rule.selectorText === "." + className) {
//           rules.push(rule);
//         }
//       }
//     } catch (err) {
//       continue;
//     }
//   }
//   return rules;
// }
