# 🔗 ChainWill - Decentralized Digital Will Platform

A complete blockchain-based dApp for creating and managing digital wills on Ethereum. Users can create wills, assign beneficiaries, lock assets, and have them automatically transferred upon verified inactivity.

## � Project Overview - What & Why

This project demonstrates a **Web3 decentralized application** that solves a real-world problem: **What happens to your digital assets when you pass away?**

### The Problem
- Traditional wills are paper-based and don't cover crypto assets
- No automated way to transfer crypto upon death
- Requires trust in a third party (lawyer, executor)
- No transparency or verification

### Our Solution
- **Blockchain-based will** stored permanently on Ethereum
- **Smart contracts** automate asset distribution
- **No intermediaries** - trustless execution
- **Transparent** - all transactions are verifiable
- **Proof of Life** - testator can prevent accidental transfers

---

## 🛠 Complete Tech Stack Explanation

### 1. **Frontend Framework - React.js + Vite**

**What it is:** React is a JavaScript library for building user interfaces using components. Vite is a modern build tool.

**Why we use it:**
- React manages dynamic UI state (wallet connection, form data, transaction status)
- Vite provides fast hot module replacement for development
- Component-based architecture for modular, reusable code

**How it works in our app:**
```
User clicks "Create Will"
  ↓
React component renders form (CreateWill.jsx)
  ↓
Form data stored in React state
  ↓
User clicks submit
  ↓
React calls custom hooks (useContract, useWallet)
  ↓
Smart contract interaction happens
  ↓
UI updates with transaction status
```

**Files using React:**
- `src/App.jsx` - Main app component with routing
- `src/pages/CreateWill.jsx` - Will creation form
- `src/pages/MyWill.jsx` - View your will
- `src/components/` - Reusable UI components

---

### 2. **Blockchain - Ethereum Sepolia Testnet**

**What it is:** A test version of the Ethereum blockchain where transactions are free (use fake ETH).

**Why we use it:**
- Perfect for development and testing
- No real money involved
- Easy to reset or redeploy
- Mimics real Ethereum network behavior
- Free test ETH from faucets

**How it works:**
```
Your App (React) 
  ↓
Sends transaction to Sepolia Network
  ↓
Validators confirm transaction
  ↓
Smart contract executes on blockchain
  ↓
Transaction recorded permanently
  ↓
All users can verify it on Etherscan
```

**Key concepts:**
- **Chain ID**: 11155111 (unique identifier for Sepolia)
- **RPC URL**: `https://rpc.sepolia.org` (gateway to the network)
- **Block Explorer**: Etherscan (view all transactions)

---

### 3. **Smart Contracts - Solidity**

**What it is:** Code that runs on the blockchain (immutable and permanent).

**Why we use it:**
- Defines the business logic (what a will is, how to execute it)
- Handles fund custody (securely holds ETH)
- Enforces rules automatically (no manual override)
- Trustless execution (no one person can cheat the system)

**How the smart contract works - Step by step:**

#### Step 1: CREATE WILL
```solidity
contract function: createWill()
├─ Input: beneficiaries, inactivityPeriod, executor, ipfsHash
├─ Actions:
│  ├─ Validate inputs (beneficiaries total 100%, addresses are valid)
│  ├─ Store will data on blockchain
│  ├─ Record current timestamp as "lastProofOfLife"
│  ├─ Lock the ETH sent with the transaction
│  └─ Emit CreateWill event
└─ Output: Will stored on blockchain, ETH locked
```

**Where the data is stored:**
```solidity
mapping(address => Will) public wills;  // All wills stored here

struct Will {
  address testator;
  Beneficiary[] beneficiaries;
  address executor;
  uint256 inactivityPeriod;
  uint256 lockedAmount;
  uint256 lastProofOfLife;
  string ipfsHash;
  bool isActive;
}
```

#### Step 2: PROOF OF LIFE
```solidity
contract function: proofOfLife()
├─ Actions:
│  ├─ Get testator's will
│  ├─ Update "lastProofOfLife" to current time
│  └─ Reset the inactivity timer
└─ Output: Timer reset, will stays locked
```

#### Step 3: CHECK IF INACTIVITY TRIGGERED
```solidity
contract function: isInactivityTriggered(testatorAddress)
├─ Logic:
│  ├─ Get will
│  ├─ Calculate time since last proof: now - lastProofOfLife
│  ├─ Check if time > inactivityPeriod
│  └─ Return true/false
└─ Output: Boolean (is triggered or not)
```

#### Step 4: EXECUTE WILL
```solidity
contract function: executeWill(testatorAddress)
├─ Checks:
│  ├─ Is caller the executor?
│  ├─ Is inactivity triggered?
│  ├─ Does the will still exist?
│  └─ Is there locked ETH?
├─ Actions:
│  ├─ For each beneficiary:
│  │  ├─ Calculate their share: (lockAmount × percentage) / 100
│  │  ├─ Send ETH to beneficiary address
│  │  └─ Log transaction
│  ├─ Mark will as inactive
│  └─ Emit WillExecuted event
└─ Output: ETH distributed to beneficiaries
```

**Key Security Features in Smart Contract:**
```solidity
// Prevents hackers from calling functions multiple times
using ReentrancyGuard for executeWill;

// Only testator can update their own will
require(msg.sender == will.testator)

// Checks happen before state changes (CEI pattern)
// Calculate amounts
// Change state
// Send funds (safest order)

// All changes are recorded as events for transparency
event WillCreated(address indexed testator, ...)
event WillExecuted(address indexed testator, ...)
```

**File:** `contracts/DigitalWill.sol`

---

### 4. **Wallet Integration - MetaMask + ethers.js**

**What it is:** MetaMask is a browser extension that manages cryptocurrency. ethers.js is a JavaScript library to interact with blockchain.

**Why we use it:**
- Users don't give us their private keys (safer)
- All transactions are signed by the user
- Users have full control of their funds
- Industry standard for Web3

**How the wallet flow works:**

```
User clicks "Connect Wallet"
  ↓
App calls: window.ethereum.request({method: 'eth_requestAccounts'})
  ↓
MetaMask popup appears
  ↓
User clicks "Approve" in MetaMask
  ↓
MetaMask sends user's address to app
  ↓
App now has access to:
├─ User's address (0x...)
├─ User's signer (for signing transactions)
└─ User's provider (for reading blockchain)
```

**Code example - Connecting Wallet:**
```javascript
// src/context/WalletContext.jsx
const connectWallet = async () => {
  // Request accounts from MetaMask
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  });
  
  // Create ethers provider
  const provider = new ethers.BrowserProvider(window.ethereum);
  
  // Get signer (for signing transactions)
  const signer = await provider.getSigner();
  
  // Store everything in context
  return { account, provider, signer };
}
```

**Files using wallet:**
- `src/context/WalletContext.jsx` - Wallet state management
- `src/hooks/useWallet.js` - Custom hook to access wallet
- `src/hooks/useContract.js` - Creates contract instance with signer

---

### 5. **File Storage - IPFS + Pinata**

**What it is:** IPFS (InterPlanetary File System) is decentralized file storage. Pinata is a service that helps store to IPFS.

**Why we use it:**
- Smart contracts can only store small amounts of data
- Will PDF document is too large for blockchain
- IPFS content is permanent and can't be censored
- Only the hash (fingerprint) is stored on blockchain

**How it works:**

```
User uploads Will PDF
  ↓
App sends file to Pinata API
  ↓
Pinata stores file on IPFS network
  ↓
Pinata returns hash: Qm...xyz (256-bit fingerprint)
  ↓
App stores hash on blockchain in smart contract
  ↓
Later, anyone can retrieve file using the hash
```

**Code example - Upload to IPFS:**
```javascript
// src/utils/ipfs.js
export const uploadToPinata = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Send to Pinata API
  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'pinata_api_key': process.env.VITE_PINATA_API_KEY,
      'pinata_secret_api_key': process.env.VITE_PINATA_SECRET_KEY
    },
    body: formData
  });
  
  const data = await response.json();
  return data.IpfsHash; // Returns: Qm...xyz
}
```

**Where the hash is stored:**
```solidity
struct Will {
  // ... other data ...
  string ipfsHash;  // Stores: "QmSampleHash123456789"
}
```

**Files using IPFS:**
- `src/utils/ipfs.js` - Upload functions
- `src/pages/CreateWill.jsx` - Calls upload function
- Smart contract stores the hash

---

### 6. **UI Styling - TailwindCSS**

**What it is:** Utility-first CSS framework for styling.

**Why we use it:**
- Faster development (pre-built classes)
- Consistent design system
- Responsive design (works on mobile, desktop, etc.)
- Dark theme for crypto aesthetics

**Example - Styled button with Tailwind:**
```jsx
<button className="
  px-6 py-3              // Padding
  bg-indigo-600          // Background color
  hover:bg-indigo-700    // Hover state
  text-white             // Text color
  font-bold              // Font weight
  rounded-lg             // Rounded corners
  transition             // Smooth animation
">
  Create Will
</button>
```

**Files using TailwindCSS:**
- `tailwind.config.js` - Tailwind configuration
- Every `.jsx` component - Uses className utilities

---

### 7. **Routing - React Router v6**

**What it is:** Library for client-side navigation (pages).

**Why we use it:**
- Single Page App (SPA) - no page reloads
- Bookmarkable URLs
- Back button works correctly
- Organized page structure

**Routes in our app:**
```javascript
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/create" element={<CreateWill />} />
  <Route path="/my-will" element={<MyWill />} />
  <Route path="/beneficiary" element={<BeneficiaryDashboard />} />
  <Route path="/execute" element={<ExecuteWill />} />
</Routes>
```

**How navigation works:**
```
User clicks "Create Will" link
  ↓
React Router intercepts click
  ↓
URL changes to "/create"
  ↓
React renders CreateWill.jsx component
  ↓
No page reload, instant navigation
```

---

### 8. **Custom Hooks - State Management**

**What it is:** Reusable logic for React components.

**Why we use it:**
- Keep components clean and focused
- Reuse logic across multiple components
- Easier to test and debug

**Key custom hooks:**

#### `useWallet()` - Manages wallet connection
```javascript
// Location: src/hooks/useWallet.js
const { 
  account,           // User's address
  provider,          // Blockchain provider
  signer,            // For signing transactions
  isConnected,       // Is wallet connected?
  connectWallet      // Function to connect
} = useWallet();
```

#### `useContract()` - Interacts with smart contract
```javascript
// Location: src/hooks/useContract.js
const { 
  createWill,        // Call contract: createWill()
  proofOfLife,       // Call contract: proofOfLife()
  addFunds,          // Call contract: addFunds()
  executeWill,       // Call contract: executeWill()
  getWillDetails,    // Read contract: getWillDetails()
  loading            // Is transaction pending?
} = useContract();
```

#### `useWill()` - Fetches will data
```javascript
// Location: src/hooks/useWill.js
const { 
  will,              // Will object
  beneficiaries,     // Beneficiary list
  isTriggered,       // Is inactivity triggered?
  timeRemaining,     // Seconds until execution
  loading,           // Is loading?
  refetch            // Re-fetch data
} = useWill(account);
```

---

## 🔄 Complete User Journey - Everything That Happens

### Step 1: User Arrives at App

```
1. User opens website
   ↓
2. React loads (Vite bundles all components)
   ↓
3. App.jsx renders with TailwindCSS styling
   ↓
4. WalletProvider context initializes
   ↓
5. Home page displays with "Connect Wallet" button
```

**Technologies used:** React, Vite, TailwindCSS, React Router

---

### Step 2: User Connects Wallet

```
1. User clicks "Connect Wallet"
   ↓
2. Click handler calls: connectWallet() from useWallet
   ↓
3. useWallet calls: window.ethereum.request()
   ↓
4. MetaMask popup appears
   ↓
5. User approves in MetaMask
   ↓
6. MetaMask sends back user's address: 0x1234...5678
   ↓
7. ethers.js creates:
   ├─ BrowserProvider (connection to blockchain)
   ├─ Signer (can sign transactions)
   └─ Provider (can read blockchain)
   ↓
8. WalletContext stores all this data
   ↓
9. UI updates to show "Connected: 0x1234...5678"
```

**Technologies used:** MetaMask, ethers.js, React Context API

---

### Step 3: User Navigates to "Create Will"

```
1. User clicks "Create Will" in navigation
   ↓
2. React Router changes URL to "/create"
   ↓
3. CreateWill.jsx component renders
   ↓
4. Form loads with pre-filled sample data
   ↓
5. User sees 5-step wizard:
   ├─ Step 1: Add Beneficiaries
   ├─ Step 2: Set Inactivity Period
   ├─ Step 3: Assign Executor
   ├─ Step 4: Upload Document
   └─ Step 5: Deposit & Create
```

**Technologies used:** React, React Router, TailwindCSS

---

### Step 4: User Adds Beneficiary

```
1. User fills form:
   ├─ Name: "John Doe"
   ├─ Address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
   └─ Percentage: "50"
   ↓
2. User clicks "Add Beneficiary"
   ↓
3. BeneficiaryForm.jsx validates:
   ├─ Is name not empty? ✓
   ├─ Is address valid? 
   │  └─ Calls: isValidAddress() from helpers.js
   │  └─ Checks: starts with 0x, 42 chars total, valid hex
   ├─ Is percentage > 0? ✓
   └─ Is percentage ≤ remaining? ✓
   ↓
4. Validation passes!
   ↓
5. addBeneficiary() called with beneficiary object
   ↓
6. CreateWill.jsx updates state: setBeneficiaries([...])
   ↓
7. BeneficiaryForm re-renders showing added beneficiary
   ↓
8. Toast notification shows: "Beneficiary added successfully!"
```

**Technologies used:** React, Custom validation (ethers.js for address checking)

---

### Step 5: User Uploads Will Document

```
1. User clicks "Upload Document"
   ↓
2. File picker dialog opens
   ↓
3. User selects Will_Document.pdf
   ↓
4. handleFileUpload() calls uploadToPinata(file)
   ↓
5. uploadToPinata() in ipfs.js:
   ├─ Creates FormData with file
   ├─ Sends to Pinata API
   │  POST https://api.pinata.cloud/pinning/pinFileToIPFS
   │  Headers: Include Pinata API keys
   │  Body: File data
   ├─ Pinata stores file on IPFS network
   ├─ Pinata returns hash: "Qm..."
   └─ Returns hash to component
   ↓
6. CreateWill stores hash: setIpfsHash(hash)
   ↓
7. UI updates: Shows "File uploaded successfully!"
```

**Technologies used:** Pinata API, IPFS, React

---

### Step 6: User Submits Will to Blockchain

```
Step 5a: Validation
├─ Check all beneficiaries exist
├─ Check beneficiaries total 100%
├─ Check executor address valid
├─ Check ETH amount valid
└─ Check IPFS hash exists

Step 5b: Prepare Transaction
├─ Convert inactivityPeriod to seconds: 365 days → 31,536,000 seconds
├─ Convert ETH to Wei: 0.5 ETH → 500000000000000000 wei
├─ Format all data for contract
└─ Create transaction object

Step 5c: Send Transaction to MetaMask
├─ App calls: contract.createWill(...)
├─ ethers.js prepares transaction with signer
├─ Sends to MetaMask
├─ MetaMask shows confirmation popup
├─ Gas fee estimate shown
└─ User reviews and clicks "Approve"

Step 5d: MetaMask Signs Transaction
├─ User's private key signs transaction
├─ Signature proves user authorized it
├─ Transaction is now tamper-proof
└─ Sent to Ethereum network

Step 5e: Ethereum Network Processes Transaction
├─ Validators receive transaction
├─ Smart contract code executes:
│  ├─ Validate all inputs
│  ├─ Store will data on blockchain
│  ├─ Lock ETH in contract
│  ├─ Record timestamp as lastProofOfLife
│  ├─ Emit CreateWill event
│  └─ Return success
├─ Validators reach consensus (6 confirmations)
└─ Transaction becomes permanent

Step 5f: App Receives Confirmation
├─ ethers.js detects transaction mined
├─ receipt object returned
├─ App stores: transactionHash
├─ UI shows success message
├─ setTxStatus("success")
└─ Redirect to "/my-will" after 3 seconds
```

**Technologies used:**
- Smart Contract (Solidity)
- ethers.js (transaction builder)
- MetaMask (signer)
- Ethereum Sepolia (blockchain)

---

### Step 7: User Views Their Will ("My Will" Page)

```
1. User navigates to "/my-will"
   ↓
2. MyWill.jsx component loads
   ↓
3. useWill(account) is called
   ↓
4. Hook fetches data:
   ├─ contract.hasWill(account)
   │  └─ Checks: Does a will exist for this address?
   ├─ contract.getWillDetails(account)
   │  └─ Reads: All will data from blockchain
   ├─ contract.getBeneficiaries(account)
   │  └─ Reads: Beneficiary list
   ├─ contract.isInactivityTriggered(account)
   │  └─ Reads: Has inactivity period passed?
   └─ contract.getTimeUntilTrigger(account)
      └─ Reads: Seconds remaining
   ↓
5. Data displayed:
   ├─ Countdown timer showing time remaining
   ├─ Beneficiary details and percentages
   ├─ ETH locked amount
   ├─ Executor address
   ├─ Buttons: "Proof of Life", "Add Funds", "Update Executor", "Revoke"
   └─ Will document link to IPFS
   ↓
6. Countdown updates every second
```

**Technologies used:** React, ethers.js, Smart Contract (view functions)

---

### Step 8: User Sends "Proof of Life"

```
1. User clicks "Proof of Life" button
   ↓
2. proofOfLife() called from useContract
   ↓
3. ethers.js prepares transaction
   ↓
4. Calls: contract.proofOfLife()
   ├─ No parameters needed
   ├─ No ETH sent
   └─ Just needs signature
   ↓
5. MetaMask prompts to approve
   ↓
6. User approves in MetaMask
   ↓
7. Smart contract executes:
   ├─ Gets testator's will
   ├─ Checks: Is caller the testator?
   ├─ Updates: will.lastProofOfLife = now
   ├─ Timer resets
   └─ Emits ProofOfLife event
   ↓
8. Transaction mined and confirmed
   ↓
9. App refetches data
   ↓
10. Countdown timer resets to maximum
```

**Technologies used:** Smart Contract, ethers.js, MetaMask

---

### Step 9: Beneficiary Checks "Beneficiary Dashboard"

```
1. Beneficiary navigates to "/beneficiary"
   ↓
2. App connects their wallet
   ↓
3. Smart contract queried:
   ├─ Searches all wills in mapping
   ├─ Finds wills where they're a beneficiary
   ├─ Returns list with details
   └─ Shows percentage allocation
   ↓
4. Page displays:
   ├─ Wills they're beneficiary of
   ├─ Testator's address
   ├─ Their percentage
   ├─ Time until automatic distribution
   └─ Will document links
```

**Technologies used:** Smart Contract (mappings and loops), React

---

### Step 10: Executor Executes Will (After Inactivity)

```
1. Executor navigates to "/execute"
   ↓
2. Connects their wallet
   ↓
3. Sees list of wills where they're executor
   ↓
4. Checks will status:
   ├─ Call: isInactivityTriggered(testatorAddress)
   ├─ If true: "Eligible to Execute" button appears
   └─ If false: "Not yet eligible" (shows time remaining)
   ↓
5. When inactivity period passes (e.g., 365 days):
   ├─ Executor clicks "Execute Will"
   ├─ ethers.js prepares transaction
   └─ Sends: contract.executeWill(testatorAddress)
   ↓
6. Smart contract executes:
   ├─ Checks executor authorized? ✓
   ├─ Checks inactivity triggered? ✓
   ├─ Checks will active? ✓
   ├─ For each beneficiary:
   │  ├─ Calculate share: (1000 ETH × 50%) / 100 = 500 ETH
   │  ├─ Transfer 500 ETH to beneficiary address
   │  ├─ Emit Transfer event
   │  └─ Log to blockchain
   ├─ Mark will as executed
   └─ Emit WillExecuted event
   ↓
7. All beneficiaries receive their ETH
   ↓
8. Etherscan shows all transactions
```

**Technologies used:** Smart Contract, ethers.js, Ethereum (fund transfers)

---

## 📊 Data Flow Diagram

```
User Browser (React App)
│
├─ WalletContext (Manages wallet state)
│  ├─ account
│  ├─ provider
│  ├─ signer
│  └─ Functions: connectWallet(), switchToSepolia()
│
├─ Custom Hooks
│  ├─ useWallet() → WalletContext
│  ├─ useContract() → Creates contract instance with signer
│  └─ useWill() → Fetches will data
│
├─ React Components
│  ├─ CreateWill.jsx → Calls useContract.createWill()
│  ├─ MyWill.jsx → Calls useWill() for reading
│  ├─ BeneficiaryDashboard.jsx → Queries beneficiary wills
│  └─ ExecuteWill.jsx → Call executeWill()
│
└─ External Services
   ├─ MetaMask Extension
   │  └─ Manages private key and signs transactions
   │
   ├─ Pinata API
   │  └─ Stores files on IPFS
   │
   └─ Ethereum Sepolia Network
      ├─ Validators run nodes
      ├─ Store blockchain state
      ├─ Execute smart contracts
      └─ Process transactions
         │
         └─ Smart Contract (DigitalWill.sol)
            ├─ Storage: mapping(address => Will) wills
            ├─ Functions: createWill, proofOfLife, executeWill, etc.
            ├─ Events: WillCreated, WillExecuted, etc.
            └─ Security: ReentrancyGuard, input validation
```

---

## 🔐 Security at Every Step

| Step | Security Measure | How it Works |
|------|------------------|------------|
| **User Login** | Private key never shared | MetaMask keeps private key local, only sends signatures |
| **Transaction Signing** | Cryptographic signature | Only testator can sign with their private key |
| **Smart Contract** | ReentrancyGuard | Prevents recursive calls during fund transfers |
| **Fund Transfer** | Checks-Effects-Interactions | State changed before sending funds |
| **Data Storage** | Immutable blockchain | No one can alter historical will data |
| **Access Control** | Only testator can update | `require(msg.sender == will.testator)` |
| **File Upload** | IPFS hash fingerprint | Any modification changes hash, breaks link |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```
Installs: react, ethers, tailwindcss, react-router, etc.

### 2. Setup Environment (`.env`)
```
VITE_CONTRACT_ADDRESS=0x...
VITE_PINATA_API_KEY=...
VITE_PINATA_SECRET_KEY=...
```

### 3. Start Dev Server
```bash
npm run dev
```
Runs on http://localhost:5173

### 4. Prepare Wallet
- Install MetaMask
- Switch to Sepolia Testnet
- Get test ETH from faucet

### 5. Deploy Contract
Option A: Use Remix IDE
- Copy contract to Remix
- Compile v0.8.20
- Deploy on Sepolia
- Copy address to `.env`

Option B: Use Hardhat
```bash
npm run hardhat:deploy
```

---

## 📁 Complete File Structure Explained

```
PROJECT/
│
├── contracts/
│   └── DigitalWill.sol
│       └─ Smart contract code (Solidity)
│       └─ Defines: struct Will, functions, events
│
├── src/
│   ├── App.jsx
│   │   └─ Main app, sets up routing and providers
│   │
│   ├── main.jsx
│   │   └─ Entry point, renders App to DOM
│   │
│   ├── context/
│   │   └── WalletContext.jsx
│   │       └─ Global wallet state (account, signer, provider)
│   │
│   ├── hooks/
│   │   ├── useWallet.js
│   │   │   └─ Access wallet from any component
│   │   ├── useContract.js
│   │   │   └─ Create contract instance, call functions
│   │   └── useWill.js
│   │       └─ Fetch will data from blockchain
│   │
│   ├── utils/
│   │   ├── contract.js
│   │   │   └─ CONTRACT_ADDRESS and ABI
│   │   ├── helpers.js
│   │   │   └─ formatAddress, isValidAddress, formatEther, etc.
│   │   └── ipfs.js
│   │       └─ uploadToPinata function
│   │
│   ├── components/
│   │   ├── Navbar.jsx - Navigation bar
│   │   ├── WalletConnect.jsx - Connect wallet button
│   │   ├── BeneficiaryForm.jsx - Add beneficiaries form
│   │   ├── WillCard.jsx - Display will details
│   │   ├── CountdownTimer.jsx - Show time remaining
│   │   ├── ProofOfLifeButton.jsx - Trigger proof of life
│   │   ├── TransactionStatus.jsx - Show tx status
│   │   └── (other components)
│   │
│   └── pages/
│       ├── Home.jsx - Landing page
│       ├── CreateWill.jsx - 5-step will creation
│       ├── MyWill.jsx - View your will
│       ├── BeneficiaryDashboard.jsx - See inherited wills
│       ├── ExecuteWill.jsx - Execute as executor
│       └── (other pages)
│
├── test/
│   └── DigitalWill.test.js
│       └─ Tests using Hardhat + Chai
│
├── scripts/
│   └── deploy.js
│       └─ Deployment script for Hardhat
│
├── hardhat.config.js
│   └─ Hardhat configuration (networks, compiler, etc.)
│
├── tailwind.config.js
│   └─ Tailwind configuration (dark theme, colors, etc.)
│
├── vite.config.js
│   └─ Vite configuration (build settings)
│
└── package.json
    └─ Dependencies and scripts
        ├─ react, react-dom
        ├─ ethers
        ├─ tailwindcss
        ├─ react-router-dom
        ├─ hardhat, chai
        └─ (other packages)
```

---

## ✅ Verification & Testing

### View on Etherscan
- Every transaction visible at: https://sepolia.etherscan.io
- Search by transaction hash or contract address
- See all contract calls, state changes, events

### Test Smart Contract
```bash
npm run hardhat:test
```
Runs through all test scenarios

### Lint Frontend Code
```bash
npm run lint
```
Checks for code quality issues

---

## 🎓 Learning Path

1. **Understand Ethereum & Web3**
   - Public/private keys
   - Smart contracts
   - Gas and transactions

2. **Learn Solidity**
   - Variables and functions
   - State management
   - Events and modifiers

3. **Learn React**
   - Components and hooks
   - State management
   - Forms and validation

4. **Learn ethers.js**
   - Connect to blockchain
   - Sign transactions
   - Read/write to contracts

5. **Study This Project**
   - Read DigitalWill.sol line by line
   - Trace a transaction from React to blockchain
   - Modify and deploy changes

---

## 📞 Support & Resources

- **Ethereum Docs**: https://ethereum.org/developers
- **Solidity Docs**: https://docs.soliditylang.org
- **ethers.js**: https://docs.ethers.org/v6
- **React Docs**: https://react.dev
- **Hardhat**: https://hardhat.org/docs
- **MetaMask**: https://docs.metamask.io

---

## 📋 Prerequisites

Before you start, make sure you have:

1. **Node.js** (v16+ recommended)
2. **MetaMask** browser extension installed
3. **Ethereum Sepolia Testnet** configured in MetaMask
4. Test ETH on Sepolia (get from [Sepolia Faucet](https://sepolia-faucet.pk910.de/))
5. **Pinata Account** (optional, for IPFS file uploads)

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
cd PE1
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Get from Alchemy (https://www.alchemy.com/)
ALCHEMY_API_KEY=your_alchemy_api_key

# Your private key (DO NOT SHARE!)
# Get from MetaMask: Settings > Security & Privacy > Show Private Key
PRIVATE_KEY=your_private_key

# Optional: For contract verification on Etherscan
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional: For IPFS file uploads
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

### 3. Configure MetaMask to Sepolia Network

1. Open MetaMask
2. Click the network dropdown (top-left)
3. Click "Add Network"
4. Add Sepolia:
   - **Network Name**: Sepolia Testnet
   - **RPC URL**: https://rpc.sepolia.org
   - **Chain ID**: 11155111
   - **Currency**: ETH
   - **Block Explorer**: https://sepolia.etherscan.io

### 4. Deploy Smart Contract

#### Option A: Using Remix IDE (Recommended for Testing)

1. Go to [Remix IDE](https://remix.ethereum.org)
2. Create new file: `DigitalWill.sol`
3. Copy the entire contract code from `contracts/DigitalWill.sol`
4. Go to **Solidity Compiler** tab
5. Select compiler version **0.8.20**
6. Click **Compile**
7. Go to **Deploy & Run Transactions** tab
8. In "Environment" dropdown, select **"Injected Provider - MetaMask"**
9. Make sure MetaMask is connected to Sepolia
10. Click **Deploy**
11. Copy the deployed contract address
12. Paste it in `src/utils/contract.js` (update `CONTRACT_ADDRESS`)

#### Option B: Using Hardhat (For Production)

```bash
# Compile contract
npm run hardhat:compile

# Deploy to Sepolia
npm run hardhat:deploy

# This will automatically update src/utils/contract.js
```

### 5. Update Contract Address

Update `src/utils/contract.js`:

```javascript
export const CONTRACT_ADDRESS = "0xYourDeployedContractAddressHere";
```

Also update `.env`:

```env
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddressHere
```

### 6. Run Tests (Optional)

```bash
npm run hardhat:test
```

### 7. Start Frontend Development Server

```bash
npm run dev
```

This will start the Vite dev server at `http://localhost:5173`

## 📖 Usage Guide

### Creating Your First Will

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Approve MetaMask connection
   - Ensure you're on Sepolia network

2. **Navigate to Create Will**
   - Click "Create Will" in navigation

3. **Step 1: Add Beneficiaries**
   - Enter beneficiary name
   - Paste their Ethereum address
   - Enter percentage allocation (must total 100%)
   - Click "Add Beneficiary"
   - Repeat for multiple beneficiaries

4. **Step 2: Set Inactivity Period**
   - Use slider to set days until auto-execution (30-1825 days)
   - Recommended: 365 days (1 year)

5. **Step 3: Assign Executor**
   - Enter executor's Ethereum address
   - This person can trigger will execution

6. **Step 4: Upload Document**
   - Click to upload your will PDF
   - File is uploaded to IPFS via Pinata
   - Hash is stored on blockchain

7. **Step 5: Deposit & Create**
   - Enter ETH amount to lock
   - Review all details
   - Click "Create Will"
   - Approve transaction in MetaMask

### Managing Your Will

**In "My Will" Page:**

- **Proof of Life**: Click button to reset inactivity timer
- **Add Funds**: Add more ETH to your will
- **Update Executor**: Change who can trigger execution
- **Revoke Will**: Delete will and get ETH back

### As a Beneficiary

**Check "Beneficiary Dashboard":**

- See all wills you're a beneficiary of
- View your percentage allocation
- Track time until automatic distribution

### As an Executor

**Check "Execute Will" Page:**

- See all wills where you're assigned as executor
- Monitor inactivity status
- Execute wills once inactivity period passes

## Smart Contract Functions

### For Testators

```solidity
createWill(beneficiaries, inactivityPeriod, executor, ipfsHash) payable
proofOfLife()
updateBeneficiaries(newBeneficiaries)
addFunds() payable
updateExecutor(newExecutor)
revokeWill()
```

### View Functions

```solidity
getWillDetails(testatorAddress) returns (Will)
getBeneficiaries(testatorAddress) returns (Beneficiary[])
isInactivityTriggered(testatorAddress) returns (bool)
getTimeUntilTrigger(testatorAddress) returns (uint256)
```

### For Executors

```solidity
executeWill(testatorAddress)
```

## Security Features

- ✅ **ReentrancyGuard** on fund transfers
- ✅ **Ownable** for admin controls
- ✅ **Pausable** for emergency stops
- ✅ **Overflow Protection** built into Solidity 0.8
- ✅ **Input Validation** on all functions
- ✅ **Event Logging** for all state changes
- ✅ **Gas Optimization** with storage patterns

## Common Issues & Troubleshooting

### "MetaMask is not installed"
- Install MetaMask extension from [metamask.io](https://metamask.io)

### "Please switch to Sepolia Testnet"
- MetaMask will show a prompt to switch
- Or manually switch in MetaMask settings

### "Insufficient funds"
- Get free ETH from [Sepolia Faucet](https://sepolia-faucet.pk910.de/)

### Contract address not updating
- Manually update `src/utils/contract.js` with your contract address
- Clear browser cache

### IPFS upload fails
- Verify Pinata API keys in `.env`
- Check Pinata account status and quota

## File Structure

```
PE1/
├── contracts/
│   └── DigitalWill.sol          # Smart contract
├── test/
│   └── DigitalWill.test.js      # Hardhat tests
├── scripts/
│   └── deploy.js                # Deployment script
├── src/
│   ├── components/              # React components
│   │   ├── Navbar.jsx
│   │   ├── WalletConnect.jsx
│   │   ├── WillCard.jsx
│   │   ├── BeneficiaryForm.jsx
│   │   ├── CountdownTimer.jsx
│   │   ├── ProofOfLifeButton.jsx
│   │   └── TransactionStatus.jsx
│   ├── pages/                   # Route pages
│   │   ├── Home.jsx
│   │   ├── CreateWill.jsx
│   │   ├── MyWill.jsx
│   │   ├── BeneficiaryDashboard.jsx
│   │   └── ExecuteWill.jsx
│   ├── hooks/                   # Custom hooks
│   │   ├── useWallet.js
│   │   ├── useContract.js
│   │   └── useWill.js
│   ├── context/                 # React contexts
│   │   └── WalletContext.jsx
│   ├── utils/                   # Utilities
│   │   ├── contract.js          # ABI & address
│   │   ├── ipfs.js              # IPFS upload
│   │   └── helpers.js           # Helper functions
│   ├── App.jsx                  # Main app
│   ├── main.jsx                 # Entry point
│   └── index.css                # Styles
├── hardhat.config.js            # Hardhat config
├── package.json                 # Dependencies
├── tailwind.config.js           # Tailwind config
├── vite.config.js               # Vite config
└── README.md                    # This file
```

## Deployment to Production

### 📦 Live Deployment (Vercel)

**Current Deployment:** https://digital-will-blockchain.vercel.app/

The application is currently deployed and live on Vercel. Every push to the `main` branch automatically triggers a new deployment.

#### Deploy Your Own Copy to Vercel:

1. **Fork this repository** on GitHub

2. **Connect to Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Set Environment Variables in Vercel Dashboard:**
   - Go to your Vercel project settings
   - Add `VITE_CONTRACT_ADDRESS` with your deployed smart contract address
   - Optionally add Pinata keys for IPFS uploads

4. **Deploy:**
   ```bash
   vercel --prod
   ```

5. **Auto Deployments:**
   - Connect your GitHub repo to Vercel
   - Every push to `main` will auto-deploy

### 1. Build Frontend

```bash
npm run build
```

This creates optimized files in `dist/` folder.

### 2. Deploy to Netlify / Vercel

**Netlify:**
```bash
npx netlify deploy --prod --dir=dist
```

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

### 3. Mainnet Deployment

For production Ethereum:

1. Get ETH on mainnet
2. Update `hardhat.config.js` with mainnet RPC URL
3. Deploy: `npx hardhat run scripts/deploy.js --network mainnet`
4. Verify contract on Etherscan

## Testing

```bash
# Run all tests
npm run hardhat:test

# Run specific test
npx hardhat test test/DigitalWill.test.js

# With coverage
npx hardhat coverage
```

## License

MIT - Open source for educational purposes

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review contract comments in Solidity files
3. Check browser console for errors

## Disclaimer

This is a proof-of-concept dApp. Always audit smart contracts before using with real funds. Test thoroughly on testnet first.

---

**Happy legacy building! 🚀**
