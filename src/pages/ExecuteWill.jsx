import React, { useState, useEffect } from "react";
import { useWallet } from "../hooks/useWallet.js";
import { useContract } from "../hooks/useContract.js";
import { formatAddress, formatEther, formatTimeRemaining, formatDate } from "../utils/helpers.js";
import toast from "react-hot-toast";

const ExecuteWill = () => {
  const { account, isConnected, connectWallet } = useWallet();
  const { contract, executeWill } = useContract();

  const [executorWills, setExecutorWills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(null);
  const [selectedWill, setSelectedWill] = useState(null);

  const fetchExecutorWills = async () => {
    if (!contract || !account) return;

    setLoading(true);
    try {
      // Note: This is a simplified implementation
      // In production, you'd use event listeners or The Graph
      toast.info("Listening for wills where you're the executor...");
    } catch (error) {
      console.error("Error fetching wills:", error);
      toast.error("Failed to fetch executor wills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && account) {
      fetchExecutorWills();
    }
  }, [account, isConnected]);

  const handleExecuteWill = async (testatorAddress) => {
    setExecuting(testatorAddress);
    const result = await executeWill(testatorAddress);

    if (result) {
      toast.success("Will executed successfully!");
      setTimeout(() => fetchExecutorWills(), 2000);
    }

    setExecuting(null);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="p-8 bg-slate-800 border border-slate-700 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">You need to connect your wallet to execute wills</p>
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
        <h1 className="text-4xl font-bold text-white mb-8">Execute Wills</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
            <p className="text-gray-400 text-sm">Your Address</p>
            <p className="text-white font-mono text-sm">{formatAddress(account)}</p>
          </div>
          <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
            <p className="text-gray-400 text-sm">Wills to Execute</p>
            <p className="text-indigo-400 font-bold text-2xl">{executorWills.length}</p>
          </div>
          <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
            <p className="text-gray-400 text-sm">Ready to Execute</p>
            <p className="text-red-400 font-bold text-2xl">
              {executorWills.filter((w) => w.isTriggered).length}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-8">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading wills...</p>
          </div>
        ) : executorWills.length === 0 ? (
          <div className="p-8 bg-slate-800 border-2 border-dashed border-slate-700 rounded-lg text-center">
            <p className="text-gray-400 text-lg">
              You are not assigned as executor for any wills yet.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              When someone assigns you as an executor, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {executorWills.map((will, index) => (
              <div key={index} className="p-6 bg-slate-800 border border-slate-700 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Testator: {formatAddress(will.testator)}</h3>
                    <p className="text-gray-400 text-sm">Last Check-In: {formatDate(will.lastCheckIn)}</p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded font-bold ${
                      will.isTriggered
                        ? "bg-red-900 text-red-200"
                        : "bg-yellow-900 text-yellow-200"
                    }`}
                  >
                    {will.isTriggered ? "Ready ✓" : "Pending"}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Inactivity Period</p>
                    <p className="text-white font-bold">{Math.floor(will.inactivityPeriod / 86400)} days</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">ETH Locked</p>
                    <p className="text-green-400 font-bold">{formatEther(will.totalEthLocked)} ETH</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Beneficiaries</p>
                    <p className="text-indigo-400 font-bold">{will.beneficiariesCount}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded border border-slate-700 mb-4">
                  <p className="text-gray-400 text-sm mb-1">Time Remaining</p>
                  <p
                    className={`font-bold ${
                      will.isTriggered ? "text-red-400" : "text-yellow-400"
                    }`}
                  >
                    {formatTimeRemaining(will.timeUntilTrigger)}
                  </p>
                </div>

                {will.isTriggered && (
                  <button
                    onClick={() => handleExecuteWill(will.testator)}
                    disabled={executing === will.testator}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-bold transition"
                  >
                    {executing === will.testator ? "Executing..." : "⚡ Execute Will"}
                  </button>
                )}

                {!will.isTriggered && (
                  <button
                    disabled
                    className="w-full px-4 py-3 bg-gray-700 text-gray-400 rounded-lg font-bold cursor-not-allowed"
                  >
                    Inactivity Period Not Triggered Yet
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 p-4 bg-blue-900 border border-blue-600 rounded-lg">
          <h3 className="text-white font-bold mb-2">💡 Executor Responsibilities</h3>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• Monitor assigned wills for inactivity trigger</li>
            <li>• Execute wills only after inactivity period passes</li>
            <li>• Ensure beneficiaries receive their allocations</li>
            <li>• Maintain confidentiality of testator information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExecuteWill;
