// ==UserScript==
// @name         BetInAsia Book Strength Overlay
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Shows weakest-to-strongest book ranking from chart prices on black.betinasia.com
// @author       You
// @match        https://black.betinasia.com/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    if (window.__BetInAsiaBookStrengthOverlayLoaded) return;
    window.__BetInAsiaBookStrengthOverlayLoaded = true;

    const OVERLAY_CLASS = "bia-book-strength-overlay";
    const OVERLAY_CONTAINER_CLASS = "bia-book-strength-overlay-container";

    function parseNumber(text) {
        if (!text) return null;
        const n = parseFloat(String(text).replace(/[^\d.-]/g, ""));
        return Number.isFinite(n) ? n : null;
    }

    function parseRgbColor(colorText) {
        if (!colorText) return null;
        const hex = String(colorText).trim().match(/^#([0-9a-f]{6}|[0-9a-f]{8})$/i);
        if (hex) {
            const raw = hex[1];
            return {
                r: parseInt(raw.slice(0, 2), 16),
                g: parseInt(raw.slice(2, 4), 16),
                b: parseInt(raw.slice(4, 6), 16)
            };
        }
        const m = colorText.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
        if (!m) return null;
        return {
            r: Math.max(0, Math.min(255, parseInt(m[1], 10))),
            g: Math.max(0, Math.min(255, parseInt(m[2], 10))),
            b: Math.max(0, Math.min(255, parseInt(m[3], 10)))
        };
    }

    function colorDistance(a, b) {
        if (!a || !b) return Number.POSITIVE_INFINITY;
        const dr = a.r - b.r;
        const dg = a.g - b.g;
        const db = a.b - b.b;
        return dr * dr + dg * dg + db * db;
    }

    function isDarkColor(colorText) {
        const rgb = parseRgbColor(colorText);
        if (!rgb) return false;
        // Perceived luminance (sRGB)
        const luminance = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
        return luminance < 115;
    }

    function parseTranslateY(transformText) {
        if (!transformText) return 0;
        const m = transformText.match(/translate\(\s*[^,]+,\s*([^)]+)\)/);
        if (!m) return 0;
        const y = parseFloat(m[1]);
        return Number.isFinite(y) ? y : 0;
    }

    function parsePathLastY(pathData) {
        if (!pathData) return null;
        const matches = [...pathData.matchAll(/-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?/g)];
        if (!matches.length) return null;
        const lastPair = matches[matches.length - 1][0];
        const parts = lastPair.split(",");
        if (parts.length !== 2) return null;
        const y = parseFloat(parts[1]);
        return Number.isFinite(y) ? y : null;
    }

    function collectAxisPoints(svgRoot) {
        const axisTextNodes = svgRoot.querySelectorAll(".visx-axis-left text");
        const points = [];
        axisTextNodes.forEach((textNode) => {
            const value = parseNumber(textNode.textContent?.trim());
            const y = parseFloat(textNode.getAttribute("y"));
            if (!Number.isFinite(value) || !Number.isFinite(y)) return;
            points.push({ y, value });
        });
        return points;
    }

    function yToPrice(y, axisPoints) {
        if (!Number.isFinite(y) || axisPoints.length < 2) return null;
        const sorted = [...axisPoints].sort((a, b) => a.y - b.y);

        let low = sorted[0];
        let high = sorted[sorted.length - 1];
        for (let i = 0; i < sorted.length - 1; i++) {
            const a = sorted[i];
            const b = sorted[i + 1];
            if (y >= a.y && y <= b.y) {
                low = a;
                high = b;
                break;
            }
        }

        if (high.y === low.y) return low.value;
        const t = (y - low.y) / (high.y - low.y);
        return low.value + t * (high.value - low.value);
    }

    function isLikelyBookLabel(text) {
        if (!text) return false;
        const clean = text.trim();
        if (!clean) return false;
        const lower = clean.toLowerCase();
        if (lower.includes("hour")) return false;
        if (lower.includes("timezone")) return false;
        return /^[a-z0-9_.-]+$/i.test(clean);
    }

    function extractBookLabels(panelRoot) {
        const labels = [];
        const nodes = panelRoot.querySelectorAll("div._3505ac4e");
        nodes.forEach((node) => {
            const text = node.textContent?.trim();
            if (!isLikelyBookLabel(text)) return;
            const bgColor = getComputedStyle(node).backgroundColor || "";
            labels.push({ name: text, color: bgColor, isAverage: text.toLowerCase() === "average" });
        });
        const deduped = [];
        const seen = new Set();
        labels.forEach((entry) => {
            if (seen.has(entry.name)) return;
            seen.add(entry.name);
            deduped.push(entry);
        });
        return deduped;
    }

    function buildRankingData(panelRoot) {
        const svg = panelRoot.querySelector("svg");
        if (!svg) return null;

        const labels = extractBookLabels(panelRoot);
        if (!labels.length) return null;

        const axisPoints = collectAxisPoints(svg);
        if (axisPoints.length < 2) return null;

        const linePaths = [...svg.querySelectorAll("path.visx-linepath")];
        if (!linePaths.length) return null;

        const lineMeta = linePaths.map((path, idx) => {
            const d = path.getAttribute("d");
            const lastY = parsePathLastY(d);
            const price = yToPrice(lastY, axisPoints);
            const stroke = path.getAttribute("stroke") || getComputedStyle(path).stroke || "";
            return {
                idx,
                price,
                stroke,
                strokeRgb: parseRgbColor(stroke)
            };
        }).filter((item) => Number.isFinite(item.price));

        if (!lineMeta.length) return null;

        // Prefer color-based matching so the "average" line is always included even
        // when line ordering changes between markets.
        const ranked = [];
        const usedLineIdx = new Set();
        labels.forEach((labelMeta, labelIndex) => {
            const labelRgb = parseRgbColor(labelMeta.color);
            let best = null;
            let bestScore = Number.POSITIVE_INFINITY;
            lineMeta.forEach((candidate) => {
                if (usedLineIdx.has(candidate.idx)) return;
                let score;
                if (labelMeta.isAverage) {
                    // Average line is rendered gray; bias toward that specific tone.
                    score = colorDistance(candidate.strokeRgb, { r: 167, g: 167, b: 168 });
                } else if (labelRgb && candidate.strokeRgb) {
                    score = colorDistance(candidate.strokeRgb, labelRgb);
                } else {
                    // Fallback to original-ish behavior when colors are unavailable.
                    score = Math.abs(candidate.idx - labelIndex) * 1000;
                }
                if (score < bestScore) {
                    bestScore = score;
                    best = candidate;
                }
            });
            if (!best) return;
            usedLineIdx.add(best.idx);
            ranked.push({
                label: labelMeta.name,
                color: labelMeta.color,
                price: best.price,
                isAverage: !!labelMeta.isAverage
            });
        });

        if (!ranked.length) return null;
        ranked.sort((a, b) => b.price - a.price); // highest odds = weakest
        return ranked;
    }

    function formatRankLine(item, position, total) {
        if (item.isAverage) {
            const safeBookColor = item.color || "#a7a7a8";
            const bookNameStyle = isDarkColor(safeBookColor)
                ? `color:${safeBookColor}; text-shadow:0 0 1px rgba(255,255,255,0.7);`
                : `color:${safeBookColor};`;
            return `<span style="${bookNameStyle}">${item.label}</span>: ${item.price.toFixed(3)}`;
        }
        let strengthText = "";
        let rankFractionStyle = "";
        if (position === 1) {
            strengthText = '<span style="color:#ffd400;">WEAKEST</span>'; // saturated yellow
            rankFractionStyle = "color:#ffd400;";
        } else if (position === total) {
            strengthText = '<span style="color:#2f8cff;">STRONGEST</span>'; // blue
            rankFractionStyle = "color:#2f8cff;";
        }
        const suffix = strengthText ? ` ${strengthText}` : "";
        const safeBookColor = item.color || "#ffffff";
        const bookNameStyle = isDarkColor(safeBookColor)
            ? `color:${safeBookColor}; text-shadow:0 0 1px rgba(255,255,255,0.7);`
            : `color:${safeBookColor};`;
        const rankFraction = rankFractionStyle
            ? `<span style="${rankFractionStyle}">${position}/${total}</span>`
            : `${position}/${total}`;
        return `${rankFraction} <span style="${bookNameStyle}">${item.label}</span>: ${item.price.toFixed(3)}${suffix}`;
    }

    function findPopupPanels() {
        return [...document.querySelectorAll("svg")]
            .map((svg) => svg.closest("div"))
            .filter(Boolean)
            .filter((div) => div.querySelector("path.visx-linepath") && div.querySelector(".visx-axis-left"));
    }

    function upsertOverlay(panelRoot, rankingData) {
        if (getComputedStyle(panelRoot).position === "static") {
            panelRoot.style.position = "relative";
        }

        let overlay = panelRoot.querySelector(`.${OVERLAY_CLASS}`);
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.className = OVERLAY_CLASS;
            overlay.style.cssText = [
                "position:absolute",
                "top:8px",
                "right:8px",
                "z-index:9999",
                "pointer-events:none",
                "background:rgba(0,0,0,0.85)",
                "color:#fff",
                "font-size:11px",
                "font-weight:700",
                "line-height:1.35",
                "padding:8px 10px",
                "border-radius:6px",
                "max-width:320px",
                "box-shadow:0 2px 8px rgba(0,0,0,0.35)",
                "white-space:nowrap"
            ].join(";");
            panelRoot.appendChild(overlay);
        }

        const title = "Book Strength (by price)";
        const rankedBooks = rankingData.filter((item) => !item.isAverage);
        let rankPosition = 0;
        const bodyParts = [];
        rankingData.forEach((item) => {
            if (!item.isAverage) rankPosition += 1;
            bodyParts.push({ type: "line", html: formatRankLine(item, rankPosition, rankedBooks.length) });
            if (item.isAverage) {
                bodyParts.push({
                    type: "divider",
                    html: '<div style="border-bottom:1px dotted rgba(255,255,255,0.8); margin:2px 0;"></div>'
                });
            }
        });
        let body = "";
        bodyParts.forEach((part, index) => {
            const prev = bodyParts[index - 1];
            if (index > 0 && part.type === "line" && prev?.type === "line") body += "<br>";
            body += part.html;
        });
        overlay.innerHTML = `<div>${title}</div><div style="margin-top:4px;">${body}</div>`;
    }

    function clearDetachedOverlays() {
        document.querySelectorAll(`.${OVERLAY_CLASS}`).forEach((overlay) => {
            const panel = overlay.parentElement;
            if (!panel || !document.body.contains(panel)) overlay.remove();
        });
    }

    function processAllPanels() {
        const panels = findPopupPanels();
        panels.forEach((panel) => {
            const rankingData = buildRankingData(panel);
            if (!rankingData || !rankingData.length) return;
            upsertOverlay(panel, rankingData);
        });
        clearDetachedOverlays();
    }

    let rafQueued = false;
    function scheduleProcess() {
        if (rafQueued) return;
        rafQueued = true;
        requestAnimationFrame(() => {
            rafQueued = false;
            processAllPanels();
        });
    }

    const observer = new MutationObserver(() => scheduleProcess());
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: false });

    setInterval(scheduleProcess, 2000);
    scheduleProcess();
})();
