# 🧪 BaseLytics Testing Guide

Comprehensive testing framework for BaseLytics smart contracts.

## 📁 Test Structure

```
test/
├── helpers/
│   └── TestHelper.js          # Common test utilities
├── enhanced/
│   ├── BaseToken.enhanced.test.js
│   └── BaseStaking.enhanced.test.js
├── integration/
│   └── ContractIntegration.test.js
├── security/
│   └── SecurityTests.test.js
└── BaseContracts.test.js      # Basic tests
```

## 🚀 Running Tests

### Quick Commands
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:basic        # Basic functionality
npm run test:enhanced     # Advanced scenarios
npm run test:integration  # Contract interactions
npm run test:security     # Security vulnerabilities
npm run test:all         # All test suites
```

### Advanced Testing
```bash
# Generate coverage report
npm run coverage

# Run with gas reporting
npm run gas-report

# Run specific test file
npx hardhat test test/enhanced/BaseToken.enhanced.test.js
```

## 📊 Test Categories

### 1. Basic Tests
- Contract deployment
- Core functionality
- Standard ERC compliance
- Basic access control

### 2. Enhanced Tests
- **Gas optimization tracking**
- **Edge case handling**
- **Batch operations**
- **Event emission verification**

### 3. Integration Tests
- **Multi-contract workflows**
- **Token + Staking integration**
- **NFT + Token interactions**
- **Complex user journeys**

### 4. Security Tests
- **Access control attacks**
- **Integer overflow protection**
- **Reentrancy prevention**
- **Pausable security**

## 🔧 Test Utilities

### TestHelper Functions
```javascript
// Deploy all contracts
const { contracts, signers } = await TestHelper.deployContracts();

// Setup token balances
await TestHelper.setupTokenBalances(baseToken, signers, "1000");

// Time travel for testing
await TestHelper.timeTravel(86400); // 1 day

// Track gas usage
const gasUsed = await TestHelper.getGasUsed(tx);
```

## 📈 Coverage Targets

- **Statements**: > 95%
- **Branches**: > 90%
- **Functions**: > 95%
- **Lines**: > 95%

## 🛡️ Security Testing

### Automated Checks
- Access control violations
- Integer overflow/underflow
- Reentrancy vulnerabilities
- Front-running protection
- Pausable mechanism security

### Manual Review Areas
- Business logic correctness
- Economic attack vectors
- Governance vulnerabilities
- Upgrade mechanisms

## 🎯 Best Practices

### Test Writing
- Use descriptive test names
- Test both success and failure cases
- Include gas usage tracking
- Verify events are emitted correctly
- Test edge cases and boundaries

### Performance
- Track gas usage for optimization
- Test with realistic data sizes
- Verify scalability limits
- Monitor transaction costs

## 🔍 Debugging Tests

### Common Issues
1. **Gas estimation failures**
   - Check contract size limits
   - Verify constructor parameters

2. **Time-dependent tests**
   - Use TestHelper.timeTravel()
   - Reset blockchain state between tests

3. **Access control errors**
   - Verify signer addresses
   - Check ownership transfers

### Debug Commands
```bash
# Verbose test output
npx hardhat test --verbose

# Run single test with logs
npx hardhat test test/BaseContracts.test.js --logs

# Debug specific function
npx hardhat console --network hardhat
```

## 📋 Test Checklist

Before deployment, ensure:
- [ ] All tests pass
- [ ] Coverage > 95%
- [ ] Gas usage optimized
- [ ] Security tests pass
- [ ] Integration tests complete
- [ ] Edge cases covered
- [ ] Events properly tested

## 🚨 CI/CD Integration

Add to GitHub Actions:
```yaml
- name: Run Tests
  run: |
    npm install
    npm run test:all
    npm run coverage
```

## 📞 Support

For testing issues:
1. Check test logs for specific errors
2. Verify contract compilation
3. Ensure proper test setup
4. Review gas limits and network config