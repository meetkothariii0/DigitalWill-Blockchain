# ChainWill API Reference & Developer Guide

## 📖 Table of Contents

1. [Smart Contract API](#smart-contract-api)
2. [React Hooks](#react-hooks)
3. [Utility Functions](#utility-functions)
4. [Context API](#context-api)
5. [Component Props](#component-props)

---

## Smart Contract API

### State Variables

```solidity
address public owner;                    // Platform owner (Ownable)
uint256 public inactivityPeriod;        // Default: 365 days
mapping(address => Will) public wills;
mapping(address => bool) public hasWill;
```

### Structs

#### Beneficiary
```solidity
struct Beneficiary {
    address payable walletAddress;  // Recipient address
    string name;                    // Beneficiary name
    uint256 percentage;             // Allocation percentage (0-100)
}
```

#### Will
```solidity
struct Will {
    address payable testator;       // Will creator
    Beneficiary[] beneficiaries;    // All beneficiaries
    uint256 lastCheckIn;            // Last proof-of-life timestamp
    uint256 inactivityPeriod;       // Custom period (seconds)
    address executor;               // Trusted executor address
    bool isActive;                  // Will status
    bool isExecuted;                // Execution status
    string ipfsDocHash;             // Encrypted document hash
    uint256 totalEthLocked;         // Locked ETH amount
}
```

### Write Functions

#### createWill
```solidity
function createWill(
    Beneficiary[] calldata _beneficiaries,
    uint256 _inactivityPeriod,
    address _executor,
    string calldata _ipfsHash
) external payable whenNotPaused
```

**Parameters:**
- `_beneficiaries`: Array of beneficiary structs (min 1)
- `_inactivityPeriod`: Seconds until auto-execution
- `_executor`: Address that can trigger execution
- `_ipfsHash`: Hash of encrypted will document

**Requirements:**
- Not already has a will
- All beneficiary addresses valid
- Beneficiary percentages sum to 100

**Events:**
- `WillCreated(address indexed testator, uint256 timestamp)`

---

#### proofOfLife
```solidity
function proofOfLife() external whenNotPaused
```

**Effect:** Updates `lastCheckIn` to current block timestamp

**Requirements:**
- Will must exist and be active

**Events:**
- `ProofOfLife(address indexed testator, uint256 timestamp)`

---

#### updateBeneficiaries
```solidity
function updateBeneficiaries(
    Beneficiary[] calldata _newBeneficiaries
) external whenNotPaused
```

**Requirements:**
- Will must exist
- Will must not be executed
- Percentages must sum to 100

**Events:**
- `BeneficiariesUpdated(address indexed testator, uint256 timestamp)`

---

#### addFunds
```solidity
function addFunds() external payable whenNotPaused
```

**Requirements:**
- msg.value > 0
- Will must exist and be active

**Events:**
- `FundsAdded(address indexed testator, uint256 amount)`

---

#### executeWill
```solidity
function executeWill(address _testator) 
    external nonReentrant whenNotPaused
```

**Parameters:**
- `_testator`: Address of will to execute

**Requirements:**
- Will must be active
- Will must not be executed
- Inactivity period must have passed
- Caller must be executor or testator

**Effects:**
- Distributes funds to all beneficiaries
- Marks will as executed

**Events:**
- `WillExecuted(address indexed testator, address indexed executor, uint256 timestamp)`

---

#### revokeWill
```solidity
function revokeWill() external nonReentrant whenNotPaused
```

**Requirements:**
- Must be testator
- Will must exist

**Effects:**
- Returns all funds to testator
- Deletes will

**Events:**
- `WillRevoked(address indexed testator, uint256 timestamp)`

---

#### updateExecutor
```solidity
function updateExecutor(address _newExecutor) 
    external whenNotPaused
```

**Requirements:**
- Must be testator
- New address must not be zero
- Will must exist and be active

---

### Read Functions

#### getWillDetails
```solidity
function getWillDetails(address _testator) 
    external view returns (Will memory)
```

**Returns:** Complete Will struct

---

#### getBeneficiaries
```solidity
function getBeneficiaries(address _testator) 
    external view returns (Beneficiary[] memory)
```

**Returns:** Array of beneficiaries

---

#### isInactivityTriggered
```solidity
function isInactivityTriggered(address _testator) 
    external view returns (bool)
```

**Returns:** `true` if inactivity period has passed

---

#### getTimeUntilTrigger
```solidity
function getTimeUntilTrigger(address _testator) 
    external view returns (uint256)
```

**Returns:** Seconds until trigger (0 if already triggered)

---

## React Hooks

### useWallet

**Purpose:** Manage MetaMask wallet connection and account state

```javascript
const {
  account,              // Connected account address
  provider,             // ethers.js BrowserProvider
  signer,               // ethers.js Signer
  chainId,              // Current chain ID
  isConnecting,         // Boolean: connection in progress
  isConnected,          // Boolean: wallet connected
  connectWallet,        // Function: initiate connection
  disconnectWallet,     // Function: disconnect
  switchToSepolia,      // Function: switch network
  isMetaMaskInstalled   // Function: check MetaMask
} = useWallet();
```

**Usage:**
```javascript
const { account, connectWallet, isConnected } = useWallet();

if (!isConnected) {
  return <button onClick={connectWallet}>Connect</button>;
}

return <div>Connected: {account}</div>;
```

---

### useContract

**Purpose:** All smart contract interactions

```javascript
const {
  contract,                 // ethers.js Contract instance
  loading,                  // Boolean: transaction pending
  createWill,               // Function
  proofOfLife,              // Function
  addFunds,                 // Function
  updateBeneficiaries,      // Function
  executeWill,              // Function
  revokeWill,               // Function
  updateExecutor,           // Function
  getWillDetails,           // Function
  getBeneficiaries,         // Function
  isInactivityTriggered,    // Function
  getTimeUntilTrigger,      // Function
  hasWill                   // Function
} = useContract();
```

**Creating a Will:**
```javascript
const beneficiaries = [
  {
    walletAddress: "0x...",
    name: "Alice",
    percentage: 60
  },
  {
    walletAddress: "0x...",
    name: "Bob",
    percentage: 40
  }
];

const inactivitySeconds = 365 * 24 * 60 * 60;
const result = await createWill(
  beneficiaries,
  inactivitySeconds,
  executorAddress,
  ipfsHash,
  "1.0"  // ETH amount
);

// result is receipt object if successful, null if failed
```

**Proof of Life:**
```javascript
const result = await proofOfLife();
// Updates your lastCheckIn timestamp
```

---

### useWill

**Purpose:** Fetch and manage will data

```javascript
const {
  will,             // Will struct or null
  beneficiaries,    // Beneficiary[] array
  isTriggered,      // Boolean: inactivity triggered
  timeRemaining,    // Number: seconds until trigger
  loading,          // Boolean: data loading
  error,            // String: error message or null
  refetch           // Function: refresh data
} = useWill(testatorAddress);
```

**Usage:**
```javascript
const { will, beneficiaries, timeRemaining } = useWill(account);

return (
  <div>
    <p>Will Balance: {will?.totalEthLocked}</p>
    <p>Time Remaining: {timeRemaining} seconds</p>
    {beneficiaries.map(b => <div key={b.walletAddress}>{b.name}</div>)}
  </div>
);
```

---

## Utility Functions

### Wallet Context (WalletContext.jsx)

#### connectWallet()
```javascript
const success = await connectWallet();
// Returns: boolean
// Shows toast on success/failure
// Auto-switches to Sepolia if needed
```

#### switchToSepolia()
```javascript
const success = await switchToSepolia();
// Returns: boolean
// Adds Sepolia if not present
```

#### disconnectWallet()
```javascript
disconnectWallet();
// Clears all state
```

---

### Helper Functions (helpers.js)

#### formatAddress(address)
```javascript
formatAddress("0x1234567890123456789012345678901234567890");
// Returns: "0x1234...7890"
```

#### formatEther(wei)
```javascript
formatEther("1000000000000000000");
// Returns: "1.0000"
```

#### parseEther(eth)
```javascript
parseEther("1.5");
// Returns: "1500000000000000000"
```

#### formatDate(timestamp)
```javascript
formatDate(1704067200);
// Returns: "Jan 1, 2024, 12:00 PM"
```

#### formatTimeRemaining(seconds)
```javascript
formatTimeRemaining(86400);
// Returns: "1 day"

formatTimeRemaining(7200);
// Returns: "2 hours"
```

#### isValidAddress(address)
```javascript
isValidAddress("0x1234...");
// Returns: boolean
```

#### getEtherscanLink(txHash, network)
```javascript
getEtherscanLink("0xabc123...", "sepolia");
// Returns: "https://sepolia.etherscan.io/tx/0xabc123..."
```

#### calculateBeneficiaryAmount(percentage, totalEth)
```javascript
calculateBeneficiaryAmount(50, "1000000000000000000");
// Returns: "0.5000"
```

---

### IPFS Functions (ipfs.js)

#### uploadToPinata(file)
```javascript
const file = event.target.files[0];
const ipfsHash = await uploadToPinata(file);
// Requires: PINATA_API_KEY and PINATA_SECRET_KEY in .env
// Returns: IPFS hash (Qm...)
// Throws: Error on upload failure
```

#### getIPFSUrl(ipfsHash)
```javascript
const url = getIPFSUrl("QmHash...");
// Returns: "https://gateway.pinata.cloud/ipfs/QmHash..."
```

#### uploadJSONToIPFS(data)
```javascript
const metadata = { name: "John", age: 30 };
const hash = await uploadJSONToIPFS(metadata);
// Returns: IPFS hash
```

---

## Context API

### WalletContext

**Provider Setup:**
```javascript
import { WalletProvider } from './context/WalletContext.jsx';

<WalletProvider>
  <App />
</WalletProvider>
```

**Hook Usage:**
```javascript
import { useWallet } from './context/WalletContext.jsx';

const { account, isConnected, connectWallet } = useWallet();
```

**Features:**
- Auto-detects MetaMask
- Handles account/network changes
- Sepolia network detection
- Toast notifications on events
- Automatic contract initialization

---

## Component Props

### WillCard
```javascript
<WillCard 
  will={willObject}        // Will struct from contract
  beneficiaries={array}    // Beneficiary[] array
  isTriggered={boolean}    // Inactivity triggered
/>
```

### BeneficiaryForm
```javascript
<BeneficiaryForm
  beneficiaries={[]}                 // Current beneficiaries
  onAddBeneficiary={(b) => {}}      // Callback when adding
  onRemoveBeneficiary={(index) => {}} // Callback when removing
/>
```

### CountdownTimer
```javascript
<CountdownTimer
  secondsRemaining={86400}    // Seconds left
  isTriggered={false}         // If inactivity triggered
/>
```

### ProofOfLifeButton
```javascript
<ProofOfLifeButton
  onSuccess={() => refetch()} // Callback after success
/>
```

### TransactionStatus
```javascript
<TransactionStatus
  txHash="0x..."              // Transaction hash
  status="success"            // "pending" | "success" | "error"
  message="Optional message"
/>
```

### WalletConnect
```javascript
<WalletConnect />
// No props needed - uses useWallet hook internally
```

### Navbar
```javascript
<Navbar />
// No props needed - includes WalletConnect
```

---

## Error Handling

### Contract Errors

The `useContract` hook catches these errors:

```javascript
// User rejected transaction
if (error.code === "ACTION_REJECTED") {
  toast.error("Transaction rejected by user");
}

// Insufficient funds
if (error.code === "INSUFFICIENT_FUNDS") {
  toast.error("Insufficient funds for transaction");
}

// Contract revert
if (error.reason) {
  toast.error(`Error: ${error.reason}`);
}
```

### Wallet Errors

```javascript
// MetaMask not installed
if (!window.ethereum) {
  // Show install MetaMask button
}

// Connection already pending
if (error.code === -32002) {
  toast.error("MetaMask request already pending");
}

// User rejected
if (error.code === 4001) {
  toast.error("User rejected the connection request");
}
```

---

## Gas Optimization Tips

1. **Batch Updates** - Update multiple beneficiaries in one transaction
2. **Minimal Storage** - Use uints instead of strings where possible
3. **Event Indexing** - Use events for off-chain querying
4. **Lazy Loading** - Fetch will details only when needed

---

## Testing Examples

### Test Creating a Will
```javascript
it("Should create a will with valid beneficiaries", async () => {
  const beneficiaries = [
    {
      walletAddress: beneficiary1.address,
      name: "Alice",
      percentage: 60
    },
    {
      walletAddress: beneficiary2.address,
      name: "Bob",
      percentage: 40
    }
  ];

  const tx = await contract.createWill(
    beneficiaries,
    365 * 24 * 60 * 60,
    executor.address,
    "QmHash",
    { value: ethers.parseEther("10") }
  );

  await expect(tx).to.emit(contract, "WillCreated");
  expect(await contract.hasWill(testator.address)).to.be.true;
});
```

---

## Extending the Project

### Adding a New Feature

1. **Add to Smart Contract** (if needed)
   - Update `contracts/DigitalWill.sol`
   - Add new function and events
   - Update tests

2. **Create Hook** (if contract interaction)
   - Add to `src/hooks/useContract.js`
   - Handle errors with toast

3. **Create Component**
   - Create component in `src/components/`
   - Use custom hooks for logic
   - Add Tailwind styling

4. **Add Page or Route**
   - Create in `src/pages/`
   - Add route to `App.jsx`
   - Update Navbar navigation

5. **Test Everything**
   - Test on Sepolia testnet
   - Check all edge cases
   - Verify MetaMask interactions

---

## Deployment Checklist

- [ ] All contracts compiled without errors
- [ ] All tests passing
- [ ] Contract address updated in code
- [ ] Environment variables configured
- [ ] IPFS upload tested
- [ ] MetaMask integration tested
- [ ] All pages load without errors
- [ ] Responsive design verified
- [ ] Error messages user-friendly
- [ ] Transaction links working
- [ ] Build successful (`npm run build`)

---

## Performance Optimization

```javascript
// Use useCallback to prevent unnecessary re-renders
const fetchWill = useCallback(async () => {
  // expensive operation
}, [dependencies]);

// Use useMemo for expensive calculations
const totalAmount = useMemo(() => {
  return beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
}, [beneficiaries]);

// Lazy load components
const ExecuteWill = lazy(() => import('./pages/ExecuteWill.jsx'));
```

---

This API reference covers all the major components and functions of the ChainWill dApp. For additional details, refer to the inline code comments and NatSpec documentation in the smart contract.

Happy developing! 🚀
