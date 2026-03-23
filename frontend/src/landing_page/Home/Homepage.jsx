import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "../Navbar";
import Hero from "./Hero";
import Features from "./Features";
import Benefits from "./Benifits";
import Stat from "./Stat";
import OpenAccount from "./OpenAccount";
import Footer from "../Footer";
import ScrollProgress from "./ScrollProgress";
import Home from "./Home";
import StockDashboard from "./StockDashboard";
import FNODashboard from "./FNODashboard";
import MutualFundsDashboard from "./MutualFundsDashboard";
import StockPage from "./StockPage";
import LoginPage from "./LoginPage";

function Homepage() {
    return (
        <Routes>
            <Route path='/'
                element={
                    <div>
                        <ScrollProgress />
                        <Navbar />
                        <Hero />
                        <Benefits />
                        <Features />
                        <Stat />
                        <OpenAccount />
                        <Footer />
                    </div>
                }
            />
            <Route path='/auth' element={<LoginPage />} />
            <Route path='/home' element={<Home />} />
            <Route path='/stocks' element={<StockDashboard />} />
            <Route path='/fno' element={<FNODashboard />} />
            <Route path='/MutualFunds' element={<MutualFundsDashboard />} />
            <Route path='/stock/:symbol' element={<StockPage />} />
        </Routes>
    );
}

export default Homepage;