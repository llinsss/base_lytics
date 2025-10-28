const { expect } = require("chai");
const { ethers } = require("hardhat");
const TestHelper = require("../helpers/TestHelper");

describe("Security Tests", function () {
  let baseToken, baseNFT, baseStaking, owner, addr1, addr2, attacker;

  beforeEach(async function () {
    const deployment = await TestHelper.deployContracts();
    ({ baseToken, baseNFT, baseStaking } = deployment.contracts);
    ({ owner, addr1, addr2 } = deployment.signers);
    [,,, attacker] = await ethers.getSigners();
    
    await TestHelper.setupTokenBalances(baseToken, deployment.signers);
  });

  describe("Access Control Attacks", function () {
    it("Should prevent unauthorized minting", async function () {
      await expect(
        baseToken.connect(attacker).mint(attacker.address, ethers.parseEther("1000000"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should prevent unauthorized NFT functions", async function () {
      await expect(
        baseNFT.connect(attacker).ownerMint(attacker.address, 10)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      
      await expect(
        baseNFT.connect(attacker).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should prevent unauthorized staking changes", async function () {
      await expect(
        baseStaking.connect(attacker).setRewardRate(1000)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Integer Overflow Protection", function () {
    it("Should handle large numbers safely", async function () {
      const maxUint256 = ethers.MaxUint256;
      
      await expect(
        baseToken.mint(addr1.address, maxUint256)
      ).to.be.revertedWith("BaseToken: max supply exceeded");
    });

    it("Should prevent underflow in unstaking", async function () {
      await baseToken.connect(addr1).approve(await baseStaking.getAddress(), ethers.parseEther("100"));
      await baseStaking.connect(addr1).stake(ethers.parseEther("100"));
      
      await expect(
        baseStaking.connect(addr1).unstake(ethers.parseEther("200"))
      ).to.be.revertedWith("BaseStaking: insufficient staked amount");
    });
  });

  describe("Pausable Security", function () {
    it("Should prevent operations when paused", async function () {
      await baseNFT.pause();
      
      const price = await baseNFT.PRICE();
      await expect(
        baseNFT.connect(addr1).mint({ value: price })
      ).to.be.revertedWith("Pausable: paused");
      
      await baseNFT.unpause();
      
      await baseNFT.connect(addr1).mint({ value: price });
      expect(await baseNFT.balanceOf(addr1.address)).to.equal(1);
    });
  });
});