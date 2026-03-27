const axios = require("axios");

const ALPHA_KEY = process.env.ALPHA_VANTAGE_KEY;
const ALPHA_URL = "https://www.alphavantage.co/query";


async function getFinancials(symbol) {
    try {
        // Fetch Alpha Vantage financials in parallel
        const [incomeRes, balanceRes, cashRes] = await Promise.all([
            axios.get(`${ALPHA_URL}?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${ALPHA_KEY}`),
            axios.get(`${ALPHA_URL}?function=BALANCE_SHEET&symbol=${symbol}&apikey=${ALPHA_KEY}`),
            axios.get(`${ALPHA_URL}?function=CASH_FLOW&symbol=${symbol}&apikey=${ALPHA_KEY}`)
        ]);

        const income = incomeRes.data || { annualReports: [], quarterlyReports: [] };
        const balance = balanceRes.data || { annualReports: [], quarterlyReports: [] };
        const cashFlow = cashRes.data || { annualReports: [], quarterlyReports: [] };

        // Compute ratios from latest annual reports
        const latestBS = balance.annualReports?.[0] || {};
        const latestIS = income.annualReports?.[0] || {};

        const equity = parseFloat(latestBS.totalShareholderEquity || 0);
        const liabilities = parseFloat(latestBS.totalLiabilities || 0);
        const currentAssets = parseFloat(latestBS.totalCurrentAssets || 0);
        const currentLiabilities = parseFloat(latestBS.totalCurrentLiabilities || 0);
        const netProfit = parseFloat(latestIS.netIncome || 0);
        const sharesOut = parseFloat(latestBS.commonStockSharesOutstanding || 1);

        const ratios = {
            roe: equity ? (netProfit / equity) : null,
            debtEquity: equity ? (liabilities / equity) : null,
            currentRatio: currentLiabilities ? (currentAssets / currentLiabilities) : null,
            bookValue: equity && sharesOut ? (equity / sharesOut) : null,
        };

        return {
            incomeStatement: income,
            balanceSheet: balance,
            cashFlow,
            ratios,
        };

    } catch (err) {
        console.error("getFinancials error:", err.message);
        return {
            incomeStatement: { annualReports: [], quarterlyReports: [] },
            balanceSheet: { annualReports: [], quarterlyReports: [] },
            cashFlow: { annualReports: [], quarterlyReports: [] },
            ratios: {},
            marketMetrics: { note: "No data available" },
        };
    }
}

module.exports = { getFinancials };