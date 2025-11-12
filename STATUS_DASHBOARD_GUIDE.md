# 📊 Contract Status Dashboard Guide

Real-time monitoring and health assessment for your BaseLytics contracts.

## 🚀 Quick Start

### Generate Frontend Config
```bash
# After deploying contracts, generate frontend configuration
npm run frontend-config baseSepolia

# Start the frontend development server
npm run dev
```

### Access Status Dashboard
- **Main Dashboard**: `http://localhost:3000/`
- **Status Page**: `http://localhost:3000/status`

## 📁 Dashboard Components

### 1. **Contract Status**
- ✅ **Deployment Status** - Shows which contracts are deployed
- 📍 **Contract Addresses** - Displays deployed contract addresses
- 🔄 **Real-time Updates** - Refresh button to reload status
- 📊 **Deployment Metrics** - Count of deployed vs total contracts

### 2. **System Health**
- 💚 **Health Score** - Overall system health percentage (0-100)
- ⚠️ **Health Metrics** - Individual component health checks
- 📈 **Status Indicators** - Visual health status (✅ ⚠️ ❌)
- 🔍 **Detailed Messages** - Specific health information

### 3. **Network Status**
- 🌐 **Network Information** - Current blockchain network
- 📦 **Block Number** - Latest block (real-time updates)
- ⛽ **Gas Price** - Current network gas price
- 🔗 **Connection Status** - Wallet and network connection

## 🔧 Health Monitoring

### Health Metrics Tracked

**Contract Deployment**
- ✅ All contracts deployed and configured
- ❌ Missing or misconfigured contracts

**Token Supply**
- ✅ Normal supply utilization (< 90%)
- ⚠️ High supply utilization (> 90%)

**NFT Minting**
- ✅ Minting active and enabled
- ⚠️ Contract paused or minting disabled

**Staking Rewards**
- ✅ Healthy reward rates (> 50 basis points)
- ⚠️ Low reward rates (< 50 basis points)

### Health Score Calculation
- **100%**: All systems healthy
- **80-99%**: Minor warnings present
- **60-79%**: Multiple warnings
- **< 60%**: Critical issues detected

## 🛠️ Configuration Management

### Auto-Detection Process
1. **Deploy Contracts** - Use deployment scripts
2. **Generate Config** - Run `npm run frontend-config <network>`
3. **Auto-Load** - Frontend automatically loads contract addresses
4. **Real-time Sync** - Status updates reflect current state

### Manual Configuration
If auto-detection fails, manually update:
```typescript
// frontend/src/config/contracts.ts
export const CONTRACT_ADDRESSES = {
  BaseToken: '0x123...',
  BaseNFT: '0x456...',
  BaseStaking: '0x789...',
};
```

## 📊 Status Indicators

### Connection Status
- 🟢 **Connected** - Proper network connection
- 🟡 **Wrong Network** - Connected to unsupported network
- 🔴 **Disconnected** - No wallet connection

### Contract Status
- ✅ **Active** - Contract deployed and functional
- ❌ **Missing** - Contract not deployed or configured

### Health Status
- ✅ **Healthy** - All systems operating normally
- ⚠️ **Warning** - Minor issues detected
- ❌ **Error** - Critical issues requiring attention

## 🔄 Real-time Features

### Auto-Refresh
- **Block numbers** update automatically
- **Health metrics** recalculate on data changes
- **Contract status** reflects deployment changes

### Manual Refresh
- **Refresh buttons** on each component
- **Reload configuration** to detect new deployments
- **Update network information**

## 🚨 Alert System Integration

### Status Dashboard Alerts
The dashboard integrates with your monitoring system:
- **Threshold violations** appear in health metrics
- **System alerts** affect health scores
- **Network issues** trigger connection warnings

### Alert Types Displayed
- **Critical**: Contract deployment failures
- **Warning**: High utilization, paused contracts
- **Info**: Configuration recommendations

## 📱 Mobile Responsive

### Mobile Features
- **Responsive design** works on all screen sizes
- **Touch-friendly** interface
- **Optimized layouts** for mobile viewing
- **Fast loading** on mobile networks

## 🔧 Troubleshooting

### Common Issues

**"Contracts not configured"**
- Run `npm run frontend-config <network>`
- Ensure contracts are deployed
- Check network connection

**"Network mismatch"**
- Switch wallet to Base Sepolia or Base Mainnet
- Verify network configuration
- Check RPC endpoints

**"Health score low"**
- Review individual health metrics
- Check contract configurations
- Verify network stability

### Debug Steps
1. **Check deployment** - Verify contracts deployed
2. **Generate config** - Run frontend config script
3. **Refresh status** - Use refresh buttons
4. **Check console** - Look for JavaScript errors
5. **Verify network** - Ensure correct blockchain

## 🚀 Production Deployment

### Deployment Checklist
- [ ] Deploy all contracts to target network
- [ ] Generate frontend configuration
- [ ] Build frontend application
- [ ] Configure production environment
- [ ] Set up monitoring alerts
- [ ] Test all status components

### Environment Setup
```bash
# Production build
cd frontend && npm run build

# Serve static files
# Deploy build/ folder to your hosting service
```

## 📞 Support

### Getting Help
1. **Check status dashboard** for system health
2. **Review deployment logs** for contract issues
3. **Verify network configuration**
4. **Check browser console** for frontend errors

### Monitoring Best Practices
- **Regular health checks** via status dashboard
- **Monitor deployment status** after updates
- **Track network performance** metrics
- **Set up automated alerts** for critical issues

This status dashboard provides comprehensive visibility into your BaseLytics ecosystem, enabling proactive monitoring and quick issue resolution.