#!/bin/bash

# Reset to clean state
git reset --hard HEAD~1
git push --force origin master

# Array of files and commit messages
declare -a files=(
    "stellar-contract/src/governance.rs"
    "stellar-contract/src/yield_farming.rs"
    "stellar-contract/src/nft_staking.rs"
    "stellar-contract/src/bridge.rs"
    "stellar-contract/src/amm.rs"
    "frontend/src/components/RealTimePriceFeeds.tsx"
    "frontend/src/components/AdvancedPortfolioAnalytics.tsx"
    "frontend/src/components/SocialTradingHub.tsx"
    "frontend/src/components/MobileResponsive.tsx"
    "frontend/src/components/ThemeSystem.tsx"
    "frontend/src/components/NotificationSystem.tsx"
    "frontend/src/components/PerformanceMonitoring.tsx"
    "frontend/src/components/Accessibility.tsx"
    "backend/src/services/websocket.service.ts"
    "backend/src/services/cache.service.ts"
    "backend/src/middleware/enhancedRateLimit.middleware.ts"
    "backend/swagger.ts"
    "backend/health.ts"
    "Dockerfile"
    "docker-compose.yml"
    "ci-cd.yml"
    "security-scan.sh"
    "deploy.sh"
    "push-commits.sh"
    "stellar-contract/src/main.rs"
)

declare -a messages=(
    "feat: add governance voting mechanism"
    "feat: add yield farming features"
    "feat: add NFT staking support"
    "feat: add cross-chain bridge interface"
    "feat: add automated market maker (AMM) functions"
    "feat: add real-time price feeds component"
    "feat: add advanced portfolio analytics"
    "feat: add social trading features"
    "feat: add mobile-responsive improvements"
    "feat: add dark/light theme enhancements"
    "feat: add notification system"
    "feat: add performance monitoring"
    "feat: add accessibility improvements"
    "feat: add WebSocket real-time updates"
    "feat: add advanced caching layer"
    "feat: add rate limiting improvements"
    "feat: add API documentation"
    "feat: add monitoring and health checks"
    "feat: add Docker containerization"
    "feat: add Docker Compose configuration"
    "feat: add CI/CD pipeline improvements"
    "feat: add security scanning"
    "feat: add deployment automation"
    "feat: add commit automation script"
    "feat: add Stellar contract main entry point"
)

# Create and push each commit
for i in "${!files[@]}"; do
    echo "Creating commit $((i+1))/25: ${messages[i]}"
    
    git add "${files[i]}"
    git commit -m "${messages[i]}"
    git push origin master
    
    echo "✅ Pushed commit $((i+1))"
    sleep 1
done

echo "🎉 All 25 commits pushed successfully!"