import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create sample users
    const user1 = await prisma.user.upsert({
        where: { walletAddress: '0x1234567890123456789012345678901234567890' },
        update: {},
        create: {
            walletAddress: '0x1234567890123456789012345678901234567890',
            email: 'user1@example.com',
            username: 'DeFiTrader',
            tier: 'PRO',
            preferences: {
                theme: 'dark',
                notifications: true,
                defaultChain: 8453, // Base
            },
        },
    });

    const user2 = await prisma.user.upsert({
        where: { walletAddress: '0x0987654321098765432109876543210987654321' },
        update: {},
        create: {
            walletAddress: '0x0987654321098765432109876543210987654321',
            email: 'user2@example.com',
            username: 'BaseBuilder',
            tier: 'FREE',
        },
    });

    console.log('✅ Created users:', { user1: user1.username, user2: user2.username });

    // Create sample watchlists
    const watchlist1 = await prisma.watchlist.create({
        data: {
            userId: user1.id,
            name: 'My Favorite Tokens',
            items: [
                { type: 'token', address: '0x...', symbol: 'ETH', name: 'Ethereum' },
                { type: 'token', address: '0x...', symbol: 'USDC', name: 'USD Coin' },
            ],
        },
    });

    console.log('✅ Created watchlist:', watchlist1.name);

    // Create sample alerts
    const alert1 = await prisma.alert.create({
        data: {
            userId: user1.id,
            type: 'PRICE_ABOVE',
            status: 'ACTIVE',
            conditions: {
                token: 'ETH',
                price: 3000,
                notifyEmail: true,
            },
        },
    });

    console.log('✅ Created alert:', alert1.type);

    // Create portfolio snapshot
    const portfolio1 = await prisma.portfolio.create({
        data: {
            userId: user1.id,
            totalValue: 50000.0,
            snapshot: {
                tokens: [
                    { symbol: 'ETH', amount: 10, value: 30000 },
                    { symbol: 'USDC', amount: 20000, value: 20000 },
                ],
            },
        },
    });

    console.log('✅ Created portfolio snapshot');

    console.log('✨ Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
