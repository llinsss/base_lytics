const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BaseGovernance Contract", function () {
  let owner, addr1, addr2, addr3, addr4;
  let baseGovernance, governanceToken;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

    // Deploy governance token
    const BaseToken = await ethers.getContractFactory("BaseToken");
    governanceToken = await BaseToken.deploy("Governance Token", "GOV", ethers.parseEther("1000000"));

    // Deploy BaseGovernance
    const BaseGovernance = await ethers.getContractFactory("BaseGovernance");
    baseGovernance = await BaseGovernance.deploy(await governanceToken.getAddress());

    // Distribute tokens to test addresses
    await governanceToken.transfer(addr1.address, ethers.parseEther("10000"));
    await governanceToken.transfer(addr2.address, ethers.parseEther("5000"));
    await governanceToken.transfer(addr3.address, ethers.parseEther("2000"));
    await governanceToken.transfer(addr4.address, ethers.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should deploy with correct initial values", async function () {
      expect(await baseGovernance.owner()).to.equal(owner.address);
      expect(await baseGovernance.governanceToken()).to.equal(await governanceToken.getAddress());
      expect(await baseGovernance.votingDelay()).to.equal(1);
      expect(await baseGovernance.votingPeriod()).to.equal(17280);
      expect(await baseGovernance.quorumVotes()).to.equal(1000);
      expect(await baseGovernance.proposalThreshold()).to.equal(100);
    });
  });

  describe("Vote Delegation", function () {
    it("Should delegate votes", async function () {
      await baseGovernance.connect(addr1).delegate(addr2.address);
      
      const votes = await baseGovernance.getCurrentVotes(addr2.address);
      expect(votes).to.equal(ethers.parseEther("10000"));
    });

    it("Should delegate votes by signature", async function () {
      const nonce = 0;
      const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      
      const domain = {
        name: "BaseGovernance",
        chainId: await ethers.provider.getNetwork().then(n => n.chainId),
        verifyingContract: await baseGovernance.getAddress()
      };
      
      const types = {
        Delegation: [
          { name: "delegatee", type: "address" },
          { name: "nonce", type: "uint256" },
          { name: "expiry", type: "uint256" }
        ]
      };
      
      const value = {
        delegatee: addr2.address,
        nonce: nonce,
        expiry: expiry
      };
      
      const signature = await addr1.signTypedData(domain, types, value);
      const { v, r, s } = ethers.Signature.from(signature);
      
      await baseGovernance.delegateBySig(addr1.address, addr2.address, nonce, expiry, v, r, s);
      
      const votes = await baseGovernance.getCurrentVotes(addr2.address);
      expect(votes).to.equal(ethers.parseEther("10000"));
    });

    it("Should not allow delegation with expired signature", async function () {
      const nonce = 0;
      const expiry = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      const domain = {
        name: "BaseGovernance",
        chainId: await ethers.provider.getNetwork().then(n => n.chainId),
        verifyingContract: await baseGovernance.getAddress()
      };
      
      const types = {
        Delegation: [
          { name: "delegatee", type: "address" },
          { name: "nonce", type: "uint256" },
          { name: "expiry", type: "uint256" }
        ]
      };
      
      const value = {
        delegatee: addr2.address,
        nonce: nonce,
        expiry: expiry
      };
      
      const signature = await addr1.signTypedData(domain, types, value);
      const { v, r, s } = ethers.Signature.from(signature);
      
      await expect(
        baseGovernance.delegateBySig(addr1.address, addr2.address, nonce, expiry, v, r, s)
      ).to.be.revertedWith("BaseGovernance: signature expired");
    });
  });

  describe("Proposal Creation", function () {
    beforeEach(async function () {
      // Delegate votes to addr1 to meet proposal threshold
      await baseGovernance.connect(addr1).delegate(addr1.address);
      await baseGovernance.connect(addr2).delegate(addr1.address);
    });

    it("Should create proposal", async function () {
      const targets = [await governanceToken.getAddress()];
      const values = [0];
      const signatures = ["transfer(address,uint256)"];
      const calldatas = [ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [addr2.address, ethers.parseEther("1000")])];
      
      await expect(
        baseGovernance.connect(addr1).propose(
          targets,
          values,
          signatures,
          calldatas,
          "Test Proposal",
          "This is a test proposal"
        )
      ).to.emit(baseGovernance, "ProposalCreated");

      const proposal = await baseGovernance.getProposal(0);
      expect(proposal.proposer).to.equal(addr1.address);
      expect(proposal.title).to.equal("Test Proposal");
      expect(proposal.description).to.equal("This is a test proposal");
    });

    it("Should not allow proposal creation below threshold", async function () {
      // Transfer tokens away from addr1 to reduce voting power
      await governanceToken.connect(addr1).transfer(addr4.address, ethers.parseEther("9500"));
      
      const targets = [await governanceToken.getAddress()];
      const values = [0];
      const signatures = ["transfer(address,uint256)"];
      const calldatas = [ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [addr2.address, ethers.parseEther("1000")])];
      
      await expect(
        baseGovernance.connect(addr1).propose(
          targets,
          values,
          signatures,
          calldatas,
          "Test Proposal",
          "This is a test proposal"
        )
      ).to.be.revertedWith("BaseGovernance: proposer votes below threshold");
    });

    it("Should not allow proposal with mismatched arrays", async function () {
      const targets = [await governanceToken.getAddress()];
      const values = [0, 0]; // Mismatched length
      const signatures = ["transfer(address,uint256)"];
      const calldatas = [ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [addr2.address, ethers.parseEther("1000")])];
      
      await expect(
        baseGovernance.connect(addr1).propose(
          targets,
          values,
          signatures,
          calldatas,
          "Test Proposal",
          "This is a test proposal"
        )
      ).to.be.revertedWith("BaseGovernance: proposal function information arity mismatch");
    });
  });

  describe("Voting", function () {
    let proposalId;

    beforeEach(async function () {
      // Delegate votes and create proposal
      await baseGovernance.connect(addr1).delegate(addr1.address);
      await baseGovernance.connect(addr2).delegate(addr2.address);
      await baseGovernance.connect(addr3).delegate(addr3.address);
      
      const targets = [await governanceToken.getAddress()];
      const values = [0];
      const signatures = ["transfer(address,uint256)"];
      const calldatas = [ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [addr2.address, ethers.parseEther("1000")])];
      
      await baseGovernance.connect(addr1).propose(
        targets,
        values,
        signatures,
        calldatas,
        "Test Proposal",
        "This is a test proposal"
      );
      
      proposalId = 0;
      
      // Fast forward to voting period
      await ethers.provider.send("evm_increaseTime", [2]);
      await ethers.provider.send("evm_mine");
    });

    it("Should cast vote for proposal", async function () {
      await expect(
        baseGovernance.connect(addr1).castVote(proposalId, 1) // For
      ).to.emit(baseGovernance, "VoteCast");

      const receipt = await baseGovernance.getReceipt(proposalId, addr1.address);
      expect(receipt.hasVoted).to.be.true;
      expect(receipt.support).to.equal(1);
      expect(receipt.votes).to.equal(ethers.parseEther("10000"));
    });

    it("Should cast vote against proposal", async function () {
      await expect(
        baseGovernance.connect(addr2).castVote(proposalId, 0) // Against
      ).to.emit(baseGovernance, "VoteCast");

      const receipt = await baseGovernance.getReceipt(proposalId, addr2.address);
      expect(receipt.hasVoted).to.be.true;
      expect(receipt.support).to.equal(0);
    });

    it("Should cast abstain vote", async function () {
      await expect(
        baseGovernance.connect(addr3).castVote(proposalId, 2) // Abstain
      ).to.emit(baseGovernance, "VoteCast");

      const receipt = await baseGovernance.getReceipt(proposalId, addr3.address);
      expect(receipt.hasVoted).to.be.true;
      expect(receipt.support).to.equal(2);
    });

    it("Should not allow voting twice", async function () {
      await baseGovernance.connect(addr1).castVote(proposalId, 1);
      
      await expect(
        baseGovernance.connect(addr1).castVote(proposalId, 0)
      ).to.be.revertedWith("BaseGovernance: voter already voted");
    });

    it("Should not allow voting on closed proposal", async function () {
      // Fast forward past voting period
      await ethers.provider.send("evm_increaseTime", [17280 * 15]); // ~3 days
      await ethers.provider.send("evm_mine");
      
      await expect(
        baseGovernance.connect(addr1).castVote(proposalId, 1)
      ).to.be.revertedWith("BaseGovernance: voting is closed");
    });

    it("Should not allow invalid vote type", async function () {
      await expect(
        baseGovernance.connect(addr1).castVote(proposalId, 3) // Invalid
      ).to.be.revertedWith("BaseGovernance: invalid vote type");
    });
  });

  describe("Proposal Execution", function () {
    let proposalId;

    beforeEach(async function () {
      // Delegate votes and create proposal
      await baseGovernance.connect(addr1).delegate(addr1.address);
      await baseGovernance.connect(addr2).delegate(addr1.address);
      
      const targets = [await governanceToken.getAddress()];
      const values = [0];
      const signatures = ["transfer(address,uint256)"];
      const calldatas = [ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [addr2.address, ethers.parseEther("1000")])];
      
      await baseGovernance.connect(addr1).propose(
        targets,
        values,
        signatures,
        calldatas,
        "Test Proposal",
        "This is a test proposal"
      );
      
      proposalId = 0;
      
      // Fast forward to voting period and vote
      await ethers.provider.send("evm_increaseTime", [2]);
      await ethers.provider.send("evm_mine");
      
      await baseGovernance.connect(addr1).castVote(proposalId, 1);
      
      // Fast forward past voting period
      await ethers.provider.send("evm_increaseTime", [17280 * 15]);
      await ethers.provider.send("evm_mine");
    });

    it("Should execute successful proposal", async function () {
      const initialBalance = await governanceToken.balanceOf(addr2.address);
      
      await expect(
        baseGovernance.execute(proposalId)
      ).to.emit(baseGovernance, "ProposalExecuted");

      const finalBalance = await governanceToken.balanceOf(addr2.address);
      expect(finalBalance).to.equal(initialBalance + ethers.parseEther("1000"));
    });

    it("Should not execute proposal that didn't succeed", async function () {
      // Create a new proposal that will fail
      const targets = [await governanceToken.getAddress()];
      const values = [0];
      const signatures = ["transfer(address,uint256)"];
      const calldatas = [ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [addr2.address, ethers.parseEther("1000")])];
      
      await baseGovernance.connect(addr1).propose(
        targets,
        values,
        signatures,
        calldatas,
        "Failing Proposal",
        "This proposal will fail"
      );
      
      const failingProposalId = 1;
      
      // Fast forward to voting period and vote against
      await ethers.provider.send("evm_increaseTime", [2]);
      await ethers.provider.send("evm_mine");
      
      await baseGovernance.connect(addr1).castVote(failingProposalId, 0); // Against
      
      // Fast forward past voting period
      await ethers.provider.send("evm_increaseTime", [17280 * 15]);
      await ethers.provider.send("evm_mine");
      
      await expect(
        baseGovernance.execute(failingProposalId)
      ).to.be.revertedWith("BaseGovernance: proposal not succeeded");
    });
  });

  describe("Proposal Cancellation", function () {
    let proposalId;

    beforeEach(async function () {
      await baseGovernance.connect(addr1).delegate(addr1.address);
      
      const targets = [await governanceToken.getAddress()];
      const values = [0];
      const signatures = ["transfer(address,uint256)"];
      const calldatas = [ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [addr2.address, ethers.parseEther("1000")])];
      
      await baseGovernance.connect(addr1).propose(
        targets,
        values,
        signatures,
        calldatas,
        "Test Proposal",
        "This is a test proposal"
      );
      
      proposalId = 0;
    });

    it("Should allow proposer to cancel proposal", async function () {
      await expect(
        baseGovernance.connect(addr1).cancel(proposalId)
      ).to.emit(baseGovernance, "ProposalCanceled");

      const proposal = await baseGovernance.getProposal(proposalId);
      expect(proposal.canceled).to.be.true;
    });

    it("Should allow owner to cancel proposal", async function () {
      await expect(
        baseGovernance.cancel(proposalId)
      ).to.emit(baseGovernance, "ProposalCanceled");
    });

    it("Should not allow non-proposer to cancel", async function () {
      await expect(
        baseGovernance.connect(addr2).cancel(proposalId)
      ).to.be.revertedWith("BaseGovernance: not authorized");
    });
  });

  describe("Proposal States", function () {
    let proposalId;

    beforeEach(async function () {
      await baseGovernance.connect(addr1).delegate(addr1.address);
      
      const targets = [await governanceToken.getAddress()];
      const values = [0];
      const signatures = ["transfer(address,uint256)"];
      const calldatas = [ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [addr2.address, ethers.parseEther("1000")])];
      
      await baseGovernance.connect(addr1).propose(
        targets,
        values,
        signatures,
        calldatas,
        "Test Proposal",
        "This is a test proposal"
      );
      
      proposalId = 0;
    });

    it("Should return correct proposal state", async function () {
      // Initially pending
      expect(await baseGovernance.state(proposalId)).to.equal(0); // Pending
      
      // Fast forward to active
      await ethers.provider.send("evm_increaseTime", [2]);
      await ethers.provider.send("evm_mine");
      
      expect(await baseGovernance.state(proposalId)).to.equal(1); // Active
      
      // Fast forward past voting period
      await ethers.provider.send("evm_increaseTime", [17280 * 15]);
      await ethers.provider.send("evm_mine");
      
      expect(await baseGovernance.state(proposalId)).to.equal(4); // Succeeded
    });
  });

  describe("Governance Parameters", function () {
    it("Should set voting delay", async function () {
      await baseGovernance.setVotingDelay(5);
      expect(await baseGovernance.votingDelay()).to.equal(5);
    });

    it("Should set voting period", async function () {
      await baseGovernance.setVotingPeriod(20000);
      expect(await baseGovernance.votingPeriod()).to.equal(20000);
    });

    it("Should set quorum", async function () {
      await baseGovernance.setQuorum(2000);
      expect(await baseGovernance.quorumVotes()).to.equal(2000);
    });

    it("Should set proposal threshold", async function () {
      await baseGovernance.setProposalThreshold(200);
      expect(await baseGovernance.proposalThreshold()).to.equal(200);
    });

    it("Should not allow setting voting delay too low", async function () {
      await expect(
        baseGovernance.setVotingDelay(0)
      ).to.be.revertedWith("BaseGovernance: voting delay too low");
    });

    it("Should not allow setting voting period too low", async function () {
      await expect(
        baseGovernance.setVotingPeriod(0)
      ).to.be.revertedWith("BaseGovernance: voting period too low");
    });
  });

  describe("Statistics and Information", function () {
    let proposalId;

    beforeEach(async function () {
      await baseGovernance.connect(addr1).delegate(addr1.address);
      await baseGovernance.connect(addr2).delegate(addr2.address);
      
      const targets = [await governanceToken.getAddress()];
      const values = [0];
      const signatures = ["transfer(address,uint256)"];
      const calldatas = [ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [addr2.address, ethers.parseEther("1000")])];
      
      await baseGovernance.connect(addr1).propose(
        targets,
        values,
        signatures,
        calldatas,
        "Test Proposal",
        "This is a test proposal"
      );
      
      proposalId = 0;
      
      // Fast forward to voting period and vote
      await ethers.provider.send("evm_increaseTime", [2]);
      await ethers.provider.send("evm_mine");
      
      await baseGovernance.connect(addr1).castVote(proposalId, 1);
      await baseGovernance.connect(addr2).castVote(proposalId, 0);
    });

    it("Should return proposal statistics", async function () {
      const [forVotes, againstVotes, abstainVotes, totalVotes] = await baseGovernance.getProposalStats(proposalId);
      
      expect(forVotes).to.equal(ethers.parseEther("10000"));
      expect(againstVotes).to.equal(ethers.parseEther("5000"));
      expect(abstainVotes).to.equal(0);
      expect(totalVotes).to.equal(ethers.parseEther("15000"));
    });

    it("Should check quorum", async function () {
      const hasQuorum = await baseGovernance.hasQuorum(proposalId);
      expect(hasQuorum).to.be.true; // 10000 >= 1000
    });

    it("Should return governance parameters", async function () {
      const [votingDelay, votingPeriod, quorumVotes, proposalThreshold] = await baseGovernance.getGovernanceParams();
      
      expect(votingDelay).to.equal(1);
      expect(votingPeriod).to.equal(17280);
      expect(quorumVotes).to.equal(1000);
      expect(proposalThreshold).to.equal(100);
    });
  });

  describe("Access Control", function () {
    it("Should not allow non-owner to set parameters", async function () {
      await expect(
        baseGovernance.connect(addr1).setVotingDelay(5)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Pause Functionality", function () {
    it("Should pause and unpause", async function () {
      await baseGovernance.pause();
      expect(await baseGovernance.paused()).to.be.true;
      
      await baseGovernance.unpause();
      expect(await baseGovernance.paused()).to.be.false;
    });

    it("Should not allow operations when paused", async function () {
      await baseGovernance.pause();
      
      await baseGovernance.connect(addr1).delegate(addr1.address);
      
      const targets = [await governanceToken.getAddress()];
      const values = [0];
      const signatures = ["transfer(address,uint256)"];
      const calldatas = [ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [addr2.address, ethers.parseEther("1000")])];
      
      await expect(
        baseGovernance.connect(addr1).propose(
          targets,
          values,
          signatures,
          calldatas,
          "Test Proposal",
          "This is a test proposal"
        )
      ).to.be.revertedWith("Pausable: paused");
    });
  });
});
