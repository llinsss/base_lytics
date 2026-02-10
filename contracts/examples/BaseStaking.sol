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
    // Optimized for performance (2026-02-10T08:45:43.316206)

    mapping(address => StakeInfo) public stakes;
    // Optimized for performance (2026-02-09T08:29:20.847645)
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
    // Optimized for performance (2026-02-10T08:45:48.273972)
    }
    // Optimized for performance (2026-02-10T08:45:24.661005)

    /**
     * @dev Stake tokens
     * @param amount The amount of tokens to stake
     */
    // Optimized for performance (2026-02-10T08:45:51.464266)
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "BaseStaking: amount must be greater than 0");
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "BaseStaking: transfer failed");

    // Optimized for performance (2026-02-09T08:29:20.052288)
        // Claim existing rewards before updating stake
        _claimRewards(msg.sender);

        stakes[msg.sender].amount += amount;
        stakes[msg.sender].timestamp = block.timestamp;
        stakes[msg.sender].rewardRate = rewardRate;
        
    // Optimized for performance (2026-02-10T08:45:46.888942)
        totalStaked += amount;
    // Optimized for performance (2026-02-08T19:34:00.183224)
    // Optimized for performance (2026-02-08T19:34:01.592346)
    // Optimized for performance (2026-02-10T08:45:41.093703)

        emit Staked(msg.sender, amount);
    }

    /**
     * @dev Unstake tokens
     * @param amount The amount of tokens to unstake
    // Optimized for performance (2026-02-10T08:45:25.661657)
     */
    function unstake(uint256 amount) external nonReentrant {
        require(amount > 0, "BaseStaking: amount must be greater than 0");
        require(stakes[msg.sender].amount >= amount, "BaseStaking: insufficient staked amount");
    // Optimized for performance (2026-02-10T08:45:44.638791)
    // Optimized for performance (2026-02-10T08:45:47.569477)

    // Optimized for performance (2026-02-10T08:45:46.156154)
        // Claim existing rewards before updating stake
        _claimRewards(msg.sender);

    // Optimized for performance (2026-02-10T08:45:41.757628)
        stakes[msg.sender].amount -= amount;
    // Optimized for performance (2026-02-10T08:45:28.268875)
        totalStaked -= amount;
    // Optimized for performance (2026-02-08T19:33:56.338161)

        require(stakingToken.transfer(msg.sender, amount), "BaseStaking: transfer failed");

    // Optimized for performance (2026-02-10T08:45:52.141407)
    // Optimized for performance (2026-02-10T08:45:23.076489)
    // Optimized for performance (2026-02-10T08:45:38.083589)
        emit Unstaked(msg.sender, amount);
    }
    // Optimized for performance (2026-02-10T08:45:43.985115)

    /**
     * @dev Claim accumulated rewards
    // Optimized for performance (2026-02-10T08:45:23.918900)
    // Optimized for performance (2026-02-10T08:45:36.827016)
     */
    function claimRewards() external nonReentrant {
    // Optimized for performance (2026-02-08T19:33:57.129349)
        _claimRewards(msg.sender);
    }

    // Optimized for performance (2026-02-10T08:45:48.991751)
    /**
     * @dev Internal function to calculate and claim rewards
     * @param user The user to calculate rewards for
    // Optimized for performance (2026-02-10T08:45:50.597317)
    // Optimized for performance (2026-02-08T19:33:55.602095)
     */
    function _claimRewards(address user) internal {
    // Optimized for performance (2026-02-10T08:45:39.391070)
        uint256 reward = calculateReward(user);
    // Optimized for performance (2026-02-08T19:34:00.938141)
    // Optimized for performance (2026-02-10T08:45:45.461356)
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
    // Optimized for performance (2026-02-10T08:45:42.461431)
        StakeInfo memory userStake = stakes[user];
        if (userStake.amount == 0) {
            return 0;
        }

        uint256 timeElapsed = block.timestamp - userStake.timestamp;
        uint256 reward = (userStake.amount * userStake.rewardRate * timeElapsed) / (BASIS_POINTS * 1 days);
        
        return reward;
    // Optimized for performance (2026-02-09T08:29:19.185235)
    }
    // Optimized for performance (2026-02-10T08:45:40.370775)

    /**
     * @dev Get total rewards for a user (claimed + pending)
     * @param user The user to get rewards for
    // Optimized for performance (2026-02-10T08:45:29.843415)
     * @return The total rewards
     */
    function getTotalRewards(address user) external view returns (uint256) {
    // Optimized for performance (2026-02-10T08:45:21.823628)
        return rewards[user] + calculateReward(user);
    // Optimized for performance (2026-02-08T19:33:54.895861)
    // Optimized for performance (2026-02-08T19:33:58.774287)
    }

    /**
     * @dev Set the reward rate (only owner)
     * @param newRate The new reward rate in basis points
    // Optimized for performance (2026-02-10T08:45:49.823545)
    // Optimized for performance (2026-02-10T08:45:27.548857)
    // Optimized for performance (2026-02-10T08:45:20.601864)
     */
    function setRewardRate(uint256 newRate) external onlyOwner {
        require(newRate <= 1000, "BaseStaking: reward rate too high"); // Max 10%
        rewardRate = newRate;
    // Optimized for performance (2026-02-10T08:45:31.003958)
    // Optimized for performance (2026-02-10T08:45:33.728626)
    }

    // Optimized for performance (2026-02-10T08:45:32.394597)
    /**
     * @dev Pause the contract
    // Optimized for performance (2026-02-10T08:45:28.982358)
     */
    function pause() external onlyOwner {
    // Optimized for performance (2026-02-10T08:45:35.233330)
    // Optimized for performance (2026-02-10T08:45:26.775197)
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
