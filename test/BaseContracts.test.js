const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BaseLytics Base Contracts", function () {
  let owner, addr1, addr2;
  let baseToken, baseNFT, baseStaking;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy BaseToken
    const BaseToken = await ethers.getContractFactory("BaseToken");
    baseToken = await BaseToken.deploy(
      "Test Token",
      "TEST",
      ethers.parseEther("1000000")
    );

    // Deploy BaseNFT
    const BaseNFT = await ethers.getContractFactory("BaseNFT");
    baseNFT = await BaseNFT.deploy(
      "Test NFT",
      "TNFT",
      "https://test.com/"
    );

    // Deploy BaseStaking
    const BaseStaking = await ethers.getContractFactory("BaseStaking");
    baseStaking = await BaseStaking.deploy(await baseToken.getAddress());
  });

  describe("BaseToken", function () {
    it("Should deploy with correct initial values", async function () {
      expect(await baseToken.name()).to.equal("Test Token");
      expect(await baseToken.symbol()).to.equal("TEST");
      expect(await baseToken.decimals()).to.equal(18);
      expect(await baseToken.totalSupply()).to.equal(ethers.parseEther("1000000"));
      expect(await baseToken.balanceOf(owner.address)).to.equal(ethers.parseEther("1000000"));
    });

    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      await baseToken.mint(addr1.address, mintAmount);
      expect(await baseToken.balanceOf(addr1.address)).to.equal(mintAmount);
    });

    it("Should not allow non-owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      await expect(
        baseToken.connect(addr1).mint(addr1.address, mintAmount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow owner to burn tokens", async function () {
      const burnAmount = ethers.parseEther("1000");
      const initialBalance = await baseToken.balanceOf(owner.address);
      await baseToken.burn(owner.address, burnAmount);
      expect(await baseToken.balanceOf(owner.address)).to.equal(initialBalance - burnAmount);
    });
  });

  describe("BaseNFT", function () {
    it("Should deploy with correct initial values", async function () {
      expect(await baseNFT.name()).to.equal("Test NFT");
      expect(await baseNFT.symbol()).to.equal("TNFT");
      expect(await baseNFT.getCurrentTokenId()).to.equal(0);
      expect(await baseNFT.mintingEnabled()).to.equal(true);
    });

    it("Should allow public minting with correct payment", async function () {
      const price = await baseNFT.PRICE();
      await baseNFT.connect(addr1).mint({ value: price });
      expect(await baseNFT.balanceOf(addr1.address)).to.equal(1);
      expect(await baseNFT.ownerOf(1)).to.equal(addr1.address);
    });

    it("Should not allow minting with insufficient payment", async function () {
      const price = await baseNFT.PRICE();
      await expect(
        baseNFT.connect(addr1).mint({ value: price - 1n })
      ).to.be.revertedWith("BaseNFT: insufficient payment");
    });

    it("Should allow owner to mint without payment", async function () {
      await baseNFT.ownerMint(addr1.address, 5);
      expect(await baseNFT.balanceOf(addr1.address)).to.equal(5);
    });

    it("Should allow owner to pause and unpause", async function () {
      await baseNFT.pause();
      expect(await baseNFT.paused()).to.equal(true);

      const price = await baseNFT.PRICE();
      await expect(
        baseNFT.connect(addr1).mint({ value: price })
      ).to.be.revertedWith("Pausable: paused");

      await baseNFT.unpause();
      expect(await baseNFT.paused()).to.equal(false);
    });
  });

  describe("BaseStaking", function () {
    beforeEach(async function () {
      // Transfer some tokens to addr1 for staking
      await baseToken.transfer(addr1.address, ethers.parseEther("1000"));
      // Approve staking contract to spend tokens
      await baseToken.connect(addr1).approve(await baseStaking.getAddress(), ethers.parseEther("1000"));
    });

    it("Should deploy with correct initial values", async function () {
      expect(await baseStaking.stakingToken()).to.equal(await baseToken.getAddress());
      expect(await baseStaking.totalStaked()).to.equal(0);
      expect(await baseStaking.rewardRate()).to.equal(100); // 1%
    });

    it("Should allow users to stake tokens", async function () {
      const stakeAmount = ethers.parseEther("100");
      await baseStaking.connect(addr1).stake(stakeAmount);
      
      const stakeInfo = await baseStaking.stakes(addr1.address);
      expect(stakeInfo.amount).to.equal(stakeAmount);
      expect(await baseStaking.totalStaked()).to.equal(stakeAmount);
    });

    it("Should allow users to unstake tokens", async function () {
      const stakeAmount = ethers.parseEther("100");
      await baseStaking.connect(addr1).stake(stakeAmount);
      
      const unstakeAmount = ethers.parseEther("50");
      await baseStaking.connect(addr1).unstake(unstakeAmount);
      
      const stakeInfo = await baseStaking.stakes(addr1.address);
      expect(stakeInfo.amount).to.equal(stakeAmount - unstakeAmount);
    });

    it("Should calculate rewards correctly", async function () {
      const stakeAmount = ethers.parseEther("100");
      await baseStaking.connect(addr1).stake(stakeAmount);
      
      // Fast forward time by 1 day
      await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
      await ethers.provider.send("evm_mine");
      
      const reward = await baseStaking.calculateReward(addr1.address);
      expect(reward).to.be.gt(0);
    });

    it("Should allow owner to set reward rate", async function () {
      await baseStaking.setRewardRate(200); // 2%
      expect(await baseStaking.rewardRate()).to.equal(200);
    });

    it("Should not allow setting reward rate too high", async function () {
      await expect(
        baseStaking.setRewardRate(1001) // > 10%
      ).to.be.revertedWith("BaseStaking: reward rate too high");
    });
  });
});