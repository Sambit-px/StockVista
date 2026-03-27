const axios = require("axios");
const API_KEY = process.env.TWELVE_API_KEY;

const cache = new Map();
const CACHE_TIME = 60 * 1000; // 1 minute

const calculateChanges = (fullValues, nowPrice, quote) => {
    if (!fullValues.length) {
        return {
            "1D": { change: 0, percent: 0 },
            "1W": { change: 0, percent: 0 },
            "1M": { change: 0, percent: 0 },
            "1Y": { change: 0, percent: 0 },
            "3Y": { change: 0, percent: 0 },
            "5Y": { change: 0, percent: 0 },
        };
    }

    const now = new Date();

    const cutoffs = {
        "1W": new Date(now - 7 * 24 * 60 * 60 * 1000),
        "1M": new Date(now - 30 * 24 * 60 * 60 * 1000),
        "1Y": new Date(now - 365 * 24 * 60 * 60 * 1000),
        "3Y": new Date(now - 3 * 365 * 24 * 60 * 60 * 1000),
        "5Y": new Date(now - 5 * 365 * 24 * 60 * 60 * 1000),
    };

    const reversedValues = [...fullValues]
        .map(v => ({ ...v, timestamp: new Date(v.time).getTime() }))
        .reverse();

    const getChange = (cutoff) => {
        const pastCandle = reversedValues.find(v => v.timestamp <= cutoff.getTime());
        const pastPrice = pastCandle?.price || nowPrice;
        const change = nowPrice - pastPrice;

        return {
            change: +change.toFixed(2),
            percent: +((change / pastPrice) * 100).toFixed(2),
        };
    };

    return {
        "1D": {
            change: +quote.change || 0,
            percent: +quote.percent_change || 0,
        },
        "1W": getChange(cutoffs["1W"]),
        "1M": getChange(cutoffs["1M"]),
        "1Y": getChange(cutoffs["1Y"]),
        "3Y": getChange(cutoffs["3Y"]),
        "5Y": getChange(cutoffs["5Y"]),
    };
};

const calculateReturnFromChart = (chart) => {
    if (!chart || chart.length < 2) {
        return { change: 0, percent: 0 };
    }

    const firstPrice = chart[0].price;
    const lastPrice = chart[chart.length - 1].price;
    const change = lastPrice - firstPrice;

    return {
        change: +change.toFixed(2),
        percent: firstPrice
            ? +((change / firstPrice) * 100).toFixed(2)
            : 0,
    };
};

async function getStockData(symbol, interval = "1min", period = "1D") {
    try {
        const cacheKey = `${symbol}-${interval}-${period}`;

        if (cache.has(cacheKey)) {
            const cached = cache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_TIME) {
                return cached.data;
            }
        }

        const intervalOutputSizeMap = {
            "1min": 1000,
            "5min": 600,
            "1h": 800,
            "1day": 1000,
            "1week": 2000,
        };

        const outputsize = intervalOutputSizeMap[interval] || 1000;

        // ONLY 2 API CALLS NOW
        const [quoteRes, chartRes] = await Promise.all([
            axios.get("https://api.twelvedata.com/quote", {
                params: { symbol, apikey: API_KEY },
            }),
            axios.get("https://api.twelvedata.com/time_series", {
                params: { symbol, interval, outputsize, apikey: API_KEY },
            }),
        ]);

        const quote = quoteRes.data;

        if (!quote || quote.code || quote.status === "error") {
            console.error("Quote error:", quote);
            return null;
        }

        if (!chartRes.data || chartRes.data.status === "error" || chartRes.data.code) {
            console.error("Chart error:", chartRes.data);
            return null;
        }

        const nowPrice = +quote.close || 0;
        const values = chartRes.data.values || [];

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
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        let chart = values
            .filter(v => new Date(v.datetime) >= cutoff)
            .map(v => ({
                time: v.datetime,
                price: +v.close
            }))
            .reverse();

        const MAX_POINTS = 200;

        if (chart.length > MAX_POINTS) {
            const step = Math.ceil(chart.length / MAX_POINTS);
            chart = chart.filter((_, i) => i % step === 0);
        }

        const periodReturn = calculateReturnFromChart(chart);

        // Use same dataset for change calculations
        const fullValues = values
            .map(v => ({ time: v.datetime, price: +v.close }))
            .reverse();

        const changes = calculateChanges(fullValues, nowPrice, quote);

        const result = {
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

            periodReturn,

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

        cache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });

        console.log("API CALL MADE:", symbol, interval);

        return result;

    } catch (error) {
        console.error("TwelveData error:", error.message);
        return null;
    }
}

module.exports = { getStockData };