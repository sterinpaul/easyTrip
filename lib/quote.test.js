// Run: node lib/quote.test.js — expected values are the Excel sheet's own results.
import assert from "node:assert/strict";
import { calculateQuote } from "./quote.js";

assert.deepEqual(calculateQuote({ groupRate: 87500, guests: 8, margin: 0.12 }), {
    landGroup: 87500, landPP: 10937.5, costPP: 10937.5, sellPP: 12429, profitPP: 1491.5, sellGroup: 99432, profitGroup: 11932,
});
assert.equal(calculateQuote({ groupRate: 18200, guests: 2, flight: 5000, other: 900, margin: 0 }).sellPP, 15000);
assert.equal(calculateQuote({ groupRate: 1000, guests: 0, margin: 0.1 }), null);
assert.equal(calculateQuote({ groupRate: 1000, guests: 2, margin: 1 }), null);
console.log("quote ok");
