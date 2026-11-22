// #447 (reverse-geocode half): entering the custom coordinates
// 19.39386, -154.93075 (Kehena Beach, Pahoa HI) resolved to
// "Kapoho-Kalapana Road, Hawaii, USA" — neither the beach nor the town was ever
// named, because a coordinate pair was sent to the forward-SEARCH endpoint,
// which answers with the nearest named OSM feature, and the nearest named thing
// was a road.
//
// The cure: a coordinate-only query takes the REVERSE endpoint and takes its
// label from the address's locality fields, in order, with the state/country as
// the last resort — never a street.
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  lookupCityOnline,
  lookupCountryOnline,
  localityLabel,
  parseCoordinateQuery,
} from "../assets/js/sizing/cities.js";

const jsonResponse = (body) => ({ ok: true, json: async () => body });

test("#447: a coordinate-only query is recognised, with the share-link bounds", () => {
  assert.deepEqual(parseCoordinateQuery("19.39386, -154.93075"), {
    lat: 19.39386,
    lon: -154.93075,
  });
  assert.deepEqual(parseCoordinateQuery("  51.5,-0.12 "), {
    lat: 51.5,
    lon: -0.12,
  });
  // Bounds are the sharing bounds: a pair outside them cannot become a location.
  assert.equal(parseCoordinateQuery("91, 0"), null);
  assert.equal(parseCoordinateQuery("0, -181"), null);
  // A name is not a coordinate pair, even when it carries numbers.
  assert.equal(parseCoordinateQuery("Route 66"), null);
  assert.equal(parseCoordinateQuery("19.39"), null);
});

test("#447: the label prefers a locality and never falls back to a road", () => {
  assert.equal(
    localityLabel({ road: "Kapoho-Kalapana Road", village: "Pahoa" }),
    "Pahoa",
  );
  assert.equal(
    localityLabel({ city: "Pahoa", county: "Hawaii", state: "Hawaii" }),
    "Pahoa",
  );
  // No locality: the county or the state still names a place a person knows.
  assert.equal(localityLabel({ county: "Hawaii", state: "Hawaii" }), "Hawaii");
  assert.equal(localityLabel({ road: "Some Road" }), "");
  assert.equal(localityLabel(null), "");
});

test("#447: a coordinate query reverse-geocodes and returns the place it names", async () => {
  let requested = "";
  const result = await lookupCityOnline("19.39386, -154.93075", async (url) => {
    requested = String(url);
    return jsonResponse({
      name: "Kapoho-Kalapana Road",
      lat: "19.3916",
      lon: "-154.9351",
      address: {
        road: "Kapoho-Kalapana Road",
        village: "Pahoa",
        county: "Hawaii",
        state: "Hawaii",
        country: "United States",
        country_code: "us",
      },
      display_name: "Kapoho-Kalapana Road, Pahoa, Hawaii, USA",
    });
  });

  assert.match(
    requested,
    /\/reverse\?/,
    "a coordinate pair must be reverse-geocoded",
  );
  assert.doesNotMatch(
    requested,
    /\/search\?/,
    "the forward endpoint treats a pair as text and names the nearest road",
  );
  assert.match(requested, /zoom=14/);
  // The pair leaves the device at the documented egress precision.
  assert.match(requested, /lat=19\.39&lon=-154\.93/);

  assert.equal(result.name, "Pahoa", "the locality, not the road");
  assert.equal(result.country, "US");
  assert.equal(result.r, "Hawaii");
  // The visitor's own point survives: the matched feature's coordinate is not
  // the place they asked about.
  assert.equal(result.lat, 19.39386);
  assert.equal(result.lon, -154.93075);
});

test("#447: a place-name query still uses the forward search (no regression)", async () => {
  let requested = "";
  const result = await lookupCityOnline("Testville", async (url) => {
    requested = String(url);
    return jsonResponse([
      {
        name: "Testville",
        lat: "1.25",
        lon: "2.5",
        address: { country: "Testland", state: "Test State" },
      },
    ]);
  });
  assert.match(requested, /\/search\?/);
  assert.doesNotMatch(requested, /\/reverse\?/);
  assert.equal(result.name, "Testville");
});

test("#447: the GPS reverse lookup names a locality too", async () => {
  const result = await lookupCountryOnline(19.39386, -154.93075, async () =>
    jsonResponse({
      name: "Kapoho-Kalapana Road",
      address: {
        road: "Kapoho-Kalapana Road",
        town: "Pahoa",
        state: "Hawaii",
        country: "United States",
        country_code: "us",
      },
    }),
  );
  assert.equal(result.name, "Pahoa");
  assert.equal(result.country, "US");
  assert.equal(result.r, "Hawaii");
});
