import { useState, useCallback, useMemo } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/contract.js";
import { useWallet } from "./useWallet.js";
import toast from "react-hot-toast";

export const useContract = () => {
  const { signer, provider, isConnected } = useWallet();
  const [loading, setLoading] = useState(false);

  // Initialize contract
  const contract = useMemo(() => {
    if (!signer && !provider) return null;

    const contractInstance = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer || provider
    );

    return contractInstance;
  }, [signer, provider]);

  /**
   * Create a new will
   */
  const createWill = useCallback(
    async (beneficiaries, inactivityPeriod, executor, ipfsHash, ethAmount) => {
      if (!isConnected) {
        toast.error("Please connect your wallet first");
        return null;
      }

      if (!contract) {
        toast.error("Contract not initialized");
        return null;
      }

      setLoading(true);
      try {
        const tx = await contract.createWill(
          beneficiaries,
          inactivityPeriod,
          executor,
          ipfsHash,
          {
            value: ethers.parseEther(ethAmount || "0"),
          }
        );

        const receipt = await tx.wait();
        toast.success("Will created successfully!");
        return receipt;
      } catch (error) {
        console.error("Create will error:", error);
        handleContractError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [contract, isConnected]
  );

  /**
   * Send proof of life
   */
  const proofOfLife = useCallback(async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return null;
    }

    if (!contract) {
      toast.error("Contract not initialized");
      return null;
    }

    setLoading(true);
    try {
      const tx = await contract.proofOfLife();
      const receipt = await tx.wait();
      toast.success("Proof of life recorded!");
      return receipt;
    } catch (error) {
      console.error("Proof of life error:", error);
      handleContractError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [contract, isConnected]);

  /**
   * Add funds to will
   */
  const addFunds = useCallback(
    async (ethAmount) => {
      if (!isConnected) {
        toast.error("Please connect your wallet first");
        return null;
      }

      if (!contract) {
        toast.error("Contract not initialized");
        return null;
      }

      setLoading(true);
      try {
        const tx = await contract.addFunds({
          value: ethers.parseEther(ethAmount || "0"),
        });

        const receipt = await tx.wait();
        toast.success("Funds added successfully!");
        return receipt;
      } catch (error) {
        console.error("Add funds error:", error);
        handleContractError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [contract, isConnected]
  );

  /**
   * Update beneficiaries
   */
  const updateBeneficiaries = useCallback(
    async (newBeneficiaries) => {
      if (!isConnected) {
        toast.error("Please connect your wallet first");
        return null;
      }

      if (!contract) {
        toast.error("Contract not initialized");
        return null;
      }

      setLoading(true);
      try {
        const tx = await contract.updateBeneficiaries(newBeneficiaries);
        const receipt = await tx.wait();
        toast.success("Beneficiaries updated!");
        return receipt;
      } catch (error) {
        console.error("Update beneficiaries error:", error);
        handleContractError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [contract, isConnected]
  );

  /**
   * Execute will
   */
  const executeWill = useCallback(
    async (testatorAddress) => {
      if (!isConnected) {
        toast.error("Please connect your wallet first");
        return null;
      }

      if (!contract) {
        toast.error("Contract not initialized");
        return null;
      }

      setLoading(true);
      try {
        const tx = await contract.executeWill(testatorAddress);
        const receipt = await tx.wait();
        toast.success("Will executed successfully!");
        return receipt;
      } catch (error) {
        console.error("Execute will error:", error);
        handleContractError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [contract, isConnected]
  );

  /**
   * Revoke will
   */
  const revokeWill = useCallback(async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return null;
    }

    if (!contract) {
      toast.error("Contract not initialized");
      return null;
    }

    setLoading(true);
    try {
      const tx = await contract.revokeWill();
      const receipt = await tx.wait();
      toast.success("Will revoked successfully!");
      return receipt;
    } catch (error) {
      console.error("Revoke will error:", error);
      handleContractError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [contract, isConnected]);

  /**
   * Update executor
   */
  const updateExecutor = useCallback(
    async (newExecutor) => {
      if (!isConnected) {
        toast.error("Please connect your wallet first");
        return null;
      }

      if (!contract) {
        toast.error("Contract not initialized");
        return null;
      }

      setLoading(true);
      try {
        const tx = await contract.updateExecutor(newExecutor);
        const receipt = await tx.wait();
        toast.success("Executor updated!");
        return receipt;
      } catch (error) {
        console.error("Update executor error:", error);
        handleContractError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [contract, isConnected]
  );

  /**
   * Get will details (view function)
   */
  const getWillDetails = useCallback(
    async (testatorAddress) => {
      if (!contract) {
        toast.error("Contract not initialized");
        return null;
      }

      try {
        const will = await contract.getWillDetails(testatorAddress);
        return will;
      } catch (error) {
        console.error("Get will details error:", error);
        return null;
      }
    },
    [contract]
  );

  /**
   * Get beneficiaries (view function)
   */
  const getBeneficiaries = useCallback(
    async (testatorAddress) => {
      if (!contract) {
        toast.error("Contract not initialized");
        return null;
      }

      try {
        const beneficiaries = await contract.getBeneficiaries(testatorAddress);
        return beneficiaries;
      } catch (error) {
        console.error("Get beneficiaries error:", error);
        return null;
      }
    },
    [contract]
  );

  /**
   * Check if inactivity is triggered
   */
  const isInactivityTriggered = useCallback(
    async (testatorAddress) => {
      if (!contract) {
        return false;
      }

      try {
        const triggered = await contract.isInactivityTriggered(testatorAddress);
        return triggered;
      } catch (error) {
        console.error("Check inactivity error:", error);
        return false;
      }
    },
    [contract]
  );

  /**
   * Get time until trigger
   */
  const getTimeUntilTrigger = useCallback(
    async (testatorAddress) => {
      if (!contract) {
        return 0;
      }

      try {
        const timeRemaining = await contract.getTimeUntilTrigger(testatorAddress);
        return Number(timeRemaining);
      } catch (error) {
        console.error("Get time until trigger error:", error);
        return 0;
      }
    },
    [contract]
  );

  /**
   * Check if will exists
   */
  const hasWill = useCallback(
    async (address) => {
      if (!contract) {
        return false;
      }

      try {
        const exists = await contract.hasWill(address);
        return exists;
      } catch (error) {
        console.error("Check will exists error:", error);
        return false;
      }
    },
    [contract]
  );

  return {
    contract,
    loading,
    createWill,
    proofOfLife,
    addFunds,
    updateBeneficiaries,
    executeWill,
    revokeWill,
    updateExecutor,
    getWillDetails,
    getBeneficiaries,
    isInactivityTriggered,
    getTimeUntilTrigger,
    hasWill,
  };
};

/**
 * Handle contract errors
 */
const handleContractError = (error) => {
  console.error("Contract error detail:", error);

  if (error.code === "ACTION_REJECTED") {
    toast.error("Transaction rejected by user");
  } else if (error.code === "INSUFFICIENT_FUNDS") {
    toast.error("Insufficient funds for transaction");
  } else if (error.code === "UNCONFIGURED_NAME") {
    toast.error("Address validation error. Please ensure all wallet addresses are valid Ethereum addresses (starting with 0x)");
  } else if (error.reason) {
    toast.error(`Error: ${error.reason}`);
  } else if (error.message) {
    toast.error(`Error: ${error.message}`);
  } else {
    toast.error("An error occurred. Please try again.");
  }
};

export default useContract;
