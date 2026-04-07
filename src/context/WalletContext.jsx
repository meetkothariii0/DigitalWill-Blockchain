import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // SEPOLIA TESTNET CHAIN ID
  const SEPOLIA_CHAIN_ID = 11155111;
  const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

  /**
   * Check if MetaMask is installed
   */
  const isMetaMaskInstalled = () => {
    return typeof window !== "undefined" && window.ethereum;
  };

  /**
   * Connect wallet
   */
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      toast.error("MetaMask is not installed. Please install it to continue.");
      return false;
    }

    setIsConnecting(true);
    try {
      // Request accounts
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const account = accounts[0];
      setAccount(account);

      // Create provider and signer with explicit network configuration
      // This prevents ENS resolution errors on Sepolia testnet
      const ethersProvider = new ethers.BrowserProvider(window.ethereum, {
        chainId: SEPOLIA_CHAIN_ID,
        name: 'sepolia'
      });
      const ethersSigner = await ethersProvider.getSigner();

      setProvider(ethersProvider);
      setSigner(ethersSigner);

      // Get chain ID
      const network = await ethersProvider.getNetwork();
      setChainId(Number(network.chainId));

      // Check if on Sepolia
      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
        toast.error("Please switch to Sepolia Testnet in MetaMask");
        await switchToSepolia();
        return false;
      }

      setIsConnected(true);
      toast.success(`Connected: ${account.slice(0, 6)}...${account.slice(-4)}`);
      return true;
    } catch (error) {
      console.error("Connection error:", error);
      if (error.code === -32002) {
        toast.error("MetaMask connection request already pending");
      } else if (error.code === 4001) {
        toast.error("User rejected the connection request");
      } else {
        toast.error("Failed to connect wallet");
      }
      setIsConnected(false);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  /**
   * Switch to Sepolia network
   */
  const switchToSepolia = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
      });
      return true;
    } catch (error) {
      if (error.code === 4902) {
        // Sepolia not added, need to add it
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID_HEX,
                chainName: "Sepolia Testnet",
                rpcUrls: ["https://rpc.sepolia.org"],
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
          toast.success("Sepolia network added successfully");
          return true;
        } catch (addError) {
          toast.error("Failed to add Sepolia network");
          return false;
        }
      }
      toast.error("Failed to switch to Sepolia");
      return false;
    }
  }, []);

  /**
   * Disconnect wallet
   */
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsConnected(false);
    toast.success("Wallet disconnected");
  }, []);

  /**
   * Listen for account and chain changes
   */
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex) => {
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);

      if (newChainId !== SEPOLIA_CHAIN_ID && isConnected) {
        toast.error("Please switch to Sepolia Testnet");
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [isConnected, disconnectWallet]);

  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        signer,
        chainId,
        isConnecting,
        isConnected,
        connectWallet,
        disconnectWallet,
        switchToSepolia,
        isMetaMaskInstalled,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
};

export default WalletContext;
