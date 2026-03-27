const axios = require("axios");

const FMP_API_KEY = process.env.FMP_API_KEY;

function normalizeStock(stock) {
    return {
        symbol: stock.symbol,
        name: stock.name,
        price: Number(stock.price?.toFixed(2)),
        change: Number(stock.change?.toFixed(2)),
        changesPercentage: Number(stock.changesPercentage?.toFixed(2)),
        volume: stock.volume ?? 0
    };
}

async function getTopGainers() {
    try {
        const res = await axios.get(
            `https://financialmodelingprep.com/stable/biggest-gainers?apikey=${FMP_API_KEY}`
        );

        return res.data.slice(0, 3).map(normalizeStock);

    } catch (error) {
        console.error("Gainers error:", error.message);
        return [];
    }
}

async function getTopLosers() {
    try {
        const res = await axios.get(
            `https://financialmodelingprep.com/stable/biggest-losers?apikey=${FMP_API_KEY}`
        );

        return res.data.slice(0, 3).map(normalizeStock);

    } catch (error) {
        console.error("Losers error:", error.message);
        return [];
    }
}

async function getMostActive() {
    try {
        const res = await axios.get(
            `https://financialmodelingprep.com/stable/most-actives?apikey=${FMP_API_KEY}`
        );

        return res.data.slice(0, 4).map(normalizeStock);

    } catch (error) {
        console.error("Most active error:", error.message);
        return [];
    }
}

async function getMarketMetrics(symbol) {
    try {
        const res = await axios.get(`https://financialmodelingprep.com/stable/profile?symbol=${symbol}&apikey=${FMP_API_KEY}`);
        const profile = res.data?.[0];

        if (!profile) return {};

        return {
            marketCap: profile.marketCap ?? null,
            peRatio: profile.pe ?? null,
            pbRatio: profile.price && profile?.bookValue ? (profile.price / profile.bookValue) : null,
            dividendYield: profile.lastDividend && profile.price ? (profile.lastDividend / profile.price) : null,
        };
    } catch (err) {
        console.error("FMP profile error:", err.message);
        return {};
    }
}

module.exports = {
    getTopGainers,
    getTopLosers,
    getMostActive,
    getMarketMetrics
};