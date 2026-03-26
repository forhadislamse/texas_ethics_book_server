import { PaymentStatus } from "@prisma/client";
import { paginationHelper } from "../../../helpars/paginationHelper";
import prisma from "../../../shared/prisma";

const getAllPaidTransactions = async (query: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
}) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination({
        ...query,
        limit: query.limit ? Number(query.limit) : 5
    });

    const where = { status: PaymentStatus.PAID };

    const payments = await prisma.payment.findMany({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true
                }
            },
            plan: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                    currency: true
                }
            }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
    });

    const total = await prisma.payment.count({ where });

    return {
        data: payments,
        meta: {
            total,
            page,
            limit
        }
    };
};

const getAllUsersWithPayments = async (query: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    searchTerm?: string;
}) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination({
        ...query,
        limit: query.limit ? Number(query.limit) : 5
    });

    const { searchTerm } = query;
    const where: any = {
        role: { not: 'ADMIN' }
    };

    if (searchTerm) {
        where.OR = [
            { fullName: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } }
        ];
    }

    const users = await prisma.user.findMany({
        where,
        include: {
            plan: true,
            Payment: {
                where: { status: PaymentStatus.PAID },
                orderBy: { createdAt: 'desc' },
                include: {
                    plan: true
                }
            }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
    });

    const total = await prisma.user.count({ where });

    // Remove passwords from users for security
    const sanitizedUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    });

    return {
        data: sanitizedUsers,
        meta: {
            total,
            page,
            limit
        }
    };
};

const getDashboardStats = async () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // 1. Basic Counts
    const totalUsers = await prisma.user.count({ 
        where: { role: 'USER' } 
    });

    const activeSubscriptions = await prisma.user.count({ 
        where: { 
            isSubscribed: true, 
            subscriptionExpiresAt: { gt: now } 
        } 
    });

    // 2. Revenue Calculations (Current Month & Current Year)
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const startOfYear = new Date(currentYear, 0, 1);

    const monthlyRevenueData = await prisma.payment.aggregate({
        where: {
            status: PaymentStatus.PAID,
            createdAt: { gte: startOfMonth }
        },
        _sum: { amount: true }
    });

    const annualRevenueData = await prisma.payment.aggregate({
        where: {
            status: PaymentStatus.PAID,
            createdAt: { gte: startOfYear }
        },
        _sum: { amount: true }
    });

    // 3. Yearly Revenue Chart Data (Jan to Dec)
    const yearlyPayments = await prisma.payment.findMany({
        where: {
            status: PaymentStatus.PAID,
            createdAt: { gte: startOfYear }
        },
        select: {
            amount: true,
            createdAt: true
        }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const annualRevenueChart = monthNames.map((month, index) => {
        const monthlySum = yearlyPayments
            .filter(payment => payment.createdAt.getMonth() === index)
            .reduce((sum, payment) => sum + payment.amount, 0);
        
        return {
            month,
            revenue: monthlySum
        };
    });

    // 4. Recent Subscriptions (Last 5)
    const recentSubscriptions = await prisma.payment.findMany({
        where: { status: PaymentStatus.PAID },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
            user: {
                select: {
                    fullName: true,
                    email: true,
                    profileImage: true
                }
            },
            plan: {
                select: {
                    name: true,
                    price: true
                }
            }
        }
    });

    return {
        totalUsers,
        activeSubscriptions,
        monthlyRevenue: monthlyRevenueData._sum.amount || 0,
        annualRevenue: annualRevenueData._sum.amount || 0,
        annualRevenueChart,
        recentSubscriptions
    };
};

const getSubscriptionAnalytics = async (query: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
}) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    // 1. Global Metrics
    const activeSubscriptionCount = await prisma.user.count({ 
        where: { 
            isSubscribed: true, 
            subscriptionExpiresAt: { gt: now } 
        } 
    });

    const annualRevenueData = await prisma.payment.aggregate({
        where: {
            status: PaymentStatus.PAID,
            createdAt: { gte: startOfYear }
        },
        _sum: { amount: true }
    });

    // 2. Paginated Subscription List (PAID only)
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination({
        ...query,
        limit: query.limit ? Number(query.limit) : 5
    });

    const where = { status: PaymentStatus.PAID };

    const subscriptions = await prisma.payment.findMany({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true
                }
            },
            plan: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                    currency: true
                }
            }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
    });

    const total = await prisma.payment.count({ where });

    return {
        activeSubscriptionCount,
        annualRevenueTotal: annualRevenueData._sum.amount || 0,
        data: subscriptions,
        meta: {
            total,
            page,
            limit
        }
    };
};

export const AdminService = {
    getAllPaidTransactions,
    getAllUsersWithPayments,
    getDashboardStats,
    getSubscriptionAnalytics
};
