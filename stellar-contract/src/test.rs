#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, Address, Env};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register_contract(None, BaseLyticsContract);
    let client = BaseLyticsContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    
    client.initialize(&admin);
    
    assert_eq!(client.get_total_staked(), 0);
    assert_eq!(client.is_paused(), false);
    assert_eq!(client.get_minimum_stake(), 100);
}

#[test]
fn test_stake_and_unstake() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, BaseLyticsContract);
    let client = BaseLyticsContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let token = Address::generate(&env);
    
    client.initialize(&admin);
    
    // Stake tokens
    client.stake(&user, &token, &1000);
    
    let stake_info = client.get_stake_info(&user);
    assert_eq!(stake_info.amount, 1000);
    assert_eq!(client.get_total_staked(), 1000);
    
    // Unstake tokens
    client.unstake(&user, &token, &500);
    
    let stake_info = client.get_stake_info(&user);
    assert_eq!(stake_info.amount, 500);
    assert_eq!(client.get_total_staked(), 500);
}

#[test]
fn test_rewards_calculation() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, BaseLyticsContract);
    let client = BaseLyticsContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let token = Address::generate(&env);
    
    client.initialize(&admin);
    client.stake(&user, &token, &1000);
    
    // Advance time
    env.ledger().with_mut(|li| {
        li.timestamp = 365 * 24 * 3600; // 1 year
    });
    
    let rewards = client.calculate_rewards(&user);
    assert!(rewards > 0);
}

// Security Tests
#[test]
#[should_panic(expected = "Unauthorized")]
fn test_unauthorized_admin_functions() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, BaseLyticsContract);
    let client = BaseLyticsContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let fake_admin = Address::generate(&env);
    
    client.initialize(&admin);
    client.pause_contract(&fake_admin);
}

#[test]
#[should_panic(expected = "Amount below minimum stake")]
fn test_minimum_stake_enforcement() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, BaseLyticsContract);
    let client = BaseLyticsContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let token = Address::generate(&env);
    
    client.initialize(&admin);
    client.stake(&user, &token, &50); // Below minimum of 100
}

#[test]
#[should_panic(expected = "Insufficient stake")]
fn test_unstake_more_than_staked() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, BaseLyticsContract);
    let client = BaseLyticsContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let token = Address::generate(&env);
    
    client.initialize(&admin);
    client.stake(&user, &token, &1000);
    client.unstake(&user, &token, &1500); // More than staked
}

#[test]
fn test_claim_rewards_with_zero_stake() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, BaseLyticsContract);
    let client = BaseLyticsContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let token = Address::generate(&env);
    
    client.initialize(&admin);
    
    let rewards = client.claim_rewards(&user, &token);
    assert_eq!(rewards, 0);
}

#[test]
#[should_panic(expected = "Contract is paused")]
fn test_paused_contract_operations() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, BaseLyticsContract);
    let client = BaseLyticsContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let token = Address::generate(&env);
    
    client.initialize(&admin);
    client.pause_contract(&admin);
    
    assert_eq!(client.is_paused(), true);
    client.stake(&user, &token, &1000); // Should panic
}

// Advanced Features Tests
#[test]
fn test_compound_rewards() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, BaseLyticsContract);
    let client = BaseLyticsContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let token = Address::generate(&env);
    
    client.initialize(&admin);
    client.stake(&user, &token, &1000);
    
    // Advance time
    env.ledger().with_mut(|li| {
        li.timestamp = 365 * 24 * 3600; // 1 year
    });
    
    let initial_stake = client.get_stake_info(&user).amount;
    let compounded = client.compound_rewards(&user);
    let final_stake = client.get_stake_info(&user).amount;
    
    assert!(compounded > 0);
    assert_eq!(final_stake, initial_stake + compounded);
}

#[test]
fn test_reward_multiplier() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, BaseLyticsContract);
    let client = BaseLyticsContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let token = Address::generate(&env);
    
    client.initialize(&admin);
    client.set_reward_multiplier(&admin, &20000); // 2x multiplier
    client.stake(&user, &token, &1000);
    
    // Advance time
    env.ledger().with_mut(|li| {
        li.timestamp = 365 * 24 * 3600;
    });
    
    let rewards = client.calculate_rewards(&user);
    assert!(rewards > 0);
}

#[test]
fn test_lock_period_functionality() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, BaseLyticsContract);
    let client = BaseLyticsContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let token = Address::generate(&env);
    
    client.initialize(&admin);
    client.set_lock_period(&admin, &86400); // 1 day lock
    client.stake(&user, &token, &1000);
    
    let stake_info = client.get_stake_info(&user);
    assert!(stake_info.lock_end_time > 0);
}

#[test]
fn test_emergency_functions() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, BaseLyticsContract);
    let client = BaseLyticsContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let new_admin = Address::generate(&env);
    let token = Address::generate(&env);
    
    client.initialize(&admin);
    
    // Test pause/unpause
    client.pause_contract(&admin);
    assert_eq!(client.is_paused(), true);
    
    client.unpause_contract(&admin);
    assert_eq!(client.is_paused(), false);
    
    // Test admin transfer
    client.transfer_admin(&admin, &new_admin);
    
    // Test emergency withdraw
    client.emergency_withdraw(&new_admin, &token, &100);
}

#[test]
fn test_contract_stats() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, BaseLyticsContract);
    let client = BaseLyticsContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    let token = Address::generate(&env);
    
    client.initialize(&admin);
    
    let initial_stats = client.get_contract_stats();
    assert_eq!(initial_stats.total_users, 0);
    
    client.stake(&user1, &token, &1000);
    client.stake(&user2, &token, &2000);
    
    let stats = client.get_contract_stats();
    assert_eq!(stats.total_users, 2);
    assert_eq!(stats.total_volume, 3000);
}

#[test]
fn test_apy_calculation() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, BaseLyticsContract);
    let client = BaseLyticsContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    
    client.initialize(&admin);
    
    let apy = client.get_apy();
    assert!(apy > 0);
}

#[test]
fn test_bonus_rewards_distribution() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, BaseLyticsContract);
    let client = BaseLyticsContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let token = Address::generate(&env);
    
    client.initialize(&admin);
    
    let initial_stats = client.get_contract_stats();
    client.distribute_bonus_rewards(&admin, &user, &500, &token);
    
    let final_stats = client.get_contract_stats();
    assert_eq!(final_stats.total_rewards_distributed, initial_stats.total_rewards_distributed + 500);
}

// Integration Tests
#[test]
fn test_full_staking_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, BaseLyticsContract);
    let client = BaseLyticsContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let token = Address::generate(&env);
    let reward_token = Address::generate(&env);
    
    // Initialize
    client.initialize(&admin);
    
    // Stake
    client.stake(&user, &token, &1000);
    assert_eq!(client.get_stake_info(&user).amount, 1000);
    
    // Advance time for rewards
    env.ledger().with_mut(|li| {
        li.timestamp = 30 * 24 * 3600; // 30 days
    });
    
    // Claim rewards
    let rewards = client.claim_rewards(&user, &reward_token);
    assert!(rewards > 0);
    
    // Compound some rewards
    env.ledger().with_mut(|li| {
        li.timestamp = 60 * 24 * 3600; // 60 days
    });
    
    let compounded = client.compound_rewards(&user);
    assert!(compounded > 0);
    
    // Final unstake
    let final_stake = client.get_stake_info(&user).amount;
    client.unstake(&user, &token, &final_stake);
    
    assert_eq!(client.get_stake_info(&user).amount, 0);
}

#[test]
fn test_multiple_users_staking() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, BaseLyticsContract);
    let client = BaseLyticsContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let users: Vec<Address> = (0..5).map(|_| Address::generate(&env)).collect();
    let token = Address::generate(&env);
    
    client.initialize(&admin);
    
    // Multiple users stake different amounts
    for (i, user) in users.iter().enumerate() {
        let amount = (i as i128 + 1) * 1000;
        client.stake(user, &token, &amount);
    }
    
    // Verify total staked
    let expected_total = (1..=5).sum::<i128>() * 1000;
    assert_eq!(client.get_total_staked(), expected_total);
    
    // Verify user count
    let stats = client.get_contract_stats();
    assert_eq!(stats.total_users, 5);
}