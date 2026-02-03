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
    TokenStake(Address, Address), // (user, token)
    TokenTotalStaked(Address),
    TokenEnabled(Address),
    StakingPool(u32),
    UserPoolStake(Address, u32), // (user, pool_id)
    NextPoolId,
    ReferralInfo(Address),
    UserReferrer(Address),
    ReferralRate,
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
pub struct StakingPool {
    pub pool_id: u32,
    pub token: Address,
    pub apy: i128,
    pub total_staked: i128,
    pub max_capacity: i128,
    pub lock_period: u64,
    pub active: bool,
}

#[contracttype]
pub struct ReferralInfo {
    pub referrer: Address,
    pub total_referred: u32,
    pub total_rewards: i128,
    pub active: bool,
}

#[contracttype]
pub struct UserPoolStake {
    pub amount: i128,
    pub entry_time: u64,
    pub last_claim: u64,
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
        env.storage().instance().set(&DataKey::NextPoolId, &1u32);
        env.storage().instance().set(&DataKey::ReferralRate, &500i128); // 5% referral rate
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

    // Multi-Token Support Functions
    pub fn add_supported_token(env: Env, admin: Address, token: Address, reward_rate: i128) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        
        env.storage().persistent().set(&DataKey::TokenEnabled(token.clone()), &true);
        env.storage().persistent().set(&DataKey::TokenRewardRate(token.clone()), &reward_rate);
        env.storage().persistent().set(&DataKey::TokenTotalStaked(token), &0i128);
    }

    pub fn remove_supported_token(env: Env, admin: Address, token: Address) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        env.storage().persistent().set(&DataKey::TokenEnabled(token), &false);
    }

    pub fn stake_token(env: Env, user: Address, token: Address, amount: i128) {
        user.require_auth();
        Self::require_not_paused(&env);
        
        let token_enabled: bool = env.storage().persistent()
            .get(&DataKey::TokenEnabled(token.clone())).unwrap_or(false);
        assert!(token_enabled, "Token not supported");
        
        let min_stake: i128 = env.storage().instance().get(&DataKey::MinimumStake).unwrap_or(100);
        assert!(amount >= min_stake, "Amount below minimum stake");
        
        token::Client::new(&env, &token).transfer(&user, &env.current_contract_address(), &amount);
        
        let current_stake: i128 = env.storage().persistent()
            .get(&DataKey::TokenStake(user.clone(), token.clone())).unwrap_or(0);
        
        env.storage().persistent().set(&DataKey::TokenStake(user.clone(), token.clone()), &(current_stake + amount));
        
        let token_total: i128 = env.storage().persistent()
            .get(&DataKey::TokenTotalStaked(token.clone())).unwrap_or(0);
        env.storage().persistent().set(&DataKey::TokenTotalStaked(token), &(token_total + amount));
    }

    pub fn unstake_token(env: Env, user: Address, token: Address, amount: i128) {
        user.require_auth();
        Self::require_not_paused(&env);
        
        let current_stake: i128 = env.storage().persistent()
            .get(&DataKey::TokenStake(user.clone(), token.clone())).unwrap_or(0);
        assert!(current_stake >= amount, "Insufficient token stake");
        
        env.storage().persistent().set(&DataKey::TokenStake(user.clone(), token.clone()), &(current_stake - amount));
        
        let token_total: i128 = env.storage().persistent()
            .get(&DataKey::TokenTotalStaked(token.clone())).unwrap_or(0);
        env.storage().persistent().set(&DataKey::TokenTotalStaked(token.clone()), &(token_total - amount));
        
        token::Client::new(&env, &token).transfer(&env.current_contract_address(), &user, &amount);
    }

    pub fn get_token_stake(env: Env, user: Address, token: Address) -> i128 {
        env.storage().persistent().get(&DataKey::TokenStake(user, token)).unwrap_or(0)
    }

    pub fn get_token_total_staked(env: Env, token: Address) -> i128 {
        env.storage().persistent().get(&DataKey::TokenTotalStaked(token)).unwrap_or(0)
    }

    pub fn is_token_supported(env: Env, token: Address) -> bool {
        env.storage().persistent().get(&DataKey::TokenEnabled(token)).unwrap_or(false)
    }

    // Staking Pool Functions
    pub fn create_staking_pool(env: Env, admin: Address, token: Address, apy: i128, max_capacity: i128, lock_period: u64) -> u32 {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        
        let pool_id: u32 = env.storage().instance().get(&DataKey::NextPoolId).unwrap_or(1);
        
        let pool = StakingPool {
            pool_id,
            token,
            apy,
            total_staked: 0,
            max_capacity,
            lock_period,
            active: true,
        };
        
        env.storage().persistent().set(&DataKey::StakingPool(pool_id), &pool);
        env.storage().instance().set(&DataKey::NextPoolId, &(pool_id + 1));
        
        pool_id
    }

    pub fn stake_in_pool(env: Env, user: Address, pool_id: u32, amount: i128) {
        user.require_auth();
        Self::require_not_paused(&env);
        
        let mut pool: StakingPool = env.storage().persistent()
            .get(&DataKey::StakingPool(pool_id)).unwrap_or_panic();
        
        assert!(pool.active, "Pool not active");
        assert!(pool.total_staked + amount <= pool.max_capacity, "Pool capacity exceeded");
        
        token::Client::new(&env, &pool.token).transfer(&user, &env.current_contract_address(), &amount);
        
        let user_stake = UserPoolStake {
            amount,
            entry_time: env.ledger().timestamp(),
            last_claim: env.ledger().timestamp(),
        };
        
        env.storage().persistent().set(&DataKey::UserPoolStake(user, pool_id), &user_stake);
        
        pool.total_staked += amount;
        env.storage().persistent().set(&DataKey::StakingPool(pool_id), &pool);
    }

    pub fn unstake_from_pool(env: Env, user: Address, pool_id: u32) {
        user.require_auth();
        Self::require_not_paused(&env);
        
        let user_stake: UserPoolStake = env.storage().persistent()
            .get(&DataKey::UserPoolStake(user.clone(), pool_id)).unwrap_or_panic();
        
        let pool: StakingPool = env.storage().persistent()
            .get(&DataKey::StakingPool(pool_id)).unwrap_or_panic();
        
        assert!(env.ledger().timestamp() >= user_stake.entry_time + pool.lock_period, "Lock period not expired");
        
        token::Client::new(&env, &pool.token).transfer(&env.current_contract_address(), &user, &user_stake.amount);
        
        env.storage().persistent().remove(&DataKey::UserPoolStake(user, pool_id));
        
        let mut updated_pool = pool;
        updated_pool.total_staked -= user_stake.amount;
        env.storage().persistent().set(&DataKey::StakingPool(pool_id), &updated_pool);
    }

    pub fn get_pool_info(env: Env, pool_id: u32) -> StakingPool {
        env.storage().persistent().get(&DataKey::StakingPool(pool_id)).unwrap_or_panic()
    }

    pub fn get_user_pool_stake(env: Env, user: Address, pool_id: u32) -> UserPoolStake {
        env.storage().persistent().get(&DataKey::UserPoolStake(user, pool_id))
            .unwrap_or(UserPoolStake { amount: 0, entry_time: 0, last_claim: 0 })
    }

    // Referral System Functions
    pub fn set_referrer(env: Env, user: Address, referrer: Address) {
        user.require_auth();
        assert!(user != referrer, "Cannot refer yourself");
        
        // Check if user already has a referrer
        let existing_referrer = env.storage().persistent().get(&DataKey::UserReferrer(user.clone()));
        assert!(existing_referrer.is_none(), "User already has a referrer");
        
        env.storage().persistent().set(&DataKey::UserReferrer(user), &referrer);
        
        // Update referrer info
        let mut referrer_info: ReferralInfo = env.storage().persistent()
            .get(&DataKey::ReferralInfo(referrer.clone()))
            .unwrap_or(ReferralInfo {
                referrer: referrer.clone(),
                total_referred: 0,
                total_rewards: 0,
                active: true,
            });
        
        referrer_info.total_referred += 1;
        env.storage().persistent().set(&DataKey::ReferralInfo(referrer), &referrer_info);
    }

    pub fn claim_referral_rewards(env: Env, referrer: Address, reward_token: Address) -> i128 {
        referrer.require_auth();
        
        let mut referrer_info: ReferralInfo = env.storage().persistent()
            .get(&DataKey::ReferralInfo(referrer.clone()))
            .unwrap_or_panic();
        
        let rewards = referrer_info.total_rewards;
        if rewards > 0 {
            referrer_info.total_rewards = 0;
            env.storage().persistent().set(&DataKey::ReferralInfo(referrer.clone()), &referrer_info);
            
            token::Client::new(&env, &reward_token).transfer(&env.current_contract_address(), &referrer, &rewards);
        }
        
        rewards
    }

    pub fn get_referral_info(env: Env, referrer: Address) -> ReferralInfo {
        env.storage().persistent().get(&DataKey::ReferralInfo(referrer))
            .unwrap_or(ReferralInfo {
                referrer: referrer.clone(),
                total_referred: 0,
                total_rewards: 0,
                active: false,
            })
    }

    pub fn set_referral_rate(env: Env, admin: Address, rate: i128) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        env.storage().instance().set(&DataKey::ReferralRate, &rate);
    }

    fn process_referral_reward(env: &Env, user: &Address, reward_amount: i128) {
        if let Some(referrer) = env.storage().persistent().get::<DataKey, Address>(&DataKey::UserReferrer(user.clone())) {
            let referral_rate: i128 = env.storage().instance().get(&DataKey::ReferralRate).unwrap_or(500);
            let referral_reward = (reward_amount * referral_rate) / 10000;
            
            if referral_reward > 0 {
                let mut referrer_info: ReferralInfo = env.storage().persistent()
                    .get(&DataKey::ReferralInfo(referrer.clone()))
                    .unwrap_or(ReferralInfo {
                        referrer: referrer.clone(),
                        total_referred: 0,
                        total_rewards: 0,
                        active: true,
                    });
                
                referrer_info.total_rewards += referral_reward;
                env.storage().persistent().set(&DataKey::ReferralInfo(referrer), &referrer_info);
            }
        }
    }
}

#[cfg(test)]
mod test;