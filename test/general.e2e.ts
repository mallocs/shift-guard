import { browser, $$, $, expect } from "@wdio/globals";

const isFirefox = browser.capabilities.browserName === "firefox";
const baseUrl = "http://127.0.0.1:4567/";
const defaultPageChangeInterval = 4000;

describe("General e2e tests", () => {
  if (!isFirefox) {
    it("should open popup window with the default shift duration", async () => {
      await browser.openExtensionPopup("Shift Guard");
      await expect($$("#extension-root")).toBeElementsArrayOfSize(1);
    });
    it("should have the default shift duration", async () => {
      await browser.openExtensionPopup("Shift Guard");
      await expect($$("#delayValue")).toHaveText("0.6s");
    });
  }
});
