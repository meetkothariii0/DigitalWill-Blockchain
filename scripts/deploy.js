const fs = require("fs");
const path = require("path");
const ethers = require("ethers");

async function main() {
  console.log("Deploying DigitalWill contract...");

  const DigitalWill = await ethers.getContractFactory("DigitalWill");
  const digitalWill = await DigitalWill.deploy();

  await digitalWill.waitForDeployment();

  const contractAddress = await digitalWill.getAddress();
  console.log(`\n✅ DigitalWill deployed to: ${contractAddress}\n`);

  // Get contract ABI
  const contractArtifact = require("../artifacts/contracts/DigitalWill.sol/DigitalWill.json");
  const contractABI = contractArtifact.abi;

  // Create contract.js file
  const contractJsContent = `// Auto-generated contract configuration
// Generated on: ${new Date().toISOString()}

export const CONTRACT_ADDRESS = "${contractAddress}";

export const CONTRACT_ABI = ${JSON.stringify(contractABI, null, 2)};

export default {
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
};
`;

  const contractPath = path.join(__dirname, "../src/utils/contract.js");
  fs.writeFileSync(contractPath, contractJsContent);

  console.log(`✅ Contract configuration saved to src/utils/contract.js`);
  console.log(`\n📝 Make sure to add the following to your .env file:`);
  console.log(`VITE_CONTRACT_ADDRESS=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
