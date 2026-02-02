#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, token};

#[contracttype]
pub enum DataKey {
    Admin,
    UserStake(Address),
    TotalStaked,
    RewardRate,
}

#[contracttype]
pub struct StakeInfo {
    pub amount: i128,
    pub reward_debt: i128,
    pub last_stake_time: u64,
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
    }

    pub fn stake(env: Env, user: Address, token: Address, amount: i128) {
        user.require_auth();
        
        token::Client::new(&env, &token).transfer(&user, &env.current_contract_address(), &amount);
        
        let mut stake_info: StakeInfo = env.storage().persistent()
            .get(&DataKey::UserStake(user.clone()))
            .unwrap_or(StakeInfo {
                amount: 0,
                reward_debt: 0,
                last_stake_time: env.ledger().timestamp(),
            });
        
        stake_info.amount += amount;
        stake_info.last_stake_time = env.ledger().timestamp();
        
        env.storage().persistent().set(&DataKey::UserStake(user), &stake_info);
        
        let total_staked: i128 = env.storage().instance()
            .get(&DataKey::TotalStaked).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalStaked, &(total_staked + amount));
    }

    pub fn unstake(env: Env, user: Address, token: Address, amount: i128) {
        user.require_auth();
        
        let mut stake_info: StakeInfo = env.storage().persistent()
            .get(&DataKey::UserStake(user.clone()))
            .unwrap_or_panic();
        
        assert!(stake_info.amount >= amount, "Insufficient stake");
        
        stake_info.amount -= amount;
        env.storage().persistent().set(&DataKey::UserStake(user.clone()), &stake_info);
        
        token::Client::new(&env, &token).transfer(&env.current_contract_address(), &user, &amount);
        
        let total_staked: i128 = env.storage().instance()
            .get(&DataKey::TotalStaked).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalStaked, &(total_staked - amount));
    }

    pub fn calculate_rewards(env: Env, user: Address) -> i128 {
        let stake_info: StakeInfo = env.storage().persistent()
            .get(&DataKey::UserStake(user))
            .unwrap_or(StakeInfo {
                amount: 0,
                reward_debt: 0,
                last_stake_time: 0,
            });
        
        if stake_info.amount == 0 {
            return 0;
        }
        
        let current_time = env.ledger().timestamp();
        let time_diff = current_time - stake_info.last_stake_time;
        let reward_rate: i128 = env.storage().instance().get(&DataKey::RewardRate).unwrap_or(100);
        
        (stake_info.amount * reward_rate * time_diff as i128) / (365 * 24 * 3600 * 10000)
    }

    pub fn claim_rewards(env: Env, user: Address, reward_token: Address) -> i128 {
        user.require_auth();
        
        let rewards = Self::calculate_rewards(env.clone(), user.clone());
        
        if rewards > 0 {
            let mut stake_info: StakeInfo = env.storage().persistent()
                .get(&DataKey::UserStake(user.clone()))
                .unwrap_or_panic();
            
            stake_info.reward_debt += rewards;
            stake_info.last_stake_time = env.ledger().timestamp();
            env.storage().persistent().set(&DataKey::UserStake(user.clone()), &stake_info);
            
            token::Client::new(&env, &reward_token).transfer(&env.current_contract_address(), &user, &rewards);
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
}

#[cfg(test)]
mod test;