const onOffButtonEl = document.querySelector("#onOffButton");
const delaySliderValue = document.querySelector("#delayValue");
const delayInputEl = document.querySelector("#delayInput");

function renderSlider(value) {
  const progress = (value / delayInputEl.max) * 100;
  delayInputEl.style.background = `linear-gradient(to right, rgb(26, 115, 232) ${progress}%, #ccc ${progress}%)`;
  delaySliderValue.innerText = (Math.round(value / 100) / 10).toFixed(1) + "s";
}

delayInputEl.addEventListener("input", (event) => {
  renderSlider(event.target.value);
  browser.storage.local.set({
    delay: parseInt(event.target.value),
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
  onOffButtonEl.textContent = "OFF";
  onOffButtonEl.setAttribute(
    "title",
    "Stop extension processing and click handling"
  );
  startApp();
}

function stop() {
  onOffButtonEl.textContent = "ON";
  onOffButtonEl.setAttribute(
    "title",
    "Reject clicks on recently shifted elements"
  );
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
