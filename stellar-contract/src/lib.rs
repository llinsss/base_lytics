#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, token};

#[contracttype]
pub enum DataKey {
    Admin,
    UserStake(Address),
    TotalStaked,
    RewardRate,
    Paused,
    MinimumStake,
    SupportedTokens,
    TokenRewardRate(Address),
    UserHistory(Address),
    ContractStats,
    RewardMultiplier,
    LockPeriod,
}

#[contracttype]
pub struct StakeInfo {
    pub amount: i128,
    pub reward_debt: i128,
    pub last_stake_time: u64,
    pub lock_end_time: u64,
}

#[contracttype]
pub struct ContractStats {
    pub total_users: u32,
    pub total_volume: i128,
    pub total_rewards_distributed: i128,
}

#[contracttype]
pub struct StakeHistory {
    pub timestamp: u64,
    pub action: u32, // 0=stake, 1=unstake, 2=claim
    pub amount: i128,
}

#[contract]
pub struct BaseLyticsContract;

#[contractimpl]
impl BaseLyticsContract {
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalStaked, &0i128);
        env.storage().instance().set(&DataKey::RewardRate, &100i128);
        env.storage().instance().set(&DataKey::Paused, &false);
        env.storage().instance().set(&DataKey::MinimumStake, &100i128);
        env.storage().instance().set(&DataKey::RewardMultiplier, &10000i128);
        env.storage().instance().set(&DataKey::LockPeriod, &0u64);
        env.storage().instance().set(&DataKey::ContractStats, &ContractStats {
            total_users: 0,
            total_volume: 0,
            total_rewards_distributed: 0,
        });
    }

    pub fn stake(env: Env, user: Address, token: Address, amount: i128) {
        user.require_auth();
        Self::require_not_paused(&env);
        
        let min_stake: i128 = env.storage().instance().get(&DataKey::MinimumStake).unwrap_or(100);
        assert!(amount >= min_stake, "Amount below minimum stake");
        
        token::Client::new(&env, &token).transfer(&user, &env.current_contract_address(), &amount);
        
        let is_new_user = !env.storage().persistent().has(&DataKey::UserStake(user.clone()));
        
        let mut stake_info: StakeInfo = env.storage().persistent()
            .get(&DataKey::UserStake(user.clone()))
            .unwrap_or(StakeInfo {
                amount: 0,
                reward_debt: 0,
                last_stake_time: env.ledger().timestamp(),
                lock_end_time: 0,
            });
        
        stake_info.amount += amount;
        stake_info.last_stake_time = env.ledger().timestamp();
        
        let lock_period: u64 = env.storage().instance().get(&DataKey::LockPeriod).unwrap_or(0);
        if lock_period > 0 {
            stake_info.lock_end_time = env.ledger().timestamp() + lock_period;
        }
        
        env.storage().persistent().set(&DataKey::UserStake(user.clone()), &stake_info);
        
        let total_staked: i128 = env.storage().instance().get(&DataKey::TotalStaked).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalStaked, &(total_staked + amount));
        
        Self::update_stats(&env, is_new_user, amount, 0);
        Self::add_to_history(&env, user, 0, amount);
    }

    pub fn unstake(env: Env, user: Address, token: Address, amount: i128) {
        user.require_auth();
        Self::require_not_paused(&env);
        
        let mut stake_info: StakeInfo = env.storage().persistent()
            .get(&DataKey::UserStake(user.clone()))
            .unwrap_or_panic();
        
        assert!(stake_info.amount >= amount, "Insufficient stake");
        assert!(env.ledger().timestamp() >= stake_info.lock_end_time, "Tokens still locked");
        
        stake_info.amount -= amount;
        env.storage().persistent().set(&DataKey::UserStake(user.clone()), &stake_info);
        
        token::Client::new(&env, &token).transfer(&env.current_contract_address(), &user, &amount);
        
        let total_staked: i128 = env.storage().instance().get(&DataKey::TotalStaked).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalStaked, &(total_staked - amount));
        
        Self::update_stats(&env, false, 0, 0);
        Self::add_to_history(&env, user, 1, amount);
    }

    pub fn calculate_rewards(env: Env, user: Address) -> i128 {
        let stake_info: StakeInfo = env.storage().persistent()
            .get(&DataKey::UserStake(user))
            .unwrap_or(StakeInfo {
                amount: 0,
                reward_debt: 0,
                last_stake_time: 0,
                lock_end_time: 0,
            });
        
        if stake_info.amount == 0 {
            return 0;
        }
        
        let current_time = env.ledger().timestamp();
        let time_diff = current_time - stake_info.last_stake_time;
        let reward_rate: i128 = env.storage().instance().get(&DataKey::RewardRate).unwrap_or(100);
        let multiplier: i128 = env.storage().instance().get(&DataKey::RewardMultiplier).unwrap_or(10000);
        
        let base_rewards = (stake_info.amount * reward_rate * time_diff as i128) / (365 * 24 * 3600 * 10000);
        (base_rewards * multiplier) / 10000
    }

    pub fn claim_rewards(env: Env, user: Address, reward_token: Address) -> i128 {
        user.require_auth();
        Self::require_not_paused(&env);
        
        let rewards = Self::calculate_rewards(env.clone(), user.clone());
        
        if rewards > 0 {
            let mut stake_info: StakeInfo = env.storage().persistent()
                .get(&DataKey::UserStake(user.clone()))
                .unwrap_or_panic();
            
            stake_info.reward_debt += rewards;
            stake_info.last_stake_time = env.ledger().timestamp();
            env.storage().persistent().set(&DataKey::UserStake(user.clone()), &stake_info);
            
            token::Client::new(&env, &reward_token).transfer(&env.current_contract_address(), &user, &rewards);
            
            Self::update_stats(&env, false, 0, rewards);
            Self::add_to_history(&env, user, 2, rewards);
        }
        
        rewards
    }

    pub fn get_stake_info(env: Env, user: Address) -> StakeInfo {
        env.storage().persistent()
            .get(&DataKey::UserStake(user))
            .unwrap_or(StakeInfo {
                amount: 0,
                reward_debt: 0,
                last_stake_time: 0,
                lock_end_time: 0,
            })
    }

    pub fn get_total_staked(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalStaked).unwrap_or(0)
    }

    pub fn set_reward_rate(env: Env, admin: Address, new_rate: i128) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert_eq!(admin, stored_admin, "Unauthorized");
        
        env.storage().instance().set(&DataKey::RewardRate, &new_rate);
    }

    pub fn get_balance(env: Env, token: Address) -> i128 {
        token::Client::new(&env, &token).balance(&env.current_contract_address())
    }

    // Emergency & Security Functions
    pub fn pause_contract(env: Env, admin: Address) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        env.storage().instance().set(&DataKey::Paused, &true);
    }

    pub fn unpause_contract(env: Env, admin: Address) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        env.storage().instance().set(&DataKey::Paused, &false);
    }

    pub fn emergency_withdraw(env: Env, admin: Address, token: Address, amount: i128) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        token::Client::new(&env, &token).transfer(&env.current_contract_address(), &admin, &amount);
    }

    pub fn transfer_admin(env: Env, current_admin: Address, new_admin: Address) {
        current_admin.require_auth();
        Self::require_admin(&env, &current_admin);
        env.storage().instance().set(&DataKey::Admin, &new_admin);
    }

    // Advanced Staking Features
    pub fn compound_rewards(env: Env, user: Address) -> i128 {
        user.require_auth();
        Self::require_not_paused(&env);
        
        let rewards = Self::calculate_rewards(env.clone(), user.clone());
        
        if rewards > 0 {
            let mut stake_info: StakeInfo = env.storage().persistent()
                .get(&DataKey::UserStake(user.clone()))
                .unwrap_or_panic();
            
            stake_info.amount += rewards;
            stake_info.reward_debt += rewards;
            stake_info.last_stake_time = env.ledger().timestamp();
            env.storage().persistent().set(&DataKey::UserStake(user.clone()), &stake_info);
            
            let total_staked: i128 = env.storage().instance().get(&DataKey::TotalStaked).unwrap_or(0);
            env.storage().instance().set(&DataKey::TotalStaked, &(total_staked + rewards));
        }
        
        rewards
    }

    pub fn set_minimum_stake(env: Env, admin: Address, min_amount: i128) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        env.storage().instance().set(&DataKey::MinimumStake, &min_amount);
    }

    pub fn set_lock_period(env: Env, admin: Address, period: u64) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        env.storage().instance().set(&DataKey::LockPeriod, &period);
    }

    // Reward Enhancement Functions
    pub fn set_reward_multiplier(env: Env, admin: Address, multiplier: i128) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        env.storage().instance().set(&DataKey::RewardMultiplier, &multiplier);
    }

    pub fn get_apy(env: Env) -> i128 {
        let reward_rate: i128 = env.storage().instance().get(&DataKey::RewardRate).unwrap_or(100);
        let multiplier: i128 = env.storage().instance().get(&DataKey::RewardMultiplier).unwrap_or(10000);
        (reward_rate * multiplier) / 100
    }

    pub fn distribute_bonus_rewards(env: Env, admin: Address, user: Address, bonus: i128, token: Address) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        token::Client::new(&env, &token).transfer(&env.current_contract_address(), &user, &bonus);
        Self::update_stats(&env, false, 0, bonus);
    }

    // Analytics & Reporting Functions
    pub fn get_contract_stats(env: Env) -> ContractStats {
        env.storage().instance().get(&DataKey::ContractStats)
            .unwrap_or(ContractStats {
                total_users: 0,
                total_volume: 0,
                total_rewards_distributed: 0,
            })
    }

    pub fn is_paused(env: Env) -> bool {
        env.storage().instance().get(&DataKey::Paused).unwrap_or(false)
    }

    pub fn get_minimum_stake(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::MinimumStake).unwrap_or(100)
    }

    pub fn get_lock_period(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::LockPeriod).unwrap_or(0)
    }

    // Helper Functions
    fn require_admin(env: &Env, admin: &Address) {
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert_eq!(*admin, stored_admin, "Unauthorized");
    }

    fn require_not_paused(env: &Env) {
        let paused: bool = env.storage().instance().get(&DataKey::Paused).unwrap_or(false);
        assert!(!paused, "Contract is paused");
    }

    fn update_stats(env: &Env, new_user: bool, volume: i128, rewards: i128) {
        let mut stats: ContractStats = env.storage().instance()
            .get(&DataKey::ContractStats)
            .unwrap_or(ContractStats {
                total_users: 0,
                total_volume: 0,
                total_rewards_distributed: 0,
            });
        
        if new_user {
            stats.total_users += 1;
        }
        stats.total_volume += volume;
        stats.total_rewards_distributed += rewards;
        
        env.storage().instance().set(&DataKey::ContractStats, &stats);
    }

    fn add_to_history(env: &Env, user: Address, action: u32, amount: i128) {
        let history = StakeHistory {
            timestamp: env.ledger().timestamp(),
            action,
            amount,
        };
        
        let key = DataKey::UserHistory(user);
        env.storage().persistent().set(&key, &history);
    }
}

#[cfg(test)]
mod test;