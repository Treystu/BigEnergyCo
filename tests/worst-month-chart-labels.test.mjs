// #445 regression: the SOC chart's zoomed window used to be labelled only
// "Day 751" … "Day 781", so a visitor could not tell WHICH month the worst
// month was; and the strip above it printed the best single day of the whole
// five-year record (6.68 kWh/kW/day) as if it were the window's daily output,
// above a chart whose own stated yield is ~4.98. Both are the same class of
// defect — a number or a label that does not say what it measures — so the
// teeth here pin the measurement, not the phrasing: a peak outside the window
// may never reach the strip's figure, and every axis tick must carry a month.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LOCALES } from "../assets/js/shared/locales.js";

const uiSrc = readFileSync(
  new URL("../assets/js/sizing/ui.js", import.meta.url),
  "utf8",
);
const stamp = uiSrc.match(/import\("\.\/charts\.js\?v=([^"]+)"\)/);
assert.ok(stamp, "ui.js must dynamically import the stamped charts module");
const charts = await import(
  new URL(`../assets/js/sizing/charts.js?v=${stamp[1]}`, import.meta.url).href
);

const render = (locale, key, params = {}) => {
  const value = LOCALES[locale][key];
  assert.equal(typeof value, "string", `${locale}.${key} must exist`);
  return value.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? ""));
};

// ── the strip's two figures ────────────────────────────────────────────────

test("sunStripStats reports the WINDOW's average and peak, not the record's", () => {
  // 90 days at 3 kWh/kW/day, one very sunny day at 6.68 outside the window,
  // one at 5.5 inside it. 6.68 is exactly the figure the issue saw: the
  // five-year record's best day, printed above the worst month.
  const pv = new Array(90).fill(3);
  pv[10] = 6.68;
  pv[70] = 5.5;

  const window = charts.sunStripStats(pv, 60, 89);
  assert.equal(window.days, 30);
  assert.equal(
    window.peak,
    5.5,
    "the peak must be the window's, not the record's",
  );
  assert.equal(window.avg, 3.08);

  const whole = charts.sunStripStats(pv);
  assert.equal(whole.days, 90);
  assert.equal(
    whole.peak,
    6.68,
    "the full view still shows the record's best day",
  );

  // Degenerate inputs must not invent a figure.
  assert.deepEqual(charts.sunStripStats([]), { avg: 0, peak: 0, days: 0 });
  assert.deepEqual(charts.sunStripStats(null), { avg: 0, peak: 0, days: 0 });
  assert.deepEqual(charts.sunStripStats(pv, 95, 120), {
    avg: 0,
    peak: 0,
    days: 0,
  });
});

test("every locale's strip label names BOTH figures it now prints", () => {
  for (const locale of Object.keys(LOCALES)) {
    const text = LOCALES[locale].chartDailySun;
    assert.match(text, /\{avg\}/, `${locale}.chartDailySun must print {avg}`);
    assert.match(text, /\{peak\}/, `${locale}.chartDailySun must print {peak}`);
    assert.match(
      text,
      /\{avg\}[\s\S]*\{peak\}/,
      `${locale}.chartDailySun must present the average before the peak`,
    );
  }
});

// ── calendar dates on the zoomed axis ──────────────────────────────────────

test("dayDateLabel maps day index 0 to 1 January of the record's first year", () => {
  assert.equal(charts.dayDateLabel(0, "en"), "Jan 1");
  // Day 750 of a record starting 1 January is 21 January two years later — the
  // window the issue reported as "Day 751".
  assert.equal(charts.dayDateLabel(750, "en"), "Jan 21");
  assert.equal(charts.dayDateLabel(780, "en"), "Feb 20");
});

test("zoomWindowText names the days, their dates and the record's years", () => {
  charts.initCharts({
    $: () => null,
    el: () => ({}),
    t: (key, params) => render("en", key, params),
    fmt: String,
    money: String,
  });
  const text = charts.zoomWindowText({
    start: 750,
    end: 780,
    startYear: 2020,
    endYear: 2024,
  });
  assert.equal(
    text,
    render("en", "chartZoomWindow", {
      first: "751",
      last: "781",
      from: "Jan 21",
      to: "Feb 20",
      startYear: "2020",
      endYear: "2024",
    }),
  );
  // No window at all (a caller that has no zoom) must not print a sentence.
  assert.equal(
    charts.zoomWindowText({ start: null, end: 30, startYear: 1, endYear: 2 }),
    "",
  );
});

// ── the rendered chart ─────────────────────────────────────────────────────

function mountChart(history) {
  const texts = [];
  const context = new Proxy(
    {
      fillText: (value) => texts.push(String(value)),
      createLinearGradient: () => ({ addColorStop() {} }),
    },
    {
      get(target, key) {
        return key in target ? target[key] : () => {};
      },
      set(target, key, value) {
        target[key] = value;
        return true;
      },
    },
  );
  const nodes = new Map();
  const handlers = new Map();
  const getNode = (id) => {
    if (!nodes.has(id)) {
      const node = {
        id,
        tag: "div",
        attrs: {},
        style: {},
        childNodes: [],
        textContent: "",
        innerHTML: "",
        clientWidth: 360,
        appendChild(child) {
          this.childNodes.push(child);
          return child;
        },
        setAttribute(name, value) {
          this.attrs[name] = value;
        },
        addEventListener(name, fn) {
          handlers.set(`${id}:${name}`, fn);
        },
        getContext: () => context,
      };
      nodes.set(id, node);
    }
    return nodes.get(id);
  };
  const previousWindow = globalThis.window;
  globalThis.window = { devicePixelRatio: 1, innerWidth: 400 };
  charts.initCharts({
    $: getNode,
    el: (tag, attrs, text) => getNode(`el:${tag}:${text}`),
    t: (key, params) => render("en", key, params),
    fmt: String,
    money: String,
  });
  charts.drawSocChart(history, "LFP", true);
  charts.setupZoomButtons();
  return {
    texts,
    handlers,
    node: getNode,
    restore: () => {
      globalThis.window = previousWindow;
    },
  };
}

test("the worst-month zoom labels its axis with dates and names its window", () => {
  const days = 1825; // five years of daily bands
  const pvDaily = new Array(days).fill(4);
  pvDaily[10] = 6.68; // the record's best day, far outside the worst window
  pvDaily[760] = 5.2; // the window's own best day
  const dailyMin = new Array(days).fill(40);
  const dailyMax = new Array(days).fill(100);
  for (let i = 750; i < 780; i++) dailyMin[i] = 5; // the darkest stretch

  const history = {
    kind: "gridtie",
    startYear: 2020,
    endYear: 2024,
    days,
    pvDaily,
    tiers: [
      {
        id: "tier95",
        chemLabel: "LFP",
        dailyMin,
        dailyMax,
        minPct: 5,
        fullDays: 1700,
        totalDays: days,
        emptyDays: 0,
      },
    ],
  };

  const chart = mountChart(history);
  try {
    chart.texts.length = 0;
    const worst = chart.handlers.get("btnSocZoomWorst:click");
    assert.ok(worst, "the Worst Month control must be wired");
    worst();

    // The axis carries calendar dates, never day indices alone.
    assert.ok(
      chart.texts.includes(charts.dayDateLabel(750)),
      "the zoomed axis must print the window's opening date",
    );
    assert.ok(
      chart.texts.includes(charts.dayDateLabel(780)),
      "the zoomed axis must print the window's closing date",
    );
    assert.deepEqual(
      chart.texts.filter((text) => /^Day \d/.test(text)),
      [],
      "no axis tick may be a bare day number",
    );

    // The caption names the window, its dates and the record's years.
    const caption = chart.node("socCaption").textContent;
    assert.ok(
      caption.startsWith(
        render("en", "chartZoomWindow", {
          first: "751",
          last: "781",
          from: charts.dayDateLabel(750),
          to: charts.dayDateLabel(780),
          startYear: "2020",
          endYear: "2024",
        }),
      ),
      `the caption must open with the window it is showing, got: ${caption.slice(0, 80)}`,
    );

    // The strip's figure is the WINDOW's, so the record's 6.68 best day cannot
    // stand in for the worst month's daily output.
    const strip = chart.texts.find((text) => text.includes("per kW of panel"));
    assert.ok(strip, "the sun strip label must be drawn");
    assert.ok(
      strip.includes("4.03") || strip.includes("4.04"),
      `the strip must print the window average, got: ${strip}`,
    );
    assert.ok(
      strip.includes("5.2"),
      `the strip must print the window's own best day, got: ${strip}`,
    );
    assert.ok(
      !strip.includes("6.68"),
      `the strip must never print a peak from outside the window, got: ${strip}`,
    );
  } finally {
    chart.restore();
  }
});
