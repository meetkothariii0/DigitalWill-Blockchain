import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../hooks/useWallet.js";
import { useContract } from "../hooks/useContract.js";
import BeneficiaryForm from "../components/BeneficiaryForm.jsx";
import TransactionStatus from "../components/TransactionStatus.jsx";
import { uploadToPinata } from "../utils/ipfs.js";
import { isValidAddress } from "../utils/helpers.js";
import toast from "react-hot-toast";

const CreateWill = () => {
  const { isConnected, connectWallet } = useWallet();
  const { createWill, loading } = useContract();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [step, setStep] = useState(1);
  const [beneficiaries, setBeneficiaries] = useState([
    {
      name: "Sarah Johnson",
      walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      percentage: 50,
    },
    {
      name: "Michael Chen",
      walletAddress: "0x70997970C51812e339D9B73b0245ad59c365d569",
      percentage: 30,
    },
    {
      name: "Emma Rodriguez",
      walletAddress: "0x3C44CdDdB6a900c6671B36f7D6440ffb3d4F6eff",
      percentage: 20,
    },
  ]);
  const [formData, setFormData] = useState({
    inactivityPeriod: 365,
    executor: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    ethAmount: "0.5",
  });
  const [ipfsHash, setIpfsHash] = useState("QmXxxxxxxxxxxxxxxxxxxxxxxxxxxx");
  const [uploadedFile, setUploadedFile] = useState({
    name: "Will_Document.pdf",
  });
  const [txHash, setTxHash] = useState(null);
  const [txStatus, setTxStatus] = useState(null);

  const addBeneficiary = (beneficiary) => {
    console.log("addBeneficiary called with:", beneficiary);
    setBeneficiaries((prev) => {
      const updated = [...prev, beneficiary];
      console.log("Updated beneficiaries:", updated);
      return updated;
    });
  };

  const removeBeneficiary = (index) => {
    setBeneficiaries(beneficiaries.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    const toastId = toast.loading("Uploading file to IPFS...");

    try {
      const hash = await uploadToPinata(file);
      setIpfsHash(hash);
      toast.success("File uploaded successfully!", { id: toastId });
    } catch (error) {
      toast.error("Failed to upload file", { id: toastId });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateWill = async () => {
    // Validation
    if (beneficiaries.length === 0) {
      toast.error("Add at least one beneficiary");
      return;
    }

    // Validate all beneficiary addresses
    for (const beneficiary of beneficiaries) {
      if (!isValidAddress(beneficiary.walletAddress)) {
        toast.error(`Invalid address for beneficiary "${beneficiary.name}"`);
        return;
      }
    }

    const totalPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    if (totalPercentage !== 100) {
      toast.error("Beneficiary percentages must sum to 100%");
      return;
    }

    if (!isValidAddress(formData.executor)) {
      toast.error("Enter a valid executor address");
      return;
    }

    if (!ipfsHash) {
      toast.error("Upload a will document first");
      return;
    }

    setTxStatus("pending");

    const inactivityPeriodSeconds = formData.inactivityPeriod * 24 * 60 * 60;

    const result = await createWill(
      beneficiaries,
      inactivityPeriodSeconds,
      formData.executor,
      ipfsHash,
      formData.ethAmount
    );

    if (result) {
      setTxHash(result.transactionHash);
      setTxStatus("success");
      setTimeout(() => {
        navigate("/my-will");
      }, 3000);
    } else {
      setTxStatus("error");
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="p-8 bg-slate-800 border border-slate-700 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">You need to connect your MetaMask wallet to create a will</p>
          <button
            onClick={connectWallet}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
          >
            Connect MetaMask
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition ${
                  s <= step
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-700 text-gray-400"
                }`}
              >
                {s}
              </div>
            ))}
          </div>
          <div className="h-1 bg-slate-700 rounded-full">
            <div
              className="h-1 bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          {/* Step 1: Beneficiaries */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Add Beneficiaries</h2>
              <BeneficiaryForm
                beneficiaries={beneficiaries}
                onAddBeneficiary={addBeneficiary}
                onRemoveBeneficiary={removeBeneficiary}
              />
            </div>
          )}

          {/* Step 2: Inactivity Period */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Set Inactivity Period</h2>
              <div className="space-y-4">
                <p className="text-gray-300">
                  How many days until your assets are automatically transferred if you don't check in?
                </p>
                <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg">
                  <input
                    type="range"
                    min="30"
                    max="1825"
                    step="1"
                    value={formData.inactivityPeriod}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        inactivityPeriod: parseInt(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                  <div className="mt-4 text-center">
                    <p className="text-indigo-400 text-3xl font-bold">
                      {formData.inactivityPeriod} Days
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      ~{Math.floor(formData.inactivityPeriod / 365)} year
                      {Math.floor(formData.inactivityPeriod / 365) > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Executor */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Assign Executor</h2>
              <div className="space-y-4">
                <p className="text-gray-300">
                  Who can trigger the will execution (in addition to the system)?
                </p>
                <input
                  type="text"
                  name="executor"
                  value={formData.executor}
                  onChange={handleInputChange}
                  placeholder="0x..."
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-gray-500"
                />
                <p className="text-xs text-gray-400">
                  This should be a trusted person (friend, lawyer, etc.)
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Upload Document */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Upload Will Document</h2>
              <div className="space-y-4">
                <p className="text-gray-300">
                  Upload a PDF of your will (optional but recommended)
                </p>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {uploadedFile ? (
                    <div>
                      <p className="text-green-400 text-lg font-bold">✓ File Uploaded</p>
                      <p className="text-gray-400 text-sm mt-2">{uploadedFile.name}</p>
                      <p className="text-success-400 text-xs mt-2">IPFS Hash: {ipfsHash?.slice(0, 20)}...</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-300 text-lg">📄 Click to upload PDF</p>
                      <p className="text-gray-500 text-sm mt-2">or drag and drop</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Deposit & Review */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Deposit ETH & Review</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount to Lock (ETH)
                  </label>
                  <input
                    type="number"
                    name="ethAmount"
                    value={formData.ethAmount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-gray-500"
                  />
                </div>

                {/* Summary */}
                <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg">
                  <h3 className="text-white font-semibold mb-3">Review Your Will</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-400">
                      <strong>Beneficiaries:</strong> {beneficiaries.length}
                    </p>
                    <p className="text-gray-400">
                      <strong>Inactivity Period:</strong> {formData.inactivityPeriod} days
                    </p>
                    <p className="text-gray-400">
                      <strong>Executor:</strong> {formData.executor.slice(0, 10)}...
                    </p>
                    <p className="text-gray-400">
                      <strong>ETH to Lock:</strong> {formData.ethAmount} ETH
                    </p>
                  </div>
                </div>

                {txStatus && (
                  <TransactionStatus txHash={txHash} status={txStatus} />
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-gray-800 text-white rounded-lg font-medium transition"
            >
              Previous
            </button>

            {step < 5 ? (
              <button
                onClick={() => setStep(Math.min(5, step + 1))}
                disabled={step === 1 && beneficiaries.length === 0}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleCreateWill}
                disabled={loading || !ipfsHash}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition"
              >
                {loading ? "Creating..." : "Create Will"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWill;
