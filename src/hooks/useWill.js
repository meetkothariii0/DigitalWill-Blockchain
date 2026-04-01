import { useState, useEffect, useCallback } from "react";
import { useContract } from "./useContract.js";
import { useWallet } from "./useWallet.js";

export const useWill = (testatorAddress) => {
  const { getWillDetails, getBeneficiaries, isInactivityTriggered, getTimeUntilTrigger, hasWill } =
    useContract();
  const { isConnected } = useWallet();

  const [will, setWill] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [isTriggered, setIsTriggered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch will details
  const fetchWill = useCallback(async () => {
    if (!testatorAddress || !isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const willExists = await hasWill(testatorAddress);

      if (!willExists) {
        setWill(null);
        setBeneficiaries([]);
        return;
      }

      const willData = await getWillDetails(testatorAddress);
      const beneficiariesData = await getBeneficiaries(testatorAddress);
      const triggered = await isInactivityTriggered(testatorAddress);
      const timeLeft = await getTimeUntilTrigger(testatorAddress);

      setWill(willData);
      setBeneficiaries(beneficiariesData || []);
      setIsTriggered(triggered);
      setTimeRemaining(timeLeft);
    } catch (err) {
      console.error("Error fetching will:", err);
      setError("Failed to fetch will details");
    } finally {
      setLoading(false);
    }
  }, [testatorAddress, isConnected, getWillDetails, getBeneficiaries, isInactivityTriggered, getTimeUntilTrigger, hasWill]);

  // Fetch will on mount and when testatorAddress changes
  useEffect(() => {
    fetchWill();

    // Set up polling interval to update time remaining
    const interval = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [testatorAddress, isConnected, fetchWill]);

  return {
    will,
    beneficiaries,
    isTriggered,
    timeRemaining,
    loading,
    error,
    refetch: fetchWill,
  };
};

export default useWill;
