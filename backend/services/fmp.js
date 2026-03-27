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
        // 1️⃣ Get current stock profile for marketCap and price
        const profileRes = await axios.get(
            `https://financialmodelingprep.com/stable/profile?symbol=${symbol}&apikey=${FMP_API_KEY}`
        );
        const profile = profileRes.data?.[0] ?? {};

        // 2️⃣ Get financial ratios for PE, PB, EPS, Dividend Yield
        const ratiosRes = await axios.get(
            `https://financialmodelingprep.com/stable/ratios?symbol=${symbol}&limit=1&period=FY&apikey=${FMP_API_KEY}`
        );
        const ratios = ratiosRes.data ?? [];
        const data = ratios[0] ?? {};

        return {
            marketCap: profile.marketCap ?? null,
            peRatio: data.priceToEarningsRatio ?? null,
            pbRatio: data.priceToBookRatio ?? null,
            eps: data.netIncomePerShare ?? null,
            dividendYield: data.dividendYieldPercentage ?? null,
            roe: data.returnOnEquity ?? null,
            roa: data.returnOnAssets ?? null,
            freeCashFlowYield: data.priceToFreeCashFlowRatio ?? null,
        };

    } catch (err) {
        console.error("FMP metrics error:", err.message);
        return {};
    }
}

module.exports = {
    getTopGainers,
    getTopLosers,
    getMostActive,
    getMarketMetrics
};