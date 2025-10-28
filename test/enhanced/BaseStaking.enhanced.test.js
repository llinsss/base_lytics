const { expect } = require("chai");
const { ethers } = require("hardhat");
const TestHelper = require("../helpers/TestHelper");

describe("BaseStaking - Enhanced Tests", function () {
  let baseToken, baseStaking, owner, addr1, addr2, addr3;

  beforeEach(async function () {
    const deployment = await TestHelper.deployContracts();
    ({ baseToken, baseStaking } = deployment.contracts);
    ({ owner, addr1, addr2, addr3 } = deployment.signers);
    
    await TestHelper.setupTokenBalances(baseToken, deployment.signers);
    
    // Approve staking contract
    await baseToken.connect(addr1).approve(await baseStaking.getAddress(), ethers.parseEther("1000"));
    await baseToken.connect(addr2).approve(await baseStaking.getAddress(), ethers.parseEther("1000"));
  });

  describe("Staking Mechanics", function () {
    it("Should handle multiple users staking", async function () {
      await baseStaking.connect(addr1).stake(ethers.parseEther("100"));
      await baseStaking.connect(addr2).stake(ethers.parseEther("200"));
      
      expect(await baseStaking.totalStaked()).to.equal(ethers.parseEther("300"));
      
      const stake1 = await baseStaking.stakes(addr1.address);
      const stake2 = await baseStaking.stakes(addr2.address);
      
      expect(stake1.amount).to.equal(ethers.parseEther("100"));
      expect(stake2.amount).to.equal(ethers.parseEther("200"));
    });

    it("Should calculate rewards over time", async function () {
      await baseStaking.connect(addr1).stake(ethers.parseEther("100"));
      
      // Fast forward 1 day
      await TestHelper.timeTravel(86400);
      
      const reward = await baseStaking.calculateReward(addr1.address);
      expect(reward).to.be.gt(0);
      
      // Fast forward another day
      await TestHelper.timeTravel(86400);
      
      const reward2 = await baseStaking.calculateReward(addr1.address);
      expect(reward2).to.be.gt(reward);
    });

    it("Should handle partial unstaking", async function () {
      await baseStaking.connect(addr1).stake(ethers.parseEther("100"));
      
      await TestHelper.timeTravel(86400);
      
      await baseStaking.connect(addr1).unstake(ethers.parseEther("30"));
      
      const stake = await baseStaking.stakes(addr1.address);
      expect(stake.amount).to.equal(ethers.parseEther("70"));
    });
  });

  describe("Reward System", function () {
    it("Should distribute rewards proportionally", async function () {
      await baseStaking.connect(addr1).stake(ethers.parseEther("100"));
      await baseStaking.connect(addr2).stake(ethers.parseEther("200"));
      
      await TestHelper.timeTravel(86400);
      
      const reward1 = await baseStaking.calculateReward(addr1.address);
      const reward2 = await baseStaking.calculateReward(addr2.address);
      
      // addr2 staked 2x more, should get ~2x rewards
      expect(reward2).to.be.closeTo(reward1 * 2n, ethers.parseEther("0.1"));
    });

    it("Should handle reward rate changes", async function () {
      await baseStaking.connect(addr1).stake(ethers.parseEther("100"));
      
      await TestHelper.timeTravel(86400);
      const reward1 = await baseStaking.calculateReward(addr1.address);
      
      await baseStaking.setRewardRate(200); // Double the rate
      
      await TestHelper.timeTravel(86400);
      const reward2 = await baseStaking.calculateReward(addr1.address);
      
      expect(reward2).to.be.gt(reward1);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero staking", async function () {
      await expect(
        baseStaking.connect(addr1).stake(0)
      ).to.be.revertedWith("BaseStaking: amount must be greater than 0");
    });

    it("Should handle unstaking more than staked", async function () {
      await baseStaking.connect(addr1).stake(ethers.parseEther("100"));
      
      await expect(
        baseStaking.connect(addr1).unstake(ethers.parseEther("200"))
      ).to.be.revertedWith("BaseStaking: insufficient staked amount");
    });

    it("Should handle emergency withdrawal", async function () {
      await baseStaking.connect(addr1).stake(ethers.parseEther("100"));
      
      await baseStaking.emergencyWithdraw();
      
      const stake = await baseStaking.stakes(addr1.address);
      expect(stake.amount).to.equal(0);
    });
  });

  describe("Gas Optimization", function () {
    it("Should track gas for staking operations", async function () {
      const stakeTx = await baseStaking.connect(addr1).stake(ethers.parseEther("100"));
      const stakeGas = await TestHelper.getGasUsed(stakeTx);
      console.log(`      Stake gas usage: ${TestHelper.formatGas(stakeGas)}`);
      
      const unstakeTx = await baseStaking.connect(addr1).unstake(ethers.parseEther("50"));
      const unstakeGas = await TestHelper.getGasUsed(unstakeTx);
      console.log(`      Unstake gas usage: ${TestHelper.formatGas(unstakeGas)}`);
      
      expect(stakeGas).to.be.lt(150000);
      expect(unstakeGas).to.be.lt(100000);
    });
  });
});