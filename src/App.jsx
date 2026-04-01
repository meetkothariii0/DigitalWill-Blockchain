import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { WalletProvider } from "./context/WalletContext.jsx";

import Navbar from "./components/Navbar.jsx";

import Home from "./pages/Home.jsx";
import CreateWill from "./pages/CreateWill.jsx";
import MyWill from "./pages/MyWill.jsx";
import BeneficiaryDashboard from "./pages/BeneficiaryDashboard.jsx";
import ExecuteWill from "./pages/ExecuteWill.jsx";

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-slate-900">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateWill />} />
              <Route path="/my-will" element={<MyWill />} />
              <Route path="/beneficiary" element={<BeneficiaryDashboard />} />
              <Route path="/execute" element={<ExecuteWill />} />
            </Routes>
          </main>
        </div>
        <Toaster position="top-right" />
      </Router>
    </WalletProvider>
  );
}

export default App;
