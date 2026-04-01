import React from "react";
import { getEtherscanLink } from "../utils/helpers.js";

const TransactionStatus = ({ txHash, status = "pending", message = "" }) => {
  const etherscanLink = getEtherscanLink(txHash);

  const statusConfig = {
    pending: {
      color: "bg-yellow-900 border-yellow-600",
      icon: "⏳",
      text: "Transaction Pending",
    },
    success: {
      color: "bg-green-900 border-green-600",
      icon: "✓",
      text: "Transaction Successful",
    },
    error: {
      color: "bg-red-900 border-red-600",
      icon: "✕",
      text: "Transaction Failed",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div className={`p-4 border-2 rounded-lg ${config.color}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{config.icon}</span>
        <p className="text-white font-semibold">{config.text}</p>
      </div>

      {message && <p className="text-gray-200 text-sm mb-3">{message}</p>}

      {txHash && (
        <div className="flex items-center gap-2">
          <code className="bg-black bg-opacity-30 px-3 py-1 rounded text-sm text-gray-100 flex-1 overflow-auto">
            {txHash.slice(0, 20)}...{txHash.slice(-10)}
          </code>
          <a
            href={etherscanLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium transition"
          >
            View
          </a>
        </div>
      )}
    </div>
  );
};

export default TransactionStatus;
