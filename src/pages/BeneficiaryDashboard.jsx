import React, { useState, useEffect } from "react";
import { useWallet } from "../hooks/useWallet.js";
import { useContract } from "../hooks/useContract.js";
import { formatEther, formatAddress, formatTimeRemaining } from "../utils/helpers.js";
import toast from "react-hot-toast";

const BeneficiaryDashboard = () => {
  const { account, isConnected, connectWallet } = useWallet();
  const { contract } = useContract();
  const [wills, setWills] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWillsAsBeneficiary = async () => {
    if (!contract || !account) return;

    setLoading(true);
    try {
      // This is a simplified approach - in production, you'd use events or indexing
      const willListeners = await contract.listenerCount("BeneficiariesUpdated");
      toast.info("Note: To get accurate beneficiary data, use a blockchain indexer (The Graph, etc.)");
    } catch (error) {
      console.error("Error fetching wills:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && account) {
      fetchWillsAsBeneficiary();
    }
  }, [account, isConnected]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="p-8 bg-slate-800 border border-slate-700 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">Check which wills you're a beneficiary of</p>
          <button
            onClick={connectWallet}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
          >
            Connect MetaMask
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-8">Beneficiary Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
            <p className="text-gray-400 text-sm">Your Address</p>
            <p className="text-white font-mono text-sm">{formatAddress(account)}</p>
          </div>
          <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
            <p className="text-gray-400 text-sm">Wills as Beneficiary</p>
            <p className="text-indigo-400 font-bold text-2xl">{wills.length}</p>
          </div>
          <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
            <p className="text-gray-400 text-sm">Total Potential Inheritance</p>
            <p className="text-green-400 font-bold text-2xl">TBD</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-8">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading beneficiary information...</p>
          </div>
        ) : wills.length === 0 ? (
          <div className="p-8 bg-slate-800 border-2 border-dashed border-slate-700 rounded-lg text-center">
            <p className="text-gray-400 text-lg">
              You haven't been added as a beneficiary to any wills yet.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              When someone adds you as a beneficiary, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {wills.map((will, index) => (
              <div key={index} className="p-6 bg-slate-800 border border-slate-700 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Testator</p>
                    <p className="text-white font-mono">{formatAddress(will.testator)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Your Percentage</p>
                    <p className="text-indigo-400 font-bold text-lg">{will.percentage}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total ETH Locked</p>
                    <p className="text-green-400 font-bold">{formatEther(will.totalEthLocked)} ETH</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">You Would Receive</p>
                    <p className="text-green-400 font-bold">{(parseFloat(formatEther(will.totalEthLocked)) * will.percentage / 100).toFixed(4)} ETH</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded border border-slate-700">
                  <p className="text-gray-400 text-sm mb-2">Days until trigger</p>
                  <p className="text-yellow-400 font-bold">{formatTimeRemaining(will.timeUntilTrigger)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 p-4 bg-blue-900 border border-blue-600 rounded-lg">
          <h3 className="text-white font-bold mb-2">💡 How It Works</h3>
          <p className="text-blue-200 text-sm">
            When someone creates a will and adds you as a beneficiary, their assets will automatically be
            distributed to you based on your percentage allocation if they become inactive for the specified period.
            Keep an eye on your beneficiary dashboard to track all wills you're included in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryDashboard;
