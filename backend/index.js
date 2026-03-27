require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const UserModel = require("./model/UserModel");
const authMiddleware = require("./middleware/auth.js");
const authRoutes = require("./routes/auth");

const { getStockQuote, searchStocks, getStockFundamentals, getStockFinancials } = require("./services/finnhub");
const { getIntradayChart } = require("./services/alphaVantage");
const { getStockData } = require("./services/twelveData");
const { getTopGainers, getTopLosers, getMostActive } = require("./services/fmp");

const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL;

const app = express();

app.use(cors());
app.use(bodyParser.json());


app.use("/auth", authRoutes);

app.get("/test", (req, res) => {
  console.log("TEST ROUTE WORKING");
  res.send("server updated");
});

app.get("/debug-twelve/:symbol", async (req, res) => {
  const { symbol } = req.params;
  try {
    const result = await axios.get("https://api.twelvedata.com/quote", {
      params: { symbol, apikey: process.env.TWELVE_API_KEY }
    });
    res.json({
      keyExists: !!process.env.TWELVE_API_KEY,
      keyPreview: process.env.TWELVE_API_KEY?.slice(0, 6) + "...",
      data: result.data
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});
```

Then visit:
```
https://stockvista-20p2.onrender.com/debug-twelve/AAPL

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


  console.log("------ STOCK API CALLED ------");
  console.log("Symbol:", symbol);
  console.log("Period:", period);
  console.log("Time:", new Date().toLocaleTimeString());
  console.log("------------------------------");

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

    const stockInfo = await getStockData(symbol, interval, period);
    console.log("StockInfo received from service:", stockInfo);


    if (!stockInfo) {
      return res.status(404).json({ error: "Stock not found" });
    }

    console.log("Stock info sent:", {
      symbol: stockInfo.symbol,
      price: stockInfo.price,
      changes: stockInfo.changes,
      chartLength: stockInfo.chart.length
    });

    res.json(stockInfo);


  } catch (err) {
    console.error("Stock API error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch stock data" });

  }
});


app.get("/stock-chart/:symbol", authMiddleware, async (req, res) => {
  try {

    const { symbol } = req.params;
    const { interval } = req.query;

    const chart = await getIntradayChart(symbol, interval || "1h");

    res.json(chart);

  } catch (error) {
    res.status(500).json({ error: "Chart fetch failed" });
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

    user.stocks.orders.push({
      symbol,
      type: "BUY",
      quantity,
      price
    });

    await user.save();

    res.json({
      message: "Stock bought successfully",
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

    const stock = user.stocks.holdings.find(
      s => s.symbol === symbol
    );

    if (!stock) {
      return res.status(400).json({ error: "Stock not in holdings" });
    }

    if (stock.quantity < quantity) {
      return res.status(400).json({ error: "Not enough shares to sell" });
    }

    stock.quantity -= quantity;

    if (stock.quantity === 0) {
      user.stocks.holdings = user.stocks.holdings.filter(
        s => s.symbol !== symbol
      );
    }

    user.stocks.orders.push({
      symbol,
      type: "SELL",
      quantity,
      price
    });

    await user.save();

    res.json({
      message: "Stock sold successfully",
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