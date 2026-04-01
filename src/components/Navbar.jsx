import React from "react";
import { Link } from "react-router-dom";
import WalletConnect from "./WalletConnect";

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-indigo-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ChainWill</h1>
              <p className="text-xs text-indigo-300">Digital Will Platform</p>
            </div>
          </Link>

          <div className="hidden md:flex gap-8 items-center">
            <Link to="/" className="text-gray-300 hover:text-white transition">
              Home
            </Link>
            <Link to="/create" className="text-gray-300 hover:text-white transition">
              Create Will
            </Link>
            <Link to="/my-will" className="text-gray-300 hover:text-white transition">
              My Will
            </Link>
            <Link to="/beneficiary" className="text-gray-300 hover:text-white transition">
              Beneficiary
            </Link>
          </div>

          <WalletConnect />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
