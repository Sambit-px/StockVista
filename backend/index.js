require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const HoldingModel = require("./model/HoldingModel.js");
const OrderModel = require("./model/OrderModel.js");
const WatchlistModel = require("./model/WatchlistModel.js");
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
    const [holdings, watchlist, orders] = await Promise.all([
      HoldingModel.find({ userId: req.userId }),
      WatchlistModel.find({ userId: req.userId }),
      OrderModel.find({ userId: req.userId }),
    ]);

    res.json({ holdings, watchlist, orders });

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
    const { name, orderType = "LIMIT" } = req.body;
    const quantity = Number(req.body.quantity);
    const price = Number(req.body.price);

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    const quote = await getStockQuote(symbol);
    if (!quote?.price) {
      return res.status(400).json({ error: "Failed to fetch current stock price" });
    }

    const currentPrice = Number(quote.price);

    // ✅ EXECUTION LOGIC
    let executed = false;
    let executionPrice = price;

    if (orderType === "MARKET") {
      executed = true;
      executionPrice = currentPrice;
    } else {
      executed = price >= currentPrice;
      executionPrice = executed ? currentPrice : price;
    }

    // ✅ UPDATE HOLDINGS
    if (executed) {
      const existing = await HoldingModel.findOne({ userId: req.userId, symbol });

      if (existing) {
        const newQty = existing.quantity + quantity;

        existing.avgPrice =
          (existing.avgPrice * existing.quantity + executionPrice * quantity) / newQty;

        existing.quantity = newQty;
        await existing.save();
      } else {
        await HoldingModel.create({
          userId: req.userId,
          symbol,
          name: name || symbol,
          quantity,
          avgPrice: executionPrice
        });
      }
    }

    // ✅ STORE ORDER (correct price)
    await OrderModel.create({
      userId: req.userId,
      symbol,
      type: "BUY",
      quantity,
      price: executionPrice,
      orderType,
      status: executed ? "EXECUTED" : "PENDING",
      placedAt: new Date()
    });

    const [holdings, orders] = await Promise.all([
      HoldingModel.find({ userId: req.userId }),
      OrderModel.find({ userId: req.userId })
    ]);

    res.json({
      message: executed
        ? `Bought at $${executionPrice}`
        : "Buy order placed (pending)",
      holdings,
      orders
    });

  } catch (error) {
    console.error("Buy error:", error);
    res.status(500).json({ error: "Buy failed" });
  }
});


app.post("/stock/:symbol/sell", authMiddleware, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { orderType = "LIMIT" } = req.body;
    const quantity = Number(req.body.quantity);
    const price = Number(req.body.price);

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    const holding = await HoldingModel.findOne({ userId: req.userId, symbol });
    if (!holding) {
      return res.status(400).json({ error: "Stock not in holdings" });
    }

    // ✅ FIX: validate BEFORE execution
    if (holding.quantity < quantity) {
      return res.status(400).json({ error: "Not enough shares to sell" });
    }

    const quote = await getStockQuote(symbol);
    const currentPrice = Number(quote?.price || 0);

    // ✅ EXECUTION LOGIC
    let executed = false;
    let executionPrice = price;

    if (orderType === "MARKET") {
      executed = true;
      executionPrice = currentPrice;
    } else {
      executed = price <= currentPrice;
      executionPrice = executed ? currentPrice : price;
    }

    // ✅ UPDATE HOLDINGS
    if (executed) {
      holding.quantity -= quantity;

      if (holding.quantity === 0) {
        await HoldingModel.deleteOne({ userId: req.userId, symbol });
      } else {
        await holding.save();
      }
    }

    // ✅ STORE ORDER
    await OrderModel.create({
      userId: req.userId,
      symbol,
      type: "SELL",
      quantity,
      price: executionPrice,
      orderType,
      status: executed ? "EXECUTED" : "PENDING",
      placedAt: new Date()
    });

    const [holdings, orders] = await Promise.all([
      HoldingModel.find({ userId: req.userId }),
      OrderModel.find({ userId: req.userId })
    ]);

    res.json({
      message: executed
        ? `Sold at $${executionPrice}`
        : "Sell order placed (pending)",
      holdings,
      orders
    });

  } catch (error) {
    console.error("Sell error:", error);
    res.status(500).json({ error: "Sell failed" });
  }
});

// GET /watchlist/:symbol — check if watchlisted
app.get("/watchlist/:symbol", authMiddleware, async (req, res) => {
  const item = await WatchlistModel.findOne({ userId: req.userId, symbol: req.params.symbol.toUpperCase() });
  res.json({ isWatchlisted: !!item });
});

// POST /watchlist — add to watchlist
app.post("/watchlist", authMiddleware, async (req, res) => {
  const { symbol, name } = req.body;
  const existing = await WatchlistModel.findOne({ userId: req.userId, symbol: symbol.toUpperCase() });
  if (existing) return res.json({ message: "Already in watchlist" });
  await WatchlistModel.create({ userId: req.userId, symbol: symbol.toUpperCase(), name });
  res.json({ message: "Added to watchlist" });
});

// DELETE /watchlist/:symbol — remove from watchlist
app.delete("/watchlist/:symbol", authMiddleware, async (req, res) => {
  await WatchlistModel.deleteOne({ userId: req.userId, symbol: req.params.symbol.toUpperCase() });
  res.json({ message: "Removed from watchlist" });
});

// DELETE /order/:id
app.delete("/order/:id", authMiddleware, async (req, res) => {
  try {
    const order = await OrderModel.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "PENDING") {
      return res.status(400).json({ error: "Only pending orders can be cancelled" });
    }

    order.status = "CANCELLED";
    await order.save();

    const orders = await OrderModel.find({ userId: req.userId });

    res.json({
      message: "Order cancelled",
      orders
    });

  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ error: "Cancel failed" });
  }
});

// GET /orders — fetch all orders for logged-in user
app.get("/orders", authMiddleware, async (req, res) => {
  try {
    const orders = await OrderModel.find({ userId: req.userId }).sort({ placedAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.error("Failed to fetch orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// PUT /order/:id
app.put("/order/:id", authMiddleware, async (req, res) => {
  try {
    const { quantity, price } = req.body;

    const order = await OrderModel.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "PENDING") {
      return res.status(400).json({ error: "Only pending orders can be edited" });
    }

    const newQty = Number(quantity);
    const newPrice = Number(price);

    if (!newQty || newQty <= 0) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    // ✅ GET LIVE PRICE
    const quote = await getStockQuote(order.symbol);
    const currentPrice = Number(quote?.price || 0);

    let executed = false;
    let executionPrice = newPrice;

    // ✅ EXECUTION LOGIC (same as buy/sell)
    if (order.orderType === "MARKET") {
      executed = true;
      executionPrice = currentPrice;
    } else {
      if (order.type === "BUY") {
        executed = newPrice >= currentPrice;
      } else {
        executed = newPrice <= currentPrice;
      }
      executionPrice = executed ? currentPrice : newPrice;
    }

    // ✅ UPDATE ORDER
    order.quantity = newQty;
    order.price = executionPrice;
    order.status = executed ? "EXECUTED" : "PENDING";

    await order.save();

    // ✅ UPDATE HOLDINGS IF EXECUTED
    if (executed && order.type === "BUY") {
      const existing = await HoldingModel.findOne({ userId: req.userId, symbol: order.symbol });

      if (existing) {
        const totalQty = existing.quantity + newQty;

        existing.avgPrice =
          (existing.avgPrice * existing.quantity + executionPrice * newQty) / totalQty;

        existing.quantity = totalQty;
        await existing.save();
      } else {
        await HoldingModel.create({
          userId: req.userId,
          symbol: order.symbol,
          name: order.symbol,
          quantity: newQty,
          avgPrice: executionPrice
        });
      }
    }

    if (executed && order.type === "SELL") {
      const holding = await HoldingModel.findOne({ userId: req.userId, symbol: order.symbol });

      if (holding) {
        holding.quantity -= newQty;

        if (holding.quantity <= 0) {
          await HoldingModel.deleteOne({ userId: req.userId, symbol: order.symbol });
        } else {
          await holding.save();
        }
      }
    }

    const orders = await OrderModel.find({ userId: req.userId });

    res.json({
      message: executed ? "Order executed" : "Order updated (still pending)",
      orders
    });

  } catch (err) {
    console.error("Edit order error:", err);
    res.status(500).json({ error: "Edit failed" });
  }
});

// GET /allorders — fetch ALL orders (no filter, full history)
app.get("/allorders", authMiddleware, async (req, res) => {
  try {
    const orders = await OrderModel.find({ userId: req.userId })
      .sort({ placedAt: -1 }); // newest first

    res.json({
      count: orders.length,
      orders
    });

  } catch (err) {
    console.error("All orders fetch error:", err);
    res.status(500).json({ error: "Failed to fetch all orders" });
  }
});

// GET /stock/:symbol/live — returns only the latest price
app.get("/stock/:symbol/live", async (req, res) => {
  try {
    const { symbol } = req.params;
    if (!symbol) return res.status(400).json({ error: "Symbol is required" });

    // Use your existing service (getStockQuote) to get latest price
    const quote = await getStockQuote(symbol.toUpperCase());

    if (!quote?.price) {
      return res.status(404).json({ error: "Price not found" });
    }

    res.json({ price: Number(quote.price) });
  } catch (err) {
    console.error("Live price error:", err.message);
    res.status(500).json({ error: "Failed to fetch live price" });
  }
});

app.listen(PORT, () => {
  console.log("App started!");
  mongoose.connect(uri);
  console.log("DB started!");
});