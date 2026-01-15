# BaseLytics Backend API

Backend infrastructure for the BaseLytics DeFi analytics platform.

## Features

- ✅ JWT + Wallet Signature Authentication
- ✅ PostgreSQL Database with Prisma ORM
- ✅ Redis Caching Layer
- ✅ Tier-based Rate Limiting
- ✅ User Profile Management
- ✅ Watchlist System
- ✅ Price Alerts
- ✅ Portfolio Snapshots
- ✅ API Key Management
- ✅ Referral System

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache**: Redis
- **Auth**: JWT + ethers.js

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Redis 7+

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# At minimum, set:
# - DATABASE_URL
# - REDIS_URL
# - JWT_SECRET
# - REFRESH_TOKEN_SECRET

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Server will run on http://localhost:5000
```

### Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/nonce` - Get nonce for wallet signature
- `POST /api/auth/login` - Login with wallet signature
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### User

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/watchlist` - Get watchlists
- `POST /api/users/watchlist` - Create watchlist
- `PUT /api/users/watchlist/:id` - Update watchlist
- `DELETE /api/users/watchlist/:id` - Delete watchlist
- `GET /api/users/alerts` - Get alerts
- `POST /api/users/alerts` - Create alert (Pro+)
- `PATCH /api/users/alerts/:id` - Update alert status
- `DELETE /api/users/alerts/:id` - Delete alert
- `GET /api/users/portfolio/history` - Get portfolio snapshots
- `POST /api/users/portfolio/snapshot` - Save snapshot
- `GET /api/users/stats` - Get user statistics

### Health

- `GET /health` - Health check (database + Redis status)

## Database Schema

See [prisma/schema.prisma](prisma/schema.prisma) for full schema.

Key models:
- `User` - User accounts
- `Watchlist` - Token/contract watchlists
- `Alert` - Price and event alerts
- `Portfolio` - Portfolio snapshots
- `Subscription` - Subscription management
- `ApiKey` - API access keys
- `Referral` - Referral tracking

## Rate Limiting

Tier-based rate limits:
- **Public**: 50 requests / 15 minutes
- **Free**: 100 requests / 15 minutes
- **Pro**: 1,000 requests / 15 minutes
- **Enterprise**: 10,000 requests / 15 minutes

## Caching Strategy

Redis TTLs:
- **Prices**: 5 minutes
- **NFT Metadata**: 1 hour
- **Portfolio**: 30 seconds
- **Gas Prices**: 10 seconds

## Scripts

```bash
npm run dev               # Development server
npm run build             # Build TypeScript
npm start                 # Production server
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run migrations
npm run prisma:studio     # Open Prisma Studio
npm run prisma:seed       # Seed database
npm test                  # Run tests
```

## Environment Variables

See [.env.example](.env.example) for all required variables.

## License

MIT
