import { ethers } from "ethers";

/**
 * Formats an Ethereum address to a shorter display format
 * @param {string} address - Full Ethereum address
 * @returns {string} Shortened address (0x1234...5678)
 */
export const formatAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Converts Wei to ETH
 * @param {string|number} wei - Amount in Wei
 * @returns {string} Amount in ETH with 4 decimal places
 */
export const formatEther = (wei) => {
  if (!wei) return "0.0000";
  try {
    const eth = ethers.formatEther(wei);
    return parseFloat(eth).toFixed(4);
  } catch {
    return "0.0000";
  }
};

/**
 * Converts ETH to Wei
 * @param {string|number} eth - Amount in ETH
 * @returns {string} Amount in Wei
 */
export const parseEther = (eth) => {
  if (!eth) return "0";
  try {
    return ethers.parseEther(eth.toString()).toString();
  } catch {
    return "0";
  }
};

/**
 * Formats a timestamp to a readable date string
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Formatted date
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Formats time remaining (in seconds) to human readable format
 * @param {number} seconds - Seconds remaining
 * @returns {string} Formatted time (e.g., "25 days, 3 hours")
 */
export const formatTimeRemaining = (seconds) => {
  if (!seconds || seconds <= 0) return "Triggered";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);

  return parts.length > 0 ? parts.join(", ") : "Less than a minute";
};

/**
 * Validates if a string is a valid Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid address
 */
export const isValidAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  // Remove any whitespace
  const trimmed = address.trim();
  
  // Check if it starts with 0x and is 42 characters long
  if (!trimmed.startsWith('0x') || trimmed.length !== 42) {
    return false;
  }
  
  // Check if it's a valid hex string
  try {
    // Try using ethers.isAddress first
    if (ethers.isAddress(trimmed)) {
      return true;
    }
  } catch (e) {
    console.error("ethers.isAddress error:", e);
  }
  
  // Fallback: check if all characters after 0x are valid hex
  const hexPart = trimmed.slice(2);
  return /^[0-9a-fA-F]{40}$/.test(hexPart);
};

/**
 * Creates Etherscan transaction link
 * @param {string} txHash - Transaction hash
 * @param {string} network - Network name (mainnet, sepolia, etc.)
 * @returns {string} Etherscan URL
 */
export const getEtherscanLink = (txHash, network = "sepolia") => {
  const baseUrl =
    network === "mainnet" ? "https://etherscan.io" : `https://${network}.etherscan.io`;
  return `${baseUrl}/tx/${txHash}`;
};

/**
 * Creates Etherscan address link
 * @param {string} address - Ethereum address
 * @param {string} network - Network name
 * @returns {string} Etherscan URL
 */
export const getEtherscanAddressLink = (address, network = "sepolia") => {
  const baseUrl =
    network === "mainnet" ? "https://etherscan.io" : `https://${network}.etherscan.io`;
  return `${baseUrl}/address/${address}`;
};

/**
 * Calculates total ETH to be received by a beneficiary
 * @param {number} percentage - Beneficiary percentage
 * @param {string} totalEth - Total ETH in Wei
 * @returns {string} ETH amount formatted
 */
export const calculateBeneficiaryAmount = (percentage, totalEth) => {
  if (!totalEth || totalEth === "0") return "0.0000";
  try {
    const amount = (BigInt(totalEth) * BigInt(percentage)) / BigInt(100);
    return formatEther(amount.toString());
  } catch {
    return "0.0000";
  }
};

/**
 * Returns a percentage color indicator
 * @param {number} percentage - Percentage value
 * @returns {string} Tailwind color class
 */
export const getPercentageColor = (percentage) => {
  if (percentage >= 50) return "text-green-400";
  if (percentage >= 25) return "text-yellow-400";
  return "text-orange-400";
};

/**
 * Truncates text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 50) => {
  if (!text) return "";
  if (text.length <= length) return text;
  return `${text.slice(0, length)}...`;
};
