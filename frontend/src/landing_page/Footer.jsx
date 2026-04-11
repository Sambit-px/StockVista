import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-amber-200 to-amber-50 bg-clip-text text-transparent mb-4">
                            StockVista
                        </h3>
                        <p className="text-slate-400 mb-6">
                            Your trusted partner for smart investing. Trade stocks, mutual funds, F&O, IPOs, and bonds with zero brokerage.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-500">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-500">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-500">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-500">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Products */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Products</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="hover:text-amber-300">Stocks</a></li>
                            <li><a href="#" className="hover:text-amber-300">Mutual Funds</a></li>
                            <li><a href="#" className="hover:text-amber-300">F&O</a></li>
                            <li><a href="#" className="hover:text-amber-300">IPO</a></li>
                            <li><a href="#" className="hover:text-amber-300">Bonds & NCDs</a></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Company</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="hover:text-amber-300">About Us</a></li>
                            <li><a href="#" className="hover:text-amber-300">Careers</a></li>
                            <li><a href="#" className="hover:text-amber-300">Press</a></li>
                            <li><a href="#" className="hover:text-amber-300">Blog</a></li>
                            <li><a href="#" className="hover:text-amber-300">Contact</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Get in Touch</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
                                <span>support@stockvista.com</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
                                <span>1800-123-4567</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
                                <span>Rourkela, Odisha, India</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-slate-500">
                            © 2025 StockVista. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <a href="#" className="text-slate-500 hover:text-amber-400 transition-colors">Privacy Policy</a>
                            <a href="#" className="text-slate-500 hover:text-amber-400 transition-colors">Terms of Service</a>
                            <a href="#" className="text-slate-500 hover:text-amber-400 transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;