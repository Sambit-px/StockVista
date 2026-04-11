const axios = require("axios");
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

async function getStockQuote(symbol) {
    try {
        //price data
        const quoteResponse = await axios.get("https://finnhub.io/api/v1/quote", {
            params: { symbol, token: FINNHUB_API_KEY }
        });

        //company profile for the full name
        const profileResponse = await axios.get("https://finnhub.io/api/v1/stock/profile2", {
            params: { symbol, token: FINNHUB_API_KEY }
        });

        return {
            symbol: symbol,
            name: profileResponse.data.name || symbol,
            price: quoteResponse.data.c,
            change: quoteResponse.data.d,
            changePercent: quoteResponse.data.dp,
            volume: quoteResponse.data.v
        };

    } catch (error) {
        console.error("Finnhub error:", error.message);
        return null;
    }
}

async function searchStocks(query) {
    if (!query) return [];

    try {
        const response = await axios.get("https://finnhub.io/api/v1/search", {
            params: { q: query, token: FINNHUB_API_KEY }
        });

        // Finnhub returns { result: [ { description, symbol, type } ] }
        // Map to clean format and take top 20 results
        const results = response.data.result.slice(0, 5).map(stock => ({
            symbol: stock.symbol,
            name: stock.description,
            type: stock.type
        }));

        return results;
    } catch (error) {
        console.error("Finnhub search error:", error.message);
        return [];
    }
}

async function getStockFundamentals(symbol) {
    try {
        const response = await axios.get("https://finnhub.io/api/v1/stock/metric", {
            params: {
                symbol,
                metric: "all",
                token: FINNHUB_API_KEY
            }
        });

        const metric = response.data.metric || {};

        return {
            marketCap: metric.marketCapitalization || 0,

            // ✅ FIXED
            pe: metric.peTTM || 0,
            pb: metric.pb || 0,
            dividendYield: metric.currentDividendYieldTTM || 0,

            eps: metric.epsTTM || 0,
            roe: metric.roeTTM || 0,

            high52w: metric["52WeekHigh"] || 0,
            low52w: metric["52WeekLow"] || 0,
            avgVolume: metric["10DayAverageTradingVolume"] || 0,

            industryPe: null
        };

    } catch (error) {
        console.error("Finnhub fundamentals error:", error.message);
        return null;
    }
}

async function getCompanyNews(symbol, from, to) {
    try {
        // Default: last 7 days if not provided
        const today = new Date();
        const past = new Date();
        past.setDate(today.getDate() - 7);

        const fromDate = from || past.toISOString().split("T")[0];
        const toDate = to || today.toISOString().split("T")[0];

        const response = await axios.get("https://finnhub.io/api/v1/company-news", {
            params: {
                symbol,
                from: fromDate,
                to: toDate,
                token: FINNHUB_API_KEY
            }
        });

        // Clean the response for frontend
        const news = response.data.slice(0, 50).map(article => ({
            headline: article.headline,
            source: article.source,
            url: article.url,
            image: article.image,
            summary: article.summary,
            datetime: article.datetime
        }));

        return news;

    } catch (error) {
        console.error("Finnhub news error:", error.message);
        return [];
    }
}

async function getStockFinancials(symbol) {
    try {
        const res = await axios.get("https://finnhub.io/api/v1/stock/financials-reported", {
            params: { symbol, token: FINNHUB_API_KEY }
        });

        const data = res.data.data || [];
        if (!data.length) return null;

        const latest = data[0];
        const prev = data[1];

        const findValue = (obj, key) => obj?.[key] ?? 0;

        // Annual income statement
        const incomeStatement = data.slice(0, 3).map(year => ({
            year: year.year,
            revenue: findValue(year.report.ic, "Revenue"),
            expenses: findValue(year.report.ic, "Operating Expenses"),
            operatingProfit: findValue(year.report.ic, "Operating Income"),
            netProfit: findValue(year.report.ic, "Net Income")
        }));

        // Quarterly data (filter by quarter > 0)
        const quarterly = data.filter(d => d.quarter > 0).slice(0, 4).map(q => ({
            quarter: `Q${q.quarter} ${q.year}`,
            revenue: findValue(q.report.ic, "Revenue"),
            profit: findValue(q.report.ic, "Net Income"),
            eps: findValue(q.report.ic, "EPS")
        }));

        // Ratios example (PE, PB, ROE, etc.)
        const ratios = [
            { label: "PE Ratio", value: findValue(latest.report.ic, "Price to Earnings") || "--" },
            { label: "PB Ratio", value: findValue(latest.report.ic, "Price to Book") || "--" },
            { label: "ROE", value: findValue(latest.report.ic, "Return on Equity") || "--" },
            { label: "Dividend Yield", value: findValue(latest.report.ic, "Dividend Yield") || "--" }
        ];

        // Key metrics
        const latestRevenue = findValue(latest.report.ic, "Revenue");
        const prevRevenue = findValue(prev?.report.ic, "Revenue");
        const latestProfit = findValue(latest.report.ic, "Net Income");
        const prevProfit = findValue(prev?.report.ic, "Net Income");

        const revenueGrowth = prevRevenue ? ((latestRevenue - prevRevenue) / prevRevenue) * 100 : 0;
        const profitGrowth = prevProfit ? ((latestProfit - prevProfit) / prevProfit) * 100 : 0;

        return {
            keyFinancials: {
                revenue: latestRevenue,
                revenueGrowth: +revenueGrowth.toFixed(2),
                netProfit: latestProfit,
                profitGrowth: +profitGrowth.toFixed(2),
            },
            income: incomeStatement,
            quarterly,
            ratios,
            balanceSheet: latest.report.bs,
            cashFlow: latest.report.cf
        };

    } catch (error) {
        console.error("Financials error:", error.message);
        return null;
    }
}

module.exports = { searchStocks, getStockQuote, getStockFundamentals, getStockFinancials, getCompanyNews };