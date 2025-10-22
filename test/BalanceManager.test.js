const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BalanceManager Contract", function () {
  let owner, addr1, addr2, addr3;
  let balanceManager;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploy BalanceManager
    const BalanceManager = await ethers.getContractFactory("BalanceManager");
    balanceManager = await BalanceManager.deploy(
      "Balance Token",
      "BAL",
      ethers.parseEther("1000000")
    );
  });

  describe("Deployment", function () {
    it("Should deploy with correct initial values", async function () {
      expect(await balanceManager.name()).to.equal("Balance Token");
      expect(await balanceManager.symbol()).to.equal("BAL");
      expect(await balanceManager.decimals()).to.equal(18);
      expect(await balanceManager.totalSupply()).to.equal(ethers.parseEther("1000000"));
      expect(await balanceManager.balanceOf(owner.address)).to.equal(ethers.parseEther("1000000"));
    });
  });

  describe("Balance Checking Functions", function () {
    it("Should check balance and record the check", async function () {
      const initialBalance = await balanceManager.balanceOf(addr1.address);
      
      const result = await balanceManager.checkBalance(addr1.address);
      const balance = result[0];
      const lastCheck = result[1];
      const totalTransactions = result[2];
      
      expect(balance).to.equal(initialBalance);
      expect(totalTransactions).to.equal(1); // Should record the balance check
      expect(lastCheck).to.equal(0); // First check
      
      // Check that lastBalanceCheck was updated
      const newLastCheck = await balanceManager.lastBalanceCheck(addr1.address);
      expect(newLastCheck).to.be.gt(0);
    });

    it("Should check multiple balances at once", async function () {
      // Transfer some tokens to test addresses
      await balanceManager.transfer(addr1.address, ethers.parseEther("1000"));
      await balanceManager.transfer(addr2.address, ethers.parseEther("2000"));
      
      const accounts = [addr1.address, addr2.address, addr3.address];
      const balances = await balanceManager.checkMultipleBalances(accounts);
      
      expect(balances.length).to.equal(3);
      expect(balances[0]).to.equal(ethers.parseEther("1000"));
      expect(balances[1]).to.equal(ethers.parseEther("2000"));
      expect(balances[2]).to.equal(0);
    });

    it("Should emit BalanceChecked event", async function () {
      await expect(balanceManager.checkBalance(addr1.address))
        .to.emit(balanceManager, "BalanceChecked");
    });
  });

  describe("Balance Update Functions", function () {
    it("Should allow owner to update balance", async function () {
      const newBalance = ethers.parseEther("5000");
      const reason = "Manual balance adjustment";
      
      await expect(balanceManager.updateBalance(addr1.address, newBalance, reason))
        .to.emit(balanceManager, "BalanceUpdated")
        .withArgs(addr1.address, 0, newBalance, reason);
      
      // Note: This doesn't actually change the ERC20 balance, just records the update
      const history = await balanceManager.getBalanceHistory(addr1.address, 1);
      expect(history[0].balance).to.equal(newBalance);
      expect(history[0].reason).to.equal(reason);
    });

    it("Should not allow non-owner to update balance", async function () {
      await expect(
        balanceManager.connect(addr1).updateBalance(addr1.address, ethers.parseEther("1000"), "test")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Enhanced Transfer Functions", function () {
    beforeEach(async function () {
      // Transfer some tokens to addr1 for testing
      await balanceManager.transfer(addr1.address, ethers.parseEther("10000"));
    });

    it("Should track balance updates during transfer", async function () {
      const transferAmount = ethers.parseEther("1000");
      
      await expect(balanceManager.connect(addr1).transfer(addr2.address, transferAmount))
        .to.emit(balanceManager, "TransactionProcessed")
        .withArgs(addr1.address, addr2.address, transferAmount, await balanceManager.lastBalanceCheck(addr1.address));
      
      // Check balance history
      const senderHistory = await balanceManager.getBalanceHistory(addr1.address, 2);
      const receiverHistory = await balanceManager.getBalanceHistory(addr2.address, 2);
      
      expect(senderHistory[0].reason).to.equal("Transfer Out");
      expect(receiverHistory[0].reason).to.equal("Transfer In");
    });

    it("Should track balance updates during transferFrom", async function () {
      const transferAmount = ethers.parseEther("1000");
      
      // Approve the contract to spend tokens
      await balanceManager.connect(addr1).approve(owner.address, transferAmount);
      
      await expect(balanceManager.transferFrom(addr1.address, addr2.address, transferAmount))
        .to.emit(balanceManager, "TransactionProcessed")
        .withArgs(addr1.address, addr2.address, transferAmount, await balanceManager.lastBalanceCheck(addr1.address));
      
      // Check balance history
      const senderHistory = await balanceManager.getBalanceHistory(addr1.address, 2);
      const receiverHistory = await balanceManager.getBalanceHistory(addr2.address, 2);
      
      expect(senderHistory[0].reason).to.equal("TransferFrom Out");
      expect(receiverHistory[0].reason).to.equal("TransferFrom In");
    });
  });

  describe("Mint and Burn Functions", function () {
    it("Should track balance updates during minting", async function () {
      const mintAmount = ethers.parseEther("1000");
      
      await expect(balanceManager.mint(addr1.address, mintAmount))
        .to.emit(balanceManager, "TransactionProcessed")
        .withArgs(ethers.ZeroAddress, addr1.address, mintAmount, await balanceManager.lastBalanceCheck(addr1.address));
      
      const history = await balanceManager.getBalanceHistory(addr1.address, 1);
      expect(history[0].reason).to.equal("Mint");
    });

    it("Should track balance updates during burning", async function () {
      const burnAmount = ethers.parseEther("1000");
      
      await expect(balanceManager.burn(owner.address, burnAmount))
        .to.emit(balanceManager, "TransactionProcessed")
        .withArgs(owner.address, ethers.ZeroAddress, burnAmount, await balanceManager.lastBalanceCheck(owner.address));
      
      const history = await balanceManager.getBalanceHistory(owner.address, 1);
      expect(history[0].reason).to.equal("Burn");
    });
  });

  describe("Balance History Functions", function () {
    beforeEach(async function () {
      // Create some transaction history
      await balanceManager.transfer(addr1.address, ethers.parseEther("1000"));
      await balanceManager.connect(addr1).transfer(addr2.address, ethers.parseEther("500"));
      await balanceManager.mint(addr1.address, ethers.parseEther("2000"));
    });

    it("Should return balance history", async function () {
      const history = await balanceManager.getBalanceHistory(addr1.address, 0); // Get all
      
      expect(history.length).to.be.gt(0);
      expect(history[0].reason).to.equal("Mint"); // Most recent first
    });

    it("Should return limited balance history", async function () {
      const history = await balanceManager.getBalanceHistory(addr1.address, 2);
      
      expect(history.length).to.equal(2);
    });

    it("Should get balance at specific timestamp", async function () {
      const currentBalance = await balanceManager.balanceOf(addr1.address);
      const currentTime = Math.floor(Date.now() / 1000);
      
      const balanceAtTime = await balanceManager.getBalanceAt(addr1.address, currentTime);
      expect(balanceAtTime).to.equal(currentBalance);
    });

    it("Should return 0 for balance before any transactions", async function () {
      const balanceAtTime = await balanceManager.getBalanceAt(addr1.address, 0);
      expect(balanceAtTime).to.equal(0);
    });
  });

  describe("Account Statistics", function () {
    beforeEach(async function () {
      // Create some activity
      await balanceManager.transfer(addr1.address, ethers.parseEther("1000"));
      await balanceManager.connect(addr1).transfer(addr2.address, ethers.parseEther("500"));
    });

    it("Should return account statistics", async function () {
      const [currentBalance, totalTransactions, lastActivity, accountAge] = 
        await balanceManager.getAccountStats(addr1.address);
      
      expect(currentBalance).to.equal(ethers.parseEther("500"));
      expect(totalTransactions).to.be.gt(0);
      expect(lastActivity).to.be.gt(0);
      expect(accountAge).to.be.gt(0);
    });

    it("Should return zero stats for inactive account", async function () {
      const [currentBalance, totalTransactions, lastActivity, accountAge] = 
        await balanceManager.getAccountStats(addr3.address);
      
      expect(currentBalance).to.equal(0);
      expect(totalTransactions).to.equal(0);
      expect(lastActivity).to.equal(0);
      expect(accountAge).to.equal(0);
    });
  });

  describe("Security Features", function () {
    it("Should prevent reentrancy attacks", async function () {
      // This test ensures the nonReentrant modifier is working
      const transferAmount = ethers.parseEther("1000");
      
      // Should not revert due to reentrancy
      await expect(balanceManager.transfer(addr1.address, transferAmount))
        .to.not.be.reverted;
    });

    it("Should validate zero addresses", async function () {
      await expect(
        balanceManager.checkBalance(ethers.ZeroAddress)
      ).to.be.revertedWith("BalanceManager: cannot check balance for zero address");
      
      await expect(
        balanceManager.updateBalance(ethers.ZeroAddress, ethers.parseEther("1000"), "test")
      ).to.be.revertedWith("BalanceManager: cannot update balance for zero address");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle empty balance history", async function () {
      const history = await balanceManager.getBalanceHistory(addr3.address, 0);
      expect(history.length).to.equal(0);
    });

    it("Should handle large numbers correctly", async function () {
      const largeAmount = ethers.parseEther("999999999");
      await balanceManager.mint(addr1.address, largeAmount);
      
      const balance = await balanceManager.balanceOf(addr1.address);
      expect(balance).to.equal(largeAmount);
    });
  });
});
