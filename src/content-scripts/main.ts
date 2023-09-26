import browser from "webextension-polyfill";
import {
  appStatusStopped,
  appStorageStatusKey,
  appStorageDelayKey,
  defaultDelay,
} from "../lib/shared.js";

// TODO: LayoutShift type
type LayoutShift = { sources: LayoutShiftAttribution[] };
type LayoutShiftAttribution = { node: HTMLElement; sources: Node[] };
let mutationLog: [number, MutationRecord][] = [];
let shiftLog: [number, LayoutShiftAttribution][] = [];

let delay = defaultDelay;
browser.storage.local.get(appStorageDelayKey).then((res) => {
  delay = res.delay || defaultDelay;
});

// mutates input log
// log entry should be [Date, logEntry]
function pruneLog(log: [number, any][]) {
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

function pruneShiftLog() {
  shiftLog = pruneLog(shiftLog);
}
const throttledPruneShiftLog = throttle(pruneShiftLog, 500);

function pruneMutationLog() {
  mutationLog = pruneLog(mutationLog);
}
const throttledPruneMutationLog = throttle(pruneMutationLog, 500);

function throttle(callback: (args: any) => any, limit: number) {
  var waiting = false; // Initially, we're not waiting
  return function (args?: any) {
    // We return a throttled function
    if (!waiting) {
      // If we're not waiting
      callback(args); // Execute users function
      waiting = true; // Prevent future invocations
      setTimeout(function () {
        // After a period of time
        waiting = false; // And allow future invocations
      }, limit);
    }
  };
}

const performanceObserver = new PerformanceObserver((list) => {
  throttledPruneShiftLog();
  list.getEntries().forEach((entry) => {
    entry.entryType === "layout-shift" &&
      (entry as unknown as LayoutShift).sources.forEach((source) => {
        shiftLog.push([Date.now(), source]);
      });
  });
});

let hideSelectors: Set<string>;
let showSelectors: Set<string>;
function setupClassSets() {
  hideSelectors = new Set();
  showSelectors = new Set();

  for (const styleSheet of document.styleSheets) {
    try {
      const cssRules = styleSheet.cssRules;
      for (const rule of cssRules) {
        if (!(rule instanceof CSSStyleRule)) {
          continue;
        }
        if ("display" in rule.style) {
          if (rule.style.display === "none") {
            hideSelectors.add(rule.selectorText);
          } else if (["block", "inline-block"].includes(rule.style.display)) {
            showSelectors.add(rule.selectorText);
          }
        }
        if ("visibility" in rule.style) {
          if (rule.style.visibility === "hidden") {
            hideSelectors.add(rule.selectorText);
          } else if (rule.style.visibility === "visible") {
            showSelectors.add(rule.selectorText);
          }
        }
      }
    } catch (err) {
      console.log(`Can't read stylesheet. ${err}`);
    }
  }
}

const VISIBILITY_HIDDEN_RE = /visibility:\s?hidden/g;
const DISPLAY_NONE_RE = /display:\s?none/g;

const mutationObserver = new MutationObserver((mutationList) => {
  throttledPruneMutationLog();
  for (const mutation of mutationList) {
    if (!hideSelectors) {
      setupClassSets();
    }
    if (mutation.type === "childList") {
      mutationLog.push([Date.now(), mutation]);
    } else if (mutation.type === "attributes") {
      const mutationTarget = mutation.target as HTMLElement;
      if (mutation.attributeName === "style") {
        // TODO: Check if style mutation is overriding a class.
        const style = mutationTarget.style;
        if (
          ((style.display === "block" || style.display === "inline-block") &&
            mutation.oldValue?.search(DISPLAY_NONE_RE) !== -1) ||
          (style.visibility === "visible" &&
            mutation.oldValue?.search(VISIBILITY_HIDDEN_RE) !== -1)
        ) {
          mutationLog.push([Date.now(), mutation]);
        }
      } else if (
        (mutation.attributeName === "class" &&
          mutation.oldValue !==
            mutationTarget.attributes.getNamedItem("class")?.value) ||
        (mutation.attributeName === "id" &&
          mutation.oldValue !==
            mutationTarget.attributes.getNamedItem("id")?.value)
      ) {
        const oldValue = mutation.oldValue ? String(mutation.oldValue) : "";
        const oldValueSelector =
          mutation.attributeName === "class"
            ? `.${oldValue.trim().split(" ").join(".")}`
            : `#${oldValue.trim()}`;
        const mutationTarget = mutation.target as HTMLElement;
        for (const selectorText of hideSelectors) {
          const oldValueStarSelector =
            mutation.attributeName === "class"
              ? selectorText.replace(`.${oldValue}`, " * ")
              : selectorText.replace(`#${oldValue}`, " * ");
          // target was hidden and the mutation removed the class doing the hiding
          if (
            !mutationTarget.matches(selectorText) &&
            (oldValue === "" || mutationTarget.matches(oldValueStarSelector))
          ) {
            mutationLog.push([Date.now(), mutation]);
          }
        }
        // Adding a class that shows the element by overriding a hide selector
        if (oldValue === "") {
          continue;
        }
        for (const selectorText of showSelectors) {
          if (
            mutationTarget.matches(selectorText) &&
            mutationTarget.matches(oldValueSelector) // TODO: Check this is a hide selector.
          ) {
            mutationLog.push([Date.now(), mutation]);
          }
        }
      }
    }
  }
});

function isEventInRect(event: MouseEvent, rect: DOMRect) {
  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  );
}

function stopClick(e: MouseEvent) {
  // Only single clicks should be stopped.
  if (e.detail >= 2) {
    return;
  }
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  window.addEventListener("click", captureClick, true);
}
function captureClick(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  window.removeEventListener("click", captureClick, true);
}

const mousedownHandlerFn = (e: MouseEvent) => {
  // mutations sometimes happen in response to mousedown events but those are
  // triggered by the user and shouldn't be stopped, so we have to check
  // mutations when mousedown events happen and use that to cancel click events
  // console.log(mutationLog);
  pruneMutationLog();
  for (const [logTime, logEntry] of mutationLog) {
    if (logEntry.type === "childList" && logEntry.addedNodes.length) {
      logEntry.addedNodes.forEach((node) => {
        if (e.target instanceof HTMLElement && node.contains(e.target)) {
          stopClick(e);
          return;
        }
      });
    } else if (
      logEntry.type === "attributes" &&
      logEntry.attributeName &&
      logEntry.target instanceof HTMLElement &&
      logEntry.oldValue !==
        logEntry.target.attributes.getNamedItem(logEntry.attributeName)
          ?.value &&
      e.target instanceof HTMLElement &&
      logEntry.target.contains(e.target)
    ) {
      stopClick(e);
      return;
    }
  }

  pruneShiftLog();
  for (const [logTime, logEntry] of shiftLog) {
    if (
      logEntry.node &&
      isEventInRect(e, logEntry.node.getBoundingClientRect())
    ) {
      stopClick(e);
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
