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
    // TODO: Find the cases where these mutations cause shifts.
    // if (mutation.type === "childList") {
    //   mutationLog.push([Date.now(), mutation]);
    //   continue;
    // } else
    if (
      mutation.type === "attributes" &&
      shouldLogAttributeMutation(mutation)
    ) {
      mutationLog.push([Date.now(), mutation]);
    }
  }
});

function shouldLogAttributeMutation(mutation: MutationRecord): boolean {
  const mutationTarget = mutation.target as HTMLElement;
  const oldValue = String(mutation.oldValue ?? "");

  // Sometimes a mutation that seems unchanged gets added to the list
  if (
    mutation.attributeName &&
    oldValue ===
      mutationTarget.attributes.getNamedItem(mutation.attributeName)?.value
  ) {
    return false;
  }
  return (
    (mutation.attributeName === "style" && shouldLogStyleMutation(mutation)) ||
    (mutation.attributeName === "id" && shouldLogIdMutation(mutation)) ||
    (mutation.attributeName === "class" && shouldLogClassMutation(mutation))
  );
}

function shouldLogStyleMutation(mutation: MutationRecord): boolean {
  // TODO: Check if style mutation is overriding a class.
  const style = (mutation.target as HTMLElement).style;
  if (
    ((style.display === "block" || style.display === "inline-block") &&
      mutation.oldValue?.search(DISPLAY_NONE_RE) !== -1) ||
    (style.visibility === "visible" &&
      mutation.oldValue?.search(VISIBILITY_HIDDEN_RE) !== -1)
  ) {
    return true;
  }
  return false;
}

function shouldLogIdMutation(mutation: MutationRecord): boolean {
  // 1) remove hide id
  // 2) override hide class with show id

  const mutationTarget = mutation.target as HTMLElement;
  const oldValue = String(mutation.oldValue ?? "");
  for (const hideSelectorText of hideSelectors) {
    // 2)
    if (mutationTarget.matches(hideSelectorText)) {
      for (const showSelectorText of showSelectors) {
        if (
          !showSelectorText.includes(
            `#${mutationTarget.attributes.getNamedItem("id")?.value}`
          )
        ) {
          continue;
        }
        if (mutationTarget.matches(showSelectorText)) {
          return true;
        }
      }
    }
    // 1)
    if (
      targetDidMatch(hideSelectorText, oldValue, "#", mutationTarget) &&
      !mutationTarget.matches(hideSelectorText)
    ) {
      return true;
    }
  }
  return false;
}

function shouldLogClassMutation(mutation: MutationRecord): boolean {
  // 1) override hide class with more specific show selector
  // 2) remove hide class

  const mutationTarget = mutation.target as HTMLElement;
  const oldValue = String(mutation.oldValue ?? "");
  // class mutation needs to be overriding or removing something from the oldValue to appear.
  if (oldValue === "") {
    return false;
  }
  // old value matches a hide selector
  for (const hideSelectorText of hideSelectors) {
    if (targetDidMatch(hideSelectorText, oldValue, "\\.", mutationTarget)) {
      // 2) mutated value does not match hide selector because it was removed
      if (!mutationTarget.matches(hideSelectorText)) {
        return true;
      }
      // 1) Adding a class that shows the element by overriding a hide selector
      for (const showSelectorText of showSelectors) {
        if (mutationTarget.matches(showSelectorText)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Filter out regex special characters from string to avoid a syntax error, ie
// Uncaught SyntaxError: Invalid regular expression: /(^|[\s]+)\.lg:h-[calc(100vh-3rem)]($|[\s]+)/g: Range out of order in character class
const STRING_ESCAPE_RE = /[|\\{}()[\]^$+*?.]/g;

// https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord/oldValue
// Turn the oldValue into a selector to check whether a target would have
// matched the fromSelector.
// ex) getStarSelector('body .wrapper .display-none-specific', 'display-none-specific', '\\.') => 'body .wrapper *'
// if this matches the mutation.target, then fromSelector was being applied to the target.
function getStarSelector(
  fromSelector: string,
  oldValue: string,
  prefix: string
) {
  return oldValue
    .trim()
    .split(" ")
    .filter((val) => val !== "")
    .reduce(
      (prev, current) =>
        prev.replace(
          new RegExp(
            `(^|[\\s]+)${prefix}${current.replace(
              STRING_ESCAPE_RE,
              "\\$&"
            )}($|[\\s]+)`,
            "g"
          ),
          " * "
        ),
      fromSelector
    )
    .trim();
}

function targetDidMatch(
  fromSelector: string,
  oldValue: string,
  prefix: string,
  target: HTMLElement
): boolean {
  const oldValueStarSelector = getStarSelector(fromSelector, oldValue, prefix);

  return (
    oldValueStarSelector !== fromSelector &&
    target.matches(oldValueStarSelector)
  );
}

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

browser.storage.local
  .get(appStorageStatusKey)
  .then((res: Record<string, any>) => {
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
