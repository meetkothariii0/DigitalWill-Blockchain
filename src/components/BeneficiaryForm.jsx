import React, { useState } from "react";
import { isValidAddress } from "../utils/helpers.js";
import toast from "react-hot-toast";

const BeneficiaryForm = ({ onAddBeneficiary, onRemoveBeneficiary, beneficiaries }) => {
  const [formData, setFormData] = useState({
    name: "",
    walletAddress: "",
    percentage: "",
  });

  const totalPercentage = beneficiaries.reduce((sum, b) => sum + (b.percentage || 0), 0);
  const remainingPercentage = 100 - totalPercentage;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddBeneficiary = (e) => {
    e.preventDefault();

    // Trim inputs
    const name = formData.name.trim();
    const walletAddress = formData.walletAddress.trim();
    const percentageStr = formData.percentage.trim();

    if (!name) {
      toast.error("Please enter beneficiary name");
      return;
    }

    if (!walletAddress) {
      toast.error("Please enter a wallet address");
      return;
    }

    // Validate address - trim before validation
    if (!isValidAddress(walletAddress)) {
      console.error("Invalid address:", walletAddress);
      toast.error("Invalid wallet address. Please check and try again.");
      return;
    }

    if (!percentageStr) {
      toast.error("Please enter a percentage");
      return;
    }

    const percentage = parseInt(percentageStr);
    if (isNaN(percentage) || percentage <= 0) {
      toast.error("Percentage must be a number greater than 0");
      return;
    }

    if (percentage > remainingPercentage) {
      toast.error(`Percentage cannot exceed remaining ${remainingPercentage}%`);
      return;
    }

    console.log("Adding beneficiary:", { name, walletAddress, percentage });
    
    onAddBeneficiary({
      name,
      walletAddress,
      percentage,
    });

    setFormData({ name: "", walletAddress: "", percentage: "" });
    toast.success("Beneficiary added successfully!");
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddBeneficiary} className="space-y-3 p-4 bg-slate-800 rounded-lg border border-slate-700">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Beneficiary Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., John Doe"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Wallet Address</label>
          <input
            type="text"
            name="walletAddress"
            value={formData.walletAddress}
            onChange={handleInputChange}
            placeholder="0x..."
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono text-sm"
          />
          {formData.walletAddress && (
            <div>
              {isValidAddress(formData.walletAddress.trim()) ? (
                <p className="text-green-400 text-xs mt-1">✓ Valid address</p>
              ) : (
                <p className="text-red-400 text-xs mt-1">
                  ✗ Invalid address (must be 42 characters starting with 0x)
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Percentage ({remainingPercentage}% remaining)
          </label>
          <input
            type="number"
            name="percentage"
            value={formData.percentage}
            onChange={handleInputChange}
            placeholder="Enter amount (e.g., 25)"
            min="1"
            max={remainingPercentage}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
          {formData.percentage && parseInt(formData.percentage) > remainingPercentage && (
            <p className="text-red-400 text-xs mt-1">Cannot exceed {remainingPercentage}% remaining</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition disabled:bg-gray-600 disabled:cursor-not-allowed"
          disabled={!formData.name.trim() || !isValidAddress(formData.walletAddress.trim()) || !formData.percentage || parseInt(formData.percentage) <= 0 || parseInt(formData.percentage) > remainingPercentage}
        >
          {remainingPercentage <= 0 ? "100% Already Allocated" : "Add Beneficiary"}
        </button>
      </form>

      {beneficiaries.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-300">Added Beneficiaries</h3>
            <span className={`text-sm font-bold ${totalPercentage === 100 ? "text-green-400" : "text-yellow-400"}`}>
              {totalPercentage}%
            </span>
          </div>

          <div className="space-y-2">
            {beneficiaries.map((beneficiary, index) => (
              <div key={index} className="p-3 bg-slate-800 border border-slate-700 rounded flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">{beneficiary.name}</p>
                  <p className="text-gray-400 text-xs font-mono">{beneficiary.walletAddress.slice(0, 10)}...{beneficiary.walletAddress.slice(-8)}</p>
                  <p className="text-indigo-400 text-sm font-semibold">{beneficiary.percentage}%</p>
                </div>
                <button
                  onClick={() => {
                    onRemoveBeneficiary(index);
                    toast.success("Beneficiary removed");
                  }}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BeneficiaryForm;
