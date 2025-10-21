const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BaseMarketplace Contract", function () {
  let owner, addr1, addr2, addr3;
  let baseMarketplace, baseNFT, baseToken;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploy BaseMarketplace
    const BaseMarketplace = await ethers.getContractFactory("BaseMarketplace");
    baseMarketplace = await BaseMarketplace.deploy();

    // Deploy BaseNFT
    const BaseNFT = await ethers.getContractFactory("BaseNFT");
    baseNFT = await BaseNFT.deploy("Test NFT", "TNFT", "https://test.com/");

    // Deploy BaseToken for payments
    const BaseToken = await ethers.getContractFactory("BaseToken");
    baseToken = await BaseToken.deploy("Payment Token", "PAY", ethers.parseEther("1000000"));

    // Add payment token to supported tokens
    await baseMarketplace.addSupportedPaymentToken(await baseToken.getAddress());

    // Mint some NFTs for testing
    await baseNFT.ownerMint(addr1.address, 3);
    await baseNFT.ownerMint(addr2.address, 2);

    // Transfer some payment tokens
    await baseToken.transfer(addr2.address, ethers.parseEther("1000"));
    await baseToken.transfer(addr3.address, ethers.parseEther("1000"));
  });

  describe("Deployment and Setup", function () {
    it("Should deploy successfully", async function () {
      expect(await baseMarketplace.owner()).to.equal(owner.address);
    });

    it("Should add supported payment token", async function () {
      expect(await baseMarketplace.supportedPaymentTokens(await baseToken.getAddress())).to.be.true;
    });

    it("Should remove supported payment token", async function () {
      await baseMarketplace.removeSupportedPaymentToken(await baseToken.getAddress());
      expect(await baseMarketplace.supportedPaymentTokens(await baseToken.getAddress())).to.be.false;
    });
  });

  describe("NFT Listing", function () {
    beforeEach(async function () {
      // Approve marketplace to transfer NFT
      await baseNFT.connect(addr1).approve(await baseMarketplace.getAddress(), 1);
    });

    it("Should list NFT for sale", async function () {
      const price = ethers.parseEther("1");
      
      await expect(
        baseMarketplace.connect(addr1).listItem(
          await baseNFT.getAddress(),
          1,
          price,
          await baseToken.getAddress()
        )
      ).to.emit(baseMarketplace, "ItemListed");

      const listing = await baseMarketplace.getListing(await baseNFT.getAddress(), 1);
      expect(listing.active).to.be.true;
      expect(listing.price).to.equal(price);
      expect(listing.seller).to.equal(addr1.address);
    });

    it("Should list NFT for ETH", async function () {
      const price = ethers.parseEther("0.1");
      
      await expect(
        baseMarketplace.connect(addr1).listItem(
          await baseNFT.getAddress(),
          1,
          price,
          ethers.ZeroAddress
        )
      ).to.emit(baseMarketplace, "ItemListed");
    });

    it("Should not allow listing with zero price", async function () {
      await expect(
        baseMarketplace.connect(addr1).listItem(
          await baseNFT.getAddress(),
          1,
          0,
          await baseToken.getAddress()
        )
      ).to.be.revertedWith("BaseMarketplace: invalid price");
    });

    it("Should not allow listing unsupported payment token", async function () {
      await expect(
        baseMarketplace.connect(addr1).listItem(
          await baseNFT.getAddress(),
          1,
          ethers.parseEther("1"),
          addr1.address // Random address
        )
      ).to.be.revertedWith("BaseMarketplace: unsupported payment token");
    });
  });

  describe("NFT Buying", function () {
    beforeEach(async function () {
      // List NFT for sale
      await baseNFT.connect(addr1).approve(await baseMarketplace.getAddress(), 1);
      await baseMarketplace.connect(addr1).listItem(
        await baseNFT.getAddress(),
        1,
        ethers.parseEther("1"),
        await baseToken.getAddress()
      );

      // Approve payment token
      await baseToken.connect(addr2).approve(await baseMarketplace.getAddress(), ethers.parseEther("10"));
    });

    it("Should buy NFT with ERC20 token", async function () {
      const price = ethers.parseEther("1");
      
      await expect(
        baseMarketplace.connect(addr2).buyItem(await baseNFT.getAddress(), 1)
      ).to.emit(baseMarketplace, "ItemSold");

      // Check NFT ownership
      expect(await baseNFT.ownerOf(1)).to.equal(addr2.address);
    });

    it("Should buy NFT with ETH", async function () {
      // Delist and relist for ETH
      await baseMarketplace.connect(addr1).delistItem(await baseNFT.getAddress(), 1);
      
      await baseNFT.connect(addr1).approve(await baseMarketplace.getAddress(), 1);
      await baseMarketplace.connect(addr1).listItem(
        await baseNFT.getAddress(),
        1,
        ethers.parseEther("0.1"),
        ethers.ZeroAddress
      );

      await expect(
        baseMarketplace.connect(addr2).buyItem(await baseNFT.getAddress(), 1, { value: ethers.parseEther("0.1") })
      ).to.emit(baseMarketplace, "ItemSold");
    });

    it("Should not allow buying own NFT", async function () {
      await expect(
        baseMarketplace.connect(addr1).buyItem(await baseNFT.getAddress(), 1)
      ).to.be.revertedWith("BaseMarketplace: cannot buy own item");
    });

    it("Should not allow buying with insufficient payment", async function () {
      await expect(
        baseMarketplace.connect(addr2).buyItem(await baseNFT.getAddress(), 1, { value: ethers.parseEther("0.05") })
      ).to.be.revertedWith("BaseMarketplace: insufficient payment");
    });
  });

  describe("NFT Delisting", function () {
    beforeEach(async function () {
      await baseNFT.connect(addr1).approve(await baseMarketplace.getAddress(), 1);
      await baseMarketplace.connect(addr1).listItem(
        await baseNFT.getAddress(),
        1,
        ethers.parseEther("1"),
        await baseToken.getAddress()
      );
    });

    it("Should delist NFT", async function () {
      await expect(
        baseMarketplace.connect(addr1).delistItem(await baseNFT.getAddress(), 1)
      ).to.emit(baseMarketplace, "ItemDelisted");

      const listing = await baseMarketplace.getListing(await baseNFT.getAddress(), 1);
      expect(listing.active).to.be.false;
    });

    it("Should not allow non-seller to delist", async function () {
      await expect(
        baseMarketplace.connect(addr2).delistItem(await baseNFT.getAddress(), 1)
      ).to.be.revertedWith("BaseMarketplace: not authorized");
    });

    it("Should allow owner to delist any NFT", async function () {
      await expect(
        baseMarketplace.delistItem(await baseNFT.getAddress(), 1)
      ).to.emit(baseMarketplace, "ItemDelisted");
    });
  });

  describe("Auction System", function () {
    beforeEach(async function () {
      await baseNFT.connect(addr1).approve(await baseMarketplace.getAddress(), 2);
    });

    it("Should create auction", async function () {
      const startingPrice = ethers.parseEther("0.5");
      const duration = 7 * 24 * 60 * 60; // 7 days
      
      await expect(
        baseMarketplace.connect(addr1).createAuction(
          await baseNFT.getAddress(),
          2,
          startingPrice,
          duration,
          await baseToken.getAddress()
        )
      ).to.emit(baseMarketplace, "AuctionCreated");

      const auction = await baseMarketplace.getAuction(await baseNFT.getAddress(), 2);
      expect(auction.startingPrice).to.equal(startingPrice);
      expect(auction.seller).to.equal(addr1.address);
    });

    it("Should place bid", async function () {
      // Create auction
      await baseMarketplace.connect(addr1).createAuction(
        await baseNFT.getAddress(),
        2,
        ethers.parseEther("0.5"),
        7 * 24 * 60 * 60,
        await baseToken.getAddress()
      );

      // Approve payment token for bid
      await baseToken.connect(addr2).approve(await baseMarketplace.getAddress(), ethers.parseEther("10"));

      await expect(
        baseMarketplace.connect(addr2).placeBid(await baseNFT.getAddress(), 2, { value: ethers.parseEther("1") })
      ).to.emit(baseMarketplace, "BidPlaced");
    });

    it("Should end auction", async function () {
      // Create auction
      await baseMarketplace.connect(addr1).createAuction(
        await baseNFT.getAddress(),
        2,
        ethers.parseEther("0.5"),
        1, // 1 second duration
        await baseToken.getAddress()
      );

      // Place bid
      await baseToken.connect(addr2).approve(await baseMarketplace.getAddress(), ethers.parseEther("10"));
      await baseMarketplace.connect(addr2).placeBid(await baseNFT.getAddress(), 2, { value: ethers.parseEther("1") });

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [2]);
      await ethers.provider.send("evm_mine");

      await expect(
        baseMarketplace.endAuction(await baseNFT.getAddress(), 2)
      ).to.emit(baseMarketplace, "AuctionEnded");
    });
  });

  describe("Royalty System", function () {
    it("Should set royalty", async function () {
      await baseMarketplace.setRoyalty(
        await baseNFT.getAddress(),
        1,
        addr3.address,
        250 // 2.5%
      );

      const [recipient, percentage] = await baseMarketplace.getRoyalty(await baseNFT.getAddress(), 1);
      expect(recipient).to.equal(addr3.address);
      expect(percentage).to.equal(250);
    });

    it("Should not allow setting royalty too high", async function () {
      await expect(
        baseMarketplace.setRoyalty(
          await baseNFT.getAddress(),
          1,
          addr3.address,
          1001 // > 10%
        )
      ).to.be.revertedWith("BaseMarketplace: royalty too high");
    });
  });

  describe("Fee Management", function () {
    it("Should set marketplace fee", async function () {
      await baseMarketplace.setMarketplaceFee(500); // 5%
      expect(await baseMarketplace.marketplaceFee()).to.equal(500);
    });

    it("Should not allow setting fee too high", async function () {
      await expect(
        baseMarketplace.setMarketplaceFee(1001) // > 10%
      ).to.be.revertedWith("BaseMarketplace: fee too high");
    });

    it("Should set fee recipient", async function () {
      await baseMarketplace.setFeeRecipient(addr3.address);
      expect(await baseMarketplace.feeRecipient()).to.equal(addr3.address);
    });
  });

  describe("Access Control", function () {
    it("Should not allow non-owner to add payment token", async function () {
      await expect(
        baseMarketplace.connect(addr1).addSupportedPaymentToken(addr1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not allow non-owner to set fees", async function () {
      await expect(
        baseMarketplace.connect(addr1).setMarketplaceFee(500)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Pause Functionality", function () {
    it("Should pause and unpause", async function () {
      await baseMarketplace.pause();
      expect(await baseMarketplace.paused()).to.be.true;
      
      await baseMarketplace.unpause();
      expect(await baseMarketplace.paused()).to.be.false;
    });

    it("Should not allow operations when paused", async function () {
      await baseMarketplace.pause();
      
      await baseNFT.connect(addr1).approve(await baseMarketplace.getAddress(), 1);
      
      await expect(
        baseMarketplace.connect(addr1).listItem(
          await baseNFT.getAddress(),
          1,
          ethers.parseEther("1"),
          await baseToken.getAddress()
        )
      ).to.be.revertedWith("Pausable: paused");
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow emergency withdraw", async function () {
      // Transfer some tokens to marketplace
      await baseToken.transfer(await baseMarketplace.getAddress(), ethers.parseEther("100"));
      
      const initialBalance = await baseToken.balanceOf(owner.address);
      await baseMarketplace.emergencyWithdraw(await baseToken.getAddress(), ethers.parseEther("100"));
      
      const finalBalance = await baseToken.balanceOf(owner.address);
      expect(finalBalance).to.equal(initialBalance + ethers.parseEther("100"));
    });
  });
});
