import asyncio
import numpy as np
from dataclasses import dataclass
from typing import Dict, List, Optional
from enum import Enum
import json

class ProtocolType(Enum):
    LENDING = "lending"
    STAKING = "staking"
    LIQUIDITY_MINING = "liquidity_mining"
    YIELD_FARMING = "yield_farming"

@dataclass
class YieldOpportunity:
    protocol: str
    protocol_type: ProtocolType
    token: str
    apy: float
    tvl: float
    risk_score: float
    min_deposit: float
    lock_period: int  # days
    auto_compound: bool

@dataclass
class Portfolio:
    user_id: str
    total_value: float
    allocations: Dict[str, float]
    risk_tolerance: float  # 0-1 scale
    target_apy: float

class YieldOptimizer:
    def __init__(self):
        self.opportunities: List[YieldOpportunity] = []
        self.portfolios: Dict[str, Portfolio] = {}
        self.price_feeds: Dict[str, float] = {}
        
    def add_opportunity(self, opportunity: YieldOpportunity):
        self.opportunities.append(opportunity)
        
    def update_price(self, token: str, price: float):
        self.price_feeds[token] = price
        
    def calculate_risk_adjusted_return(self, opportunity: YieldOpportunity) -> float:
        # Risk-adjusted return using Sharpe-like ratio
        risk_free_rate = 0.02  # 2% risk-free rate
        return (opportunity.apy - risk_free_rate) / max(opportunity.risk_score, 0.01)
        
    def filter_opportunities(self, portfolio: Portfolio) -> List[YieldOpportunity]:
        filtered = []
        
        for opp in self.opportunities:
            # Filter by risk tolerance
            if opp.risk_score <= portfolio.risk_tolerance:
                # Filter by minimum deposit
                if portfolio.total_value >= opp.min_deposit:
                    filtered.append(opp)
                    
        return filtered
        
    def optimize_allocation(self, user_id: str) -> Dict[str, float]:
        if user_id not in self.portfolios:
            return {}
            
        portfolio = self.portfolios[user_id]
        opportunities = self.filter_opportunities(portfolio)
        
        if not opportunities:
            return {}
            
        # Sort by risk-adjusted return
        opportunities.sort(key=self.calculate_risk_adjusted_return, reverse=True)
        
        # Simple allocation strategy
        allocation = {}
        remaining_value = portfolio.total_value
        
        for i, opp in enumerate(opportunities[:5]):  # Top 5 opportunities
            if remaining_value <= 0:
                break
                
            # Allocate based on risk-adjusted return and diversification
            weight = self.calculate_allocation_weight(opp, i, portfolio)
            amount = min(remaining_value * weight, remaining_value)
            
            if amount >= opp.min_deposit:
                allocation[f"{opp.protocol}_{opp.token}"] = amount
                remaining_value -= amount
                
        return allocation
        
    def calculate_allocation_weight(self, opportunity: YieldOpportunity, rank: int, portfolio: Portfolio) -> float:
        # Base weight decreases with rank
        base_weight = 1.0 / (rank + 1)
        
        # Adjust for risk tolerance
        risk_adjustment = 1.0 - abs(opportunity.risk_score - portfolio.risk_tolerance)
        
        # Adjust for APY vs target
        apy_adjustment = min(opportunity.apy / portfolio.target_apy, 2.0)
        
        return base_weight * risk_adjustment * apy_adjustment * 0.3
        
    def calculate_portfolio_metrics(self, user_id: str) -> Dict:
        if user_id not in self.portfolios:
            return {}
            
        portfolio = self.portfolios[user_id]
        allocation = self.optimize_allocation(user_id)
        
        total_apy = 0.0
        total_risk = 0.0
        total_allocated = sum(allocation.values())
        
        for key, amount in allocation.items():
            protocol, token = key.split('_', 1)
            
            # Find matching opportunity
            opp = next((o for o in self.opportunities 
                       if o.protocol == protocol and o.token == token), None)
            
            if opp:
                weight = amount / total_allocated if total_allocated > 0 else 0
                total_apy += opp.apy * weight
                total_risk += opp.risk_score * weight
                
        return {
            'expected_apy': total_apy,
            'portfolio_risk': total_risk,
            'allocation': allocation,
            'total_allocated': total_allocated,
            'unallocated': portfolio.total_value - total_allocated
        }
        
    def rebalance_portfolio(self, user_id: str) -> List[Dict]:
        current_allocation = self.portfolios[user_id].allocations
        optimal_allocation = self.optimize_allocation(user_id)
        
        rebalance_actions = []
        
        # Calculate differences
        all_positions = set(current_allocation.keys()) | set(optimal_allocation.keys())
        
        for position in all_positions:
            current = current_allocation.get(position, 0)
            optimal = optimal_allocation.get(position, 0)
            difference = optimal - current
            
            if abs(difference) > 100:  # Minimum rebalance threshold
                action = {
                    'position': position,
                    'current': current,
                    'target': optimal,
                    'action': 'increase' if difference > 0 else 'decrease',
                    'amount': abs(difference)
                }
                rebalance_actions.append(action)
                
        return rebalance_actions
        
    def simulate_yield(self, user_id: str, days: int) -> Dict:
        portfolio = self.portfolios[user_id]
        allocation = self.optimize_allocation(user_id)
        
        daily_yields = []
        current_value = portfolio.total_value
        
        for day in range(days):
            daily_yield = 0.0
            
            for key, amount in allocation.items():
                protocol, token = key.split('_', 1)
                opp = next((o for o in self.opportunities 
                           if o.protocol == protocol and o.token == token), None)
                
                if opp:
                    # Add some volatility
                    daily_apy = opp.apy * (1 + np.random.normal(0, 0.1))
                    daily_return = amount * (daily_apy / 365)
                    daily_yield += daily_return
                    
            daily_yields.append(daily_yield)
            current_value += daily_yield
            
        return {
            'initial_value': portfolio.total_value,
            'final_value': current_value,
            'total_yield': current_value - portfolio.total_value,
            'daily_yields': daily_yields,
            'annualized_return': (current_value / portfolio.total_value - 1) * (365 / days)
        }
        
    def add_portfolio(self, portfolio: Portfolio):
        self.portfolios[portfolio.user_id] = portfolio
        
    def get_top_opportunities(self, limit: int = 10) -> List[YieldOpportunity]:
        return sorted(self.opportunities, 
                     key=self.calculate_risk_adjusted_return, 
                     reverse=True)[:limit]
        
    def analyze_protocol_risk(self, protocol: str) -> Dict:
        protocol_opps = [o for o in self.opportunities if o.protocol == protocol]
        
        if not protocol_opps:
            return {}
            
        total_tvl = sum(o.tvl for o in protocol_opps)
        avg_apy = np.mean([o.apy for o in protocol_opps])
        avg_risk = np.mean([o.risk_score for o in protocol_opps])
        
        return {
            'protocol': protocol,
            'total_tvl': total_tvl,
            'average_apy': avg_apy,
            'average_risk': avg_risk,
            'opportunity_count': len(protocol_opps),
            'risk_rating': 'Low' if avg_risk < 0.3 else 'Medium' if avg_risk < 0.7 else 'High'
        }

# Example usage
def main():
    optimizer = YieldOptimizer()
    
    # Add yield opportunities
    opportunities = [
        YieldOpportunity("Aave", ProtocolType.LENDING, "USDC", 0.05, 1000000000, 0.2, 100, 0, True),
        YieldOpportunity("Compound", ProtocolType.LENDING, "USDC", 0.04, 800000000, 0.15, 50, 0, True),
        YieldOpportunity("Uniswap", ProtocolType.LIQUIDITY_MINING, "ETH-USDC", 0.15, 500000000, 0.6, 1000, 0, False),
        YieldOpportunity("Curve", ProtocolType.YIELD_FARMING, "3CRV", 0.08, 2000000000, 0.3, 200, 0, True),
        YieldOpportunity("Yearn", ProtocolType.YIELD_FARMING, "USDC", 0.12, 300000000, 0.4, 500, 0, True),
    ]
    
    for opp in opportunities:
        optimizer.add_opportunity(opp)
    
    # Add portfolio
    portfolio = Portfolio(
        user_id="user1",
        total_value=10000.0,
        allocations={},
        risk_tolerance=0.5,
        target_apy=0.10
    )
    
    optimizer.add_portfolio(portfolio)
    
    # Optimize allocation
    allocation = optimizer.optimize_allocation("user1")
    print("Optimal allocation:", allocation)
    
    # Calculate metrics
    metrics = optimizer.calculate_portfolio_metrics("user1")
    print("Portfolio metrics:", metrics)
    
    # Simulate yield
    simulation = optimizer.simulate_yield("user1", 365)
    print("Yield simulation:", simulation)
    
    # Get top opportunities
    top_opps = optimizer.get_top_opportunities(5)
    print("Top opportunities:")
    for opp in top_opps:
        print(f"  {opp.protocol} {opp.token}: {opp.apy:.2%} APY, Risk: {opp.risk_score:.2f}")

if __name__ == "__main__":
    main()
// Code refactored

// Code refactored

// Code refactored

// Code refactored

// Code refactored

// Code refactored

// Code refactored

// Code refactored

// Code refactored
