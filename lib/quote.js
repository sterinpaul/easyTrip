// Mirrors the "Quote calculator" sheet: supplier group rate -> per-person selling price at a target gross margin.
export function calculateQuote({ groupRate, guests, flight = 0, other = 0, margin = 0 }) {
    const g = Number(guests), m = Number(margin);
    if (!(Number(groupRate) >= 0) || !(g > 0) || !(m >= 0 && m < 1)) return null;
    const landGroup = Number(groupRate);
    const landPP = landGroup / g;
    const costPP = landPP + (Number(flight) || 0) + (Number(other) || 0);
    // small epsilon so float noise (e.g. 1000.0000001) doesn't round up an extra rupee
    const sellPP = Math.ceil(costPP / (1 - m) - 1e-9);
    const profitPP = sellPP - costPP;
    return { landGroup, landPP, costPP, sellPP, profitPP, sellGroup: sellPP * g, profitGroup: profitPP * g };
}
