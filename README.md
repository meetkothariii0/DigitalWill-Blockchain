# ChainWill - Decentralized Digital Will Platform

A complete blockchain-based dApp for creating and managing digital wills on Ethereum. Users can create wills, assign beneficiaries, lock assets, and have them automatically transferred upon verified inactivity.

## 🌟 Features

- **Create Digital Wills** - Securely store your will on the blockchain
- **Assign Beneficiaries** - Add multiple beneficiaries with percentage allocations
- **Lock Assets** - Deposit ETH that's held in escrow until triggered
- **Proof of Life** - Regularly verify your status to prevent accidental transfers
- **Auto-Execution** - Smart contracts automatically distribute assets upon inactivity
- **IPFS Storage** - Upload encrypted will documents to IPFS via Pinata
- **MetaMask Integration** - Connect your wallet directly from the browser
- **Real-time Monitoring** - Track inactivity countdown and will status

## 🛠 Tech Stack

- **Smart Contract**: Solidity 0.8.20 (OpenZeppelin contracts for security)
- **Frontend**: React.js + Vite, ethers.js v6, TailwindCSS, React Router v6
- **Blockchain**: Ethereum Sepolia Testnet
- **Wallet**: MetaMask
- **Storage**: Pinata IPFS
- **Testing**: Hardhat, Chai, Mocha
- **Styling**: TailwindCSS, Framer Motion

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
