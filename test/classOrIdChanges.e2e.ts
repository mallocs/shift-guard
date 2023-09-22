import { browser, $$, $, expect } from "@wdio/globals";

const isFirefox = browser.capabilities.browserName === "firefox";
const baseUrl = "http://127.0.0.1:4567/";

describe("Class or id changes can make elements unclickable", () => {
  const testPageUrl = `${baseUrl}classOrIdChanges.html`;
  const changeTimeout = 10000;
  it("should have elements be unclickable when a class change removes display none", async () => {
    await browser.setWindowSize(1600, 1400);
    await browser.url(testPageUrl);
    await expect(browser).toHaveUrl(testPageUrl);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await intervalSpeedEl.setValue("500");
    await changeSelectEl.selectByAttribute("value", "className,display-none,");
    await changeEl.waitForDisplayed({
      timeout: changeTimeout,
      waitforInterval: 50,
    });
    await changeEl.click();
    await expect(browser).toHaveUrl(testPageUrl);
    await changeSelectEl.selectByAttribute(
      "value",
      "className,display-none,display-block"
    );
    await changeEl.waitForDisplayed({
      timeout: changeTimeout,
      waitforInterval: 100,
    });
    await changeEl.click();
    await expect(browser).toHaveUrl(testPageUrl);
  });
  it("should have elements be unclickable when a class change removes visibility hidden", async () => {
    await browser.setWindowSize(1600, 1400);
    await browser.url(testPageUrl);
    await expect(browser).toHaveUrl(testPageUrl);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await intervalSpeedEl.setValue("500");
    await changeSelectEl.selectByAttribute(
      "value",
      "className,visibility-hidden,"
    );
    await changeEl.waitForDisplayed({
      timeout: changeTimeout,
      waitforInterval: 50,
    });
    await changeEl.click();
    await expect(browser).toHaveUrl(testPageUrl);
  });
  it("should have elements be unclickable when an id change removes display none", async () => {
    await browser.setWindowSize(1600, 1400);
    await browser.url(testPageUrl);
    await expect(browser).toHaveUrl(testPageUrl);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await intervalSpeedEl.setValue("500");
    await changeSelectEl.selectByAttribute("value", "id,display-none,");
    await changeEl.waitForDisplayed({
      timeout: changeTimeout,
      waitforInterval: 50,
    });
    await changeEl.click();
    await expect(browser).toHaveUrl(testPageUrl);
  });
  it("should have elements be unclickable when an id change removes visibility hidden", async () => {
    await browser.setWindowSize(1600, 1400);
    await browser.url(testPageUrl);
    await expect(browser).toHaveUrl(testPageUrl);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await intervalSpeedEl.setValue("500");
    await changeSelectEl.selectByAttribute("value", "id,visibility-hidden,");
    await changeEl.waitForDisplayed({
      timeout: changeTimeout,
      waitforInterval: 50,
    });
    await changeEl.click();
    await expect(browser).toHaveUrl(testPageUrl);
  });

  it("should have elements be unclickable when a class change causes a descendant selector to not match a rule with display none", async () => {
    await browser.setWindowSize(1600, 1400);
    await browser.url(testPageUrl);
    await expect(browser).toHaveUrl(testPageUrl);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await intervalSpeedEl.setValue("500");
    await changeSelectEl.selectByAttribute(
      "value",
      "className,display-none-complicated,"
    );
    await changeEl.waitForDisplayed({
      timeout: changeTimeout,
      waitforInterval: 50,
    });
    await changeEl.click();
    await expect(browser).toHaveUrl(testPageUrl);
  });

  it("should have elements be unclickable when a class change causes a descendant selector to not match a rule with visibility hidden", async () => {
    await browser.setWindowSize(1600, 1400);
    await browser.url(testPageUrl);
    await expect(browser).toHaveUrl(testPageUrl);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await intervalSpeedEl.setValue("500");
    await changeSelectEl.selectByAttribute(
      "value",
      "className,visibility-hidden-complicated,"
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
    await changeSelectEl.selectByAttribute(
      "value",
      "className,display-none,display-block"
    );
    await changeEl.waitForDisplayed({
      timeout: changeTimeout,
      waitforInterval: 50,
    });
    // await changeEl.doubleClick();
    // For some reason .doubleClick() only seems to be registering 2 single clicks in FF
    // but it works with the style change tests.
    await browser.executeAsync((done) => {
      document
        .querySelector('div[data-testid="changeEl"')
        ?.dispatchEvent(new MouseEvent("click", { detail: 2 }));
      done();
    });
    await expect(browser).not.toHaveUrl(testPageUrl);
  });
});

describe("Shifted elements should be clickable after extension default time has passed", () => {
  const testPageUrl = `${baseUrl}classOrIdChanges.html`;
  const defaultExtensionInterval = 600;
  const changeTimeout = 10000;

  it("should be clickable when a class change changes css visibility to hidden", async () => {
    await browser.setWindowSize(1600, 1400);
    await browser.url(testPageUrl);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await expect(browser).toHaveUrl(testPageUrl);
    await intervalSpeedEl.setValue("4000");
    await changeSelectEl.selectByAttribute(
      "value",
      "className,visibility-hidden,"
    );
    await changeEl.waitForDisplayed({
      timeout: changeTimeout,
      waitforInterval: 50,
    });
    await browser.pause(defaultExtensionInterval + 600);
    await changeEl.click();
    await expect(browser).not.toHaveUrl(testPageUrl);
  });

  it("should be clickable when a class change changes css display to none", async () => {
    await browser.setWindowSize(1600, 1400);
    await browser.url(testPageUrl);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await expect(browser).toHaveUrl(testPageUrl);
    await intervalSpeedEl.setValue("4000");
    await changeSelectEl.selectByAttribute("value", "className,display-none,");
    await changeEl.waitForDisplayed({
      timeout: changeTimeout,
      waitforInterval: 50,
    });
    await browser.pause(defaultExtensionInterval + 600);
    await changeEl.click();
    await expect(browser).not.toHaveUrl(testPageUrl);
  });

  it("should be clickable when an id change changes css visibility", async () => {
    await browser.setWindowSize(1600, 1400);
    await browser.url(testPageUrl);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await expect(browser).toHaveUrl(testPageUrl);
    await intervalSpeedEl.setValue("4000");
    await changeSelectEl.selectByAttribute("value", "id,visibility-hidden,");
    await changeEl.waitForDisplayed({
      timeout: changeTimeout,
      waitforInterval: 50,
    });
    await browser.pause(defaultExtensionInterval + 600);
    await changeEl.click();
    await expect(browser).not.toHaveUrl(testPageUrl);
  });

  it("should be clickable when an id change changes css display", async () => {
    await browser.setWindowSize(1600, 1400);
    await browser.url(testPageUrl);
    const changeEl = await $('div[data-testid="changeEl"');
    const intervalSpeedEl = await $("#intervalSpeedEl");
    const changeSelectEl = await $("#changeSelectEl");
    await expect(browser).toHaveUrl(testPageUrl);
    await intervalSpeedEl.setValue("4000");
    await changeSelectEl.selectByAttribute("value", "id,display-none,");
    await changeEl.waitForDisplayed({
      timeout: changeTimeout,
      waitforInterval: 50,
    });
    await browser.pause(defaultExtensionInterval + 600);
    await changeEl.click();
    await expect(browser).not.toHaveUrl(testPageUrl);
  });
});
