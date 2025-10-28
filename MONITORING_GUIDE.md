# 📊 BaseLytics Monitoring & Analytics Guide

Comprehensive monitoring system for tracking contract performance, usage, and revenue.

## 🚀 Quick Start

### Real-time Monitoring
```bash
# Start event monitoring (runs continuously)
npm run monitor --network baseSepolia

# Check current usage statistics
npm run stats --network baseSepolia

# Track revenue metrics
npm run revenue --network baseSepolia

# Monitor for alerts
npm run alerts --network baseSepolia
```

### Reports & Analytics
```bash
# Generate daily summary
npm run summary --network baseSepolia

# Track gas usage
npm run gas-track --network baseSepolia

# Usage stats with timeframe
npm run stats --network baseSepolia 7d  # 24h, 7d, 30d
```

## 📁 Monitoring System Structure

```
scripts/
├── monitor/
│   ├── event-listener.js      # Real-time event monitoring
│   └── gas-tracker.js         # Gas usage analysis
├── analytics/
│   ├── usage-stats.js         # Usage statistics
│   └── revenue-tracker.js     # Revenue analysis
├── alerts/
│   └── threshold-monitor.js   # Alert system
└── reports/
    └── daily-summary.js       # Daily reports
```

## 🔍 Event Monitoring

### Real-time Event Tracking
The event listener monitors all contract events in real-time:

- **BaseToken**: Transfer events, minting, burning
- **BaseNFT**: NFT transfers, minting
- **BaseStaking**: Stake, unstake, reward claims

### Event Log Storage
Events are automatically saved to `logs/` directory:
- Format: `events-{network}-{date}.json`
- Includes transaction hashes, block numbers, timestamps
- Used by analytics scripts for historical analysis

### Usage
```bash
# Start monitoring (Ctrl+C to stop)
npm run monitor --network baseSepolia

# Events are logged to console and saved to files
# Example output:
# 📝 2024-01-15T10:30:00.000Z | BaseToken.Transfer | {"from":"0x123...","to":"0x456...","value":"100.0"}
```

## 📈 Analytics & Statistics

### Usage Statistics
Comprehensive usage analysis with multiple timeframes:

```bash
# 24 hour stats (default)
npm run stats --network baseSepolia

# Weekly stats
npm run stats --network baseSepolia 7d

# Monthly stats  
npm run stats --network baseSepolia 30d
```

**Metrics Tracked:**
- Token supply utilization
- NFT minting activity
- Staking participation
- Event frequency analysis
- User engagement metrics

### Revenue Tracking
Monitor revenue streams and financial metrics:

```bash
npm run revenue --network baseSepolia
```

**Revenue Sources:**
- **NFT Sales**: ETH collected from minting
- **Token Distribution**: Tracking token allocation
- **Staking Metrics**: Total value locked (TVL)

## 🚨 Alert System

### Threshold Monitoring
Automated monitoring for unusual activity:

```bash
# Check current thresholds
npm run alerts --network baseSepolia

# View threshold configuration
npm run alerts --network baseSepolia config
```

### Alert Types

**Critical Alerts:**
- High token supply utilization (>90%)
- Contract security issues

**Warning Alerts:**
- Low contract ETH balance
- Unusual transaction volumes

**Info Alerts:**
- Low staking reward rates
- Configuration changes needed

### Alert Configuration
Thresholds are configurable in `threshold-monitor.js`:

```javascript
const THRESHOLDS = {
  nft: {
    maxMintedPerHour: 100,
    lowContractBalance: "0.1" // ETH
  },
  token: {
    maxSupplyUtilization: 90, // percentage
    largeTransferAmount: "10000" // tokens
  },
  staking: {
    maxStakePerUser: "50000", // tokens
    lowRewardRate: 50 // basis points
  }
};
```

## 📋 Daily Reports

### Automated Summaries
Generate comprehensive daily reports:

```bash
# Today's summary
npm run summary --network baseSepolia

# Specific date
npm run summary --network baseSepolia 2024-01-15
```

**Report Contents:**
- Contract state snapshots
- Daily activity metrics
- Alert summaries
- System health score (0-100)

### Health Score Calculation
- Starts at 100 points
- Deductions for alerts (Critical: -20, Warning: -10, Info: -5)
- Deductions for paused contracts (-15)
- Provides quick system health overview

## ⛽ Gas Optimization

### Gas Usage Tracking
Monitor transaction costs and identify optimization opportunities:

```bash
npm run gas-track --network baseSepolia
```

**Analysis Includes:**
- Current network gas prices
- Gas estimates for common operations
- Cost calculations in ETH
- Optimization recommendations

### Gas Efficiency Ratings
- 🟢 **Efficient**: < 100k gas
- 🟡 **Moderate**: 100k - 200k gas  
- 🔴 **High**: > 200k gas

## 📊 Data Storage

### Directory Structure
```
logs/           # Event logs by date
alerts/         # Alert notifications
reports/        # Daily summaries and analytics
```

### File Formats
All data stored in JSON format for easy processing:
- Timestamped entries
- Structured data fields
- Cross-reference capabilities

## 🔧 Advanced Usage

### Custom Analytics
Extend the system by:
1. Adding new event listeners
2. Creating custom metrics
3. Building specialized reports
4. Integrating external data sources

### Integration Options
- **Webhooks**: Send alerts to external systems
- **Databases**: Store data in PostgreSQL/MongoDB
- **Dashboards**: Connect to Grafana/DataDog
- **APIs**: Expose metrics via REST endpoints

## 🛡️ Security Monitoring

### Automated Checks
- Unusual transaction patterns
- Large value transfers
- Rapid state changes
- Access control violations

### Manual Review Points
- Daily summary review
- Alert investigation
- Gas usage trends
- Revenue anomalies

## 📞 Troubleshooting

### Common Issues

1. **Event monitoring stops**
   - Check network connectivity
   - Verify contract addresses
   - Restart monitoring script

2. **Missing analytics data**
   - Ensure event logs exist
   - Check file permissions
   - Verify date formats

3. **Alert false positives**
   - Adjust thresholds in configuration
   - Review alert logic
   - Consider network conditions

### Debug Commands
```bash
# Check contract deployment
npm run info --network baseSepolia

# Verify event logs
ls logs/

# Test alert thresholds
npm run alerts --network baseSepolia config
```

## 🚀 Production Deployment

### Recommended Setup
1. **Continuous Monitoring**: Run event listener as service
2. **Scheduled Reports**: Daily summary via cron job
3. **Alert Integration**: Connect to notification systems
4. **Data Backup**: Regular backup of logs and reports

### Scaling Considerations
- Use database for large datasets
- Implement log rotation
- Add monitoring redundancy
- Consider real-time dashboards

This monitoring system provides enterprise-grade observability for your BaseLytics contracts, enabling proactive management and data-driven optimization.