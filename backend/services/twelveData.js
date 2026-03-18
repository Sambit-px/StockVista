const axios = require("axios");
const API_KEY = process.env.TWELVE_API_KEY;

async function getStockData(symbol, interval = "1min", period = "1D") {
    try {
        // 🔥 Dynamic output size (fetch slightly more than needed)
        const intervalOutputSizeMap = {
            "1min": 400,
            "5min": 600,
            "1h": 800,
            "1day": 1000,
            "1week": 900,
            "1month": 700,
        };

        const outputsize = intervalOutputSizeMap[interval] || 400;

        // ⚡ Parallel API calls
        const [quoteRes, chartRes] = await Promise.all([
            axios.get("https://api.twelvedata.com/quote", {
                params: { symbol, apikey: API_KEY },
            }),
            axios.get("https://api.twelvedata.com/time_series", {
                params: {
                    symbol,
                    interval,
                    outputsize,
                    apikey: API_KEY,
                },
            })
        ]);

        const quote = quoteRes.data;

        if (!quote || quote.code) {
            console.error("Quote error:", quote.message);
            return null;
        }

        if (chartRes.data.code) {
            console.error("Chart error:", chartRes.data.message);
            return null;
        }

        const values = chartRes.data.values || [];

        // 🔥 PERIOD FILTERING (MAIN FIX)
        const now = new Date();

        const periodDaysMap = {
            "1D": 1,
            "1W": 7,
            "1M": 30,
            "1Y": 365,
            "3Y": 365 * 3,
            "5Y": 365 * 5,
        };

        const days = periodDaysMap[period] || 1;

        const cutoff = new Date();
        cutoff.setDate(now.getDate() - days);

        let chart = values
            .filter(v => new Date(v.datetime) >= cutoff)
            .map(v => ({
                time: v.datetime,
                price: +v.close
            }))
            .reverse();

        // 🔥 DOWNSAMPLING (prevents too many points)
        const MAX_POINTS = 200;

        if (chart.length > MAX_POINTS) {
            const step = Math.ceil(chart.length / MAX_POINTS);
            chart = chart.filter((_, i) => i % step === 0);
        }

        const nowPrice = +quote.close || 0;

        // ⚡ FAST CHANGE CALCULATION
        const calculateChanges = (chartData) => {
            if (!chartData.length) return {};

            const getIndex = (percent) =>
                Math.max(0, Math.floor(chartData.length * percent));

            const getChange = (index) => {
                const pastPrice = chartData[index]?.price || nowPrice;
                const change = nowPrice - pastPrice;

                return {
                    change: +change.toFixed(2),
                    percent: +((change / pastPrice) * 100).toFixed(2),
                };
            };

            return {
                "1D": getChange(getIndex(0.98)),
                "1W": getChange(getIndex(0.9)),
                "1M": getChange(getIndex(0.75)),
                "1Y": getChange(getIndex(0.5)),
                "3Y": getChange(getIndex(0.25)),
                "5Y": getChange(0),
            };
        };

        const changes = calculateChanges(chart);

        return {
            symbol: quote.symbol,
            name: quote.name,
            price: nowPrice,
            exchange: quote.exchange,

            open: +quote.open || 0,
            high: +quote.high || 0,
            low: +quote.low || 0,
            prevClose: +quote.previous_close || 0,

            change: +quote.change || 0,
            changePercent: +quote.percent_change || 0,

            volume: +quote.volume || 0,
            avgVolume: +quote.average_volume || 0,

            isMarketOpen: quote.is_market_open || false,

            fiftyTwoWeek: {
                low: +quote.fifty_two_week?.low || 0,
                high: +quote.fifty_two_week?.high || 0,
                range: quote.fifty_two_week?.range || "0 - 0",
            },

            chart,
            changes,
        };

    } catch (error) {
        console.error("TwelveData error:", error.message);
        return null;
    }
}

module.exports = { getStockData };