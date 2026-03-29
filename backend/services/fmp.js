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
        const keyRes = await axios.get(
            `https://financialmodelingprep.com/stable/key-metrics?symbol=${symbol}&limit=1&apikey=${FMP_API_KEY}`
        );
        const key = keyRes.data?.[0] ?? {};

        const ratiosRes = await axios.get(
            `https://financialmodelingprep.com/stable/ratios?symbol=${symbol}&limit=1&period=FY&apikey=${FMP_API_KEY}`
        );
        const ratios = ratiosRes.data ?? [];
        const data = ratios[0] ?? {};

        return {
            marketCap: key.marketCap ?? null,
            peRatio: data.priceToEarningsRatio ?? null,
            pbRatio: data.priceToBookRatio ?? null,
            eps: data.netIncomePerShare ?? null,
            dividendYield: data.dividendYieldPercentage ?? null,
            roe: key.returnOnEquity ?? null,
            roa: key.returnOnAssets ?? null,
            bookValue: ratios.bookValuePerShare,
            currentRatio: ratios.currentRatio,
            DebtToEquity: ratios.debtToEquityRatio,
            freeCashFlowYield: key.freeCashFlowYield ?? null,
        };

    } catch (err) {
        console.error("FMP metrics error:", err.message);
        return {};
    }
}

async function getIncomeStatement(symbol) {
    try {
        const res = await axios.get(
            `https://financialmodelingprep.com/stable/income-statement?symbol=${symbol}&apikey=${FMP_API_KEY}`
        );

        return {
            annualReports: res.data?.filter(r => r.period === "FY") ?? []
        };
    } catch (err) {
        console.error("Income statement error:", err.message);
        return { annualReports: [] };
    }
}

async function getBalanceSheet(symbol) {
    try {
        const res = await axios.get(
            `https://financialmodelingprep.com/stable/balance-sheet-statement?symbol=${symbol}&apikey=${FMP_API_KEY}`
        );

        return {
            annualReports: res.data?.filter(r => r.period === "FY") ?? []
        };
    } catch (err) {
        console.error("Balance sheet error:", err.message);
        return { annualReports: [] };
    }
}

async function getCashFlow(symbol) {
    try {
        const res = await axios.get(
            `https://financialmodelingprep.com/stable/cash-flow-statement?symbol=${symbol}&apikey=${FMP_API_KEY}`
        );

        return {
            annualReports: res.data?.filter(r => r.period === "FY") ?? []
        };
    } catch (err) {
        console.error("Cash flow error:", err.message);
        return { annualReports: [] };
    }
}

module.exports = {
    getTopGainers,
    getTopLosers,
    getMostActive,
    getMarketMetrics,
    getIncomeStatement,
    getBalanceSheet,
    getCashFlow
};