import axios from "axios";

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;
const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs";

/**
 * Uploads a file to IPFS via Pinata
 * @param {File} file - File to upload
 * @returns {Promise<string>} IPFS hash
 */
export const uploadToPinata = async (file) => {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("Pinata API credentials not configured");
  }

  const formData = new FormData();
  formData.append("file", file);

  const metadata = JSON.stringify({
    name: file.name,
    keyvalues: {
      uploadedAt: new Date().toISOString(),
    },
  });
  formData.append("pinataMetadata", metadata);

  try {
    const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      headers: {
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_SECRET_KEY,
      },
    });

    return response.data.IpfsHash;
  } catch (error) {
    console.error("Pinata upload error:", error);
    throw new Error("Failed to upload file to IPFS");
  }
};

/**
 * Downloads a file from IPFS via Pinata gateway
 * @param {string} ipfsHash - IPFS hash of the file
 * @returns {string} Full IPFS URL
 */
export const getIPFSUrl = (ipfsHash) => {
  if (!ipfsHash) return null;
  return `${IPFS_GATEWAY}/${ipfsHash}`;
};

/**
 * Validates if a string is a valid IPFS hash
 * @param {string} hash - Hash to validate
 * @returns {boolean} True if valid
 */
export const isValidIPFSHash = (hash) => {
  // Basic validation for CIDv0 (34 chars, starts with Qm)
  // or CIDv1 format
  return /^Qm[a-zA-Z0-9]{44}$/.test(hash) || /^bagaaie[a-zA-Z0-9]+$/.test(hash);
};

/**
 * Uploads JSON metadata to IPFS
 * @param {object} data - JSON data to upload
 * @returns {Promise<string>} IPFS hash
 */
export const uploadJSONToIPFS = async (data) => {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("Pinata API credentials not configured");
  }

  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      data,
      {
        headers: {
          "pinata_api_key": PINATA_API_KEY,
          "pinata_secret_api_key": PINATA_SECRET_KEY,
        },
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error("Pinata JSON upload error:", error);
    throw new Error("Failed to upload JSON to IPFS");
  }
};
