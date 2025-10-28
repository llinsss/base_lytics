const { expect } = require("chai");
const { ethers } = require("hardhat");
const TestHelper = require("../helpers/TestHelper");

describe("Contract Integration Tests", function () {
  let baseToken, baseNFT, baseStaking, owner, addr1, addr2;

  beforeEach(async function () {
    const deployment = await TestHelper.deployContracts();
    ({ baseToken, baseNFT, baseStaking } = deployment.contracts);
    ({ owner, addr1, addr2 } = deployment.signers);
    
    await TestHelper.setupTokenBalances(baseToken, deployment.signers);
  });

  describe("Token + Staking Integration", function () {
    it("Should allow staking and earning rewards", async function () {
      // Setup approvals
      await baseToken.connect(addr1).approve(await baseStaking.getAddress(), ethers.parseEther("1000"));
      
      // Stake tokens
      await baseStaking.connect(addr1).stake(ethers.parseEther("100"));
      
      // Fast forward time
      await TestHelper.timeTravel(86400 * 7); // 1 week
      
      // Check rewards
      const reward = await baseStaking.calculateReward(addr1.address);
      expect(reward).to.be.gt(0);
      
      // Claim rewards (if implemented)
      const initialBalance = await baseToken.balanceOf(addr1.address);
      await baseStaking.connect(addr1).claimReward();
      const finalBalance = await baseToken.balanceOf(addr1.address);
      
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should handle staking while minting new tokens", async function () {
      await baseToken.connect(addr1).approve(await baseStaking.getAddress(), ethers.parseEther("1000"));
      await baseStaking.connect(addr1).stake(ethers.parseEther("100"));
      
      // Mint new tokens to increase supply
      await baseToken.mint(addr2.address, ethers.parseEther("10000"));
      
      // Staking should still work normally
      const stake = await baseStaking.stakes(addr1.address);
      expect(stake.amount).to.equal(ethers.parseEther("100"));
    });
  });

  describe("NFT + Token Integration", function () {
    it("Should mint NFT with ETH payment", async function () {
      const price = await baseNFT.PRICE();
      
      await baseNFT.connect(addr1).mint({ value: price });
      
      expect(await baseNFT.balanceOf(addr1.address)).to.equal(1);
      expect(await baseNFT.ownerOf(1)).to.equal(addr1.address);
    });

    it("Should handle batch NFT minting", async function () {
      await baseNFT.ownerMint(addr1.address, 5);
      
      expect(await baseNFT.balanceOf(addr1.address)).to.equal(5);
      
      // Check all token IDs
      for (let i = 1; i <= 5; i++) {
        expect(await baseNFT.ownerOf(i)).to.equal(addr1.address);
      }
    });
  });

  describe("Multi-Contract Scenarios", function () {
    it("Should handle complex user journey", async function () {
      // 1. User gets tokens
      const userTokens = ethers.parseEther("1000");
      expect(await baseToken.balanceOf(addr1.address)).to.equal(userTokens);
      
      // 2. User stakes half their tokens
      await baseToken.connect(addr1).approve(await baseStaking.getAddress(), userTokens);
      await baseStaking.connect(addr1).stake(ethers.parseEther("500"));
      
      // 3. User mints NFT
      const nftPrice = await baseNFT.PRICE();
      await baseNFT.connect(addr1).mint({ value: nftPrice });
      
      // 4. Time passes, user earns rewards
      await TestHelper.timeTravel(86400 * 30); // 30 days
      
      // 5. User claims rewards
      const reward = await baseStaking.calculateReward(addr1.address);
      expect(reward).to.be.gt(0);
      
      // 6. User unstakes
      await baseStaking.connect(addr1).unstake(ethers.parseEther("250"));
      
      // Verify final state
      expect(await baseToken.balanceOf(addr1.address)).to.be.gt(ethers.parseEther("750"));
      expect(await baseNFT.balanceOf(addr1.address)).to.equal(1);
      
      const finalStake = await baseStaking.stakes(addr1.address);
      expect(finalStake.amount).to.equal(ethers.parseEther("250"));
    });
  });

  describe("Gas Efficiency", function () {
    it("Should track gas for complex operations", async function () {
      const approveTx = await baseToken.connect(addr1).approve(await baseStaking.getAddress(), ethers.parseEther("1000"));
      const approveGas = await TestHelper.getGasUsed(approveTx);
      
      const stakeTx = await baseStaking.connect(addr1).stake(ethers.parseEther("100"));
      const stakeGas = await TestHelper.getGasUsed(stakeTx);
      
      console.log(`      Approve + Stake total gas: ${TestHelper.formatGas(approveGas + stakeGas)}`);
      
      expect(approveGas + stakeGas).to.be.lt(200000);
    });
  });
});