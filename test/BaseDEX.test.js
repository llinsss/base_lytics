const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BaseDEX Contract", function () {
  let owner, addr1, addr2, addr3;
  let baseDEX, tokenA, tokenB;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploy BaseDEX
    const BaseDEX = await ethers.getContractFactory("BaseDEX");
    baseDEX = await BaseDEX.deploy();

    // Deploy test tokens
    const BaseToken = await ethers.getContractFactory("BaseToken");
    tokenA = await BaseToken.deploy("Token A", "TKA", ethers.parseEther("1000000"));
    tokenB = await BaseToken.deploy("Token B", "TKB", ethers.parseEther("1000000"));

    // Create pool
    await baseDEX.createPool(await tokenA.getAddress(), await tokenB.getAddress(), 0);

    // Transfer tokens to test addresses
    await tokenA.transfer(addr1.address, ethers.parseEther("10000"));
    await tokenB.transfer(addr1.address, ethers.parseEther("10000"));
    await tokenA.transfer(addr2.address, ethers.parseEther("10000"));
    await tokenB.transfer(addr2.address, ethers.parseEther("10000"));
  });

  describe("Deployment and Pool Creation", function () {
    it("Should deploy successfully", async function () {
      expect(await baseDEX.owner()).to.equal(owner.address);
    });

    it("Should create pool successfully", async function () {
      const [reserveA, reserveB, totalSupply, feeRate] = await baseDEX.getPoolInfo(await tokenA.getAddress(), await tokenB.getAddress());
      expect(reserveA).to.equal(0);
      expect(reserveB).to.equal(0);
      expect(totalSupply).to.equal(0);
      expect(feeRate).to.equal(30); // Default fee rate
    });

    it("Should not allow creating duplicate pools", async function () {
      await expect(
        baseDEX.createPool(await tokenA.getAddress(), await tokenB.getAddress(), 0)
      ).to.be.revertedWith("BaseDEX: pool exists");
    });

    it("Should not allow creating pool with identical tokens", async function () {
      await expect(
        baseDEX.createPool(await tokenA.getAddress(), await tokenA.getAddress(), 0)
      ).to.be.revertedWith("BaseDEX: identical tokens");
    });
  });

  describe("Liquidity Management", function () {
    beforeEach(async function () {
      // Approve tokens for liquidity provision
      await tokenA.connect(addr1).approve(await baseDEX.getAddress(), ethers.parseEther("1000"));
      await tokenB.connect(addr1).approve(await baseDEX.getAddress(), ethers.parseEther("1000"));
    });

    it("Should add liquidity successfully", async function () {
      const amountA = ethers.parseEther("100");
      const amountB = ethers.parseEther("200");

      await expect(
        baseDEX.connect(addr1).addLiquidity(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          amountA,
          amountB,
          0,
          0
        )
      ).to.emit(baseDEX, "LiquidityAdded");

      const [reserveA, reserveB] = await baseDEX.getPoolInfo(await tokenA.getAddress(), await tokenB.getAddress());
      expect(reserveA).to.equal(amountA);
      expect(reserveB).to.equal(amountB);
    });

    it("Should remove liquidity successfully", async function () {
      // First add liquidity
      const amountA = ethers.parseEther("100");
      const amountB = ethers.parseEther("200");
      
      await baseDEX.connect(addr1).addLiquidity(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        amountA,
        amountB,
        0,
        0
      );

      // Get liquidity amount
      const [liquidityAmount] = await baseDEX.getLiquidityPosition(addr1.address, await tokenA.getAddress(), await tokenB.getAddress());

      // Remove liquidity
      await expect(
        baseDEX.connect(addr1).removeLiquidity(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          liquidityAmount,
          0,
          0
        )
      ).to.emit(baseDEX, "LiquidityRemoved");
    });

    it("Should not allow adding liquidity with zero amounts", async function () {
      await expect(
        baseDEX.connect(addr1).addLiquidity(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          0,
          ethers.parseEther("100"),
          0,
          0
        )
      ).to.be.revertedWith("BaseDEX: invalid amounts");
    });
  });

  describe("Token Swaps", function () {
    beforeEach(async function () {
      // Add initial liquidity
      await tokenA.connect(addr1).approve(await baseDEX.getAddress(), ethers.parseEther("1000"));
      await tokenB.connect(addr1).approve(await baseDEX.getAddress(), ethers.parseEther("1000"));
      
      await baseDEX.connect(addr1).addLiquidity(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        ethers.parseEther("100"),
        ethers.parseEther("200"),
        0,
        0
      );

      // Approve tokens for swapping
      await tokenA.connect(addr2).approve(await baseDEX.getAddress(), ethers.parseEther("1000"));
    });

    it("Should execute swap successfully", async function () {
      const swapAmount = ethers.parseEther("10");
      
      await expect(
        baseDEX.connect(addr2).swap(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          swapAmount,
          0
        )
      ).to.emit(baseDEX, "SwapExecuted");
    });

    it("Should calculate correct output amount", async function () {
      const swapAmount = ethers.parseEther("10");
      const amountOut = await baseDEX.getAmountOut(await tokenA.getAddress(), await tokenB.getAddress(), swapAmount);
      
      expect(amountOut).to.be.gt(0);
      expect(amountOut).to.be.lt(swapAmount * 2); // Should be less than 2x due to fees
    });

    it("Should not allow swap with insufficient output", async function () {
      const swapAmount = ethers.parseEther("10");
      const amountOut = await baseDEX.getAmountOut(await tokenA.getAddress(), await tokenB.getAddress(), swapAmount);
      
      await expect(
        baseDEX.connect(addr2).swap(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          swapAmount,
          amountOut + 1 // Higher than possible output
        )
      ).to.be.revertedWith("BaseDEX: insufficient output");
    });

    it("Should get quote with price impact", async function () {
      const swapAmount = ethers.parseEther("10");
      const [amountOut, priceImpact] = await baseDEX.getQuote(await tokenA.getAddress(), await tokenB.getAddress(), swapAmount);
      
      expect(amountOut).to.be.gt(0);
      expect(priceImpact).to.be.gt(0);
    });
  });

  describe("Fee Management", function () {
    it("Should set default fee rate", async function () {
      await baseDEX.setDefaultFeeRate(50); // 0.5%
      expect(await baseDEX.defaultFeeRate()).to.equal(50);
    });

    it("Should not allow setting fee too high", async function () {
      await expect(
        baseDEX.setDefaultFeeRate(1001) // > 10%
      ).to.be.revertedWith("BaseDEX: fee too high");
    });

    it("Should set protocol fee rate", async function () {
      await baseDEX.setProtocolFeeRate(500); // 5%
      expect(await baseDEX.protocolFeeRate()).to.equal(500);
    });

    it("Should set fee recipient", async function () {
      await baseDEX.setFeeRecipient(addr1.address);
      expect(await baseDEX.feeRecipient()).to.equal(addr1.address);
    });
  });

  describe("Access Control", function () {
    it("Should not allow non-owner to create pool", async function () {
      const newToken = await ethers.getContractFactory("BaseToken");
      const tokenC = await newToken.deploy("Token C", "TKC", ethers.parseEther("1000000"));
      
      await expect(
        baseDEX.connect(addr1).createPool(await tokenA.getAddress(), await tokenC.getAddress(), 0)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not allow non-owner to set fees", async function () {
      await expect(
        baseDEX.connect(addr1).setDefaultFeeRate(50)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Pause Functionality", function () {
    it("Should pause and unpause", async function () {
      await baseDEX.pause();
      expect(await baseDEX.paused()).to.be.true;
      
      await baseDEX.unpause();
      expect(await baseDEX.paused()).to.be.false;
    });

    it("Should not allow operations when paused", async function () {
      await baseDEX.pause();
      
      await tokenA.connect(addr1).approve(await baseDEX.getAddress(), ethers.parseEther("1000"));
      await tokenB.connect(addr1).approve(await baseDEX.getAddress(), ethers.parseEther("1000"));
      
      await expect(
        baseDEX.connect(addr1).addLiquidity(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          ethers.parseEther("100"),
          ethers.parseEther("200"),
          0,
          0
        )
      ).to.be.revertedWith("Pausable: paused");
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow emergency withdraw", async function () {
      // Transfer some tokens to DEX
      await tokenA.transfer(await baseDEX.getAddress(), ethers.parseEther("100"));
      
      const initialBalance = await tokenA.balanceOf(owner.address);
      await baseDEX.emergencyWithdraw(await tokenA.getAddress(), ethers.parseEther("100"));
      
      const finalBalance = await tokenA.balanceOf(owner.address);
      expect(finalBalance).to.equal(initialBalance + ethers.parseEther("100"));
    });
  });
});
