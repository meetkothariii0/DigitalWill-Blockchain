import React from "react";
import { formatEther, formatDate, formatAddress, calculateBeneficiaryAmount } from "../utils/helpers.js";
import { generateWillPDF } from "../utils/generatePDF.js";

const WillCard = ({ will, beneficiaries, isTriggered }) => {
  const handleDownloadPDF = () => {
    const fileName = `Digital_Will_${new Date().toISOString().split("T")[0]}.pdf`;
    generateWillPDF(will, beneficiaries, will.testator, fileName);
  };

  if (!will) {
    return (
      <div className="p-6 bg-slate-800 border-2 border-dashed border-slate-700 rounded-lg text-center">
        <p className="text-gray-400">No will found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Activity Status */}
      <div className={`p-4 rounded-lg border-2 ${isTriggered ? "bg-red-900 border-red-600" : "bg-green-900 border-green-600"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold mb-1">{isTriggered ? "⚠️ INACTIVE" : "✓ ACTIVE"}</p>
            <p className={`text-sm ${isTriggered ? "text-red-200" : "text-green-200"}`}>
              {isTriggered 
                ? "Your account is marked as inactive. Will can be executed at any time." 
                : "Your account is active. Last check-in confirmed."}
            </p>
          </div>
        </div>
      </div>

      {/* Will Summary */}
      <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">Will Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="text-gray-400 text-sm">Testator</p>
            <p className="text-indigo-400 font-mono text-sm">{formatAddress(will.testator)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Executor</p>
            <p className="text-indigo-400 font-mono text-sm">{formatAddress(will.executor)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total ETH Locked</p>
            <p className="text-green-400 font-bold text-lg">{formatEther(will.totalEthLocked)} ETH</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Status</p>
            <p className={`font-bold ${will.isExecuted ? "text-gray-300" : will.isActive ? "text-green-400" : "text-red-400"}`}>
              {will.isExecuted ? "Executed" : will.isActive ? "Active" : "Inactive"}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Last Check-In</p>
            <p className="text-white text-sm">{formatDate(will.lastCheckIn)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Inactivity Period</p>
            <p className="text-white text-sm">{Math.floor(will.inactivityPeriod / 86400)} days</p>
          </div>
        </div>

        {isTriggered && (
          <div className="mt-4 p-3 bg-red-900 border border-red-600 rounded">
            <p className="text-red-200 text-sm font-semibold">⚠️ Inactivity Triggered - Will can be executed</p>
          </div>
        )}
      </div>

      {/* Beneficiaries */}
      {beneficiaries && beneficiaries.length > 0 && (
        <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-1">Beneficiaries</h3>
          <p className="text-xs text-amber-400 mb-3">📋 This is what your beneficiaries will receive when the will is transferred:</p>
          <div className="space-y-2">
            {beneficiaries.map((beneficiary, index) => (
              <div key={index} className="p-3 bg-slate-900 rounded border border-slate-700 flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-white font-medium">{beneficiary.name}</p>
                  <p className="text-gray-400 text-xs font-mono">{formatAddress(beneficiary.walletAddress)}</p>
                </div>
                <div className="text-right">
                  <p className="text-indigo-400 font-bold">{beneficiary.percentage}%</p>
                  <p className="text-green-400 text-sm font-bold">{calculateBeneficiaryAmount(beneficiary.percentage, will.totalEthLocked)} ETH</p>
                </div>
              </div>
            ))}
          </div>

          {/* Transfer Preview */}
          <div className="mt-4 p-3 bg-blue-900 border border-blue-600 rounded">
            <p className="text-blue-200 text-sm font-semibold mb-2">💰 Total to Be Transferred:</p>
            <p className="text-white text-2xl font-bold">{formatEther(will.totalEthLocked)} ETH</p>
            <p className="text-blue-300 text-xs mt-1">When inactivity is triggered, these funds will be automatically distributed to your beneficiaries.</p>
            
            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              className="mt-4 w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition flex items-center justify-center gap-2"
            >
              📄 Download Will as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WillCard;
