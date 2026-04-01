# ChainWill - Installation & Deployment Guide

## 🚀 5-Minute Setup Guide

### Prerequisites Check
- [ ] Node.js v16+ installed (`node --version`)
- [ ] MetaMask browser extension installed
- [ ] Sepolia testnet added to MetaMask
- [ ] Free test ETH from [faucet](https://sepolia-faucet.pk910.de/)

---

## Step 1: Install Dependencies (1 minute)

```bash
cd c:\Users\Meet\Desktop\PE1
npm install
```

---

## Step 2: Configure Environment Variables (2 minutes)

```bash
# Copy example file
copy .env.example .env

# Edit .env and add these:
```

Edit `.env` and fill in (use any placeholder if you don't have it yet):

```env
# Get from https://www.alchemy.com/ (free tier)
ALCHEMY_API_KEY=your_alchemy_api_key

# Your MetaMask private key
# ⚠️  NEVER commit this to git
# Get from MetaMask: Settings > Security & Privacy > Show Private Key
PRIVATE_KEY=your_private_key

# Optional - get from https://etherscan.io/apis
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional - get from https://pinata.cloud/
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Will be updated after deployment
VITE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
VITE_ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/
VITE_PINATA_API_KEY=placeholder
VITE_PINATA_SECRET_KEY=placeholder
```

---

## Step 3: Prepare MetaMask (1 minute)

### Add Sepolia Network to MetaMask

1. Open MetaMask
2. Click network dropdown (top left)
3. Click **"Add Network"**
4. Click **"Add a network manually"**
5. Enter these details:

   ```
   Network Name: Sepolia Testnet
   RPC URL: https://rpc.sepolia.org
   Chain ID: 11155111
   Currency: ETH
   Block Explorer: https://sepolia.etherscan.io
   ```

6. Click **"Save"**

### Get Test ETH

1. Go to [Sepolia Faucet](https://sepolia-faucet.pk910.de/)
2. Paste your MetaMask address
3. Click "Send me ETH" (you'll get 0.1-1 ETH per request)
4. Wait for transaction to complete

---

## Step 4: Deploy Smart Contract (3 minutes)

### ⭐ Option A: Simple Remix IDE (Recommended)

**No setup needed! Use the web IDE:**

1. Go to **[Remix IDE](https://remix.ethereum.org)**

2. Click the **file icon** in left sidebar

3. Click **"Create New File"** and name it `DigitalWill.sol`

4. Copy the entire code from:
   ```
   c:\Users\Meet\Desktop\PE1\contracts\DigitalWill.sol
   ```

5. Paste it into Remix editor

6. On the left sidebar, click **"Solidity Compiler"** tab

7. In **"Compiler Version"** dropdown, select **`0.8.20`**

8. Click the **blue "Compile DigitalWill.sol"** button

   - Should show: ✓ No warnings or errors

9. Now click **"Deploy & Run Transactions"** tab

10. In **"Environment"** dropdown, select:
    ```
    Injected Provider - MetaMask
    ```

11. **Approve the connection** in MetaMask popup

12. Make sure **Sepolia** is selected in MetaMask

13. Click the blue **"Deploy"** button

14. **Approve the transaction** in MetaMask
    - Wait for confirmation (30 seconds - 2 minutes)

15. ✅ Contract deployed! Copy the address shown (starts with `0x`)

### 💾 Update Your Code with Contract Address

1. Open `src/utils/contract.js`
2. Find this line:
   ```javascript
   export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";
   ```
3. Replace with your address:
   ```javascript
   export const CONTRACT_ADDRESS = "0xYourAddressHere";
   ```
4. Also update `.env`:
   ```env
   VITE_CONTRACT_ADDRESS=0xYourAddressHere
   ```

---

### 🔧 Option B: Hardhat (For Production)

If you're deploying to mainnet or want automated deployment:

```bash
# Ensure Alchemy key is in .env

# Compile contract
npm run hardhat:compile

# Deploy to Sepolia
npm run hardhat:deploy

# This will automatically update src/utils/contract.js
```

---

## Step 5: Start Development Server (1 minute)

```bash
npm run dev
```

This will:
- Start Vite dev server
- Open browser to http://localhost:5173
- Show you the dApp

---

## Step 6: Test the dApp

### Create Your First Will

1. **Click "Connect Wallet"**
   - Approve MetaMask connection

2. **Navigation → "Create Will"**

3. **Step 1: Add Beneficiaries**
   - Name: "Friend One"
   - Address: `0x1234567890123456789012345678901234567890` (any address)
   - Percentage: 60
   - Click "Add Beneficiary"
   
   - Name: "Friend Two"
   - Address: `0x0987654321098765432109876543210987654321`
   - Percentage: 40
   - Click "Add Beneficiary"

4. **Step 2: Inactivity Period**
   - Keep default or adjust slider (365 days is good for testing)

5. **Step 3: Executor**
   - Paste any Ethereum address (can be yours or a friend's)

6. **Step 4: Upload Document** (optional)
   - Click to upload a PDF file
   - It will upload to IPFS

7. **Step 5: Deposit ETH**
   - Enter: `0.01` (small amount for testing)

8. **Click "Create Will"**
   - Approve in MetaMask
   - Wait for confirmation

9. ✅ **Will Created!**
   - You'll see transaction hash with Etherscan link

### Test Other Features

**In "My Will" page:**
- Click "🔄 Proof of Life" - resets the timer
- Click "💰 Add More Funds" - add extra ETH
- Click "👤 Update Executor" - change executor

**Check "Beneficiary Dashboard":**
- See wills you're a beneficiary of
- View your inheritance amount

---

## 📋 Verification Checklist

- [ ] Node.js installed and working
- [ ] All npm packages installed (`npm install` successful)
- [ ] `.env` file created with API key
- [ ] MetaMask has Sepolia network
- [ ] MetaMask has test ETH (balance > 0)
- [ ] Smart contract deployed to Sepolia
- [ ] Contract address updated in code
- [ ] `npm run dev` starts without errors
- [ ] Browser shows ChainWill dApp
- [ ] "Connect Wallet" button works
- [ ] Can create a test will successfully

---

## Common Issues & Fixes

### ❌ "MetaMask is not installed"
**Fix**: Install from [metamask.io](https://metamask.io)

### ❌ "Please switch to Sepolia Testnet"
**Fix**: 
- Click the popup to switch
- Or manually select in MetaMask dropdown

### ❌ "Contract not initialized"
**Fix**: Update `CONTRACT_ADDRESS` in `src/utils/contract.js`

### ❌ "Insufficient funds"
**Fix**: Get more test ETH from [faucet](https://sepolia-faucet.pk910.de/)

### ❌ npm install fails
**Fix**: 
```bash
# Clear cache
npm cache clean --force
# Try again
npm install
```

### ❌ "Cannot find module" errors
**Fix**: 
```bash
# Remove node_modules
rm -r node_modules  # or: rmdir /s node_modules (Windows)
# Reinstall
npm install
```

---

## 🧪 Run Tests (Optional)

```bash
# Test smart contract
npm run hardhat:test

# All tests should pass ✓
```

---

## 📦 Build for Production

```bash
# Creates optimized dist/ folder
npm run build

# Preview the build
npm run preview

# Deploy the dist/ folder to Netlify/Vercel
```

---

## 🌐 Deployment Platforms

### Deploy to Netlify (Free)
```bash
npm run build
# Go to https://app.netlify.com
# Drag and drop the 'dist' folder
```

### Deploy to Vercel (Free)
```bash
npm run build
npm install -g vercel
vercel --prod
```

### Deploy to Web3 Hosting
- [IPFS Deploy](https://www.npmjs.com/package/ipfs-deploy)
- [Fleek](https://fleek.co/)
- [Spheron](https://spheron.network/)

---

## 📚 What Each Script Does

```bash
npm run dev                    # Start development server
npm run build                  # Build for production
npm run preview                # Preview production build
npm run hardhat:compile        # Compile smart contract
npm run hardhat:test           # Run contract tests
npm run hardhat:deploy         # Deploy to Sepolia
npm run hardhat:deploy:local   # Deploy to local Hardhat node
```

---

## ✅ You Are Ready!

1. ✅ Environment setup complete
2. ✅ Smart contract deployed
3. ✅ Frontend ready to use
4. ✅ Tests passing
5. ✅ Documentation available

**Start the dev server and begin creating digital wills:**

```bash
npm run dev
```

---

## 📞 Need Help?

1. Check **README.md** for full documentation
2. Check **PROJECT_SUMMARY.md** for architecture overview
3. Review smart contract in `contracts/DigitalWill.sol`
4. Check browser console for error messages
5. Review test file at `test/DigitalWill.test.js`

---

## 🎉 Next Adventure

After getting comfortable:
- Deploy to Ethereum mainnet
- Audit the smart contract
- Implement advanced features
- Add more integrations (The Graph, etc.)
- Host on decentralized infrastructure

Happy will-making! 🚀
