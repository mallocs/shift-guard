import { browser, $$, $, expect } from "@wdio/globals";

const isFirefox = browser.capabilities.browserName === "firefox";
const baseUrl = "http://127.0.0.1:4567/";

describe("Shift changes can make elements unclickable", () => {
  const testPageUrl = `${baseUrl}shiftChanges.html`;
  const defaultExtensionInterval = 600;
  const changeTimeout = 10000;

  if (!isFirefox) {
    it("should have elements unclickable when they are shifted to a different position", async () => {
      await browser.setWindowSize(1600, 1400);
      await browser.url(testPageUrl);
      await expect(browser).toHaveUrl(testPageUrl);
      const changeEl = await $('div[data-testid="shiftEl"');
      const intervalSpeedEl = await $("#intervalSpeedEl");
      const changeSelectEl = await $("#changeSelectEl");
      await intervalSpeedEl.setValue("500");
      await changeSelectEl.selectByAttribute("value", "display,block,none");
      await changeEl.waitForDisplayed({
        timeout: changeTimeout,
      });
      await changeEl.click();
      await expect(browser).toHaveUrl(testPageUrl);
    });

    it("should have elements be clickable after extension default time has passed", async () => {
      await browser.setWindowSize(1600, 1400);
      await browser.url(testPageUrl);
      const changeEl = await $('div[data-testid="shiftEl"');
      const intervalSpeedEl = await $("#intervalSpeedEl");
      const changeSelectEl = await $("#changeSelectEl");
      await expect(browser).toHaveUrl(testPageUrl);
      await intervalSpeedEl.setValue("5000");
      await changeSelectEl.selectByAttribute("value", "display,block,none");
      await browser.pause(defaultExtensionInterval + 600);
      await changeEl.waitForDisplayed({
        timeout: changeTimeout,
        waitforInterval: 50,
      });
      await changeEl.click();
      await expect(browser).not.toHaveUrl(testPageUrl);
    });
  }
});
