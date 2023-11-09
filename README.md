<div align="center">

![Extension logo](./src/public/icons/icon-128.png)

# Shift Guard

[![chrome web store](https://img.shields.io/badge/chrome_web_store-2b4069?style=for-the-badge&logo=googlechrome&logoColor=white)](https://chrome.google.com/webstore/detail/shift-guard/kaoajhabcjalpgigachfhignliolekkb)
[![firefox add ons](https://img.shields.io/badge/amo-2b4069?style=for-the-badge&logo=firefox&logoColor=white)](https://addons.mozilla.org/en-US/firefox/addon/shift-guard/)


</div>


Shift Guard is a browser extension that helps prevent accidentally clicking the wrong thing when parts of a website suddenly shift or appear.

Our brains take time to process information. If something on a website appeared 0.1 seconds ago and you clicked on it, it's unlikely that's what you intended since your brain would still be busy processing the change.

Shift Guard works by logging various types of website changes and throwing out clicks on content that shifted or appeared within a configurable time span. If a click is incorrectly thrown out, a second click a moment later will work as usual. It's also easy to turn on and off, and double-clicks are never thrown out.

On the other hand, accidentally clicking something can be a costly mistake. If you're lucky, it just means waiting for the page to reload after going back. At worst it can mean a loss of unsaved work or an unintended purchase.

#### Demo/Test pages
* [Class or id changes that make an element appear](https://mallocs.github.io/shift-guard/test/html/classOrIdChanges.html)

* [Style changes that make an element appear](https://mallocs.github.io/shift-guard/test/html/styleChanges.html)

* [Shift changes](https://mallocs.github.io/shift-guard/test/html/shiftChanges.html)

#### Note
Shift detection uses the experimental [LayoutShift interface of the Performance API](https://developer.mozilla.org/en-US/docs/Web/API/LayoutShift) which is currently only implemented by Chrome. Class, id, and style changes will still be detected by Firefox.

#### Support
[Submit bugs or issues](https://github.com/mallocs/shift-guard)