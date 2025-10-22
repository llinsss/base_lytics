// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../tokens/ERC20.sol";
import "../access/Ownable.sol";
import "../security/ReentrancyGuard.sol";
import "../security/Pausable.sol";

/**
 * @title BaseGovernance
 * @dev A comprehensive DAO governance system with proposal creation, voting, and execution
 * Features: Proposal management, voting power delegation, quorum requirements, execution delays
 */
contract BaseGovernance is Ownable, ReentrancyGuard, Pausable {
    // Events
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title, uint256 startTime, uint256 endTime);
    event VoteCast(address indexed voter, uint256 indexed proposalId, uint8 support, uint256 votes);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCanceled(uint256 indexed proposalId);
    event DelegationChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate);
    event VotingDelaySet(uint256 oldVotingDelay, uint256 newVotingDelay);
    event VotingPeriodSet(uint256 oldVotingPeriod, uint256 newVotingPeriod);
    event QuorumSet(uint256 oldQuorum, uint256 newQuorum);
    event ProposalThresholdSet(uint256 oldProposalThreshold, uint256 newProposalThreshold);

    // Proposal structure
    struct Proposal {
        uint256 id;
        address proposer;
        address[] targets;
        uint256[] values;
        string[] signatures;
        bytes[] calldatas;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool canceled;
        bool executed;
        string title;
        string description;
    }

    // Vote structure
    struct Receipt {
        bool hasVoted;
        uint8 support; // 0 = Against, 1 = For, 2 = Abstain
        uint256 votes;
    }

    // Delegation structure
    struct Checkpoint {
        uint32 fromBlock;
        uint224 votes;
    }

    // State variables
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => Receipt)) public proposalReceipts;
    mapping(address => address) public delegates;
    mapping(address => Checkpoint[]) public checkpoints;
    mapping(address => uint256) public numCheckpoints;
    
    uint256 public proposalCount;
    uint256 public votingDelay = 1; // 1 block delay
    uint256 public votingPeriod = 17280; // ~3 days in blocks (assuming 15s per block)
    uint256 public quorumVotes = 1000; // Minimum votes required
    uint256 public proposalThreshold = 100; // Minimum tokens required to propose
    
    address public governanceToken;
    uint256 public constant BASIS_POINTS = 10000;
    
    // Proposal states
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

    constructor(address _governanceToken) {
        governanceToken = _governanceToken;
        
        // Set up EIP-712 domain separator
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        DOMAIN_SEPARATOR = keccak256(abi.encode(DOMAIN_TYPEHASH, keccak256(bytes("BaseGovernance")), chainId, address(this)));
    }

    /**
     * @dev Create a new proposal
     * @param targets Target addresses for calls
     * @param values ETH values for calls
     * @param signatures Function signatures
     * @param calldatas Calldata for calls
     * @param title Proposal title
     * @param description Proposal description
     */
    function propose(
        address[] memory targets,
        uint256[] memory values,
        string[] memory signatures,
        bytes[] memory calldatas,
        string memory title,
        string memory description
    ) external whenNotPaused returns (uint256) {
        require(getVotes(msg.sender, block.number - 1) >= proposalThreshold, "BaseGovernance: proposer votes below threshold");
        require(targets.length == values.length, "BaseGovernance: proposal function information arity mismatch");
        require(targets.length == signatures.length, "BaseGovernance: proposal function information arity mismatch");
        require(targets.length == calldatas.length, "BaseGovernance: proposal function information arity mismatch");
        require(targets.length > 0, "BaseGovernance: must provide actions");

        uint256 latestProposalId = proposalCount;
        uint256 startTime = block.timestamp + votingDelay;
        uint256 endTime = startTime + votingPeriod;

        proposalCount++;
        proposals[latestProposalId] = Proposal({
            id: latestProposalId,
            proposer: msg.sender,
            targets: targets,
            values: values,
            signatures: signatures,
            calldatas: calldatas,
            startTime: startTime,
            endTime: endTime,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            canceled: false,
            executed: false,
            title: title,
            description: description
        });

        emit ProposalCreated(latestProposalId, msg.sender, title, startTime, endTime);
        return latestProposalId;
    }

    /**
     * @dev Cast a vote on a proposal
     * @param proposalId Proposal ID
     * @param support Vote support (0 = Against, 1 = For, 2 = Abstain)
     */
    function castVote(uint256 proposalId, uint8 support) external whenNotPaused {
        require(state(proposalId) == ProposalState.Active, "BaseGovernance: voting is closed");
        require(support <= 2, "BaseGovernance: invalid vote type");
        
        Proposal storage proposal = proposals[proposalId];
        Receipt storage receipt = proposalReceipts[proposalId][msg.sender];
        require(receipt.hasVoted == false, "BaseGovernance: voter already voted");

        uint256 votes = getVotes(msg.sender, proposal.startTime);
        require(votes > 0, "BaseGovernance: no votes");

        if (support == 0) {
            proposal.againstVotes = proposal.againstVotes + votes;
        } else if (support == 1) {
            proposal.forVotes = proposal.forVotes + votes;
        } else if (support == 2) {
            proposal.abstainVotes = proposal.abstainVotes + votes;
        }

        receipt.hasVoted = true;
        receipt.support = support;
        receipt.votes = votes;

        emit VoteCast(msg.sender, proposalId, support, votes);
    }

    /**
     * @dev Execute a successful proposal
     * @param proposalId Proposal ID
     */
    function execute(uint256 proposalId) external payable nonReentrant whenNotPaused {
        require(state(proposalId) == ProposalState.Succeeded, "BaseGovernance: proposal not succeeded");

        Proposal storage proposal = proposals[proposalId];
        proposal.executed = true;

        for (uint256 i = 0; i < proposal.targets.length; i++) {
            (bool success, bytes memory returnData) = proposal.targets[i].call{value: proposal.values[i]}(
                abi.encodePacked(bytes4(keccak256(bytes(proposal.signatures[i]))), proposal.calldatas[i])
            );
            require(success, "BaseGovernance: proposal execution reverted");
        }

        emit ProposalExecuted(proposalId);
    }

    /**
     * @dev Cancel a proposal
     * @param proposalId Proposal ID
     */
    function cancel(uint256 proposalId) external {
        ProposalState currentState = state(proposalId);
        require(currentState != ProposalState.Executed, "BaseGovernance: cannot cancel executed proposal");

        Proposal storage proposal = proposals[proposalId];
        require(msg.sender == proposal.proposer || msg.sender == owner(), "BaseGovernance: not authorized");

        proposal.canceled = true;
        emit ProposalCanceled(proposalId);
    }

    /**
     * @dev Delegate votes to another address
     * @param delegatee Address to delegate votes to
     */
    function delegate(address delegatee) external {
        return _delegate(msg.sender, delegatee);
    }

    /**
     * @dev Delegate votes from a delegator to a delegatee
     * @param delegator Address of the delegator
     * @param delegatee Address to delegate votes to
     */
    function delegateBySig(
        address delegator,
        address delegatee,
        uint256 nonce,
        uint256 expiry,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(expiry >= block.timestamp, "BaseGovernance: signature expired");
        
        bytes32 structHash = keccak256(abi.encode(DELEGATION_TYPEHASH, delegator, delegatee, nonce, expiry));
        bytes32 hash = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));
        address signer = ecrecover(hash, v, r, s);
        require(signer == delegator, "BaseGovernance: invalid signature");

        _delegate(delegator, delegatee);
    }

    /**
     * @dev Get the current votes balance for an account
     * @param account Account address
     * @return votes Current votes balance
     */
    function getCurrentVotes(address account) external view returns (uint256 votes) {
        uint256 nCheckpoints = numCheckpoints[account];
        return nCheckpoints > 0 ? checkpoints[account][nCheckpoints - 1].votes : 0;
    }

    /**
     * @dev Get the votes balance for an account at a specific block
     * @param account Account address
     * @param blockNumber Block number
     * @return votes Votes balance at block
     */
    function getVotes(address account, uint256 blockNumber) public view returns (uint256 votes) {
        require(blockNumber <= block.number, "BaseGovernance: not yet determined");

        uint256 nCheckpoints = numCheckpoints[account];
        if (nCheckpoints == 0) {
            return 0;
        }

        if (checkpoints[account][nCheckpoints - 1].fromBlock <= blockNumber) {
            return checkpoints[account][nCheckpoints - 1].votes;
        }

        if (checkpoints[account][0].fromBlock > blockNumber) {
            return 0;
        }

        uint256 lower = 0;
        uint256 upper = nCheckpoints - 1;
        while (upper > lower) {
            uint256 center = upper - (upper - lower) / 2;
            Checkpoint memory cp = checkpoints[account][center];
            if (cp.fromBlock == blockNumber) {
                return cp.votes;
            } else if (cp.fromBlock < blockNumber) {
                lower = center;
            } else {
                upper = center - 1;
            }
        }
        return checkpoints[account][lower].votes;
    }

    /**
     * @dev Get the current state of a proposal
     * @param proposalId Proposal ID
     * @return proposalState Current proposal state
     */
    function state(uint256 proposalId) public view returns (ProposalState proposalState) {
        require(proposalCount >= proposalId, "BaseGovernance: invalid proposal id");
        Proposal memory proposal = proposals[proposalId];
        if (proposal.canceled) {
            return ProposalState.Canceled;
        } else if (block.timestamp <= proposal.startTime) {
            return ProposalState.Pending;
        } else if (block.timestamp <= proposal.endTime) {
            return ProposalState.Active;
        } else if (proposal.forVotes <= proposal.againstVotes || proposal.forVotes < quorumVotes) {
            return ProposalState.Defeated;
        } else if (proposal.executed) {
            return ProposalState.Executed;
        } else if (block.timestamp >= proposal.endTime + 1) {
            return ProposalState.Expired;
        } else {
            return ProposalState.Succeeded;
        }
    }

    /**
     * @dev Get proposal information
     * @param proposalId Proposal ID
     * @return proposal Proposal information
     */
    function getProposal(uint256 proposalId) external view returns (Proposal memory proposal) {
        require(proposalCount >= proposalId, "BaseGovernance: invalid proposal id");
        return proposals[proposalId];
    }

    /**
     * @dev Get proposal receipt for a voter
     * @param proposalId Proposal ID
     * @param voter Voter address
     * @return receipt Vote receipt
     */
    function getReceipt(uint256 proposalId, address voter) external view returns (Receipt memory receipt) {
        return proposalReceipts[proposalId][voter];
    }

    /**
     * @dev Get proposal statistics
     * @param proposalId Proposal ID
     * @return forVotes For votes
     * @return againstVotes Against votes
     * @return abstainVotes Abstain votes
     * @return totalVotes Total votes
     */
    function getProposalStats(uint256 proposalId) external view returns (
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        uint256 totalVotes
    ) {
        Proposal memory proposal = proposals[proposalId];
        forVotes = proposal.forVotes;
        againstVotes = proposal.againstVotes;
        abstainVotes = proposal.abstainVotes;
        totalVotes = forVotes + againstVotes + abstainVotes;
    }

    /**
     * @dev Check if a proposal has reached quorum
     * @param proposalId Proposal ID
     * @return reached Whether quorum is reached
     */
    function hasQuorum(uint256 proposalId) external view returns (bool reached) {
        Proposal memory proposal = proposals[proposalId];
        return proposal.forVotes >= quorumVotes;
    }

    /**
     * @dev Get governance parameters
     * @return delay Voting delay in blocks
     * @return period Voting period in blocks
     * @return quorum Quorum requirement
     * @return threshold Proposal threshold
     */
    function getGovernanceParams() external view returns (
        uint256 delay,
        uint256 period,
        uint256 quorum,
        uint256 threshold
    ) {
        return (votingDelay, votingPeriod, quorumVotes, proposalThreshold);
    }

    /**
     * @dev Set voting delay (owner only)
     * @param newVotingDelay New voting delay
     */
    function setVotingDelay(uint256 newVotingDelay) external onlyOwner {
        require(newVotingDelay >= 1, "BaseGovernance: voting delay too low");
        uint256 oldVotingDelay = votingDelay;
        votingDelay = newVotingDelay;
        emit VotingDelaySet(oldVotingDelay, newVotingDelay);
    }

    /**
     * @dev Set voting period (owner only)
     * @param newVotingPeriod New voting period
     */
    function setVotingPeriod(uint256 newVotingPeriod) external onlyOwner {
        require(newVotingPeriod >= 1, "BaseGovernance: voting period too low");
        uint256 oldVotingPeriod = votingPeriod;
        votingPeriod = newVotingPeriod;
        emit VotingPeriodSet(oldVotingPeriod, newVotingPeriod);
    }

    /**
     * @dev Set quorum requirement (owner only)
     * @param newQuorumVotes New quorum requirement
     */
    function setQuorum(uint256 newQuorumVotes) external onlyOwner {
        uint256 oldQuorum = quorumVotes;
        quorumVotes = newQuorumVotes;
        emit QuorumSet(oldQuorum, newQuorumVotes);
    }

    /**
     * @dev Set proposal threshold (owner only)
     * @param newProposalThreshold New proposal threshold
     */
    function setProposalThreshold(uint256 newProposalThreshold) external onlyOwner {
        uint256 oldProposalThreshold = proposalThreshold;
        proposalThreshold = newProposalThreshold;
        emit ProposalThresholdSet(oldProposalThreshold, newProposalThreshold);
    }

    /**
     * @dev Internal function to delegate votes
     */
    function _delegate(address delegator, address delegatee) internal {
        address currentDelegate = delegates[delegator];
        uint256 delegatorBalance = IERC20(governanceToken).balanceOf(delegator);
        delegates[delegator] = delegatee;

        emit DelegationChanged(delegator, currentDelegate, delegatee);

        _moveVotingPower(currentDelegate, delegatee, delegatorBalance);
    }

    /**
     * @dev Internal function to move voting power
     */
    function _moveVotingPower(address src, address dst, uint256 amount) internal {
        if (src != dst && amount > 0) {
            if (src != address(0)) {
                uint256 oldWeight = getVotes(src, block.number);
                uint256 newWeight = oldWeight - amount;
                _writeCheckpoint(src, oldWeight, newWeight);
            }

            if (dst != address(0)) {
                uint256 oldWeight = getVotes(dst, block.number);
                uint256 newWeight = oldWeight + amount;
                _writeCheckpoint(dst, oldWeight, newWeight);
            }
        }
    }

    /**
     * @dev Internal function to write checkpoint
     */
    function _writeCheckpoint(address delegatee, uint256 oldWeight, uint256 newWeight) internal {
        uint32 blockNumber = uint32(block.number);
        uint256 nCheckpoints = numCheckpoints[delegatee];

        if (nCheckpoints > 0 && checkpoints[delegatee][nCheckpoints - 1].fromBlock == blockNumber) {
            checkpoints[delegatee][nCheckpoints - 1].votes = uint224(newWeight);
        } else {
            checkpoints[delegatee][nCheckpoints] = Checkpoint(blockNumber, uint224(newWeight));
            numCheckpoints[delegatee] = nCheckpoints + 1;
        }
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // Constants for signature verification
    bytes32 public constant DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)");
    bytes32 public constant DELEGATION_TYPEHASH = keccak256("Delegation(address delegatee,uint256 nonce,uint256 expiry)");
    bytes32 public immutable DOMAIN_SEPARATOR;
}
