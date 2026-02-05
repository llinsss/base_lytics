use std::collections::{HashMap, VecDeque};
use std::sync::{Arc, Mutex};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub hash: String,
    pub value: u64,
    pub gas_price: u64,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MEVType {
    Arbitrage,
    Sandwich,
    Liquidation,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ProtectionType {
    CommitReveal,
    TimeDelay,
    PrivateMempool,
}

pub struct MEVProtectionEngine {
    mempool: Arc<Mutex<VecDeque<Transaction>>>,
    user_preferences: Arc<Mutex<HashMap<String, ProtectionType>>>,
}

impl MEVProtectionEngine {
    pub fn new() -> Self {
        Self {
            mempool: Arc::new(Mutex::new(VecDeque::new())),
            user_preferences: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn add_transaction(&self, tx: Transaction) {
        let mut mempool = self.mempool.lock().unwrap();
        mempool.push_back(tx);
    }

    pub fn protect_transaction(&self, tx: &Transaction, user: &str) -> Transaction {
        let user_prefs = self.user_preferences.lock().unwrap();
        let protection_type = user_prefs.get(user).unwrap_or(&ProtectionType::CommitReveal);
        
        match protection_type {
            ProtectionType::CommitReveal => self.apply_commit_reveal(tx),
            ProtectionType::TimeDelay => self.apply_time_delay(tx),
            ProtectionType::PrivateMempool => self.route_to_private_mempool(tx),
        }
    }

    fn apply_commit_reveal(&self, tx: &Transaction) -> Transaction {
        let mut protected_tx = tx.clone();
        protected_tx.gas_price += 5;
        protected_tx
    }

    fn apply_time_delay(&self, tx: &Transaction) -> Transaction {
        let mut protected_tx = tx.clone();
        protected_tx.timestamp += 30;
        protected_tx
    }

    fn route_to_private_mempool(&self, tx: &Transaction) -> Transaction {
        let mut protected_tx = tx.clone();
        protected_tx.gas_price += 1000;
        protected_tx
    }

    pub fn set_user_protection(&self, user: String, protection_type: ProtectionType) {
        let mut prefs = self.user_preferences.lock().unwrap();
        prefs.insert(user, protection_type);
    }
}

fn main() {
    let engine = MEVProtectionEngine::new();
    
    engine.set_user_protection("user1".to_string(), ProtectionType::CommitReveal);
    
    let tx = Transaction {
        hash: "0x123".to_string(),
        value: 1000000,
        gas_price: 20,
        timestamp: 1640995200,
    };
    
    let protected_tx = engine.protect_transaction(&tx, "user1");
    println!("Protected transaction: {:?}", protected_tx);
}