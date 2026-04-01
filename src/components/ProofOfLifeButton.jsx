import React, { useState } from "react";
import { useContract } from "../hooks/useContract.js";
import toast from "react-hot-toast";

const ProofOfLifeButton = ({ onSuccess }) => {
  const { proofOfLife, loading } = useContract();
  const [isClicked, setIsClicked] = useState(false);

  const handleProofOfLife = async () => {
    setIsClicked(true);
    const result = await proofOfLife();
    if (result) {
      setTimeout(() => setIsClicked(false), 2000);
      onSuccess && onSuccess();
    }
  };

  return (
    <button
      onClick={handleProofOfLife}
      disabled={loading}
      className={`w-full px-4 py-3 rounded-lg font-semibold transition duration-300 ${
        isClicked
          ? "bg-green-600 text-white"
          : "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600"
      }`}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Processing...
        </div>
      ) : isClicked ? (
        <div className="flex items-center justify-center gap-2">
          ✓ Proof Recorded
        </div>
      ) : (
        "🔄 Proof of Life"
      )}
    </button>
  );
};

export default ProofOfLifeButton;
