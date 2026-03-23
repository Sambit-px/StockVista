const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserModel = require("../model/UserModel");

const router = express.Router();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;


const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId },
        ACCESS_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { userId },
        REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
};


router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new UserModel({
            name,
            email,
            password: hashedPassword
        });

        const { accessToken, refreshToken } = generateTokens(user._id);

        user.refreshTokens.push(refreshToken);

        await user.save();

        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                stocks: user.stocks
            }
        });

    } catch (error) {
        res.status(500).json({ error: "Registration failed" });
    }
});


router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ error: "Invalid password" });
        }

        const { accessToken, refreshToken } = generateTokens(user._id);

        user.refreshTokens.push(refreshToken);

        await user.save();

        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                stocks: user.stocks
            }
        });

    } catch (error) {
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

        // Remove old refresh token and generate a new one
        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);

        const newAccessToken = jwt.sign({ userId: user._id }, ACCESS_SECRET, { expiresIn: "15m" });
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

        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

        const user = await UserModel.findById(decoded.userId);

        user.refreshTokens = user.refreshTokens.filter(
            token => token !== refreshToken
        );

        await user.save();

        res.json({ message: "Logged out successfully" });

    } catch (error) {
        res.status(500).json({ error: "Logout failed" });
    }
});

module.exports = router;