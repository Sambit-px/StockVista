const axios = require("axios");

const BASE_URL = "https://www.alphavantage.co/query";
const API_KEY = process.env.ALPHA_VANTAGE_KEY;

async function getIntradayChart(symbol) {

    try {

        const url =
            `${BASE_URL}?function=TIME_SERIES_INTRADAY` +
            `&symbol=${symbol}` +
            `&interval=5min` +
            `&apikey=${API_KEY}`;

        const res = await axios.get(url);

        const series = res.data["Time Series (5min)"];

        if (!series) return [];

        const chart = Object.keys(series)
            .slice(0, 30)
            .reverse()
            .map((time, index) => ({
                index,
                price: parseFloat(series[time]["4. close"])
            }));

        return chart;

    } catch (err) {

        console.error("AlphaVantage error:", err.message);
        return [];
    }
}

module.exports = { getIntradayChart };