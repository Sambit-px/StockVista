const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserModel = require("../model/UserModel");
const HoldingModel = require("../model/HoldingModel");
const OrderModel = require("../model/OrderModel");
const WatchlistModel = require("../model/WatchlistModel");

const router = express.Router();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: "1d" });
    const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken };
};

const getUserPortfolio = async (userId) => {
    const [holdings, orders, watchlist] = await Promise.all([

        // ✅ HoldingSchema fields: userId, symbol, name, quantity, avgPrice
        HoldingModel.find({ userId }),

        // ✅ OrderSchema fields: userId, symbol, type, quantity, price, status, placedAt
        OrderModel.find({ userId }),

        // ✅ WatchlistSchema fields: userId, symbol, name, addedAt
        WatchlistModel.find({ userId })

    ]);
    return { holdings, orders, watchlist };
};


router.post("/register", async (req, res) => {
    try {
        console.log("Register hit, body:", req.body);

        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Missing fields" });
        }

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new UserModel({ name, email, password: hashedPassword });

        const { accessToken, refreshToken } = generateTokens(user._id);

        if (user.refreshTokens.length > 5) {
            user.refreshTokens = user.refreshTokens.slice(-5);
        }
        user.refreshTokens.push(refreshToken);
        await user.save();

        // New user — no holdings, orders, or watchlist yet
        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                holdings: [],   // HoldingSchema
                orders: [],     // OrderSchema
                watchlist: []   // WatchlistSchema
            }
        });

    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: error.message });
    }
});


router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Missing fields" });
        }

        const user = await UserModel.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: "Invalid password" });

        const { accessToken, refreshToken } = generateTokens(user._id);

        if (user.refreshTokens.length > 5) {
            user.refreshTokens = user.refreshTokens.slice(-5);
        }
        user.refreshTokens.push(refreshToken);
        await user.save();

        // Fetch from all 3 separate collections
        const { holdings, orders, watchlist } = await getUserPortfolio(user._id);

        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                holdings,   // [{ symbol, name, quantity, avgPrice }]
                orders,     // [{ symbol, type, quantity, price, status, placedAt }]
                watchlist   // [{ symbol, name, addedAt }]
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});


router.post("/refresh", async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        const user = await UserModel.findById(decoded.userId);

        if (!user || !user.refreshTokens.includes(refreshToken)) {
            return res.status(403).json({ error: "Invalid refresh token" });
        }

        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);

        const newAccessToken = jwt.sign({ userId: user._id }, ACCESS_SECRET, { expiresIn: "1d" });
        const newRefreshToken = jwt.sign({ userId: user._id }, REFRESH_SECRET, { expiresIn: "7d" });

        user.refreshTokens.push(newRefreshToken);
        await user.save();

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });

    } catch (error) {
        res.status(403).json({ error: "Token expired or invalid" });
    }
});


router.post("/logout", async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ error: "No refresh token" });

        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        const user = await UserModel.findById(decoded.userId);

        if (!user) return res.status(404).json({ error: "User not found" });

        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
        await user.save();

        res.json({ message: "Logged out successfully" });

    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ error: "Logout failed" });
    }
});

module.exports = router;