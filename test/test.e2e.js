import { browser, $$, $, expect } from "@wdio/globals";

const isFirefox = browser.capabilities.browserName === "firefox";
const baseUrl = "http://127.0.0.1:4567/";
const defaultPageChangeInterval = 4000;

describe("Web Extension e2e test", () => {
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
  it("should have shifted elements be unclickable when shift interval is less than the extension default", async () => {
    await browser.setWindowSize(1675, 591);
    await browser.url(`${baseUrl}classOrIdChanges.html`);
    await expect(browser).toHaveUrl(`${baseUrl}classOrIdChanges.html`);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await intervalSpeedEl.setValue("500");
    await changeSelectEl.selectByAttribute("value", "className,display-none,");
    await changeEl.waitForClickable({
      timeout: defaultPageChangeInterval + 1000,
    });
    await changeEl.click();
    await changeSelectEl.selectByAttribute(
      "value",
      "className,visiblility-hidden,"
    );
    await browser.pause(200);
    await changeEl.waitForClickable({ timeout: 2000 });
    await changeEl.click();
    await changeSelectEl.selectByAttribute("value", "id,display-none,");
    await browser.pause(200);
    await changeEl.waitForClickable({ timeout: 2000 });
    await changeEl.click();
    await changeSelectEl.selectByAttribute("value", "id,visiblility-hidden,");
    await browser.pause(200);
    await changeEl.waitForClickable({ timeout: 2000 });
    await changeEl.click();
    await expect(browser).toHaveUrl(`${baseUrl}classOrIdChanges.html`);
  });
});

describe("Shifted elements should be clickable after extension default time has passed", () => {
  const defaultExtensionInterval = 600;

  it("should be clickable when a class change changes css visibility to hidden", async () => {
    await browser.setWindowSize(1675, 646);
    await browser.url(`${baseUrl}classOrIdChanges.html`);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await expect(browser).toHaveUrl(`${baseUrl}classOrIdChanges.html`);
    await intervalSpeedEl.setValue("10000");
    await changeSelectEl.selectByAttribute(
      "value",
      "className,visiblility-hidden,"
    );
    await changeEl.waitForClickable({
      timeout: defaultPageChangeInterval + 1000,
    });
    await browser.pause(defaultExtensionInterval + 100);
    await changeEl.click();
    await browser.waitUntil(async function () {
      return (await browser.getUrl()) !== `${baseUrl}classOrIdChanges.html`;
    });
    await expect(browser).not.toHaveUrl(`${baseUrl}classOrIdChanges.html`);
  });

  it("should be clickable when a class change changes css display to none", async () => {
    await browser.setWindowSize(1675, 646);
    await browser.url(`${baseUrl}classOrIdChanges.html`);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await expect(browser).toHaveUrl(`${baseUrl}classOrIdChanges.html`);
    await intervalSpeedEl.setValue("10000");
    await changeSelectEl.selectByAttribute("value", "className,display-none,");
    await changeEl.waitForClickable({
      timeout: defaultPageChangeInterval + 1000,
    });
    await browser.pause(defaultExtensionInterval + 100);
    await changeEl.click();
    await browser.waitUntil(async function () {
      return (await browser.getUrl()) !== `${baseUrl}classOrIdChanges.html`;
    });
    await expect(browser).not.toHaveUrl(`${baseUrl}classOrIdChanges.html`);
  });

  it("should be clickable when an id change changes css visibility", async () => {
    await browser.setWindowSize(1675, 646);
    await browser.url(`${baseUrl}classOrIdChanges.html`);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await expect(browser).toHaveUrl(`${baseUrl}classOrIdChanges.html`);
    await intervalSpeedEl.setValue("10000");
    await changeSelectEl.selectByAttribute("value", "id,visiblility-hidden,");
    await changeEl.waitForClickable({
      timeout: defaultPageChangeInterval + 1000,
    });
    await browser.pause(defaultExtensionInterval + 100);
    await changeEl.click();
    await browser.waitUntil(async function () {
      return (await browser.getUrl()) !== `${baseUrl}classOrIdChanges.html`;
    });
    await expect(browser).not.toHaveUrl(`${baseUrl}classOrIdChanges.html`);
  });

  it("should be clickable when an id change changes css display", async () => {
    await browser.setWindowSize(1675, 646);
    await browser.url(`${baseUrl}classOrIdChanges.html`);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await expect(browser).toHaveUrl(`${baseUrl}classOrIdChanges.html`);
    await intervalSpeedEl.setValue("10000");
    await changeSelectEl.selectByAttribute("value", "id,display-none,");
    await changeEl.waitForClickable({
      timeout: defaultPageChangeInterval + 1000,
    });
    await browser.pause(defaultExtensionInterval + 100);
    await changeEl.click();
    await browser.waitUntil(async function () {
      return (await browser.getUrl()) !== `${baseUrl}classOrIdChanges.html`;
    });
    await expect(browser).not.toHaveUrl(`${baseUrl}classOrIdChanges.html`);
  });
});
