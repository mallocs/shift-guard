import { browser, $$, $, expect } from "@wdio/globals";

const isFirefox = browser.capabilities.browserName === "firefox";
const baseUrl = "http://127.0.0.1:4567/";
const defaultPageChangeInterval = 4000;

describe("Class or id changes e2e tests", () => {
  const testPageUrl = `${baseUrl}classOrIdChanges.html`;
  it("should have shifted elements be unclickable when shift interval is less than the extension default", async () => {
    await browser.setWindowSize(1675, 591);
    await browser.url(testPageUrl);
    await expect(browser).toHaveUrl(testPageUrl);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await intervalSpeedEl.setValue("500");
    await browser.pause(defaultPageChangeInterval);
    await changeSelectEl.selectByAttribute("value", "className,display-none,");
    await changeEl.waitForDisplayed({
      timeout: 2000,
    });
    await changeEl.click();
    await expect(browser).toHaveUrl(testPageUrl);
    await changeSelectEl.selectByAttribute(
      "value",
      "className,visiblility-hidden,"
    );
    await browser.pause(200);
    await changeEl.waitForDisplayed({ timeout: 2000 });
    await changeEl.click();
    await expect(browser).toHaveUrl(testPageUrl);
    await changeSelectEl.selectByAttribute("value", "id,display-none,");
    await browser.pause(200);
    await changeEl.waitForDisplayed({ timeout: 2000 });
    await changeEl.click();
    await expect(browser).toHaveUrl(testPageUrl);
    await changeSelectEl.selectByAttribute("value", "id,visiblility-hidden,");
    await browser.pause(200);
    await changeEl.waitForDisplayed({ timeout: 2000 });
    await changeEl.click();
    await expect(browser).toHaveUrl(testPageUrl);
  });
});

describe("Shifted elements should be clickable after extension default time has passed", () => {
  const testPageUrl = `${baseUrl}classOrIdChanges.html`;
  const defaultExtensionInterval = 600;

  it("should be clickable when a class change changes css visibility to hidden", async () => {
    await browser.setWindowSize(1675, 646);
    await browser.url(testPageUrl);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await expect(browser).toHaveUrl(testPageUrl);
    await intervalSpeedEl.setValue("10000");
    await changeSelectEl.selectByAttribute(
      "value",
      "className,visiblility-hidden,"
    );
    await changeEl.waitForDisplayed({
      timeout: defaultPageChangeInterval + 1000,
    });
    await browser.pause(defaultExtensionInterval + 100);
    await changeEl.click();
    await expect(browser).not.toHaveUrl(testPageUrl);
  });

  it("should be clickable when a class change changes css display to none", async () => {
    await browser.setWindowSize(1675, 646);
    await browser.url(testPageUrl);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await expect(browser).toHaveUrl(testPageUrl);
    await intervalSpeedEl.setValue("10000");
    await changeSelectEl.selectByAttribute("value", "className,display-none,");
    await changeEl.waitForDisplayed({
      timeout: defaultPageChangeInterval + 1000,
    });
    await browser.pause(defaultExtensionInterval + 100);
    await changeEl.click();
    await expect(browser).not.toHaveUrl(testPageUrl);
  });

  it("should be clickable when an id change changes css visibility", async () => {
    await browser.setWindowSize(1675, 646);
    await browser.url(testPageUrl);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await expect(browser).toHaveUrl(testPageUrl);
    await intervalSpeedEl.setValue("10000");
    await changeSelectEl.selectByAttribute("value", "id,visiblility-hidden,");
    await changeEl.waitForDisplayed({
      timeout: defaultPageChangeInterval + 1000,
    });
    await browser.pause(defaultExtensionInterval + 100);
    await changeEl.click();
    await expect(browser).not.toHaveUrl(testPageUrl);
  });

  it("should be clickable when an id change changes css display", async () => {
    await browser.setWindowSize(1675, 646);
    await browser.url(testPageUrl);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await expect(browser).toHaveUrl(testPageUrl);
    await intervalSpeedEl.setValue("10000");
    await changeSelectEl.selectByAttribute("value", "id,display-none,");
    await changeEl.waitForDisplayed({
      timeout: defaultPageChangeInterval + 1000,
    });
    await browser.pause(defaultExtensionInterval + 100);
    await changeEl.click();
    await expect(browser).not.toHaveUrl(testPageUrl);
  });
});
