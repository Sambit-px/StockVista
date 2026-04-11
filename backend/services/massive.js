const axios = require("axios");
const API_KEY = process.env.MASSIVE_API_KEY;

/**
 * Fetches market metrics from Massive API
 * Only returns metrics we need for the app
 * Metrics fetched directly:
 * - Dividend Yield
 * - Market Cap
 * - P/E
 * - P/B
 * - Book Value (if provided)
 * Metrics NOT directly available from Massive (compute locally):
 * - ROE
 * - Debt/Equity
 * - Current Ratio
 */
async function getMassiveMetrics(symbol) {
    const url = `https://api.massive.com/v1/fundamentals/metrics/${symbol}?apiKey=${API_KEY}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        // Only return required fields
        return {
            // Direct from Massive
            dividendYield: data.dividendYield ?? null,
            marketCap: data.marketCap ?? null,
            peRatio: data.peRatio ?? null,
            pbRatio: data.pbRatio ?? null,
            bookValue: data.bookValue ?? null,

            // Cannot be fetched directly from Massive
            roe: null,           // compute: Net Profit / Shareholder Equity
            debtEquity: null,    // compute: Total Liabilities / Shareholder Equity
            currentRatio: null,  // compute: Current Assets / Current Liabilities
        };
    } catch (err) {
        console.error(`Massive API error for ${symbol}:`, err.message);
        return {
            dividendYield: null,
            marketCap: null,
            peRatio: null,
            pbRatio: null,
            bookValue: null,
            roe: null,
            debtEquity: null,
            currentRatio: null,
        };
    }
}

module.exports = { getMassiveMetrics };