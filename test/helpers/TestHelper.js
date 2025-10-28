const { ethers } = require("hardhat");

class TestHelper {
  static async deployContracts() {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    
    // Deploy BaseToken
    const BaseToken = await ethers.getContractFactory("BaseToken");
    const baseToken = await BaseToken.deploy(
      "Test Token",
      "TEST", 
      ethers.parseEther("1000000")
    );
    
    // Deploy BaseNFT
    const BaseNFT = await ethers.getContractFactory("BaseNFT");
    const baseNFT = await BaseNFT.deploy(
      "Test NFT",
      "TNFT",
      "https://test.com/"
    );
    
    // Deploy BaseStaking
    const BaseStaking = await ethers.getContractFactory("BaseStaking");
    const baseStaking = await BaseStaking.deploy(await baseToken.getAddress());
    
    return {
      contracts: { baseToken, baseNFT, baseStaking },
      signers: { owner, addr1, addr2, addr3 }
    };
  }
  
  static async setupTokenBalances(baseToken, signers, amount = "1000") {
    const { owner, addr1, addr2, addr3 } = signers;
    const transferAmount = ethers.parseEther(amount);
    
    await baseToken.transfer(addr1.address, transferAmount);
    await baseToken.transfer(addr2.address, transferAmount);
    await baseToken.transfer(addr3.address, transferAmount);
  }
  
  static async timeTravel(seconds) {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine");
  }
  
  static async getGasUsed(tx) {
    const receipt = await tx.wait();
    return receipt.gasUsed;
  }
  
  static formatGas(gasUsed) {
    return `${gasUsed.toString()} gas`;
  }
}

module.exports = TestHelper;