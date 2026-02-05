// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../tokens/ERC20.sol";
import "../access/Ownable.sol";
import "../security/ReentrancyGuard.sol";

contract AdvancedDAOGovernance is Ownable, ReentrancyGuard {
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        address[] targets;
        uint256[] values;
        bytes[] calldatas;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool executed;
        bool canceled;
        ProposalType proposalType;
        uint256 quorumRequired;
    }

    struct Vote {
        bool hasVoted;
        uint8 support; // 0=against, 1=for, 2=abstain
        uint256 votes;
        string reason;
    }

    struct Delegation {
        address delegate;
        uint256 fromBlock;
    }

    enum ProposalType {
        Standard,
        Constitutional,
        Emergency,
        Treasury
    }

    enum ProposalState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
        Queued,
        Expired,
        Executed
    }

    // State variables
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(address => Delegation) public delegations;
    mapping(address => uint256) public votingPower;
    mapping(bytes32 => bool) public queuedTransactions;
    
    uint256 public proposalCount;
    uint256 public votingDelay = 1 days;
    uint256 public votingPeriod = 7 days;
    uint256 public proposalThreshold = 100000e18; // 100k tokens
    uint256 public quorumPercentage = 4; // 4%
    uint256 public timelock = 2 days;
    
    address public governanceToken;
    address public treasury;
    
    // Events
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title);
    event VoteCast(address indexed voter, uint256 indexed proposalId, uint8 support, uint256 votes, string reason);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCanceled(uint256 indexed proposalId);
    event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate);
    event QuorumUpdated(uint256 oldQuorum, uint256 newQuorum);

    constructor(address _governanceToken, address _treasury) {
        governanceToken = _governanceToken;
        treasury = _treasury;
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory title,
        string memory description,
        ProposalType proposalType
    ) external returns (uint256) {
        require(getVotes(msg.sender) >= proposalThreshold, "Insufficient voting power");
        require(targets.length == values.length && targets.length == calldatas.length, "Proposal function information arity mismatch");
        require(targets.length > 0, "Must provide actions");

        uint256 proposalId = ++proposalCount;
        uint256 startTime = block.timestamp + votingDelay;
        uint256 endTime = startTime + votingPeriod;
        
        // Adjust parameters based on proposal type
        uint256 quorumRequired = calculateQuorum(proposalType);
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            targets: targets,
            values: values,
            calldatas: calldatas,
            startTime: startTime,
            endTime: endTime,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            executed: false,
            canceled: false,
            proposalType: proposalType,
            quorumRequired: quorumRequired
        });

        emit ProposalCreated(proposalId, msg.sender, title);
        return proposalId;
    }

    function castVote(uint256 proposalId, uint8 support) external {
        return _castVote(proposalId, msg.sender, support, "");
    }

    function castVoteWithReason(uint256 proposalId, uint8 support, string calldata reason) external {
        return _castVote(proposalId, msg.sender, support, reason);
    }

    function castVoteBySig(
        uint256 proposalId,
        uint8 support,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        bytes32 domainSeparator = keccak256(abi.encode(
            keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)"),
            keccak256(bytes("AdvancedDAOGovernance")),
            block.chainid,
            address(this)
        ));
        
        bytes32 structHash = keccak256(abi.encode(
            keccak256("Ballot(uint256 proposalId,uint8 support)"),
            proposalId,
            support
        ));
        
        bytes32 hash = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        address signer = ecrecover(hash, v, r, s);
        require(signer != address(0), "Invalid signature");
        
        return _castVote(proposalId, signer, support, "");
    }

    function _castVote(uint256 proposalId, address voter, uint8 support, string memory reason) internal {
        require(state(proposalId) == ProposalState.Active, "Voting is closed");
        require(support <= 2, "Invalid vote type");
        
        Vote storage vote = votes[proposalId][voter];
        require(!vote.hasVoted, "Already voted");
        
        uint256 weight = getVotes(voter);
        require(weight > 0, "No voting power");
        
        vote.hasVoted = true;
        vote.support = support;
        vote.votes = weight;
        vote.reason = reason;
        
        Proposal storage proposal = proposals[proposalId];
        
        if (support == 0) {
            proposal.againstVotes += weight;
        } else if (support == 1) {
            proposal.forVotes += weight;
        } else {
            proposal.abstainVotes += weight;
        }
        
        emit VoteCast(voter, proposalId, support, weight, reason);
    }

    function queue(uint256 proposalId) external {
        require(state(proposalId) == ProposalState.Succeeded, "Proposal not succeeded");
        
        Proposal storage proposal = proposals[proposalId];
        uint256 eta = block.timestamp + timelock;
        
        for (uint256 i = 0; i < proposal.targets.length; i++) {
            bytes32 txHash = keccak256(abi.encode(
                proposal.targets[i],
                proposal.values[i],
                proposal.calldatas[i],
                eta
            ));
            queuedTransactions[txHash] = true;
        }
    }

    function execute(uint256 proposalId) external payable nonReentrant {
        require(state(proposalId) == ProposalState.Queued, "Proposal not queued");
        
        Proposal storage proposal = proposals[proposalId];
        proposal.executed = true;
        
        for (uint256 i = 0; i < proposal.targets.length; i++) {
            (bool success, ) = proposal.targets[i].call{value: proposal.values[i]}(proposal.calldatas[i]);
            require(success, "Transaction execution reverted");
        }
        
        emit ProposalExecuted(proposalId);
    }

    function cancel(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Cannot cancel executed proposal");
        require(msg.sender == proposal.proposer || msg.sender == owner(), "Not authorized");
        
        proposal.canceled = true;
        emit ProposalCanceled(proposalId);
    }

    function delegate(address delegatee) external {
        address currentDelegate = delegations[msg.sender].delegate;
        delegations[msg.sender] = Delegation({
            delegate: delegatee,
            fromBlock: block.number
        });
        
        emit DelegateChanged(msg.sender, currentDelegate, delegatee);
        _updateVotingPower(msg.sender);
    }

    function getVotes(address account) public view returns (uint256) {
        address delegate = delegations[account].delegate;
        if (delegate != address(0)) {
            return votingPower[delegate];
        }
        return IERC20(governanceToken).balanceOf(account);
    }

    function state(uint256 proposalId) public view returns (ProposalState) {
        require(proposalId <= proposalCount && proposalId > 0, "Invalid proposal id");
        
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.canceled) {
            return ProposalState.Canceled;
        } else if (block.timestamp <= proposal.startTime) {
            return ProposalState.Pending;
        } else if (block.timestamp <= proposal.endTime) {
            return ProposalState.Active;
        } else if (proposal.forVotes <= proposal.againstVotes || proposal.forVotes < proposal.quorumRequired) {
            return ProposalState.Defeated;
        } else if (proposal.executed) {
            return ProposalState.Executed;
        } else {
            return ProposalState.Succeeded;
        }
    }

    function calculateQuorum(ProposalType proposalType) internal view returns (uint256) {
        uint256 totalSupply = IERC20(governanceToken).totalSupply();
        
        if (proposalType == ProposalType.Constitutional) {
            return totalSupply * 10 / 100; // 10% for constitutional changes
        } else if (proposalType == ProposalType.Emergency) {
            return totalSupply * 15 / 100; // 15% for emergency proposals
        } else if (proposalType == ProposalType.Treasury) {
            return totalSupply * 8 / 100; // 8% for treasury proposals
        } else {
            return totalSupply * quorumPercentage / 100; // Standard quorum
        }
    }

    function _updateVotingPower(address account) internal {
        uint256 balance = IERC20(governanceToken).balanceOf(account);
        votingPower[account] = balance;
    }

    // Admin functions
    function setVotingDelay(uint256 newVotingDelay) external onlyOwner {
        votingDelay = newVotingDelay;
    }

    function setVotingPeriod(uint256 newVotingPeriod) external onlyOwner {
        votingPeriod = newVotingPeriod;
    }

    function setProposalThreshold(uint256 newProposalThreshold) external onlyOwner {
        proposalThreshold = newProposalThreshold;
    }

    function setQuorumPercentage(uint256 newQuorumPercentage) external onlyOwner {
        require(newQuorumPercentage <= 20, "Quorum too high");
        uint256 oldQuorum = quorumPercentage;
        quorumPercentage = newQuorumPercentage;
        emit QuorumUpdated(oldQuorum, newQuorumPercentage);
    }

    // View functions
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }

    function getVote(uint256 proposalId, address voter) external view returns (Vote memory) {
        return votes[proposalId][voter];
    }

    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return votes[proposalId][voter].hasVoted;
    }

    function proposalSnapshot(uint256 proposalId) external view returns (uint256) {
        return proposals[proposalId].startTime;
    }

    function proposalDeadline(uint256 proposalId) external view returns (uint256) {
        return proposals[proposalId].endTime;
    }
}