const axios = require("axios");
const API_KEY = process.env.TWELVE_API_KEY;

const MAX_POINTS = 200;

// Pick the best pre-fetched series for a given period
const PERIOD_SOURCE = {
    "1D": "intraday",
    "1W": "intraday",
    "1M": "daily",
    "1Y": "daily",
    "3Y": "weekly",
    "5Y": "weekly",
};

const PERIOD_DAYS = {
    "1D": 1,
    "1W": 7,
    "1M": 30,
    "1Y": 365,
    "3Y": 365 * 3,
    "5Y": 365 * 5,
};

// Downsample to MAX_POINTS if needed
const downsample = (arr) => {
    if (arr.length <= MAX_POINTS) return arr;
    const step = Math.ceil(arr.length / MAX_POINTS);
    return arr.filter((_, i) => i % step === 0);
};

const buildChart = (values, period) => {
    const days = PERIOD_DAYS[period] || 1;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    const filtered = values
        .filter(v => v.timestamp >= cutoff)
        .sort((a, b) => a.timestamp - b.timestamp); // oldest → newest

    return downsample(filtered).map(v => ({ time: v.time, price: v.price }));
};

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

    // Sort oldest → newest with timestamps pre-parsed
    const sorted = [...fullValues].sort((a, b) => a.timestamp - b.timestamp);

    const getChange = (cutoffMs) => {
        // Walk backwards to find last candle at or before cutoff
        let pastPrice = nowPrice;
        for (let i = sorted.length - 1; i >= 0; i--) {
            if (sorted[i].timestamp <= cutoffMs) {
                pastPrice = sorted[i].price;
                break;
            }
        }
        const change = nowPrice - pastPrice;
        return {
            change: +change.toFixed(2),
            percent: +((change / pastPrice) * 100).toFixed(2),
        };
    };

    const now = Date.now();

    return {
        // 1D: use quote directly — most accurate, handles half-days & holidays
        "1D": {
            change: +quote.change || 0,
            percent: +quote.percent_change || 0,
        },
        "1W": getChange(now - 7 * 24 * 60 * 60 * 1000),
        "1M": getChange(now - 30 * 24 * 60 * 60 * 1000),
        "1Y": getChange(now - 365 * 24 * 60 * 60 * 1000),
        "3Y": getChange(now - 3 * 365 * 24 * 60 * 60 * 1000),
        "5Y": getChange(now - 5 * 365 * 24 * 60 * 60 * 1000),
    };
};

async function getStockData(symbol, interval = "1min", period = "1D") {
    try {
        // Fetch quote + intraday + daily (5Y) + weekly (all) in parallel
        const [quoteRes, intradayRes, dailyRes, weeklyRes] = await Promise.all([
            axios.get("https://api.twelvedata.com/quote", {
                params: { symbol, apikey: API_KEY },
            }),
            // Intraday: max candles at requested interval — covers 1D & 1W charts
            axios.get("https://api.twelvedata.com/time_series", {
                params: { symbol, interval, outputsize: 5000, apikey: API_KEY },
            }),
            // Daily: ~5 years of daily closes — covers 1M, 1Y charts
            axios.get("https://api.twelvedata.com/time_series", {
                params: { symbol, interval: "1day", outputsize: 1825, apikey: API_KEY },
            }),
            // Weekly: decades of data — covers 3Y, 5Y charts + all change calcs
            axios.get("https://api.twelvedata.com/time_series", {
                params: { symbol, interval: "1week", outputsize: 5000, apikey: API_KEY },
            }),





        ]);

        const quote = quoteRes.data;

        if (!quote || quote.code) {
            console.error("Quote error:", quote.message);
            return null;
        }

        if (intradayRes.data.code) {
            console.error("Intraday chart error:", intradayRes.data.message);
            return null;
        }

        const nowPrice = +quote.close || 0;


















        // -------- PARSE ALL SERIES (timestamps pre-parsed once) --------
        const parseValues = (data) =>
            (data.values || []).map(v => ({
                time: v.datetime,
                price: +v.close,
                timestamp: new Date(v.datetime).getTime(),
            }));

        const intradayValues = parseValues(intradayRes.data);
        const dailyValues = parseValues(dailyRes.data);
        const weeklyValues = parseValues(weeklyRes.data);

        // -------- CHART DATA: pick right source per period --------
        const source = PERIOD_SOURCE[period] || "daily";

        let chartValues;
        if (source === "intraday") {
            chartValues = intradayValues;
        } else if (source === "weekly") {
            // Blend: daily where available, weekly for older range
            const dailyOldest = dailyValues.length
                ? Math.min(...dailyValues.map(v => v.timestamp))
                : Infinity;
            chartValues = [
                ...weeklyValues.filter(v => v.timestamp < dailyOldest),
                ...dailyValues,
            ];
        } else {
            // daily
            chartValues = dailyValues;
        }

        const chart = buildChart(chartValues, period);
        console.log(`Chart [${period}] → source:${source}, points:${chart.length}`);

        // -------- FULL VALUES FOR CHANGE CALC (weekly + daily merged) --------
        const dailyOldest = dailyValues.length
            ? Math.min(...dailyValues.map(v => v.timestamp))
            : Infinity;









        const fullValues = [
            ...weeklyValues.filter(v => v.timestamp < dailyOldest),
            ...dailyValues,
        ];



















        const changes = calculateChanges(fullValues, nowPrice, quote);

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
