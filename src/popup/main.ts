import browser from "webextension-polyfill";
import { stopApp, startApp, isRunning, getStoredDelay } from "../lib/shared.js";

const onOffButtonEl = document.querySelector("#onOffButton")!;
const delaySliderValue = document.querySelector(
  "#delayValue"
)! as HTMLInputElement;
const delayInputEl = document.querySelector("#delayInput")! as HTMLInputElement;

function renderSlider(value: number) {
  const progress = (value / Number(delayInputEl.max)) * 100;
  delayInputEl.style.background = `linear-gradient(to right, rgb(26, 115, 232) ${progress}%, #ccc ${progress}%)`;
  delaySliderValue.innerText = (Math.round(value / 100) / 10).toFixed(1) + "s";
}

delayInputEl.addEventListener("input", (event) => {
  const inputValue = Number((event.target as HTMLInputElement).value);
  renderSlider(inputValue);
  browser.storage.local.set({
    delay: inputValue,
  });
});

async function restoreOptions() {
  const delay = await getStoredDelay();
  renderSlider(delay);
  delayInputEl.value = delay;
  (await isRunning()) ? start() : stop();
}

onOffButtonEl.addEventListener("click", async () => {
  (await isRunning()) ? stop() : start();
});

function start() {
  onOffButtonEl.textContent = "Turn Off";
  onOffButtonEl.setAttribute(
    "title",
    "Turn off extension processing and click handling"
  );
  onOffButtonEl.classList.add("active");
  startApp();
}

function stop() {
  onOffButtonEl.textContent = "Turn On";
  onOffButtonEl.setAttribute(
    "title",
    "Turn on click protection on recently shifted elements"
  );
  onOffButtonEl.classList.remove("active");
  stopApp();
}

document.addEventListener("DOMContentLoaded", restoreOptions);
browser.runtime.onInstalled.addListener(restoreOptions);
/*
const reloadButtonEl = document.querySelector("#reloadButton");

reloadButtonEl.addEventListener("click", () => {
  browser.runtime.reload();
});
<button class="button" type="button" id="reloadButton">
  Reload Extension
</button>
*/
