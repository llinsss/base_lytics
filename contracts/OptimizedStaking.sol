// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BaseLyticsRewards.sol";

contract OptimizedStaking is ReentrancyGuard, Ownable {
    IERC20 public immutable stakingToken;
    BaseLyticsRewards public immutable rewardsContract;
    
    uint256 public constant REWARD_RATE = 100; // 1% per day
    uint256 public constant SECONDS_PER_DAY = 86400;
    
    struct StakeInfo {
        uint256 amount;
        uint256 timestamp;
        uint256 lastRewardTime;
    }
    
    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    
    constructor(address _stakingToken, address _rewardsContract) {
        stakingToken = IERC20(_stakingToken);
        rewardsContract = BaseLyticsRewards(_rewardsContract);
    }
    
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        
        // Claim pending rewards first
        _claimRewards(msg.sender);
        
        stakingToken.transferFrom(msg.sender, address(this), amount);
        
        StakeInfo storage userStake = stakes[msg.sender];
        userStake.amount += amount;
        userStake.timestamp = block.timestamp;
        userStake.lastRewardTime = block.timestamp;
        
        totalStaked += amount;
        
        // Record staking activity for rewards
        rewardsContract.recordStaking(msg.sender, amount);
        
        emit Staked(msg.sender, amount);
    }
    
    function unstake(uint256 amount) external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount >= amount, "Insufficient stake");
        
        // Claim pending rewards first
        _claimRewards(msg.sender);
        
        userStake.amount -= amount;
        totalStaked -= amount;
        
        stakingToken.transfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, amount);
    }
    
    function claimRewards() external nonReentrant {
        _claimRewards(msg.sender);
    }
    
    function _claimRewards(address user) internal {
        StakeInfo storage userStake = stakes[user];
        if (userStake.amount == 0) return;
        
        uint256 rewards = calculateRewards(user);
        if (rewards > 0) {
            userStake.lastRewardTime = block.timestamp;
            stakingToken.transfer(user, rewards);
            emit RewardsClaimed(user, rewards);
        }
    }
    
    function calculateRewards(address user) public view returns (uint256) {
        StakeInfo memory userStake = stakes[user];
        if (userStake.amount == 0) return 0;
        
        uint256 timeStaked = block.timestamp - userStake.lastRewardTime;
        return (userStake.amount * REWARD_RATE * timeStaked) / (10000 * SECONDS_PER_DAY);
    }
    
    function getStakeInfo(address user) external view returns (uint256 amount, uint256 timestamp, uint256 pendingRewards) {
        StakeInfo memory userStake = stakes[user];
        return (userStake.amount, userStake.timestamp, calculateRewards(user));
    }
}