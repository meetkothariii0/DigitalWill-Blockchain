import React from "react";
import { formatEther, formatDate, formatAddress, calculateBeneficiaryAmount } from "../utils/helpers.js";

const WillCard = ({ will, beneficiaries, isTriggered }) => {
  if (!will) {
    return (
      <div className="p-6 bg-slate-800 border-2 border-dashed border-slate-700 rounded-lg text-center">
        <p className="text-gray-400">No will found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
          <h3 className="text-lg font-semibold text-white mb-3">Beneficiaries</h3>
          <div className="space-y-2">
            {beneficiaries.map((beneficiary, index) => (
              <div key={index} className="p-3 bg-slate-900 rounded border border-slate-700 flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-white font-medium">{beneficiary.name}</p>
                  <p className="text-gray-400 text-xs font-mono">{formatAddress(beneficiary.walletAddress)}</p>
                </div>
                <div className="text-right">
                  <p className="text-indigo-400 font-bold">{beneficiary.percentage}%</p>
                  <p className="text-green-400 text-sm">{calculateBeneficiaryAmount(beneficiary.percentage, will.totalEthLocked)} ETH</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WillCard;
