import React, { useState, useEffect } from "react";
import { useWallet } from "../hooks/useWallet.js";
import { useWill } from "../hooks/useWill.js";
import { useContract } from "../hooks/useContract.js";
import WillCard from "../components/WillCard.jsx";
import CountdownTimer from "../components/CountdownTimer.jsx";
import ProofOfLifeButton from "../components/ProofOfLifeButton.jsx";
import TransactionStatus from "../components/TransactionStatus.jsx";
import { isValidAddress } from "../utils/helpers.js";
import { generateWillPDF } from "../utils/generatePDF.js";
import toast from "react-hot-toast";

const MyWill = () => {
  const { account, isConnected, connectWallet } = useWallet();
  const { will, beneficiaries, isTriggered, timeRemaining, loading, refetch } = useWill(account);
  const { addFunds, revokeWill, updateExecutor, executeWill } = useContract();

  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showUpdateExecutor, setShowUpdateExecutor] = useState(false);
  const [showRevoke, setShowRevoke] = useState(false);
  const [showExecute, setShowExecute] = useState(false);
  const [ethAmount, setEthAmount] = useState("");
  const [newExecutor, setNewExecutor] = useState("");
  const [txHash, setTxHash] = useState(null);
  const [txStatus, setTxStatus] = useState(null);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="p-8 bg-slate-800 border border-slate-700 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">Connect your wallet to view your will</p>
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

  const handleAddFunds = async () => {
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    setTxStatus("pending");
    const result = await addFunds(ethAmount);

    if (result) {
      setTxHash(result.transactionHash);
      setTxStatus("success");
      setEthAmount("");
      setShowAddFunds(false);
      setTimeout(() => refetch(), 2000);
    } else {
      setTxStatus("error");
    }
  };

  const handleUpdateExecutor = async () => {
    if (!isValidAddress(newExecutor)) {
      toast.error("Enter a valid address");
      return;
    }

    setTxStatus("pending");
    const result = await updateExecutor(newExecutor);

    if (result) {
      setTxHash(result.transactionHash);
      setTxStatus("success");
      setNewExecutor("");
      setShowUpdateExecutor(false);
      setTimeout(() => refetch(), 2000);
    } else {
      setTxStatus("error");
    }
  };

  const handleRevokeWill = async () => {
    setTxStatus("pending");
    const result = await revokeWill();

    if (result) {
      setTxHash(result.transactionHash);
      setTxStatus("success");
      setShowRevoke(false);
      setTimeout(() => refetch(), 2000);
    } else {
      setTxStatus("error");
    }
  };

  const handleExecuteWill = async () => {
    setTxStatus("pending");
    const result = await executeWill(account);

    if (result) {
      setTxHash(result.transactionHash);
      setTxStatus("success");
      setShowExecute(false);
      setTimeout(() => refetch(), 2000);
    } else {
      setTxStatus("error");
    }
  };

  const handleDownloadPDF = () => {
    if (!will || !beneficiaries) {
      toast.error("Will data not loaded");
      return;
    }
    const fileName = `Digital_Will_${new Date().toISOString().split("T")[0]}.pdf`;
    generateWillPDF(will, beneficiaries, account, fileName);
    toast.success("Will PDF downloaded!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your will...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center p-8 bg-red-900 bg-opacity-30 border-2 border-red-600 rounded-lg">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <p className="text-gray-400 text-sm mb-6">Please ensure your wallet is connected and try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!will) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center p-8 bg-slate-800 border-2 border-dashed border-slate-700 rounded-lg">
            <p className="text-gray-400 text-lg mb-4">You don't have a will yet</p>
            <a
              href="/create"
              className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
            >
              Create Your First Will
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-8">Your Will</h1>

        {/* Countdown Timer */}
        <div className="mb-8">
          <CountdownTimer secondsRemaining={timeRemaining} isTriggered={isTriggered} />
        </div>

        {txStatus && <TransactionStatus txHash={txHash} status={txStatus} />}

        {/* Will Details */}
        <div className="mb-8">
          <WillCard will={will} beneficiaries={beneficiaries} isTriggered={isTriggered} />
        </div>

        {/* How It Works */}
        <div className="mb-8 p-4 bg-gradient-to-r from-indigo-900 to-purple-900 border border-indigo-600 rounded-lg">
          <h3 className="text-lg font-bold text-white mb-4">📖 How Your Will Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-800 bg-opacity-50 rounded">
              <p className="text-indigo-300 font-semibold mb-2">1️⃣ Active Period</p>
              <p className="text-sm text-gray-300">Keep your account active by checking in regularly. Your will remains secure.</p>
            </div>
            <div className="p-3 bg-slate-800 bg-opacity-50 rounded">
              <p className="text-amber-300 font-semibold mb-2">2️⃣ Inactivity Trigger</p>
              <p className="text-sm text-gray-300">If you don't check in for {will?.inactivityPeriod ? Math.floor(will.inactivityPeriod / 86400) : '?'} days, the will becomes eligible for execution.</p>
            </div>
            <div className="p-3 bg-slate-800 bg-opacity-50 rounded">
              <p className="text-green-300 font-semibold mb-2">3️⃣ Distribution</p>
              <p className="text-sm text-gray-300">Your executor (or anyone) can execute the will, and funds are automatically distributed to your beneficiaries.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <ProofOfLifeButton onSuccess={refetch} />

          <button
            onClick={() => setShowAddFunds(!showAddFunds)}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            💰 Add More Funds
          </button>

          <button
            onClick={() => setShowUpdateExecutor(!showUpdateExecutor)}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
          >
            👤 Update Executor
          </button>

          {isTriggered && (
            <button
              onClick={() => setShowExecute(!showExecute)}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition animate-pulse"
            >
              ⚡ Execute Will Now
            </button>
          )}

          <button
            onClick={handleDownloadPDF}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition"
          >
            📄 Download as PDF
          </button>

          <button
            onClick={() => setShowRevoke(!showRevoke)}
            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
          >
            ✕ Revoke Will
          </button>
        </div>

        {/* Add Funds Modal */}
        {showAddFunds && (
          <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg mb-4">
            <h3 className="text-lg font-bold text-white mb-3">Add Funds to Your Will</h3>
            <div className="space-y-3">
              <input
                type="number"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                placeholder="Amount in ETH"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-gray-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddFunds}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddFunds(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update Executor Modal */}
        {showUpdateExecutor && (
          <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg mb-4">
            <h3 className="text-lg font-bold text-white mb-3">Update Executor</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newExecutor}
                onChange={(e) => setNewExecutor(e.target.value)}
                placeholder="New Executor Address (0x...)"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-gray-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateExecutor}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition"
                >
                  Update
                </button>
                <button
                  onClick={() => setShowUpdateExecutor(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Revoke Confirmation Modal */}
        {showRevoke && (
          <div className="p-4 bg-red-900 border border-red-600 rounded-lg mb-4">
            <h3 className="text-lg font-bold text-white mb-3">⚠️ Revoke Will?</h3>
            <p className="text-red-200 mb-4">
              This will delete your will and return all locked ETH to your wallet. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleRevokeWill}
                className="flex-1 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-medium transition"
              >
                Yes, Revoke
              </button>
              <button
                onClick={() => setShowRevoke(false)}
                className="flex-1 px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Execute Will Confirmation Modal */}
        {showExecute && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="p-6 bg-slate-800 border-2 border-green-600 rounded-lg max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">⚡ Execute Will</h3>
              <p className="text-gray-300 mb-6">
                Your account is marked as inactive. You can now execute the will and distribute funds to beneficiaries.
              </p>
              <div className="p-4 bg-green-900 border border-green-600 rounded mb-6">
                <p className="text-sm text-gray-300 mb-2">This will:</p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>✓ Transfer {will?.totalEthLocked ? `${parseFloat(will.totalEthLocked) / 1e18} ETH` : "all locked funds"}</li>
                  <li>✓ Distribute to {beneficiaries?.length || 0} beneficiaries</li>
                  <li>✓ Mark the will as executed</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExecuteWill}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition"
                >
                  Execute Now
                </button>
                <button
                  onClick={() => setShowExecute(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyWill;
