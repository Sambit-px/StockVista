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
module.exports = { searchStocks, getStockQuote };