import { browser, $$, $, expect } from "@wdio/globals";

const isFirefox = browser.capabilities.browserName === "firefox";
const baseUrl = "http://127.0.0.1:4567/";

describe("Style changes can make elements unclickable", () => {
  const testPageUrl = `${baseUrl}styleChanges.html`;
  const changeTimeout = 10000;
  it("should have elements unclickable when display changes between block and none", async () => {
    await browser.setWindowSize(1600, 1400);
    await browser.url(testPageUrl);
    await expect(browser).toHaveUrl(testPageUrl);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await intervalSpeedEl.setValue("500");
    await changeSelectEl.selectByAttribute("value", "display,block,none");
    await changeEl.waitForDisplayed({
      timeout: changeTimeout,
      waitforInterval: 50,
    });
    await changeEl.click();
    await expect(browser).toHaveUrl(testPageUrl);
  });
  it("should have elements unclickable when display changes between inline-block and none", async () => {
    await browser.setWindowSize(1600, 1400);
    await browser.url(testPageUrl);
    await expect(browser).toHaveUrl(testPageUrl);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await intervalSpeedEl.setValue("500");
    await changeSelectEl.selectByAttribute(
      "value",
      "display,inline-block,none"
    );
    await changeEl.waitForDisplayed({
      timeout: changeTimeout,
      waitforInterval: 50,
    });
    await changeEl.click();
    await expect(browser).toHaveUrl(testPageUrl);
  });
  it("should have elements unclickable when visibility changes between visible and hidden", async () => {
    await browser.setWindowSize(1600, 1400);
    await browser.url(testPageUrl);
    await expect(browser).toHaveUrl(testPageUrl);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await intervalSpeedEl.setValue("500");
    await changeSelectEl.selectByAttribute(
      "value",
      "visibility,visible,hidden"
    );
    await changeEl.waitForDisplayed({
      timeout: changeTimeout,
      waitforInterval: 50,
    });
    await changeEl.click();
    await expect(browser).toHaveUrl(testPageUrl);
  });
  it("should have double clicks not be rejected", async () => {
    await browser.setWindowSize(1600, 1400);
    await browser.url(testPageUrl);
    await expect(browser).toHaveUrl(testPageUrl);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await intervalSpeedEl.setValue("500");
    await changeSelectEl.selectByAttribute("value", "display,block,none");
    await changeEl.waitForDisplayed({
      timeout: changeTimeout,
      waitforInterval: 50,
    });
    await changeEl.doubleClick();
    await expect(browser).not.toHaveUrl(testPageUrl);
  });
});

describe("Changed elements should be clickable after extension default time has passed", () => {
  const testPageUrl = `${baseUrl}styleChanges.html`;
  const defaultExtensionInterval = 600;
  const changeTimeout = 10000;

  it("should be clickable when inline style changes display to block from none", async () => {
    await browser.setWindowSize(1600, 1400);
    await browser.url(testPageUrl);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await expect(browser).toHaveUrl(testPageUrl);
    await intervalSpeedEl.setValue("4000");
    await changeSelectEl.selectByAttribute("value", "display,block,none");
    await changeEl.waitForDisplayed({
      timeout: changeTimeout,
      waitforInterval: 50,
    });
    await browser.pause(defaultExtensionInterval + 600);
    await changeEl.click();
    await expect(browser).not.toHaveUrl(testPageUrl);
  });

  it("should be clickable when inline style changes display to inline-block from none", async () => {
    await browser.setWindowSize(1600, 1400);
    await browser.url(testPageUrl);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await expect(browser).toHaveUrl(testPageUrl);
    await intervalSpeedEl.setValue("5000");
    await changeSelectEl.selectByAttribute(
      "value",
      "display,inline-block,none"
    );
    await changeEl.waitForDisplayed({
      timeout: changeTimeout,
      waitforInterval: 50,
    });
    await browser.pause(defaultExtensionInterval + 600);
    await changeEl.click();
    await expect(browser).not.toHaveUrl(testPageUrl);
  });

  it("should be clickable when inline style changes visibility to visible from hidden", async () => {
    await browser.setWindowSize(1600, 1400);
    await browser.url(testPageUrl);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await expect(browser).toHaveUrl(testPageUrl);
    await intervalSpeedEl.setValue("5000");
    await changeSelectEl.selectByAttribute(
      "value",
      "visibility,visible,hidden"
    );
    await changeEl.waitForDisplayed({
      timeout: changeTimeout,
      waitforInterval: 50,
    });
    await browser.pause(defaultExtensionInterval + 600);
    await changeEl.click();
    await expect(browser).not.toHaveUrl(testPageUrl);
  });
});
