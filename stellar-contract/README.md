# BaseLytics Stellar Contract

A Rust-based smart contract for the Stellar blockchain that provides staking and rewards functionality for the BaseLytics ecosystem.

## Features

- **Token Staking**: Users can stake tokens and earn rewards
- **Reward System**: Time-based reward calculation with configurable rates
- **Admin Controls**: Contract administration and emergency functions
- **Balance Tracking**: Real-time balance and staking information

## Contract Functions

### Core Functions

- `initialize(admin)` - Initialize contract with admin address
- `stake(user, token, amount)` - Stake tokens for rewards
- `unstake(user, token, amount)` - Unstake tokens
- `claim_rewards(user, reward_token)` - Claim accumulated rewards
- `calculate_rewards(user)` - Calculate pending rewards

### View Functions

- `get_stake_info(user)` - Get user's staking information
- `get_total_staked()` - Get total staked amount
- `get_balance(token)` - Get contract's token balance

### Admin Functions

- `set_reward_rate(admin, rate)` - Set reward rate (admin only)

## Data Structures

```rust
pub struct StakeInfo {
    pub amount: i128,           // Staked amount
    pub reward_debt: i128,      // Claimed rewards
    pub last_stake_time: u64,   // Last stake timestamp
}
```

## Building

```bash
cargo build --target wasm32-unknown-unknown --release
```

## Testing

```bash
cargo test
```

## Deployment

1. Build the contract
2. Deploy to Stellar network using Soroban CLI
3. Initialize with admin address

## Usage Example

```rust
// Initialize contract
client.initialize(&admin_address);

// Stake tokens
client.stake(&user_address, &token_address, &1000);

// Check rewards
let rewards = client.calculate_rewards(&user_address);

// Claim rewards
client.claim_rewards(&user_address, &reward_token_address);
```

## Security Features

- Authorization checks for all user actions
- Admin-only functions for contract management
- Safe arithmetic operations
- Proper token transfer handling

## License

MIT License