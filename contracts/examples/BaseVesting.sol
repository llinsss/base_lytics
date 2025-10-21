// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../tokens/ERC20.sol";
import "../access/Ownable.sol";
import "../security/ReentrancyGuard.sol";
import "../security/Pausable.sol";

/**
 * @title BaseVesting
 * @dev Token vesting contract with linear and cliff vesting schedules
 * Features: Team allocation, investor vesting, cliff periods, emergency functions
 */
contract BaseVesting is Ownable, ReentrancyGuard, Pausable {
    // Events
    event VestingScheduleCreated(address indexed beneficiary, uint256 totalAmount, uint256 cliffDuration, uint256 vestingDuration);
    event TokensVested(address indexed beneficiary, uint256 amount);
    event VestingScheduleRevoked(address indexed beneficiary);
    event EmergencyWithdraw(address indexed token, uint256 amount);

    // Vesting schedule structure
    struct VestingSchedule {
        bool initialized;
        address beneficiary;
        uint256 cliffDuration; // Cliff period in seconds
        uint256 vestingDuration; // Total vesting duration in seconds
        uint256 startTime; // Vesting start timestamp
        uint256 totalAmount; // Total tokens to be vested
        uint256 releasedAmount; // Amount already released
        bool revocable; // Whether the schedule can be revoked
    }

    // State variables
    mapping(address => VestingSchedule) public vestingSchedules;
    mapping(address => bool) public hasVestingSchedule;
    
    address public vestingToken;
    uint256 public totalVestedAmount;
    uint256 public totalReleasedAmount;
    
    // Emergency controls
    bool public emergencyMode = false;
    mapping(address => bool) public emergencyWithdrawers;

    constructor(address _vestingToken) {
        vestingToken = _vestingToken;
        emergencyWithdrawers[msg.sender] = true;
    }

    /**
     * @dev Create a vesting schedule for a beneficiary
     * @param beneficiary Address of the beneficiary
     * @param totalAmount Total amount of tokens to vest
     * @param cliffDuration Cliff duration in seconds (0 for no cliff)
     * @param vestingDuration Total vesting duration in seconds
     * @param revocable Whether the schedule can be revoked
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 totalAmount,
        uint256 cliffDuration,
        uint256 vestingDuration,
        bool revocable
    ) external onlyOwner {
        require(beneficiary != address(0), "BaseVesting: zero address");
        require(totalAmount > 0, "BaseVesting: invalid amount");
        require(vestingDuration > 0, "BaseVesting: invalid duration");
        require(!hasVestingSchedule[beneficiary], "BaseVesting: schedule exists");
        
        // Transfer tokens to this contract
        require(IERC20(vestingToken).transferFrom(msg.sender, address(this), totalAmount), "BaseVesting: transfer failed");
        
        vestingSchedules[beneficiary] = VestingSchedule({
            initialized: true,
            beneficiary: beneficiary,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration,
            startTime: block.timestamp,
            totalAmount: totalAmount,
            releasedAmount: 0,
            revocable: revocable
        });
        
        hasVestingSchedule[beneficiary] = true;
        totalVestedAmount += totalAmount;
        
        emit VestingScheduleCreated(beneficiary, totalAmount, cliffDuration, vestingDuration);
    }

    /**
     * @dev Create multiple vesting schedules in batch
     * @param beneficiaries Array of beneficiary addresses
     * @param totalAmounts Array of total amounts
     * @param cliffDurations Array of cliff durations
     * @param vestingDurations Array of vesting durations
     * @param revocables Array of revocable flags
     */
    function createVestingSchedulesBatch(
        address[] calldata beneficiaries,
        uint256[] calldata totalAmounts,
        uint256[] calldata cliffDurations,
        uint256[] calldata vestingDurations,
        bool[] calldata revocables
    ) external onlyOwner {
        require(beneficiaries.length == totalAmounts.length, "BaseVesting: array length mismatch");
        require(beneficiaries.length == cliffDurations.length, "BaseVesting: array length mismatch");
        require(beneficiaries.length == vestingDurations.length, "BaseVesting: array length mismatch");
        require(beneficiaries.length == revocables.length, "BaseVesting: array length mismatch");
        
        uint256 totalTransferAmount = 0;
        
        // Calculate total amount to transfer
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            require(beneficiaries[i] != address(0), "BaseVesting: zero address");
            require(totalAmounts[i] > 0, "BaseVesting: invalid amount");
            require(vestingDurations[i] > 0, "BaseVesting: invalid duration");
            require(!hasVestingSchedule[beneficiaries[i]], "BaseVesting: schedule exists");
            
            totalTransferAmount += totalAmounts[i];
        }
        
        // Transfer all tokens at once
        require(IERC20(vestingToken).transferFrom(msg.sender, address(this), totalTransferAmount), "BaseVesting: transfer failed");
        
        // Create vesting schedules
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            vestingSchedules[beneficiaries[i]] = VestingSchedule({
                initialized: true,
                beneficiary: beneficiaries[i],
                cliffDuration: cliffDurations[i],
                vestingDuration: vestingDurations[i],
                startTime: block.timestamp,
                totalAmount: totalAmounts[i],
                releasedAmount: 0,
                revocable: revocables[i]
            });
            
            hasVestingSchedule[beneficiaries[i]] = true;
            totalVestedAmount += totalAmounts[i];
            
            emit VestingScheduleCreated(beneficiaries[i], totalAmounts[i], cliffDurations[i], vestingDurations[i]);
        }
    }

    /**
     * @dev Release vested tokens to beneficiary
     * @param beneficiary Address of the beneficiary
     */
    function release(address beneficiary) external nonReentrant whenNotPaused {
        require(hasVestingSchedule[beneficiary], "BaseVesting: no schedule");
        
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        uint256 releasableAmount = getReleasableAmount(beneficiary);
        
        require(releasableAmount > 0, "BaseVesting: no tokens to release");
        
        schedule.releasedAmount += releasableAmount;
        totalReleasedAmount += releasableAmount;
        
        require(IERC20(vestingToken).transfer(beneficiary, releasableAmount), "BaseVesting: transfer failed");
        
        emit TokensVested(beneficiary, releasableAmount);
    }

    /**
     * @dev Release tokens for multiple beneficiaries
     * @param beneficiaries Array of beneficiary addresses
     */
    function releaseBatch(address[] calldata beneficiaries) external nonReentrant whenNotPaused {
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            if (hasVestingSchedule[beneficiaries[i]]) {
                VestingSchedule storage schedule = vestingSchedules[beneficiaries[i]];
                uint256 releasableAmount = getReleasableAmount(beneficiaries[i]);
                
                if (releasableAmount > 0) {
                    schedule.releasedAmount += releasableAmount;
                    totalReleasedAmount += releasableAmount;
                    
                    require(IERC20(vestingToken).transfer(beneficiaries[i], releasableAmount), "BaseVesting: transfer failed");
                    
                    emit TokensVested(beneficiaries[i], releasableAmount);
                }
            }
        }
    }

    /**
     * @dev Revoke a vesting schedule (only if revocable)
     * @param beneficiary Address of the beneficiary
     */
    function revokeVestingSchedule(address beneficiary) external onlyOwner {
        require(hasVestingSchedule[beneficiary], "BaseVesting: no schedule");
        
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        require(schedule.revocable, "BaseVesting: not revocable");
        
        uint256 unreleasedAmount = schedule.totalAmount - schedule.releasedAmount;
        
        if (unreleasedAmount > 0) {
            // Transfer unreleased tokens back to owner
            require(IERC20(vestingToken).transfer(owner(), unreleasedAmount), "BaseVesting: transfer failed");
            
            totalVestedAmount -= unreleasedAmount;
            schedule.totalAmount = schedule.releasedAmount;
        }
        
        hasVestingSchedule[beneficiary] = false;
        
        emit VestingScheduleRevoked(beneficiary);
    }

    /**
     * @dev Get the amount of tokens that can be released for a beneficiary
     * @param beneficiary Address of the beneficiary
     * @return amount Releasable amount
     */
    function getReleasableAmount(address beneficiary) public view returns (uint256 amount) {
        if (!hasVestingSchedule[beneficiary]) {
            return 0;
        }
        
        VestingSchedule memory schedule = vestingSchedules[beneficiary];
        
        // Check if cliff period has passed
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return 0;
        }
        
        // Calculate vested amount
        uint256 vestedAmount = getVestedAmount(beneficiary);
        
        // Return releasable amount (vested - already released)
        if (vestedAmount > schedule.releasedAmount) {
            amount = vestedAmount - schedule.releasedAmount;
        }
    }

    /**
     * @dev Get the total amount of tokens vested for a beneficiary
     * @param beneficiary Address of the beneficiary
     * @return amount Vested amount
     */
    function getVestedAmount(address beneficiary) public view returns (uint256 amount) {
        if (!hasVestingSchedule[beneficiary]) {
            return 0;
        }
        
        VestingSchedule memory schedule = vestingSchedules[beneficiary];
        
        // If before cliff, no tokens are vested
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return 0;
        }
        
        // If vesting period is complete, all tokens are vested
        if (block.timestamp >= schedule.startTime + schedule.vestingDuration) {
            return schedule.totalAmount;
        }
        
        // Calculate linear vesting
        uint256 timeElapsed = block.timestamp - schedule.startTime - schedule.cliffDuration;
        uint256 vestingPeriod = schedule.vestingDuration - schedule.cliffDuration;
        
        amount = (schedule.totalAmount * timeElapsed) / vestingPeriod;
    }

    /**
     * @dev Get vesting schedule information
     * @param beneficiary Address of the beneficiary
     * @return schedule Vesting schedule information
     */
    function getVestingSchedule(address beneficiary) external view returns (VestingSchedule memory schedule) {
        require(hasVestingSchedule[beneficiary], "BaseVesting: no schedule");
        return vestingSchedules[beneficiary];
    }

    /**
     * @dev Get vesting statistics
     * @return totalVested Total amount of tokens vested
     * @return totalReleased Total amount of tokens released
     * @return totalPending Total amount of tokens pending release
     */
    function getVestingStats() external view returns (
        uint256 totalVested,
        uint256 totalReleased,
        uint256 totalPending
    ) {
        totalVested = totalVestedAmount;
        totalReleased = totalReleasedAmount;
        totalPending = totalVestedAmount - totalReleasedAmount;
    }

    /**
     * @dev Get beneficiary's vesting information
     * @param beneficiary Address of the beneficiary
     * @return totalAmount Total amount in vesting schedule
     * @return releasedAmount Amount already released
     * @return vestedAmount Amount currently vested
     * @return releasableAmount Amount that can be released now
     */
    function getBeneficiaryInfo(address beneficiary) external view returns (
        uint256 totalAmount,
        uint256 releasedAmount,
        uint256 vestedAmount,
        uint256 releasableAmount
    ) {
        if (!hasVestingSchedule[beneficiary]) {
            return (0, 0, 0, 0);
        }
        
        VestingSchedule memory schedule = vestingSchedules[beneficiary];
        totalAmount = schedule.totalAmount;
        releasedAmount = schedule.releasedAmount;
        vestedAmount = getVestedAmount(beneficiary);
        releasableAmount = getReleasableAmount(beneficiary);
    }

    /**
     * @dev Calculate vesting progress percentage
     * @param beneficiary Address of the beneficiary
     * @return progressPercentage Progress as percentage (0-100)
     */
    function getVestingProgress(address beneficiary) external view returns (uint256 progressPercentage) {
        if (!hasVestingSchedule[beneficiary]) {
            return 0;
        }
        
        VestingSchedule memory schedule = vestingSchedules[beneficiary];
        
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return 0;
        }
        
        if (block.timestamp >= schedule.startTime + schedule.vestingDuration) {
            return 100;
        }
        
        uint256 timeElapsed = block.timestamp - schedule.startTime - schedule.cliffDuration;
        uint256 vestingPeriod = schedule.vestingDuration - schedule.cliffDuration;
        
        progressPercentage = (timeElapsed * 100) / vestingPeriod;
    }

    /**
     * @dev Set emergency mode
     * @param enabled Whether emergency mode is enabled
     */
    function setEmergencyMode(bool enabled) external onlyOwner {
        emergencyMode = enabled;
    }

    /**
     * @dev Add emergency withdrawer
     * @param withdrawer Address to add as emergency withdrawer
     */
    function addEmergencyWithdrawer(address withdrawer) external onlyOwner {
        emergencyWithdrawers[withdrawer] = true;
    }

    /**
     * @dev Remove emergency withdrawer
     * @param withdrawer Address to remove as emergency withdrawer
     */
    function removeEmergencyWithdrawer(address withdrawer) external onlyOwner {
        emergencyWithdrawers[withdrawer] = false;
    }

    /**
     * @dev Emergency withdraw function
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external {
        require(emergencyMode, "BaseVesting: emergency mode not enabled");
        require(emergencyWithdrawers[msg.sender], "BaseVesting: not authorized");
        
        require(IERC20(vestingToken).transfer(msg.sender, amount), "BaseVesting: transfer failed");
        
        emit EmergencyWithdraw(vestingToken, amount);
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
     * @dev Change vesting token (only before any vesting schedules are created)
     * @param newVestingToken New vesting token address
     */
    function changeVestingToken(address newVestingToken) external onlyOwner {
        require(totalVestedAmount == 0, "BaseVesting: vesting schedules exist");
        require(newVestingToken != address(0), "BaseVesting: zero address");
        vestingToken = newVestingToken;
    }
}
