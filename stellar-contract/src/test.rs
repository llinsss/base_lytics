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
    
    // Mock token contract
    let token_client = token::Client::new(&env, &token);
    
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