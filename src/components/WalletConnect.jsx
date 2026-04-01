import React from "react";
import { useWallet } from "../hooks/useWallet.js";
import { formatAddress } from "../utils/helpers.js";
import toast from "react-hot-toast";

const WalletConnect = () => {
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet, isMetaMaskInstalled } =
    useWallet();

  if (!isMetaMaskInstalled()) {
    return (
      <div className="px-4 py-2 bg-red-900 text-white rounded-lg text-sm font-medium">
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Install MetaMask
        </a>
      </div>
    );
  }

  return (
    <div>
      {isConnected && account ? (
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-indigo-900 rounded-lg">
            <p className="text-sm font-medium text-indigo-200">{formatAddress(account)}</p>
          </div>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition"
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </div>
  );
};

export default WalletConnect;
