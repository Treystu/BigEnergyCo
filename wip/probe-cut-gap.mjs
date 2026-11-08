import { runSizing } from "../assets/js/sizing/run.js";
import { synthesizeFromProfile } from "../assets/js/sizing/nasa.js";
import {
  OFFLINE_PROFILES,
  PROFILE_YEAR,
} from "../assets/js/sizing/profiles.js";
import { DEFAULT_RESERVE_PCT } from "../assets/js/sizing/usecases.js";

const honolulu = OFFLINE_PROFILES.find((p) => p.name.includes("Honolulu"));
const fakeWeather = async () => ({
  hours: synthesizeFromProfile(honolulu),
  meta: {
    latitude: 21.31,
    longitude: -157.86,
    startYear: PROFILE_YEAR,
    endYear: PROFILE_YEAR,
    years: 1,
    source: "test fixture",
    offline: false,
  },
});
const base = {
  latitude: 21.31,
  longitude: -157.86,
  dailyKwh: 10,
  tariff: 0.42,
  exportRate: null,
  mode: "gridtie",
  chemistry: "auto",
};
for (const rp of [null, 0, DEFAULT_RESERVE_PCT, 0.4]) {
  const p = await runSizing(
    { ...base, ...(rp === null ? {} : { reservePct: rp }) },
    { fetchWeather: fakeWeather },
  );
  const o = p.useCaseOutcome;
  console.log(
    JSON.stringify({
      reservePct: rp,
      bestChipCut: p.best && p.best.cutPct,
      focusChipCut: p.focusSystem && p.focusSystem.cutPct,
      outcomeMetric: o && o.useCase,
      outcomeValue: o && o.value,
      measuredReserve: o && o.measurement && o.measurement.reservePct,
    }),
  );
}
