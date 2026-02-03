# BaseLytics Stellar Contract

A comprehensive Rust-based smart contract for the Stellar blockchain that provides advanced staking, rewards, and governance functionality for the BaseLytics ecosystem.

## 🚀 Features

### Core Staking
- **Token Staking**: Users can stake tokens and earn rewards
- **Flexible Unstaking**: Withdraw staked tokens with lock period support
- **Reward System**: Time-based reward calculation with configurable rates
- **Compound Rewards**: Auto-compound rewards into stake for higher yields

### Security & Emergency Controls
- **Pause/Unpause**: Emergency pause functionality for contract operations
- **Admin Controls**: Secure admin functions with proper authorization
- **Emergency Withdrawal**: Admin emergency token withdrawal capabilities
- **Admin Transfer**: Secure admin ownership transfer mechanism

### Advanced Features
- **Lock Periods**: Configurable lock periods for enhanced rewards
- **Reward Multipliers**: Bonus multipliers for long-term stakers
- **Minimum Stake**: Configurable minimum staking amounts
- **Bonus Rewards**: Admin-distributed bonus reward system

### Analytics & Reporting
- **Contract Statistics**: Track total users, volume, and rewards distributed
- **User History**: Complete staking/unstaking/claiming history
- **APY Calculation**: Real-time APY calculation
- **Balance Tracking**: Real-time balance and staking information

## 📋 Contract Functions

### Core Functions

- `initialize(admin)` - Initialize contract with admin address
- `stake(user, token, amount)` - Stake tokens for rewards
- `unstake(user, token, amount)` - Unstake tokens (respects lock periods)
- `claim_rewards(user, reward_token)` - Claim accumulated rewards
- `calculate_rewards(user)` - Calculate pending rewards
- `compound_rewards(user)` - Compound rewards into stake

### Emergency & Security Functions

- `pause_contract(admin)` - Pause all contract operations
- `unpause_contract(admin)` - Resume contract operations
- `emergency_withdraw(admin, token, amount)` - Emergency token withdrawal
- `transfer_admin(current_admin, new_admin)` - Transfer admin ownership

### Configuration Functions

- `set_reward_rate(admin, rate)` - Set base reward rate
- `set_reward_multiplier(admin, multiplier)` - Set reward multiplier
- `set_minimum_stake(admin, amount)` - Set minimum staking amount
- `set_lock_period(admin, period)` - Set lock period for stakes
- `distribute_bonus_rewards(admin, user, bonus, token)` - Distribute bonus rewards

### View Functions

- `get_stake_info(user)` - Get user's complete staking information
- `get_total_staked()` - Get total staked amount across all users
- `get_balance(token)` - Get contract's token balance
- `get_contract_stats()` - Get comprehensive contract statistics
- `get_apy()` - Get current Annual Percentage Yield
- `is_paused()` - Check if contract is paused
- `get_minimum_stake()` - Get minimum staking amount
- `get_lock_period()` - Get current lock period

## 📊 Data Structures

```rust
pub struct StakeInfo {
    pub amount: i128,           // Currently staked amount
    pub reward_debt: i128,      // Total claimed rewards
    pub last_stake_time: u64,   // Last stake/claim timestamp
    pub lock_end_time: u64,     // When tokens can be unstaked
}

pub struct ContractStats {
    pub total_users: u32,                    // Total unique stakers
    pub total_volume: i128,                  // Total volume staked
    pub total_rewards_distributed: i128,    // Total rewards paid out
}

pub struct StakeHistory {
    pub timestamp: u64,         // Action timestamp
    pub action: u32,           // 0=stake, 1=unstake, 2=claim
    pub amount: i128,          // Amount involved in action
}
```

## 🧪 Testing

The contract includes comprehensive tests covering:

### Security Tests
- Unauthorized access prevention
- Minimum stake enforcement
- Overflow protection
- Paused contract operations
- Lock period enforcement

### Edge Case Tests
- Zero amount handling
- Insufficient stake scenarios
- Multiple user interactions
- Reward calculation precision

### Integration Tests
- Full staking lifecycle
- Admin operations
- Emergency scenarios
- Multi-user staking

### Business Logic Tests
- Compound rewards functionality
- Reward multiplier effects
- Lock period functionality
- Bonus reward distribution

## 🔧 Building & Testing

### Build the contract
```bash
cargo build --target wasm32-unknown-unknown --release
```

### Run tests
```bash
cargo test
```

### Run specific test categories
```bash
# Security tests
cargo test test_unauthorized
cargo test test_paused

# Integration tests
cargo test test_full_staking_lifecycle
cargo test test_multiple_users

# Advanced features
cargo test test_compound_rewards
cargo test test_reward_multiplier
```

## 🚀 Deployment

1. Build the contract for production
2. Deploy to Stellar network using Soroban CLI
3. Initialize with admin address
4. Configure reward rates and parameters

## 💡 Usage Examples

### Basic Staking
```rust
// Initialize contract
client.initialize(&admin_address);

// Stake tokens
client.stake(&user_address, &token_address, &1000);

// Check pending rewards
let rewards = client.calculate_rewards(&user_address);

// Claim rewards
client.claim_rewards(&user_address, &reward_token_address);
```

### Advanced Features
```rust
// Set up enhanced rewards
client.set_reward_multiplier(&admin, &15000); // 1.5x multiplier
client.set_lock_period(&admin, &2592000); // 30-day lock

// Compound rewards for higher yields
client.compound_rewards(&user_address);

// Check contract statistics
let stats = client.get_contract_stats();
println!("Total users: {}, Volume: {}", stats.total_users, stats.total_volume);
```

### Emergency Operations
```rust
// Pause contract in emergency
client.pause_contract(&admin);

// Emergency token withdrawal
client.emergency_withdraw(&admin, &token, &amount);

// Transfer admin rights
client.transfer_admin(&current_admin, &new_admin);
```

## 🔒 Security Features

- **Authorization Checks**: All user actions require proper authentication
- **Admin-Only Functions**: Critical functions restricted to admin
- **Pause Mechanism**: Emergency pause for all operations
- **Safe Arithmetic**: Overflow protection and safe calculations
- **Lock Periods**: Prevent premature withdrawals
- **Minimum Stakes**: Prevent dust attacks and spam

## 📈 Advanced Capabilities

- **Dynamic APY**: Real-time APY calculation based on current parameters
- **Flexible Rewards**: Multiple reward rates and multipliers
- **Historical Tracking**: Complete audit trail of all operations
- **Statistical Analytics**: Comprehensive contract performance metrics
- **Bonus Systems**: Admin-controlled bonus reward distribution

## 🔄 Upgrade Path

The contract is designed to be:
- **Modular**: Easy to extend with new features
- **Configurable**: Most parameters can be adjusted by admin
- **Auditable**: Complete transaction history and statistics
- **Secure**: Multiple layers of security and access control

## 📄 License

MIT License