const { expect } = require("chai");
const { ethers } = require("hardhat");
const TestHelper = require("../helpers/TestHelper");

describe("BaseToken - Enhanced Tests", function () {
  let baseToken, owner, addr1, addr2, addr3;

  beforeEach(async function () {
    const deployment = await TestHelper.deployContracts();
    baseToken = deployment.contracts.baseToken;
    ({ owner, addr1, addr2, addr3 } = deployment.signers);
  });

  describe("Gas Optimization Tests", function () {
    it("Should track gas usage for minting", async function () {
      const tx = await baseToken.mint(addr1.address, ethers.parseEther("1000"));
      const gasUsed = await TestHelper.getGasUsed(tx);
      console.log(`      Mint gas usage: ${TestHelper.formatGas(gasUsed)}`);
      expect(gasUsed).to.be.lt(100000); // Should be under 100k gas
    });

    it("Should track gas usage for transfers", async function () {
      const tx = await baseToken.transfer(addr1.address, ethers.parseEther("1000"));
      const gasUsed = await TestHelper.getGasUsed(tx);
      console.log(`      Transfer gas usage: ${TestHelper.formatGas(gasUsed)}`);
      expect(gasUsed).to.be.lt(60000); // Should be under 60k gas
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero amount transfers", async function () {
      await expect(baseToken.transfer(addr1.address, 0))
        .to.not.be.reverted;
    });

    it("Should handle maximum supply correctly", async function () {
      const maxSupply = await baseToken.maxSupply();
      const currentSupply = await baseToken.totalSupply();
      const remainingMintable = maxSupply - currentSupply;
      
      await baseToken.mint(addr1.address, remainingMintable);
      
      await expect(
        baseToken.mint(addr1.address, 1)
      ).to.be.revertedWith("BaseToken: max supply exceeded");
    });

    it("Should prevent burning more than balance", async function () {
      const balance = await baseToken.balanceOf(owner.address);
      await expect(
        baseToken.burn(owner.address, balance + 1n)
      ).to.be.revertedWith("ERC20: burn amount exceeds balance");
    });
  });

  describe("Access Control", function () {
    it("Should prevent non-owner from minting", async function () {
      await expect(
        baseToken.connect(addr1).mint(addr1.address, ethers.parseEther("1000"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow ownership transfer", async function () {
      await baseToken.transferOwnership(addr1.address);
      expect(await baseToken.owner()).to.equal(addr1.address);
      
      // New owner should be able to mint
      await baseToken.connect(addr1).mint(addr2.address, ethers.parseEther("1000"));
      expect(await baseToken.balanceOf(addr2.address)).to.equal(ethers.parseEther("1000"));
    });
  });

  describe("Events", function () {
    it("Should emit Transfer events correctly", async function () {
      await expect(baseToken.transfer(addr1.address, ethers.parseEther("1000")))
        .to.emit(baseToken, "Transfer")
        .withArgs(owner.address, addr1.address, ethers.parseEther("1000"));
    });

    it("Should emit Mint events correctly", async function () {
      await expect(baseToken.mint(addr1.address, ethers.parseEther("1000")))
        .to.emit(baseToken, "Transfer")
        .withArgs(ethers.ZeroAddress, addr1.address, ethers.parseEther("1000"));
    });
  });
});