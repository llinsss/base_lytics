const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BalanceTracker Utility Contract", function () {
  let owner, addr1, addr2, addr3;
  let balanceTracker, baseToken, baseToken2;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploy BalanceTracker
    const BalanceTracker = await ethers.getContractFactory("BalanceTracker");
    balanceTracker = await BalanceTracker.deploy();

    // Deploy test tokens
    const BaseToken = await ethers.getContractFactory("BaseToken");
    baseToken = await BaseToken.deploy("Test Token 1", "TT1", ethers.parseEther("1000000"));
    baseToken2 = await BaseToken.deploy("Test Token 2", "TT2", ethers.parseEther("1000000"));

    // Add tokens to supported list
    await balanceTracker.addSupportedToken(await baseToken.getAddress());
    await balanceTracker.addSupportedToken(await baseToken2.getAddress());
  });

  describe("Deployment and Token Management", function () {
    it("Should deploy successfully", async function () {
      expect(await balanceTracker.owner()).to.equal(owner.address);
    });

    it("Should allow owner to add supported tokens", async function () {
      expect(await balanceTracker.supportedTokens(await baseToken.getAddress())).to.be.true;
      expect(await balanceTracker.supportedTokens(await baseToken2.getAddress())).to.be.true;
    });

    it("Should allow owner to remove supported tokens", async function () {
      await balanceTracker.removeSupportedToken(await baseToken.getAddress());
      expect(await balanceTracker.supportedTokens(await baseToken.getAddress())).to.be.false;
    });

    it("Should not allow non-owner to add supported tokens", async function () {
      await expect(
        balanceTracker.connect(addr1).addSupportedToken(addr1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should check if token is supported", async function () {
      expect(await balanceTracker.isTokenSupported(await baseToken.getAddress())).to.be.true;
      expect(await balanceTracker.isTokenSupported(addr1.address)).to.be.false;
    });
  });

  describe("Balance Checking Functions", function () {
    beforeEach(async function () {
      // Transfer some tokens to test addresses
      await baseToken.transfer(addr1.address, ethers.parseEther("1000"));
      await baseToken.transfer(addr2.address, ethers.parseEther("2000"));
    });

    it("Should check balance for supported token", async function () {
      const tokenAddress = await baseToken.getAddress();
      const [balance, lastCheck, totalRecords] = await balanceTracker.checkBalance(tokenAddress, addr1.address);
      
      expect(balance).to.equal(ethers.parseEther("1000"));
      expect(totalRecords).to.equal(1); // Should record the balance check
      expect(lastCheck).to.equal(0); // First check
      
      // Check that lastBalanceCheck was updated
      const newLastCheck = await balanceTracker.lastBalanceCheck(tokenAddress, addr1.address);
      expect(newLastCheck).to.be.gt(0);
    });

    it("Should not check balance for unsupported token", async function () {
      await expect(
        balanceTracker.checkBalance(addr1.address, addr1.address)
      ).to.be.revertedWith("BalanceTracker: token not supported");
    });

    it("Should emit BalanceTracked event", async function () {
      const tokenAddress = await baseToken.getAddress();
      await expect(balanceTracker.checkBalance(tokenAddress, addr1.address))
        .to.emit(balanceTracker, "BalanceTracked")
        .withArgs(tokenAddress, addr1.address, ethers.parseEther("1000"), await balanceTracker.lastBalanceCheck(tokenAddress, addr1.address));
    });

    it("Should check multiple balances for multiple tokens", async function () {
      const tokens = [await baseToken.getAddress(), await baseToken2.getAddress()];
      const accounts = [addr1.address, addr2.address];
      
      const balances = await balanceTracker.checkMultipleBalances(tokens, accounts);
      
      expect(balances.length).to.equal(2); // 2 tokens
      expect(balances[0].length).to.equal(2); // 2 accounts
      expect(balances[0][0]).to.equal(ethers.parseEther("1000")); // addr1 balance for token1
      expect(balances[0][1]).to.equal(ethers.parseEther("2000")); // addr2 balance for token1
    });
  });

  describe("Transaction Tracking", function () {
    beforeEach(async function () {
      await baseToken.transfer(addr1.address, ethers.parseEther("1000"));
    });

    it("Should track transactions", async function () {
      const tokenAddress = await baseToken.getAddress();
      const transferAmount = ethers.parseEther("100");
      
      await expect(
        balanceTracker.trackTransaction(tokenAddress, addr1.address, addr2.address, transferAmount, "Test transfer")
      ).to.emit(balanceTracker, "TransactionTracked")
        .withArgs(tokenAddress, addr1.address, addr2.address, transferAmount, await balanceTracker.lastBalanceCheck(tokenAddress, addr1.address));
    });

    it("Should record balance updates after transaction tracking", async function () {
      const tokenAddress = await baseToken.getAddress();
      
      await balanceTracker.trackTransaction(tokenAddress, addr1.address, addr2.address, ethers.parseEther("100"), "Test transfer");
      
      const senderHistory = await balanceTracker.getBalanceHistory(tokenAddress, addr1.address, 1);
      const receiverHistory = await balanceTracker.getBalanceHistory(tokenAddress, addr2.address, 1);
      
      expect(senderHistory[0].reason).to.equal("Transaction Out: Test transfer");
      expect(receiverHistory[0].reason).to.equal("Transaction In: Test transfer");
    });

    it("Should allow manual balance update recording", async function () {
      const tokenAddress = await baseToken.getAddress();
      
      await balanceTracker.recordBalanceUpdate(tokenAddress, addr1.address, "Manual adjustment");
      
      const history = await balanceTracker.getBalanceHistory(tokenAddress, addr1.address, 1);
      expect(history[0].reason).to.equal("Manual Update: Manual adjustment");
    });
  });

  describe("Balance History Functions", function () {
    beforeEach(async function () {
      const tokenAddress = await baseToken.getAddress();
      
      // Create some transaction history
      await balanceTracker.checkBalance(tokenAddress, addr1.address);
      await baseToken.transfer(addr1.address, ethers.parseEther("1000"));
      await balanceTracker.trackTransaction(tokenAddress, owner.address, addr1.address, ethers.parseEther("1000"), "Transfer");
      await balanceTracker.checkBalance(tokenAddress, addr1.address);
    });

    it("Should return balance history", async function () {
      const tokenAddress = await baseToken.getAddress();
      const history = await balanceTracker.getBalanceHistory(tokenAddress, addr1.address, 0); // Get all
      
      expect(history.length).to.be.gt(0);
      expect(history[0].reason).to.equal("Balance Check"); // Most recent first
    });

    it("Should return limited balance history", async function () {
      const tokenAddress = await baseToken.getAddress();
      const history = await balanceTracker.getBalanceHistory(tokenAddress, addr1.address, 2);
      
      expect(history.length).to.equal(2);
    });

    it("Should get balance at specific timestamp", async function () {
      const tokenAddress = await baseToken.getAddress();
      const currentBalance = await baseToken.balanceOf(addr1.address);
      const currentTime = Math.floor(Date.now() / 1000);
      
      const balanceAtTime = await balanceTracker.getBalanceAt(tokenAddress, addr1.address, currentTime);
      expect(balanceAtTime).to.equal(currentBalance);
    });

    it("Should return 0 for balance before any transactions", async function () {
      const tokenAddress = await baseToken.getAddress();
      const balanceAtTime = await balanceTracker.getBalanceAt(tokenAddress, addr1.address, 0);
      expect(balanceAtTime).to.equal(0);
    });
  });

  describe("Account Statistics", function () {
    beforeEach(async function () {
      const tokenAddress = await baseToken.getAddress();
      
      // Create some activity
      await balanceTracker.checkBalance(tokenAddress, addr1.address);
      await baseToken.transfer(addr1.address, ethers.parseEther("1000"));
      await balanceTracker.trackTransaction(tokenAddress, owner.address, addr1.address, ethers.parseEther("1000"), "Transfer");
    });

    it("Should return account statistics", async function () {
      const tokenAddress = await baseToken.getAddress();
      const [currentBalance, totalRecords, lastActivity, accountAge] = 
        await balanceTracker.getAccountStats(tokenAddress, addr1.address);
      
      expect(currentBalance).to.equal(ethers.parseEther("1000"));
      expect(totalRecords).to.be.gt(0);
      expect(lastActivity).to.be.gt(0);
      expect(accountAge).to.be.gt(0);
    });

    it("Should return zero stats for inactive account", async function () {
      const tokenAddress = await baseToken.getAddress();
      const [currentBalance, totalRecords, lastActivity, accountAge] = 
        await balanceTracker.getAccountStats(tokenAddress, addr3.address);
      
      expect(currentBalance).to.equal(0);
      expect(totalRecords).to.equal(0);
      expect(lastActivity).to.equal(0);
      expect(accountAge).to.equal(0);
    });
  });

  describe("Security and Validation", function () {
    it("Should validate zero addresses", async function () {
      const tokenAddress = await baseToken.getAddress();
      
      await expect(
        balanceTracker.checkBalance(tokenAddress, ethers.ZeroAddress)
      ).to.be.revertedWith("BalanceTracker: cannot check balance for zero address");
      
      await expect(
        balanceTracker.recordBalanceUpdate(tokenAddress, ethers.ZeroAddress, "test")
      ).to.be.revertedWith("BalanceTracker: cannot update balance for zero address");
    });

    it("Should validate token addresses", async function () {
      await expect(
        balanceTracker.addSupportedToken(ethers.ZeroAddress)
      ).to.be.revertedWith("BalanceTracker: invalid token address");
    });

    it("Should handle invalid transaction addresses", async function () {
      const tokenAddress = await baseToken.getAddress();
      
      await expect(
        balanceTracker.trackTransaction(tokenAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.parseEther("100"), "test")
      ).to.be.revertedWith("BalanceTracker: invalid addresses");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle empty balance history", async function () {
      const tokenAddress = await baseToken.getAddress();
      const history = await balanceTracker.getBalanceHistory(tokenAddress, addr3.address, 0);
      expect(history.length).to.equal(0);
    });

    it("Should handle large numbers correctly", async function () {
      const tokenAddress = await baseToken.getAddress();
      const largeAmount = ethers.parseEther("999999999");
      
      await balanceTracker.trackTransaction(tokenAddress, owner.address, addr1.address, largeAmount, "Large transfer");
      
      const history = await balanceTracker.getBalanceHistory(tokenAddress, addr1.address, 1);
      expect(history[0].balance).to.equal(largeAmount);
    });
  });
});
