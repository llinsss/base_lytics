const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BaseVesting Contract", function () {
  let owner, addr1, addr2, addr3;
  let baseVesting, vestingToken;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploy vesting token
    const BaseToken = await ethers.getContractFactory("BaseToken");
    vestingToken = await BaseToken.deploy("Vesting Token", "VEST", ethers.parseEther("1000000"));

    // Deploy BaseVesting
    const BaseVesting = await ethers.getContractFactory("BaseVesting");
    baseVesting = await BaseVesting.deploy(await vestingToken.getAddress());

    // Approve vesting contract to spend tokens
    await vestingToken.approve(await baseVesting.getAddress(), ethers.parseEther("100000"));
  });

  describe("Deployment", function () {
    it("Should deploy with correct initial values", async function () {
      expect(await baseVesting.owner()).to.equal(owner.address);
      expect(await baseVesting.vestingToken()).to.equal(await vestingToken.getAddress());
    });
  });

  describe("Vesting Schedule Creation", function () {
    it("Should create vesting schedule", async function () {
      const totalAmount = ethers.parseEther("1000");
      const cliffDuration = 30 * 24 * 60 * 60; // 30 days
      const vestingDuration = 365 * 24 * 60 * 60; // 1 year

      await expect(
        baseVesting.createVestingSchedule(
          addr1.address,
          totalAmount,
          cliffDuration,
          vestingDuration,
          true
        )
      ).to.emit(baseVesting, "VestingScheduleCreated");

      const schedule = await baseVesting.getVestingSchedule(addr1.address);
      expect(schedule.beneficiary).to.equal(addr1.address);
      expect(schedule.totalAmount).to.equal(totalAmount);
      expect(schedule.cliffDuration).to.equal(cliffDuration);
      expect(schedule.vestingDuration).to.equal(vestingDuration);
    });

    it("Should create batch vesting schedules", async function () {
      const beneficiaries = [addr1.address, addr2.address];
      const totalAmounts = [ethers.parseEther("1000"), ethers.parseEther("2000")];
      const cliffDurations = [30 * 24 * 60 * 60, 60 * 24 * 60 * 60];
      const vestingDurations = [365 * 24 * 60 * 60, 730 * 24 * 60 * 60];
      const revocables = [true, false];

      await expect(
        baseVesting.createVestingSchedulesBatch(
          beneficiaries,
          totalAmounts,
          cliffDurations,
          vestingDurations,
          revocables
        )
      ).to.emit(baseVesting, "VestingScheduleCreated");

      expect(await baseVesting.hasVestingSchedule(addr1.address)).to.be.true;
      expect(await baseVesting.hasVestingSchedule(addr2.address)).to.be.true;
    });

    it("Should not allow creating schedule for zero address", async function () {
      await expect(
        baseVesting.createVestingSchedule(
          ethers.ZeroAddress,
          ethers.parseEther("1000"),
          0,
          365 * 24 * 60 * 60,
          true
        )
      ).to.be.revertedWith("BaseVesting: zero address");
    });

    it("Should not allow creating duplicate schedule", async function () {
      await baseVesting.createVestingSchedule(
        addr1.address,
        ethers.parseEther("1000"),
        0,
        365 * 24 * 60 * 60,
        true
      );

      await expect(
        baseVesting.createVestingSchedule(
          addr1.address,
          ethers.parseEther("2000"),
          0,
          365 * 24 * 60 * 60,
          true
        )
      ).to.be.revertedWith("BaseVesting: schedule exists");
    });
  });

  describe("Token Release", function () {
    beforeEach(async function () {
      // Create vesting schedule
      await baseVesting.createVestingSchedule(
        addr1.address,
        ethers.parseEther("1000"),
        0, // No cliff
        365 * 24 * 60 * 60, // 1 year
        true
      );
    });

    it("Should release tokens after vesting period", async function () {
      // Fast forward time by 6 months
      await ethers.provider.send("evm_increaseTime", [182 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      const initialBalance = await vestingToken.balanceOf(addr1.address);
      
      await expect(
        baseVesting.release(addr1.address)
      ).to.emit(baseVesting, "TokensVested");

      const finalBalance = await vestingToken.balanceOf(addr1.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should not release tokens before cliff", async function () {
      // Create schedule with cliff
      await baseVesting.createVestingSchedule(
        addr2.address,
        ethers.parseEther("1000"),
        30 * 24 * 60 * 60, // 30 day cliff
        365 * 24 * 60 * 60, // 1 year
        true
      );

      // Try to release before cliff
      const releasableAmount = await baseVesting.getReleasableAmount(addr2.address);
      expect(releasableAmount).to.equal(0);
    });

    it("Should release tokens for multiple beneficiaries", async function () {
      // Create another vesting schedule
      await baseVesting.createVestingSchedule(
        addr2.address,
        ethers.parseEther("500"),
        0,
        365 * 24 * 60 * 60,
        true
      );

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [182 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await expect(
        baseVesting.releaseBatch([addr1.address, addr2.address])
      ).to.emit(baseVesting, "TokensVested");
    });

    it("Should not release tokens if no schedule exists", async function () {
      await expect(
        baseVesting.release(addr3.address)
      ).to.be.revertedWith("BaseVesting: no schedule");
    });
  });

  describe("Vesting Calculations", function () {
    beforeEach(async function () {
      await baseVesting.createVestingSchedule(
        addr1.address,
        ethers.parseEther("1000"),
        0,
        365 * 24 * 60 * 60, // 1 year
        true
      );
    });

    it("Should calculate vested amount correctly", async function () {
      // Fast forward time by 6 months
      await ethers.provider.send("evm_increaseTime", [182 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      const vestedAmount = await baseVesting.getVestedAmount(addr1.address);
      expect(vestedAmount).to.be.gt(0);
      expect(vestedAmount).to.be.lt(ethers.parseEther("1000"));
    });

    it("Should calculate releasable amount correctly", async function () {
      // Fast forward time by 6 months
      await ethers.provider.send("evm_increaseTime", [182 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      const releasableAmount = await baseVesting.getReleasableAmount(addr1.address);
      expect(releasableAmount).to.be.gt(0);
    });

    it("Should calculate vesting progress", async function () {
      // Fast forward time by 6 months
      await ethers.provider.send("evm_increaseTime", [182 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      const progress = await baseVesting.getVestingProgress(addr1.address);
      expect(progress).to.be.gt(0);
      expect(progress).to.be.lt(100);
    });

    it("Should return 100% progress after vesting period", async function () {
      // Fast forward time by 1 year
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      const progress = await baseVesting.getVestingProgress(addr1.address);
      expect(progress).to.equal(100);
    });
  });

  describe("Vesting Schedule Revocation", function () {
    beforeEach(async function () {
      await baseVesting.createVestingSchedule(
        addr1.address,
        ethers.parseEther("1000"),
        0,
        365 * 24 * 60 * 60,
        true // Revocable
      );
    });

    it("Should revoke revocable vesting schedule", async function () {
      await expect(
        baseVesting.revokeVestingSchedule(addr1.address)
      ).to.emit(baseVesting, "VestingScheduleRevoked");

      expect(await baseVesting.hasVestingSchedule(addr1.address)).to.be.false;
    });

    it("Should not revoke non-revocable vesting schedule", async function () {
      // Create non-revocable schedule
      await baseVesting.createVestingSchedule(
        addr2.address,
        ethers.parseEther("1000"),
        0,
        365 * 24 * 60 * 60,
        false // Not revocable
      );

      await expect(
        baseVesting.revokeVestingSchedule(addr2.address)
      ).to.be.revertedWith("BaseVesting: not revocable");
    });

    it("Should not revoke non-existent schedule", async function () {
      await expect(
        baseVesting.revokeVestingSchedule(addr3.address)
      ).to.be.revertedWith("BaseVesting: no schedule");
    });
  });

  describe("Statistics and Information", function () {
    beforeEach(async function () {
      await baseVesting.createVestingSchedule(
        addr1.address,
        ethers.parseEther("1000"),
        0,
        365 * 24 * 60 * 60,
        true
      );

      await baseVesting.createVestingSchedule(
        addr2.address,
        ethers.parseEther("2000"),
        0,
        365 * 24 * 60 * 60,
        true
      );
    });

    it("Should return vesting statistics", async function () {
      const [totalVested, totalReleased, totalPending] = await baseVesting.getVestingStats();
      
      expect(totalVested).to.equal(ethers.parseEther("3000"));
      expect(totalReleased).to.equal(0);
      expect(totalPending).to.equal(ethers.parseEther("3000"));
    });

    it("Should return beneficiary information", async function () {
      const [totalAmount, releasedAmount, vestedAmount, releasableAmount] = 
        await baseVesting.getBeneficiaryInfo(addr1.address);
      
      expect(totalAmount).to.equal(ethers.parseEther("1000"));
      expect(releasedAmount).to.equal(0);
      expect(vestedAmount).to.equal(0);
      expect(releasableAmount).to.equal(0);
    });
  });

  describe("Emergency Functions", function () {
    it("Should set emergency mode", async function () {
      await baseVesting.setEmergencyMode(true);
      expect(await baseVesting.emergencyMode()).to.be.true;
    });

    it("Should add emergency withdrawer", async function () {
      await baseVesting.addEmergencyWithdrawer(addr1.address);
      expect(await baseVesting.emergencyWithdrawers(addr1.address)).to.be.true;
    });

    it("Should allow emergency withdraw", async function () {
      // Transfer tokens to vesting contract
      await vestingToken.transfer(await baseVesting.getAddress(), ethers.parseEther("1000"));
      
      // Enable emergency mode
      await baseVesting.setEmergencyMode(true);
      
      // Add emergency withdrawer
      await baseVesting.addEmergencyWithdrawer(addr1.address);
      
      const initialBalance = await vestingToken.balanceOf(addr1.address);
      
      await expect(
        baseVesting.connect(addr1).emergencyWithdraw(ethers.parseEther("500"))
      ).to.emit(baseVesting, "EmergencyWithdraw");

      const finalBalance = await vestingToken.balanceOf(addr1.address);
      expect(finalBalance).to.equal(initialBalance + ethers.parseEther("500"));
    });

    it("Should not allow emergency withdraw when not in emergency mode", async function () {
      await baseVesting.addEmergencyWithdrawer(addr1.address);
      
      await expect(
        baseVesting.connect(addr1).emergencyWithdraw(ethers.parseEther("100"))
      ).to.be.revertedWith("BaseVesting: emergency mode not enabled");
    });
  });

  describe("Access Control", function () {
    it("Should not allow non-owner to create vesting schedule", async function () {
      await expect(
        baseVesting.connect(addr1).createVestingSchedule(
          addr2.address,
          ethers.parseEther("1000"),
          0,
          365 * 24 * 60 * 60,
          true
        )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not allow non-owner to revoke schedule", async function () {
      await baseVesting.createVestingSchedule(
        addr1.address,
        ethers.parseEther("1000"),
        0,
        365 * 24 * 60 * 60,
        true
      );

      await expect(
        baseVesting.connect(addr1).revokeVestingSchedule(addr1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Pause Functionality", function () {
    it("Should pause and unpause", async function () {
      await baseVesting.pause();
      expect(await baseVesting.paused()).to.be.true;
      
      await baseVesting.unpause();
      expect(await baseVesting.paused()).to.be.false;
    });

    it("Should not allow release when paused", async function () {
      await baseVesting.createVestingSchedule(
        addr1.address,
        ethers.parseEther("1000"),
        0,
        365 * 24 * 60 * 60,
        true
      );

      await baseVesting.pause();
      
      await expect(
        baseVesting.release(addr1.address)
      ).to.be.revertedWith("Pausable: paused");
    });
  });
});
