require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const { HoldingsModel } = require("./model/HoldingsModel");

const { PositionsModel } = require("./model/PositionsModel");

const { OrdersModel } = require("./model/OrdersModel");
const { getStockQuote, searchStocks } = require("./services/finnhub");
const { getIntradayChart } = require("./services/alphaVantage");
const { getStockData } = require("./services/twelveData");
const { getTopGainers, getTopLosers, getMostActive } = require("./services/fmp");

const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL;

const app = express();

app.use(cors());
app.use(bodyParser.json());

// app.get("/addHoldings", async (req, res) => {
//   let tempHoldings = [
//     {
//       name: "BHARTIARTL",
//       qty: 2,
//       avg: 538.05,
//       price: 541.15,
//       net: "+0.58%",
//       day: "+2.99%",
//     },
//     {
//       name: "HDFCBANK",
//       qty: 2,
//       avg: 1383.4,
//       price: 1522.35,
//       net: "+10.04%",
//       day: "+0.11%",
//     },
//     {
//       name: "HINDUNILVR",
//       qty: 1,
//       avg: 2335.85,
//       price: 2417.4,
//       net: "+3.49%",
//       day: "+0.21%",
//     },
//     {
//       name: "INFY",
//       qty: 1,
//       avg: 1350.5,
//       price: 1555.45,
//       net: "+15.18%",
//       day: "-1.60%",
//       isLoss: true,
//     },
//     {
//       name: "ITC",
//       qty: 5,
//       avg: 202.0,
//       price: 207.9,
//       net: "+2.92%",
//       day: "+0.80%",
//     },
//     {
//       name: "KPITTECH",
//       qty: 5,
//       avg: 250.3,
//       price: 266.45,
//       net: "+6.45%",
//       day: "+3.54%",
//     },
//     {
//       name: "M&M",
//       qty: 2,
//       avg: 809.9,
//       price: 779.8,
//       net: "-3.72%",
//       day: "-0.01%",
//       isLoss: true,
//     },
//     {
//       name: "RELIANCE",
//       qty: 1,
//       avg: 2193.7,
//       price: 2112.4,
//       net: "-3.71%",
//       day: "+1.44%",
//     },
//     {
//       name: "SBIN",
//       qty: 4,
//       avg: 324.35,
//       price: 430.2,
//       net: "+32.63%",
//       day: "-0.34%",
//       isLoss: true,
//     },
//     {
//       name: "SGBMAY29",
//       qty: 2,
//       avg: 4727.0,
//       price: 4719.0,
//       net: "-0.17%",
//       day: "+0.15%",
//     },
//     {
//       name: "TATAPOWER",
//       qty: 5,
//       avg: 104.2,
//       price: 124.15,
//       net: "+19.15%",
//       day: "-0.24%",
//       isLoss: true,
//     },
//     {
//       name: "TCS",
//       qty: 1,
//       avg: 3041.7,
//       price: 3194.8,
//       net: "+5.03%",
//       day: "-0.25%",
//       isLoss: true,
//     },
//     {
//       name: "WIPRO",
//       qty: 4,
//       avg: 489.3,
//       price: 577.75,
//       net: "+18.08%",
//       day: "+0.32%",
//     },
//   ];

//   tempHoldings.forEach((item) => {
//     let newHolding = new HoldingsModel({
//       name: item.name,
//       qty: item.qty,
//       avg: item.avg,
//       price: item.price,
//       net: item.day,
//       day: item.day,
//     });

//     newHolding.save();
//   });
//   res.send("Done!");
// });

// app.get("/addPositions", async (req, res) => {
//   let tempPositions = [
//     {
//       product: "CNC",
//       name: "EVEREADY",
//       qty: 2,
//       avg: 316.27,
//       price: 312.35,
//       net: "+0.58%",
//       day: "-1.24%",
//       isLoss: true,
//     },
//     {
//       product: "CNC",
//       name: "JUBLFOOD",
//       qty: 1,
//       avg: 3124.75,
//       price: 3082.65,
//       net: "+10.04%",
//       day: "-1.35%",
//       isLoss: true,
//     },
//   ];

//   tempPositions.forEach((item) => {
//     let newPosition = new PositionsModel({
//       product: item.product,
//       name: item.name,
//       qty: item.qty,
//       avg: item.avg,
//       price: item.price,
//       net: item.net,
//       day: item.day,
//       isLoss: item.isLoss,
//     });

//     newPosition.save();
//   });
//   res.send("Done!");
// });


app.get("/allHoldings", async (req, res) => {
  let allHoldings = await HoldingsModel.find({});
  res.json(allHoldings);
});

app.get("/allPositions", async (req, res) => {
  let allPositions = await PositionsModel.find({});
  res.json(allPositions);
});

app.get("/allOrders", async (req, res) => {
  let allOrders = await OrdersModel.find({});
  res.json(allOrders);
});

app.delete("/cancelOrders/:name/:mode", async (req, res) => {
  let { name, mode } = req.params;
  const deleteOrder = await OrdersModel.findOneAndDelete({ name, mode });
  res.send("Order Deleted");
}
);

app.post("/buyStock", async (req, res) => {
  const { name, qty, price, currPrice, mode } = req.body;


  if (currPrice > price) {
    let order = await OrdersModel.findOne({ name, mode });

    if (order) {
      order.price = ((order.price * order.qty) + (price * qty)) / (order.qty + qty);
      order.qty = order.qty + qty;
      order.currPrice = currPrice;
      await order.save();
      console.log("Order saved!");
    }
    else {
      const newOrder = new OrdersModel({
        name: name,
        qty: qty,
        currPrice: currPrice,
        price: price,
        mode: mode,
      });
      await newOrder.save();
      console.log("Order saved!");
    }
  }

  let holding = await HoldingsModel.findOne({ name });

  if (holding) {
    holding.avg = ((holding.price * holding.qty) + (price * qty)) / (holding.qty + qty);
    holding.qty = holding.qty + qty;
    await holding.save();

    console.log("Holding updated!");
    res.send("Holding updated!");
  } else {
    const newHolding = new HoldingsModel({
      name: name,
      qty: qty,
      avg: price,
      price: price,
      net: "0%",
      day: "0%",
    });
    await newHolding.save();

    console.log("New holding saved!");
    res.send("New holding saved!");
  }
});

app.get("/stocks", async (req, res) => {
  try {
    const { symbols } = req.query; // expects comma-separated string
    if (!symbols) return res.status(400).json({ error: "Symbols are required" });

    const symbolArray = symbols.split(",").map(s => s.trim().toUpperCase());

    // Fetch all stock quotes in parallel, no backend caching
    const stocksData = await Promise.all(
      symbolArray.map(symbol => getStockQuote(symbol))
    );

    res.json(stocksData);
  } catch (err) {
    console.error("Failed to fetch /stocks:", err);
    res.status(500).json({ error: "Failed to fetch stocks" });
  }
});

app.get("/stock/:symbol", async (req, res) => {
  const { symbol } = req.params;
  const { period } = req.query; // "1D", "1W", "1M", "1Y"


  console.log("------ STOCK API CALLED ------");
  console.log("Symbol:", symbol);
  console.log("Period:", period);
  console.log("Time:", new Date().toLocaleTimeString());
  console.log("------------------------------");

  try {
    let interval;

    switch (period) {
      case "1D": interval = "1min"; break;
      case "1W": interval = "5min"; break;      // or "1day" depending on your preference
      case "1M": interval = "1h"; break;
      case "1Y": interval = "1day"; break;
      case "3Y": interval = "1week"; break;
      case "5Y": interval = "1month"; break;
      default: interval = "15min";
    }

    const stockInfo = await getStockData(symbol, interval, period);

    if (!stockInfo) {
      return res.status(404).json({ error: "Stock not found" });
    }

    res.json(stockInfo); // chart is already included inside stockInfo
    console.log("Stock info sent:", {
      symbol: stockInfo.symbol,
      price: stockInfo.price,
      changes: stockInfo.changes,
      chartLength: stockInfo.chart.length
    });


  } catch (err) {
    console.error("Stock API error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch stock data" });

  }
});


app.get("/stock-chart/:symbol", async (req, res) => {
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


app.listen(PORT, () => {
  console.log("App started!");
  mongoose.connect(uri);
  console.log("DB started!");
});