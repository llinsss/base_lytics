// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../tokens/ERC20.sol";
import "../access/Ownable.sol";
import "../security/Pausable.sol";
import "../security/ReentrancyGuard.sol";

/**
 * @title BaseStaking
 * @dev A basic staking contract for ERC20 tokens
 */
contract BaseStaking is Ownable, Pausable, ReentrancyGuard {
    struct StakeInfo {
        uint256 amount;
        uint256 timestamp;
        uint256 rewardRate;
    }

    mapping(address => StakeInfo) public stakes;
    mapping(address => uint256) public rewards;

    IERC20 public stakingToken;
    uint256 public totalStaked;
    uint256 public rewardRate = 100; // 1% per day (in basis points)
    uint256 public constant BASIS_POINTS = 10000;

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

        // Claim existing rewards before updating stake
        _claimRewards(msg.sender);

        stakes[msg.sender].amount += amount;
        stakes[msg.sender].timestamp = block.timestamp;
        stakes[msg.sender].rewardRate = rewardRate;
        
        totalStaked += amount;

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

        require(stakingToken.transfer(msg.sender, amount), "BaseStaking: transfer failed");

        emit Unstaked(msg.sender, amount);
    }

    /**
     * @dev Claim accumulated rewards
     */
    function claimRewards() external nonReentrant {
        _claimRewards(msg.sender);
    }

    /**
     * @dev Internal function to calculate and claim rewards
     * @param user The user to calculate rewards for
     */
    function _claimRewards(address user) internal {
        uint256 reward = calculateReward(user);
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
    function calculateReward(address user) public view returns (uint256) {
        StakeInfo memory userStake = stakes[user];
        if (userStake.amount == 0) {
            return 0;
        }

        uint256 timeElapsed = block.timestamp - userStake.timestamp;
        uint256 reward = (userStake.amount * userStake.rewardRate * timeElapsed) / (BASIS_POINTS * 1 days);
        
        return reward;
    }

    /**
     * @dev Get total rewards for a user (claimed + pending)
     * @param user The user to get rewards for
     * @return The total rewards
     */
    function getTotalRewards(address user) external view returns (uint256) {
        return rewards[user] + calculateReward(user);
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
    }

    /**
     * @dev Emergency withdraw function (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = stakingToken.balanceOf(address(this));
        require(stakingToken.transfer(owner(), balance), "BaseStaking: emergency withdraw failed");
    }
}
