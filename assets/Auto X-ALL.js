// ==UserScript==
// @name         OddsLogic Auto X-ALL
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically clicks X-ALL when Sharp Play popups appear on OddsLogic.
// @author       You
// @match        *://*.oddslogic.com/*
// @match        *://oddslogic.com/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    if (window.__OddslogicAutoXAllLoaded) return;
    window.__OddslogicAutoXAllLoaded = true;

    const CLICK_COOLDOWN_MS = 800;

    function isVisible(el) {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }

    function isXAllButton(el) {
        if (!el) return false;
        const text = (el.textContent || "").trim().toUpperCase();
        if (text !== "X-ALL") return false;
        return el.classList.contains("clear_all_messages_button") || el.classList.contains("messages_x");
    }

    function maybeClick(button) {
        if (!isVisible(button) || !isXAllButton(button)) return;

        const now = Date.now();
        const lastClick = Number(button.dataset.autoXAllClickedAt || 0);
        if (now - lastClick < CLICK_COOLDOWN_MS) return;

        button.dataset.autoXAllClickedAt = String(now);
        button.click();
    }

    function scanAndClick() {
        const buttons = document.querySelectorAll("span.clear_all_messages_button, .popup_message_container .messages_x");
        buttons.forEach((button) => maybeClick(button));
    }

    let rafQueued = false;
    function scheduleScan() {
        if (rafQueued) return;
        rafQueued = true;
        requestAnimationFrame(() => {
            rafQueued = false;
            scanAndClick();
        });
    }

    const observer = new MutationObserver(() => scheduleScan());
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: false
    });

    setInterval(scheduleScan, 1000);
    scheduleScan();
})();
