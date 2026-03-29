require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const UserModel = require("./model/UserModel");
const authMiddleware = require("./middleware/auth.js");
const authRoutes = require("./routes/auth");

const { getStockQuote, searchStocks, getStockFundamentals, getStockFinancials, getCompanyNews } = require("./services/finnhub");
const { getFinancials } = require("./services/alphaVantage");
const { getStockData } = require("./services/twelveData");
const { getTopGainers, getTopLosers, getMostActive, getMarketMetrics, getIncomeStatement, getBalanceSheet, getCashFlow } = require("./services/fmp");

const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL;
const axios = require("axios");

const app = express();

app.use(cors());
app.use(bodyParser.json());


app.use("/auth", authRoutes);

app.get("/test", (req, res) => {
  console.log("TEST ROUTE WORKING");
  res.send("server updated");
});

app.get("/debug-twelve/:symbol", async (req, res) => {
  const key = process.env.TWELVE_API_KEY;
  const { symbol } = req.params;
  try {
    const r = await axios.get("https://api.twelvedata.com/quote", {
      params: { symbol, apikey: key }
    });
    res.json({
      keyExists: !!key,
      twelveDataResponse: r.data  // ✅ shows exact error from TwelveData
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.get("/stocks", authMiddleware, async (req, res) => {
  try {
    const { symbols } = req.query;

    // Symbols coming from frontend
    let querySymbols = [];
    if (symbols) {
      querySymbols = symbols.split(",").map(s => s.trim().toUpperCase());
    }

    // Get user data
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Symbols stored in DB
    const holdingSymbols = user.stocks?.holdings?.map(s => s.symbol) || [];
    const watchlistSymbols = user.stocks?.watchlist?.map(s => s.symbol) || [];
    const orderSymbols = user.stocks?.orders?.map(s => s.symbol) || [];

    // Merge all symbols
    const allSymbols = [
      ...holdingSymbols,
      ...watchlistSymbols,
      ...orderSymbols
    ];

    // Remove duplicates
    const uniqueSymbols = [...new Set(allSymbols)];

    if (uniqueSymbols.length === 0) {
      return res.json([]);
    }

    // Fetch stock data
    const stocksData = await Promise.all(
      uniqueSymbols.map(symbol => getStockQuote(symbol))
    );

    const holdingsData = stocksData.filter(s => holdingSymbols.includes(s.symbol));
    const watchlistData = stocksData.filter(s => watchlistSymbols.includes(s.symbol));
    const ordersData = stocksData.filter(s => orderSymbols.includes(s.symbol));

    res.json({ holdings: holdingsData, watchlist: watchlistData, orders: ordersData });

  } catch (err) {
    console.error("Failed to fetch /stocks:", err);
    res.status(500).json({ error: "Failed to fetch stocks" });
  }
});

app.get("/stock/:symbol", async (req, res) => {
  const { symbol } = req.params;
  const { period } = req.query;

  console.log("Stock route hit:", symbol, period);

  try {
    let interval;

    switch (period) {
      case "1D": interval = "1min"; break;
      case "1W": interval = "5min"; break;
      case "1M": interval = "1h"; break;
      case "1Y": interval = "1day"; break;
      case "3Y": interval = "1week"; break;
      case "5Y": interval = "1week"; break;
      default: interval = "1min";
    }

    // -------- ALWAYS FETCH 5 YEARS NEWS --------
    const today = new Date();
    const past = new Date();
    past.setFullYear(today.getFullYear() - 5);

    const from = past.toISOString().split("T")[0];
    const to = today.toISOString().split("T")[0];
    // ------------------------------------------

    console.log("News range:", from, "to", to);

    const [stockInfo, news] = await Promise.all([
      getStockData(symbol, interval, period),
      getCompanyNews(symbol, from, to)
    ]);

    if (!stockInfo) {
      return res.status(404).json({ error: "Stock not found" });
    }

    res.json({
      ...stockInfo,
      news
    });

  } catch (err) {
    console.error("Stock API error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

// GET /financials/full/:symbol
app.get("/financials/full/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const upperSymbol = symbol.toUpperCase();

    const [income, balance, cash] = await Promise.all([
      getIncomeStatement(upperSymbol),
      getBalanceSheet(upperSymbol),
      getCashFlow(upperSymbol)
    ]);

    res.json({
      incomeStatement: income,
      balanceSheet: balance,
      cashFlow: cash
    });

  } catch (err) {
    console.error("Full financials error:", err.message);
    res.status(500).json({ error: "Failed to fetch full financials" });
  }
});

app.get("/market-metrics/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    if (!symbol) return res.status(400).json({ error: "Symbol is required" });

    const metrics = await getMarketMetrics(symbol.toUpperCase());

    if (!metrics || Object.keys(metrics).length === 0) {
      return res.status(404).json({ error: "Metrics not found" });
    }

    res.json(metrics);

  } catch (err) {
    console.error("Market Metrics error:", err.message);
    res.status(500).json({ error: "Failed to fetch market metrics" });
  }
});

// Top 3 Gainers
app.get("/explore/gainers", async (req, res) => {
  try {
    const data = await getTopGainers();

    if (!data) {
      return res.status(500).json({ error: "Failed to fetch gainers" });
    }

    res.json(data);

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});


// Top 3 Losers
app.get("/explore/losers", async (req, res) => {
  try {
    const data = await getTopLosers();

    if (!data) {
      return res.status(500).json({ error: "Failed to fetch losers" });
    }

    res.json(data);

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});


// Most Active (Most Bought)
app.get("/explore/most-active", async (req, res) => {
  try {
    const data = await getMostActive();

    if (!data) {
      return res.status(500).json({ error: "Failed to fetch most active stocks" });
    }

    res.json(data);

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === "") {
      return res.status(400).json({ error: "Query is required" });
    }

    // Call the searchStocks function
    const results = await searchStocks(q.trim());

    res.json(results); // <-- return results to frontend

  } catch (error) {
    console.error("Search API error:", error.message);
    res.status(500).json({ error: "Search failed" });
  }
});


app.get("/stock-fundamentals/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;

    const data = await getStockFundamentals(symbol);

    if (!data) {
      return res.status(404).json({ error: "Fundamentals not found" });
    }

    res.json(data);

  } catch (error) {
    console.error("Fundamentals API error:", error.message);
    res.status(500).json({ error: "Failed to fetch fundamentals" });
  }
});

app.get("/stock-financials/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;

    const data = await getStockFinancials(symbol);

    if (!data) {
      return res.status(404).json({ error: "Financials not found" });
    }

    res.json(data);

  } catch (error) {
    console.error("Financials API error:", error.message);
    res.status(500).json({ error: "Failed to fetch financials" });
  }
});

app.post("/stock/:symbol/buy", authMiddleware, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { quantity, price, name } = req.body;

    if (!quantity || !price || quantity <= 0) {
      return res.status(400).json({ error: "Invalid quantity or price" });
    }

    const user = await UserModel.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Get current stock price (assuming you have a function to fetch latest price)
    const currentPrice = await getStockQuote(symbol); // implement this
    const executed = price >= currentPrice; // true → execute immediately

    if (executed) {
      // Execute immediately → update holdings
      const existingStock = user.stocks.holdings.find(
        stock => stock.symbol === symbol
      );

      if (existingStock) {
        const newQuantity = existingStock.quantity + quantity;
        const totalCost =
          existingStock.avgPrice * existingStock.quantity +
          price * quantity;

        existingStock.quantity = newQuantity;
        existingStock.avgPrice = totalCost / newQuantity;
      } else {
        user.stocks.holdings.push({
          symbol,
          name,
          quantity,
          avgPrice: price
        });
      }
    }

    // Add to orders in both cases
    user.stocks.orders.push({
      symbol,
      type: "BUY",
      quantity,
      price,
      status: executed ? "EXECUTED" : "PENDING",
      placedAt: new Date()
    });

    await user.save();

    res.json({
      message: executed
        ? "Stock bought successfully"
        : "Order placed in pending orders",
      holdings: user.stocks.holdings,
      orders: user.stocks.orders
    });

  } catch (error) {
    console.error("Buy error:", error);
    res.status(500).json({ error: "Buy failed" });
  }
});

app.post("/stock/:symbol/sell", authMiddleware, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { quantity, price } = req.body;

    if (!quantity || !price || quantity <= 0) {
      return res.status(400).json({ error: "Invalid quantity or price" });
    }

    const user = await UserModel.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const stock = user.stocks.holdings.find(s => s.symbol === symbol);

    if (!stock) {
      return res.status(400).json({ error: "Stock not in holdings" });
    }

    // Get current stock price (implement getStockQuote)
    const currentPrice = await getStockQuote(symbol);
    const executed = price <= currentPrice; // true → execute immediately

    if (executed) {
      // Reduce holdings
      if (stock.quantity < quantity) {
        return res.status(400).json({ error: "Not enough shares to sell" });
      }

      stock.quantity -= quantity;

      if (stock.quantity === 0) {
        user.stocks.holdings = user.stocks.holdings.filter(
          s => s.symbol !== symbol
        );
      }
    }

    // Add to orders
    user.stocks.orders.push({
      symbol,
      type: "SELL",
      quantity,
      price,
      status: executed ? "EXECUTED" : "PENDING",
      placedAt: new Date()
    });

    await user.save();

    res.json({
      message: executed
        ? "Stock sold successfully"
        : "Sell order placed in pending orders",
      holdings: user.stocks.holdings,
      orders: user.stocks.orders
    });

  } catch (error) {
    console.error("Sell error:", error);
    res.status(500).json({ error: "Sell failed" });
  }
});

app.listen(PORT, () => {
  console.log("App started!");
  mongoose.connect(uri);
  console.log("DB started!");
});