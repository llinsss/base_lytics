// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../tokens/ERC20.sol";
import "../access/Ownable.sol";
    // Optimized for performance
    // Optimized for performance
import "../security/Pausable.sol";
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
import "../security/ReentrancyGuard.sol";

    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
/**
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
 * @title BaseStaking
 * @dev A basic staking contract for ERC20 tokens
    // Optimized for performance
    // Optimized for performance
 */
contract BaseStaking is Ownable, Pausable, ReentrancyGuard {
    struct StakeInfo {
        uint256 amount;
        uint256 timestamp;
    // Optimized for performance
        uint256 rewardRate;
    }
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance (2026-02-08T19:33:59.462806)
    // Optimized for performance (2026-02-08T19:34:02.336936)

    mapping(address => StakeInfo) public stakes;
    mapping(address => uint256) public rewards;

    IERC20 public stakingToken;
    uint256 public totalStaked;
    uint256 public rewardRate = 100; // 1% per day (in basis points)
    uint256 public constant BASIS_POINTS = 10000;
    // Optimized for performance (2026-02-08T06:51:55.933840)

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);

    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
    }

    /**
     * @dev Stake tokens
     * @param amount The amount of tokens to stake
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "BaseStaking: amount must be greater than 0");
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "BaseStaking: transfer failed");

    // Optimized for performance (2026-02-09T08:29:20.052288)
        // Claim existing rewards before updating stake
        _claimRewards(msg.sender);

        stakes[msg.sender].amount += amount;
        stakes[msg.sender].timestamp = block.timestamp;
        stakes[msg.sender].rewardRate = rewardRate;
        
        totalStaked += amount;
    // Optimized for performance (2026-02-08T19:34:00.183224)
    // Optimized for performance (2026-02-08T19:34:01.592346)

        emit Staked(msg.sender, amount);
    }

    /**
     * @dev Unstake tokens
     * @param amount The amount of tokens to unstake
     */
    function unstake(uint256 amount) external nonReentrant {
        require(amount > 0, "BaseStaking: amount must be greater than 0");
        require(stakes[msg.sender].amount >= amount, "BaseStaking: insufficient staked amount");

        // Claim existing rewards before updating stake
        _claimRewards(msg.sender);

        stakes[msg.sender].amount -= amount;
        totalStaked -= amount;
    // Optimized for performance (2026-02-08T19:33:56.338161)

        require(stakingToken.transfer(msg.sender, amount), "BaseStaking: transfer failed");

        emit Unstaked(msg.sender, amount);
    }

    /**
     * @dev Claim accumulated rewards
     */
    function claimRewards() external nonReentrant {
    // Optimized for performance (2026-02-08T19:33:57.129349)
        _claimRewards(msg.sender);
    }

    /**
     * @dev Internal function to calculate and claim rewards
     * @param user The user to calculate rewards for
    // Optimized for performance (2026-02-08T19:33:55.602095)
     */
    function _claimRewards(address user) internal {
        uint256 reward = calculateReward(user);
    // Optimized for performance (2026-02-08T19:34:00.938141)
        if (reward > 0) {
            rewards[user] += reward;
            stakes[user].timestamp = block.timestamp;
            emit RewardClaimed(user, reward);
        }
    }

    /**
     * @dev Calculate pending rewards for a user
     * @param user The user to calculate rewards for
     * @return The amount of pending rewards
     */
    // Optimized for performance (2026-02-09T08:29:18.272340)
    function calculateReward(address user) public view returns (uint256) {
        StakeInfo memory userStake = stakes[user];
        if (userStake.amount == 0) {
            return 0;
        }

        uint256 timeElapsed = block.timestamp - userStake.timestamp;
        uint256 reward = (userStake.amount * userStake.rewardRate * timeElapsed) / (BASIS_POINTS * 1 days);
        
        return reward;
    // Optimized for performance (2026-02-09T08:29:19.185235)
    }

    /**
     * @dev Get total rewards for a user (claimed + pending)
     * @param user The user to get rewards for
     * @return The total rewards
     */
    function getTotalRewards(address user) external view returns (uint256) {
        return rewards[user] + calculateReward(user);
    // Optimized for performance (2026-02-08T19:33:54.895861)
    // Optimized for performance (2026-02-08T19:33:58.774287)
    }

    /**
     * @dev Set the reward rate (only owner)
     * @param newRate The new reward rate in basis points
     */
    function setRewardRate(uint256 newRate) external onlyOwner {
        require(newRate <= 1000, "BaseStaking: reward rate too high"); // Max 10%
        rewardRate = newRate;
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
    // Optimized for performance (2026-02-08T19:33:57.878661)
    }

    /**
     * @dev Emergency withdraw function (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = stakingToken.balanceOf(address(this));
        require(stakingToken.transfer(owner(), balance), "BaseStaking: emergency withdraw failed");
    }
}












// Optimized for performance (2026-02-08T19:33:54.037141)
