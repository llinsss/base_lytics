use std::collections::{HashMap, VecDeque};
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub hash: String,
    pub value: u64,
    pub gas_price: u64,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Analytics {
    pub total_volume: u64,
    pub transaction_count: u64,
    pub avg_gas_price: f64,
}

pub struct AnalyticsEngine {
    transactions: Arc<Mutex<VecDeque<Transaction>>>,
    analytics: Arc<Mutex<Analytics>>,
}

impl AnalyticsEngine {
    pub fn new() -> Self {
        Self {
            transactions: Arc::new(Mutex::new(VecDeque::new())),
            analytics: Arc::new(Mutex::new(Analytics {
                total_volume: 0,
                transaction_count: 0,
                avg_gas_price: 0.0,
            })),
        }
    }

    pub fn add_transaction(&self, tx: Transaction) {
        let mut transactions = self.transactions.lock().unwrap();
        transactions.push_back(tx);
        self.update_analytics();
    }

    fn update_analytics(&self) {
        let transactions = self.transactions.lock().unwrap();
        let mut analytics = self.analytics.lock().unwrap();
        
        let total_volume: u64 = transactions.iter().map(|tx| tx.value).sum();
        let total_gas: u64 = transactions.iter().map(|tx| tx.gas_price).sum();
        
        analytics.total_volume = total_volume;
        analytics.transaction_count = transactions.len() as u64;
        analytics.avg_gas_price = if transactions.len() > 0 {
            total_gas as f64 / transactions.len() as f64
        } else {
            0.0
        };
    }

    pub fn get_analytics(&self) -> Analytics {
        self.analytics.lock().unwrap().clone()
    }
}

fn main() {
    let engine = AnalyticsEngine::new();
    
    let tx = Transaction {
        hash: "0x123".to_string(),
        value: 1000000,
        gas_price: 20,
        timestamp: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(),
    };
    
    engine.add_transaction(tx);
    let analytics = engine.get_analytics();
    println!("Analytics: {:?}", analytics);
}