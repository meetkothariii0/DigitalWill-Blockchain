const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DigitalWill Contract", () => {
  let digitalWill;
  let owner, testator, executor, beneficiary1, beneficiary2, other;

  beforeEach(async () => {
    [owner, testator, executor, beneficiary1, beneficiary2, other] = await ethers.getSigners();

    const DigitalWill = await ethers.getContractFactory("DigitalWill");
    digitalWill = await DigitalWill.deploy();
    await digitalWill.waitForDeployment();
  });

  describe("Creating a Will", () => {
    it("Should create a will with valid beneficiaries", async () => {
      const beneficiaries = [
        {
          walletAddress: beneficiary1.address,
          name: "Beneficiary One",
          percentage: 60,
        },
        {
          walletAddress: beneficiary2.address,
          name: "Beneficiary Two",
          percentage: 40,
        },
      ];

      const inactivityPeriod = 365 * 24 * 60 * 60; // 365 days
      const ethAmount = ethers.parseEther("10");

      const tx = await digitalWill
        .connect(testator)
        .createWill(beneficiaries, inactivityPeriod, executor.address, "QmTest123", {
          value: ethAmount,
        });

      await expect(tx).to.emit(digitalWill, "WillCreated").withArgs(testator.address, expect.any(Number));

      expect(await digitalWill.hasWill(testator.address)).to.be.true;

      const will = await digitalWill.getWillDetails(testator.address);
      expect(will.testator).to.equal(testator.address);
      expect(will.totalEthLocked).to.equal(ethAmount);
      expect(will.isActive).to.be.true;
      expect(will.isExecuted).to.be.false;
      expect(will.executor).to.equal(executor.address);
    });

    it("Should fail if beneficiary percentages don't sum to 100", async () => {
      const beneficiaries = [
        {
          walletAddress: beneficiary1.address,
          name: "Beneficiary One",
          percentage: 50,
        },
        {
          walletAddress: beneficiary2.address,
          name: "Beneficiary Two",
          percentage: 40,
        }, // total = 90, not 100
      ];

      const inactivityPeriod = 365 * 24 * 60 * 60;

      await expect(
        digitalWill
          .connect(testator)
          .createWill(beneficiaries, inactivityPeriod, executor.address, "QmTest123", {
            value: ethers.parseEther("10"),
          })
      ).to.be.revertedWith("Beneficiary percentages must sum to 100");
    });

    it("Should fail if no beneficiaries provided", async () => {
      const beneficiaries = [];
      const inactivityPeriod = 365 * 24 * 60 * 60;

      await expect(
        digitalWill
          .connect(testator)
          .createWill(beneficiaries, inactivityPeriod, executor.address, "QmTest123", {
            value: ethers.parseEther("10"),
          })
      ).to.be.revertedWith("At least one beneficiary is required");
    });

    it("Should fail if user already has a will", async () => {
      const beneficiaries = [
        {
          walletAddress: beneficiary1.address,
          name: "Beneficiary One",
          percentage: 100,
        },
      ];

      const inactivityPeriod = 365 * 24 * 60 * 60;

      await digitalWill
        .connect(testator)
        .createWill(beneficiaries, inactivityPeriod, executor.address, "QmTest123", {
          value: ethers.parseEther("10"),
        });

      await expect(
        digitalWill
          .connect(testator)
          .createWill(beneficiaries, inactivityPeriod, executor.address, "QmTest123", {
            value: ethers.parseEther("5"),
          })
      ).to.be.revertedWith("You already have a will");
    });
  });

  describe("Proof of Life", () => {
    beforeEach(async () => {
      const beneficiaries = [
        {
          walletAddress: beneficiary1.address,
          name: "Beneficiary One",
          percentage: 100,
        },
      ];

      const inactivityPeriod = 365 * 24 * 60 * 60;

      await digitalWill
        .connect(testator)
        .createWill(beneficiaries, inactivityPeriod, executor.address, "QmTest123", {
          value: ethers.parseEther("10"),
        });
    });

    it("Should update lastCheckIn on proof of life", async () => {
      const will1 = await digitalWill.getWillDetails(testator.address);
      const firstCheckIn = will1.lastCheckIn;

      // Increase time by 30 days
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await digitalWill.connect(testator).proofOfLife();

      const will2 = await digitalWill.getWillDetails(testator.address);
      expect(will2.lastCheckIn).to.be.greaterThan(firstCheckIn);
    });

    it("Should emit ProofOfLife event", async () => {
      const tx = await digitalWill.connect(testator).proofOfLife();
      await expect(tx).to.emit(digitalWill, "ProofOfLife").withArgs(testator.address, expect.any(Number));
    });

    it("Should only allow testator to ping proof of life", async () => {
      await expect(digitalWill.connect(other).proofOfLife()).to.be.revertedWith(
        "Will does not exist"
      );
    });
  });

  describe("Adding Funds", () => {
    beforeEach(async () => {
      const beneficiaries = [
        {
          walletAddress: beneficiary1.address,
          name: "Beneficiary One",
          percentage: 100,
        },
      ];

      const inactivityPeriod = 365 * 24 * 60 * 60;

      await digitalWill
        .connect(testator)
        .createWill(beneficiaries, inactivityPeriod, executor.address, "QmTest123", {
          value: ethers.parseEther("10"),
        });
    });

    it("Should add funds to a will", async () => {
      const addAmount = ethers.parseEther("5");
      const tx = await digitalWill.connect(testator).addFunds({ value: addAmount });

      await expect(tx).to.emit(digitalWill, "FundsAdded").withArgs(testator.address, addAmount);

      const will = await digitalWill.getWillDetails(testator.address);
      expect(will.totalEthLocked).to.equal(ethers.parseEther("15"));
    });
  });

  describe("Executing Will", () => {
    beforeEach(async () => {
      const beneficiaries = [
        {
          walletAddress: beneficiary1.address,
          name: "Beneficiary One",
          percentage: 60,
        },
        {
          walletAddress: beneficiary2.address,
          name: "Beneficiary Two",
          percentage: 40,
        },
      ];

      const inactivityPeriod = 365 * 24 * 60 * 60;

      await digitalWill
        .connect(testator)
        .createWill(beneficiaries, inactivityPeriod, executor.address, "QmTest123", {
          value: ethers.parseEther("10"),
        });
    });

    it("Should prevent execution before inactivity period passes", async () => {
      await expect(digitalWill.connect(executor).executeWill(testator.address)).to.be.revertedWith(
        "Inactivity period has not passed"
      );
    });

    it("Should execute will after inactivity period passes", async () => {
      // Increase time by 365 days + 1 second
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine");

      const beneficiary1BalanceBefore = await ethers.provider.getBalance(beneficiary1.address);
      const beneficiary2BalanceBefore = await ethers.provider.getBalance(beneficiary2.address);

      const tx = await digitalWill.connect(executor).executeWill(testator.address);

      await expect(tx)
        .to.emit(digitalWill, "WillExecuted")
        .withArgs(testator.address, executor.address, expect.any(Number));

      const will = await digitalWill.getWillDetails(testator.address);
      expect(will.isExecuted).to.be.true;
      expect(will.isActive).to.be.false;
      expect(will.totalEthLocked).to.equal(0);

      // Check beneficiary received funds (60% and 40% of 10 ETH)
      const beneficiary1BalanceAfter = await ethers.provider.getBalance(beneficiary1.address);
      const beneficiary2BalanceAfter = await ethers.provider.getBalance(beneficiary2.address);

      expect(beneficiary1BalanceAfter - beneficiary1BalanceBefore).to.equal(ethers.parseEther("6"));
      expect(beneficiary2BalanceAfter - beneficiary2BalanceBefore).to.equal(ethers.parseEther("4"));
    });

    it("Should prevent double execution", async () => {
      // Increase time by 365 days + 1 second
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine");

      await digitalWill.connect(executor).executeWill(testator.address);

      // Try to execute again
      await expect(digitalWill.connect(executor).executeWill(testator.address)).to.be.revertedWith(
        "Will has already been executed"
      );
    });
  });

  describe("Revoking Will", () => {
    beforeEach(async () => {
      const beneficiaries = [
        {
          walletAddress: beneficiary1.address,
          name: "Beneficiary One",
          percentage: 100,
        },
      ];

      const inactivityPeriod = 365 * 24 * 60 * 60;

      await digitalWill
        .connect(testator)
        .createWill(beneficiaries, inactivityPeriod, executor.address, "QmTest123", {
          value: ethers.parseEther("10"),
        });
    });

    it("Should revoke a will and return funds", async () => {
      const testatorBalanceBefore = await ethers.provider.getBalance(testator.address);

      const tx = await digitalWill.connect(testator).revokeWill();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      await expect(tx).to.emit(digitalWill, "WillRevoked").withArgs(testator.address, expect.any(Number));

      expect(await digitalWill.hasWill(testator.address)).to.be.false;

      const testatorBalanceAfter = await ethers.provider.getBalance(testator.address);
      const expectedBalance = testatorBalanceBefore + ethers.parseEther("10") - gasUsed;
      expect(testatorBalanceAfter).to.closeTo(expectedBalance, ethers.parseEther("0.001"));
    });
  });

  describe("Updating Beneficiaries", () => {
    beforeEach(async () => {
      const beneficiaries = [
        {
          walletAddress: beneficiary1.address,
          name: "Beneficiary One",
          percentage: 100,
        },
      ];

      const inactivityPeriod = 365 * 24 * 60 * 60;

      await digitalWill
        .connect(testator)
        .createWill(beneficiaries, inactivityPeriod, executor.address, "QmTest123", {
          value: ethers.parseEther("10"),
        });
    });

    it("Should update beneficiaries", async () => {
      const newBeneficiaries = [
        {
          walletAddress: beneficiary1.address,
          name: "Beneficiary One Updated",
          percentage: 50,
        },
        {
          walletAddress: beneficiary2.address,
          name: "Beneficiary Two New",
          percentage: 50,
        },
      ];

      const tx = await digitalWill.connect(testator).updateBeneficiaries(newBeneficiaries);

      await expect(tx)
        .to.emit(digitalWill, "BeneficiariesUpdated")
        .withArgs(testator.address, expect.any(Number));

      const beneficiaries = await digitalWill.getBeneficiaries(testator.address);
      expect(beneficiaries.length).to.equal(2);
      expect(beneficiaries[0].percentage).to.equal(50);
      expect(beneficiaries[1].percentage).to.equal(50);
    });

    it("Should fail if percentages don't sum to 100", async () => {
      const newBeneficiaries = [
        {
          walletAddress: beneficiary1.address,
          name: "Beneficiary One",
          percentage: 50,
        },
        {
          walletAddress: beneficiary2.address,
          name: "Beneficiary Two",
          percentage: 30,
        },
      ];

      await expect(
        digitalWill.connect(testator).updateBeneficiaries(newBeneficiaries)
      ).to.be.revertedWith("Beneficiary percentages must sum to 100");
    });

    it("Should prevent updating executed will", async () => {
      // Increase time by 365 days + 1 second
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine");

      await digitalWill.connect(executor).executeWill(testator.address);

      const newBeneficiaries = [
        {
          walletAddress: beneficiary1.address,
          name: "Beneficiary One",
          percentage: 100,
        },
      ];

      await expect(
        digitalWill.connect(testator).updateBeneficiaries(newBeneficiaries)
      ).to.be.revertedWith("Cannot update executed will");
    });
  });

  describe("Utility Functions", () => {
    beforeEach(async () => {
      const beneficiaries = [
        {
          walletAddress: beneficiary1.address,
          name: "Beneficiary One",
          percentage: 100,
        },
      ];

      const inactivityPeriod = 365 * 24 * 60 * 60;

      await digitalWill
        .connect(testator)
        .createWill(beneficiaries, inactivityPeriod, executor.address, "QmTest123", {
          value: ethers.parseEther("10"),
        });
    });

    it("Should return false for isInactivityTriggered before period passes", async () => {
      const triggered = await digitalWill.isInactivityTriggered(testator.address);
      expect(triggered).to.be.false;
    });

    it("Should return true for isInactivityTriggered after period passes", async () => {
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine");

      const triggered = await digitalWill.isInactivityTriggered(testator.address);
      expect(triggered).to.be.true;
    });

    it("Should return correct time until trigger", async () => {
      const timeRemaining = await digitalWill.getTimeUntilTrigger(testator.address);
      expect(timeRemaining).to.be.closeTo(365 * 24 * 60 * 60, 10);
    });
  });
});
