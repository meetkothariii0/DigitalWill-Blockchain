// Auto-generated contract configuration
// This file will be automatically updated by the deploy script with the actual contract ABI and address

export const CONTRACT_ADDRESS = "0xd9145CCE52D386f254917e481eB44e9943F39138";

export const CONTRACT_ABI = [
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address payable",
            name: "walletAddress",
            type: "address",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "percentage",
            type: "uint256",
          },
        ],
        internalType: "struct DigitalWill.Beneficiary[]",
        name: "_beneficiaries",
        type: "tuple[]",
      },
      {
        internalType: "uint256",
        name: "_inactivityPeriod",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_executor",
        type: "address",
      },
      {
        internalType: "string",
        name: "_ipfsHash",
        type: "string",
      },
    ],
    name: "createWill",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "proofOfLife",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address payable",
            name: "walletAddress",
            type: "address",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "percentage",
            type: "uint256",
          },
        ],
        internalType: "struct DigitalWill.Beneficiary[]",
        name: "_newBeneficiaries",
        type: "tuple[]",
      },
    ],
    name: "updateBeneficiaries",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "addFunds",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_testator",
        type: "address",
      },
    ],
    name: "executeWill",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "revokeWill",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_newExecutor",
        type: "address",
      },
    ],
    name: "updateExecutor",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_testator",
        type: "address",
      },
    ],
    name: "getWillDetails",
    outputs: [
      {
        components: [
          {
            internalType: "address payable",
            name: "testator",
            type: "address",
          },
          {
            components: [
              {
                internalType: "address payable",
                name: "walletAddress",
                type: "address",
              },
              {
                internalType: "string",
                name: "name",
                type: "string",
              },
              {
                internalType: "uint256",
                name: "percentage",
                type: "uint256",
              },
            ],
            internalType: "struct DigitalWill.Beneficiary[]",
            name: "beneficiaries",
            type: "tuple[]",
          },
          {
            internalType: "uint256",
            name: "lastCheckIn",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "inactivityPeriod",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "executor",
            type: "address",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isExecuted",
            type: "bool",
          },
          {
            internalType: "string",
            name: "ipfsDocHash",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "totalEthLocked",
            type: "uint256",
          },
        ],
        internalType: "struct DigitalWill.Will",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_testator",
        type: "address",
      },
    ],
    name: "getBeneficiaries",
    outputs: [
      {
        components: [
          {
            internalType: "address payable",
            name: "walletAddress",
            type: "address",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "percentage",
            type: "uint256",
          },
        ],
        internalType: "struct DigitalWill.Beneficiary[]",
        name: "",
        type: "array",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_testator",
        type: "address",
      },
    ],
    name: "isInactivityTriggered",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_testator",
        type: "address",
      },
    ],
    name: "getTimeUntilTrigger",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export default {
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
};
