// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title DigitalWill
 * @notice A decentralized platform for creating and managing digital wills on Ethereum
 * @dev Allows users to create wills, assign beneficiaries, and automatically transfer assets upon inactivity
 */
contract DigitalWill is Ownable, ReentrancyGuard, Pausable {
    // ========== STATE VARIABLES ==========
    
    uint256 public inactivityPeriod = 365 days;
    
    mapping(address => Will) public wills;
    mapping(address => bool) public hasWill;
    
    // ========== STRUCTS ==========
    
    /**
     * @notice Represents a beneficiary of a will
     */
    struct Beneficiary {
        address payable walletAddress;
        string name;
        uint256 percentage; // Must total 100 across all beneficiaries
    }
    
    /**
     * @notice Represents a digital will
     */
    struct Will {
        address payable testator; // Person who made the will
        Beneficiary[] beneficiaries;
        uint256 lastCheckIn; // Timestamp of last proof-of-life ping
        uint256 inactivityPeriod; // Custom or default period
        address executor; // Trusted person who can trigger distribution
        bool isActive;
        bool isExecuted;
        string ipfsDocHash; // Hash of encrypted will document on IPFS
        uint256 totalEthLocked; // ETH stored in this will
    }
    
    // ========== EVENTS ==========
    
    /**
     * @notice Emitted when a new will is created
     */
    event WillCreated(address indexed testator, uint256 timestamp);
    
    /**
     * @notice Emitted when testator provides proof of life
     */
    event ProofOfLife(address indexed testator, uint256 timestamp);
    
    /**
     * @notice Emitted when a will is executed and assets transferred
     */
    event WillExecuted(address indexed testator, address indexed executor, uint256 timestamp);
    
    /**
     * @notice Emitted when a will is revoked
     */
    event WillRevoked(address indexed testator, uint256 timestamp);
    
    /**
     * @notice Emitted when beneficiaries are updated
     */
    event BeneficiariesUpdated(address indexed testator, uint256 timestamp);
    
    /**
     * @notice Emitted when funds are added to a will
     */
    event FundsAdded(address indexed testator, uint256 amount);
    
    // ========== MODIFIERS ==========
    
    /**
     * @notice Ensures only the testator can call the function
     */
    modifier onlyTestator(address _testator) {
        require(msg.sender == _testator, "Only testator can call this function");
        _;
    }
    
    /**
     * @notice Ensures the will exists and is active
     */
    modifier willExists(address _testator) {
        require(hasWill[_testator], "Will does not exist");
        require(wills[_testator].isActive, "Will is not active");
        _;
    }
    
    // ========== EXTERNAL FUNCTIONS ==========
    
    /**
     * @notice Creates a new digital will
     * @param _beneficiaries Array of beneficiary structs
     * @param _inactivityPeriod Custom inactivity period in seconds
     * @param _executor Address of the will executor
     * @param _ipfsHash IPFS hash of the encrypted will document
     */
    function createWill(
        Beneficiary[] calldata _beneficiaries,
        uint256 _inactivityPeriod,
        address _executor,
        string calldata _ipfsHash
    ) external payable whenNotPaused {
        require(!hasWill[msg.sender], "You already have a will");
        require(_beneficiaries.length > 0, "At least one beneficiary is required");
        require(_executor != address(0), "Executor address cannot be zero");
        require(_inactivityPeriod > 0, "Inactivity period must be greater than 0");
        
        // Validate beneficiary percentages sum to 100
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            require(_beneficiaries[i].walletAddress != address(0), "Beneficiary address cannot be zero");
            require(_beneficiaries[i].percentage > 0, "Beneficiary percentage must be greater than 0");
            totalPercentage += _beneficiaries[i].percentage;
        }
        require(totalPercentage == 100, "Beneficiary percentages must sum to 100");
        
        // Create will
        Will storage newWill = wills[msg.sender];
        newWill.testator = payable(msg.sender);
        newWill.lastCheckIn = block.timestamp;
        newWill.inactivityPeriod = _inactivityPeriod;
        newWill.executor = _executor;
        newWill.isActive = true;
        newWill.isExecuted = false;
        newWill.ipfsDocHash = _ipfsHash;
        newWill.totalEthLocked = msg.value;
        
        // Add beneficiaries
        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            newWill.beneficiaries.push(_beneficiaries[i]);
        }
        
        hasWill[msg.sender] = true;
        emit WillCreated(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Proof of life - resets the inactivity timer
     */
    function proofOfLife() external whenNotPaused willExists(msg.sender) {
        wills[msg.sender].lastCheckIn = block.timestamp;
        emit ProofOfLife(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Updates the beneficiaries of a will
     * @param _newBeneficiaries Array of new beneficiary structs
     */
    function updateBeneficiaries(Beneficiary[] calldata _newBeneficiaries) external whenNotPaused {
        require(hasWill[msg.sender], "Will does not exist");
        require(!wills[msg.sender].isExecuted, "Cannot update executed will");
        require(_newBeneficiaries.length > 0, "At least one beneficiary is required");
        
        // Validate beneficiary percentages sum to 100
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < _newBeneficiaries.length; i++) {
            require(_newBeneficiaries[i].walletAddress != address(0), "Beneficiary address cannot be zero");
            require(_newBeneficiaries[i].percentage > 0, "Beneficiary percentage must be greater than 0");
            totalPercentage += _newBeneficiaries[i].percentage;
        }
        require(totalPercentage == 100, "Beneficiary percentages must sum to 100");
        
        // Clear old beneficiaries
        delete wills[msg.sender].beneficiaries;
        
        // Add new beneficiaries
        for (uint256 i = 0; i < _newBeneficiaries.length; i++) {
            wills[msg.sender].beneficiaries.push(_newBeneficiaries[i]);
        }
        
        emit BeneficiariesUpdated(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Adds funds to an existing will
     */
    function addFunds() external payable whenNotPaused willExists(msg.sender) {
        require(msg.value > 0, "Must send ETH to add funds");
        wills[msg.sender].totalEthLocked += msg.value;
        emit FundsAdded(msg.sender, msg.value);
    }
    
    /**
     * @notice Executes a will and distributes assets to beneficiaries
     * @param _testator Address of the testator whose will to execute
     */
    function executeWill(address _testator) external nonReentrant whenNotPaused {
        require(hasWill[_testator], "Will does not exist");
        
        Will storage will = wills[_testator];
        
        require(will.isActive, "Will is not active");
        require(!will.isExecuted, "Will has already been executed");
        require(
            block.timestamp >= will.lastCheckIn + will.inactivityPeriod,
            "Inactivity period has not passed"
        );
        require(msg.sender == will.executor || msg.sender == will.testator, "Only executor or testator can execute");
        
        // Mark as executed
        will.isExecuted = true;
        will.isActive = false;
        
        uint256 totalToDistribute = will.totalEthLocked;
        require(totalToDistribute > 0, "No funds to distribute");
        
        // Distribute to beneficiaries
        for (uint256 i = 0; i < will.beneficiaries.length; i++) {
            uint256 amount = (totalToDistribute * will.beneficiaries[i].percentage) / 100;
            if (amount > 0) {
                (bool success, ) = will.beneficiaries[i].walletAddress.call{value: amount}("");
                require(success, "Transfer failed");
            }
        }
        
        will.totalEthLocked = 0;
        emit WillExecuted(_testator, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Revokes a will and returns funds to testator
     */
    function revokeWill() external nonReentrant whenNotPaused onlyTestator(msg.sender) {
        require(hasWill[msg.sender], "Will does not exist");
        
        Will storage will = wills[msg.sender];
        uint256 lockedAmount = will.totalEthLocked;
        
        // Reset will
        will.isActive = false;
        will.isExecuted = false;
        will.totalEthLocked = 0;
        hasWill[msg.sender] = false;
        
        // Return funds
        if (lockedAmount > 0) {
            (bool success, ) = will.testator.call{value: lockedAmount}("");
            require(success, "Transfer failed");
        }
        
        emit WillRevoked(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Updates the executor of a will
     * @param _newExecutor Address of the new executor
     */
    function updateExecutor(address _newExecutor) external whenNotPaused willExists(msg.sender) {
        require(_newExecutor != address(0), "Executor address cannot be zero");
        wills[msg.sender].executor = _newExecutor;
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @notice Retrieves all details of a will
     * @param _testator Address of the testator
     * @return Will struct containing all will details
     */
    function getWillDetails(address _testator) external view returns (Will memory) {
        require(hasWill[_testator], "Will does not exist");
        return wills[_testator];
    }
    
    /**
     * @notice Retrieves all beneficiaries of a will
     * @param _testator Address of the testator
     * @return Array of beneficiary structs
     */
    function getBeneficiaries(address _testator) external view returns (Beneficiary[] memory) {
        require(hasWill[_testator], "Will does not exist");
        return wills[_testator].beneficiaries;
    }
    
    /**
     * @notice Checks if the inactivity trigger has been activated
     * @param _testator Address of the testator
     * @return Boolean indicating if inactivity period has passed
     */
    function isInactivityTriggered(address _testator) external view returns (bool) {
        if (!hasWill[_testator]) return false;
        return block.timestamp >= wills[_testator].lastCheckIn + wills[_testator].inactivityPeriod;
    }
    
    /**
     * @notice Returns time remaining until inactivity trigger
     * @param _testator Address of the testator
     * @return Time in seconds until trigger, or 0 if already triggered
     */
    function getTimeUntilTrigger(address _testator) external view returns (uint256) {
        if (!hasWill[_testator]) return 0;
        
        Will memory will = wills[_testator];
        uint256 triggerTime = will.lastCheckIn + will.inactivityPeriod;
        
        if (block.timestamp >= triggerTime) return 0;
        return triggerTime - block.timestamp;
    }
    
    /**
     * @notice Pauses the contract (admin only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Resumes the contract (admin only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
