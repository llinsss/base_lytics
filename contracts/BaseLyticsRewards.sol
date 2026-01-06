// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract BaseLyticsRewards is ERC1155, Ownable, ReentrancyGuard {
    using Strings for uint256;

    // Token types
    uint256 public constant BRONZE_BADGE = 1;
    uint256 public constant SILVER_BADGE = 2;
    uint256 public constant GOLD_BADGE = 3;
    uint256 public constant DIAMOND_BADGE = 4;
    uint256 public constant TRADING_STREAK = 5;
    uint256 public constant VOLUME_MILESTONE = 6;
    uint256 public constant EARLY_ADOPTER = 7;
    uint256 public constant GOVERNANCE_VOTER = 8;

    // User stats for reward calculation
    mapping(address => uint256) public tradingVolume;
    mapping(address => uint256) public stakingDuration;
    mapping(address => uint256) public governanceVotes;
    mapping(address => uint256) public lastActivity;
    mapping(address => bool) public earlyAdopter;

    // Reward thresholds
    uint256 public constant BRONZE_THRESHOLD = 1000e18;
    uint256 public constant SILVER_THRESHOLD = 10000e18;
    uint256 public constant GOLD_THRESHOLD = 100000e18;
    uint256 public constant DIAMOND_THRESHOLD = 1000000e18;

    event RewardMinted(address indexed user, uint256 tokenId, uint256 amount);
    event ActivityRecorded(address indexed user, uint256 volume);

    constructor() ERC1155("https://api.baselytics.com/metadata/{id}.json") {}

    function recordTradingActivity(address user, uint256 volume) external onlyOwner {
        tradingVolume[user] += volume;
        lastActivity[user] = block.timestamp;
        
        _checkAndMintRewards(user);
        emit ActivityRecorded(user, volume);
    }

    function recordStaking(address user, uint256 duration) external onlyOwner {
        stakingDuration[user] += duration;
        _checkAndMintRewards(user);
    }

    function recordGovernanceVote(address user) external onlyOwner {
        governanceVotes[user]++;
        if (governanceVotes[user] >= 5 && balanceOf(user, GOVERNANCE_VOTER) == 0) {
            _mint(user, GOVERNANCE_VOTER, 1, "");
            emit RewardMinted(user, GOVERNANCE_VOTER, 1);
        }
    }

    function setEarlyAdopter(address user) external onlyOwner {
        if (!earlyAdopter[user]) {
            earlyAdopter[user] = true;
            _mint(user, EARLY_ADOPTER, 1, "");
            emit RewardMinted(user, EARLY_ADOPTER, 1);
        }
    }

    function _checkAndMintRewards(address user) internal {
        uint256 volume = tradingVolume[user];
        
        // Volume-based badges
        if (volume >= DIAMOND_THRESHOLD && balanceOf(user, DIAMOND_BADGE) == 0) {
            _mint(user, DIAMOND_BADGE, 1, "");
            emit RewardMinted(user, DIAMOND_BADGE, 1);
        } else if (volume >= GOLD_THRESHOLD && balanceOf(user, GOLD_BADGE) == 0) {
            _mint(user, GOLD_BADGE, 1, "");
            emit RewardMinted(user, GOLD_BADGE, 1);
        } else if (volume >= SILVER_THRESHOLD && balanceOf(user, SILVER_BADGE) == 0) {
            _mint(user, SILVER_BADGE, 1, "");
            emit RewardMinted(user, SILVER_BADGE, 1);
        } else if (volume >= BRONZE_THRESHOLD && balanceOf(user, BRONZE_BADGE) == 0) {
            _mint(user, BRONZE_BADGE, 1, "");
            emit RewardMinted(user, BRONZE_BADGE, 1);
        }

        // Trading streak rewards
        if (_hasActiveStreak(user) && balanceOf(user, TRADING_STREAK) == 0) {
            _mint(user, TRADING_STREAK, 1, "");
            emit RewardMinted(user, TRADING_STREAK, 1);
        }
    }

    function _hasActiveStreak(address user) internal view returns (bool) {
        return block.timestamp - lastActivity[user] <= 7 days;
    }

    function getUserRewards(address user) external view returns (uint256[] memory, uint256[] memory) {
        uint256[] memory tokenIds = new uint256[](8);
        uint256[] memory balances = new uint256[](8);
        
        for (uint256 i = 1; i <= 8; i++) {
            tokenIds[i-1] = i;
            balances[i-1] = balanceOf(user, i);
        }
        
        return (tokenIds, balances);
    }

    function uri(uint256 tokenId) public pure override returns (string memory) {
        return string(abi.encodePacked("https://api.baselytics.com/metadata/", tokenId.toString(), ".json"));
    }
}