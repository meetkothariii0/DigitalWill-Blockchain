// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract DigitalWill is Ownable, ReentrancyGuard, Pausable {
    uint256 public inactivityPeriod = 365 days;

    mapping(address => Will) public wills;
    mapping(address => bool) public hasWill;

    struct Beneficiary {
        address payable walletAddress;
        string name;
        uint256 percentage;
    }

    struct Will {
        address payable testator;
        Beneficiary[] beneficiaries;
        uint256 lastCheckIn;
        uint256 inactivityPeriod;
        address executor;
        bool isActive;
        bool isExecuted;
        string ipfsDocHash;
        uint256 totalEthLocked;
    }

    event WillCreated(address indexed testator, uint256 timestamp);
    event ProofOfLife(address indexed testator, uint256 timestamp);
    event WillExecuted(address indexed testator, address indexed executor, uint256 timestamp);
    event WillRevoked(address indexed testator, uint256 timestamp);
    event BeneficiariesUpdated(address indexed testator, uint256 timestamp);
    event FundsAdded(address indexed testator, uint256 amount);

    modifier onlyTestator(address _testator) {
        require(msg.sender == _testator, "Only testator can call this function");
        _;
    }

    modifier willExists(address _testator) {
        require(hasWill[_testator], "Will does not exist");
        require(wills[_testator].isActive, "Will is not active");
        _;
    }

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

        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            require(_beneficiaries[i].walletAddress != address(0), "Beneficiary address cannot be zero");
            require(_beneficiaries[i].percentage > 0, "Beneficiary percentage must be greater than 0");
            totalPercentage += _beneficiaries[i].percentage;
        }
        require(totalPercentage == 100, "Beneficiary percentages must sum to 100");

        Will storage newWill = wills[msg.sender];
        newWill.testator = payable(msg.sender);
        newWill.lastCheckIn = block.timestamp;
        newWill.inactivityPeriod = _inactivityPeriod;
        newWill.executor = _executor;
        newWill.isActive = true;
        newWill.isExecuted = false;
        newWill.ipfsDocHash = _ipfsHash;
        newWill.totalEthLocked = msg.value;

        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            newWill.beneficiaries.push(_beneficiaries[i]);
        }

        hasWill[msg.sender] = true;
        emit WillCreated(msg.sender, block.timestamp);
    }

    function proofOfLife() external whenNotPaused willExists(msg.sender) {
        wills[msg.sender].lastCheckIn = block.timestamp;
        emit ProofOfLife(msg.sender, block.timestamp);
    }

    function updateBeneficiaries(Beneficiary[] calldata _newBeneficiaries) external whenNotPaused {
        require(hasWill[msg.sender], "Will does not exist");
        require(!wills[msg.sender].isExecuted, "Cannot update executed will");
        require(_newBeneficiaries.length > 0, "At least one beneficiary is required");

        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < _newBeneficiaries.length; i++) {
            require(_newBeneficiaries[i].walletAddress != address(0), "Beneficiary address cannot be zero");
            require(_newBeneficiaries[i].percentage > 0, "Beneficiary percentage must be greater than 0");
            totalPercentage += _newBeneficiaries[i].percentage;
        }
        require(totalPercentage == 100, "Beneficiary percentages must sum to 100");

        delete wills[msg.sender].beneficiaries;

        for (uint256 i = 0; i < _newBeneficiaries.length; i++) {
            wills[msg.sender].beneficiaries.push(_newBeneficiaries[i]);
        }

        emit BeneficiariesUpdated(msg.sender, block.timestamp);
    }

    function addFunds() external payable whenNotPaused willExists(msg.sender) {
        require(msg.value > 0, "Must send ETH to add funds");
        wills[msg.sender].totalEthLocked += msg.value;
        emit FundsAdded(msg.sender, msg.value);
    }

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

        will.isExecuted = true;
        will.isActive = false;

        uint256 totalToDistribute = will.totalEthLocked;
        require(totalToDistribute > 0, "No funds to distribute");

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

    function revokeWill() external nonReentrant whenNotPaused onlyTestator(msg.sender) {
        require(hasWill[msg.sender], "Will does not exist");

        Will storage will = wills[msg.sender];
        uint256 lockedAmount = will.totalEthLocked;

        will.isActive = false;
        will.isExecuted = false;
        will.totalEthLocked = 0;
        hasWill[msg.sender] = false;

        if (lockedAmount > 0) {
            (bool success, ) = will.testator.call{value: lockedAmount}("");
            require(success, "Transfer failed");
        }

        emit WillRevoked(msg.sender, block.timestamp);
    }

    function updateExecutor(address _newExecutor) external whenNotPaused willExists(msg.sender) {
        require(_newExecutor != address(0), "Executor address cannot be zero");
        wills[msg.sender].executor = _newExecutor;
    }

    function getWillDetails(address _testator) external view returns (Will memory) {
        require(hasWill[_testator], "Will does not exist");
        return wills[_testator];
    }

    function getBeneficiaries(address _testator) external view returns (Beneficiary[] memory) {
        require(hasWill[_testator], "Will does not exist");
        return wills[_testator].beneficiaries;
    }

    function isInactivityTriggered(address _testator) external view returns (bool) {
        if (!hasWill[_testator]) return false;
        return block.timestamp >= wills[_testator].lastCheckIn + wills[_testator].inactivityPeriod;
    }

    function getTimeUntilTrigger(address _testator) external view returns (uint256) {
        if (!hasWill[_testator]) return 0;

        Will memory will = wills[_testator];
        uint256 triggerTime = will.lastCheckIn + will.inactivityPeriod;

        if (block.timestamp >= triggerTime) return 0;
        return triggerTime - block.timestamp;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
