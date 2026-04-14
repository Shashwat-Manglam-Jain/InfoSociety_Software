"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = require("bcryptjs");
const prisma = new client_1.PrismaClient();
const DAY_MS = 24 * 60 * 60 * 1000;
// Fixed IDs make the seed idempotent even for tables that do not have business-key unique constraints.
const seedIds = {
    ledgerEntryCredit: "11111111-1111-4111-8111-111111111111",
    ledgerEntryDebit: "22222222-2222-4222-8222-222222222222",
    ledgerEntryCurrentCredit: "33333333-3333-4333-8333-333333333333",
    chequeBookIssue: "44444444-4444-4444-8444-444444444444",
    chequeClearingEntered: "55555555-5555-4555-8555-555555555555",
    chequeClearingCleared: "66666666-6666-4666-8666-666666666666",
    ibcInstrument: "77777777-7777-4777-8777-777777777777",
    obcInstrument: "88888888-8888-4888-8888-888888888888",
    investmentGovBond: "99999999-9999-4999-8999-999999999999",
    investmentTermDeposit: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    lockerVisitOne: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    lockerVisitTwo: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    cashBookReceipt: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    cashBookPayment: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
    reportDayBook: "12121212-1212-4212-8212-121212121212",
    reportLoanOverdue: "34343434-3434-4434-8434-343434343434",
    auditAccountOpened: "56565656-5656-4656-8656-565656565656",
    auditLoanDisbursed: "78787878-7878-4878-8878-787878787878",
    paymentRequestLockerRenewal: "89898989-8989-4898-8898-898989898989",
    paymentRequestLoanEmi: "90909090-9090-4909-8909-909090909090",
    paymentTransactionSubscriptionHo: "a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1",
    paymentTransactionLoanEmi: "b2b2b2b2-b2b2-4b2b-8b2b-b2b2b2b2b2b2"
};
function password(raw) {
    return (0, bcryptjs_1.hashSync)(raw, 10);
}
function fromToday(days) {
    return new Date(Date.now() + days * DAY_MS);
}
async function main() {
    // 1) Base societies that all master/module data will map to.
    const hoSociety = await prisma.society.upsert({
        where: { code: "SOC-HO" },
        update: {
            name: "Head Office Society",
            status: client_1.SocietyStatus.ACTIVE,
            isActive: true,
            billingEmail: "billing@headoffice.local",
            billingPhone: "9000000001",
            billingAddress: "Head Office Campus",
            acceptsDigitalPayments: true,
            upiId: "headoffice@upi"
        },
        create: {
            code: "SOC-HO",
            name: "Head Office Society",
            status: client_1.SocietyStatus.ACTIVE,
            billingEmail: "billing@headoffice.local",
            billingPhone: "9000000001",
            billingAddress: "Head Office Campus",
            acceptsDigitalPayments: true,
            upiId: "headoffice@upi"
        }
    });
    const westSociety = await prisma.society.upsert({
        where: { code: "SOC-WEST" },
        update: {
            name: "Western Cooperative Thrift Society",
            status: client_1.SocietyStatus.ACTIVE,
            isActive: true,
            category: "Thrift & Credit",
            registrationState: "Maharashtra"
        },
        create: {
            code: "SOC-WEST",
            name: "Western Cooperative Thrift Society",
            status: client_1.SocietyStatus.ACTIVE,
            isActive: true,
            category: "Thrift & Credit",
            registrationState: "Maharashtra"
        }
    });
    const southSociety = await prisma.society.upsert({
        where: { code: "SOC-SOUTH" },
        update: {
            name: "South Regional Urban Society",
            status: client_1.SocietyStatus.ACTIVE,
            isActive: true,
            category: "Urban Bank",
            registrationState: "Karnataka"
        },
        create: {
            code: "SOC-SOUTH",
            name: "South Regional Urban Society",
            status: client_1.SocietyStatus.ACTIVE,
            isActive: true,
            category: "Urban Bank",
            registrationState: "Karnataka"
        }
    });
    const centralSociety = await prisma.society.upsert({
        where: { code: "SOC-CENTRAL" },
        update: {
            name: "Central Employees Credit Union",
            status: client_1.SocietyStatus.ACTIVE,
            isActive: true,
            category: "Credit Union",
            registrationState: "Delhi"
        },
        create: {
            code: "SOC-CENTRAL",
            name: "Central Employees Credit Union",
            status: client_1.SocietyStatus.ACTIVE,
            isActive: true,
            category: "Credit Union",
            registrationState: "Delhi"
        }
    });
    // 2) Staff and client users (demo credentials remain stable for local testing).
    // Platform superadmin is provisioned from backend env during application bootstrap.
    const superUser = await prisma.user.upsert({
        where: { username: "superuser" },
        update: {
            passwordHash: password("Super@123"),
            fullName: "Head Office Society Admin",
            role: client_1.UserRole.SUPER_USER,
            isActive: true,
            societyId: hoSociety.id,
            customerId: null
        },
        create: {
            username: "superuser",
            passwordHash: password("Super@123"),
            fullName: "Head Office Society Admin",
            role: client_1.UserRole.SUPER_USER,
            societyId: hoSociety.id
        }
    });
    const agent = await prisma.user.upsert({
        where: { username: "agent1" },
        update: {
            passwordHash: password("Agent@123"),
            fullName: "Society Agent",
            role: client_1.UserRole.AGENT,
            societyId: hoSociety.id,
            isActive: true
        },
        create: {
            username: "agent1",
            passwordHash: password("Agent@123"),
            fullName: "Society Agent",
            role: client_1.UserRole.AGENT,
            societyId: hoSociety.id
        }
    });
    const westAgent = await prisma.user.upsert({
        where: { username: "agent2" },
        update: {
            passwordHash: password("Agent2@123"),
            fullName: "Western Region Agent",
            role: client_1.UserRole.AGENT,
            societyId: westSociety.id,
            isActive: true
        },
        create: {
            username: "agent2",
            passwordHash: password("Agent2@123"),
            fullName: "Western Region Agent",
            role: client_1.UserRole.AGENT,
            societyId: westSociety.id
        }
    });
    const societyAdmin = await prisma.user.upsert({
        where: { username: "societyadmin1" },
        update: {
            passwordHash: password("Society@123"),
            fullName: "Society Administrator",
            role: client_1.UserRole.SUPER_USER,
            societyId: hoSociety.id,
            isActive: true
        },
        create: {
            username: "societyadmin1",
            passwordHash: password("Society@123"),
            fullName: "Society Administrator",
            role: client_1.UserRole.SUPER_USER,
            societyId: hoSociety.id
        }
    });
    // 3) Customers and client login mappings.
    const demoCustomer = await prisma.customer.upsert({
        where: { customerCode: "SOC-HO-C00001" },
        update: {
            firstName: "Demo",
            lastName: "Client",
            phone: "9999999999",
            email: "client1@infopath.local",
            address: "Demo Street",
            kycVerified: true,
            societyId: hoSociety.id
        },
        create: {
            customerCode: "SOC-HO-C00001",
            societyId: hoSociety.id,
            firstName: "Demo",
            lastName: "Client",
            phone: "9999999999",
            email: "client1@infopath.local",
            address: "Demo Street",
            kycVerified: true
        }
    });
    const premiumCustomer = await prisma.customer.upsert({
        where: { customerCode: "SOC-HO-C00002" },
        update: {
            firstName: "Premium",
            lastName: "Client",
            phone: "8888888888",
            email: "premium@infopath.local",
            address: "Premium Street",
            kycVerified: true,
            societyId: hoSociety.id
        },
        create: {
            customerCode: "SOC-HO-C00002",
            societyId: hoSociety.id,
            firstName: "Premium",
            lastName: "Client",
            phone: "8888888888",
            email: "premium@infopath.local",
            address: "Premium Street",
            kycVerified: true
        }
    });
    const businessCustomer = await prisma.customer.upsert({
        where: { customerCode: "SOC-HO-C00003" },
        update: {
            firstName: "Business",
            lastName: "Member",
            phone: "7777777777",
            email: "business@infopath.local",
            address: "Market Road",
            kycVerified: true,
            societyId: hoSociety.id
        },
        create: {
            customerCode: "SOC-HO-C00003",
            societyId: hoSociety.id,
            firstName: "Business",
            lastName: "Member",
            phone: "7777777777",
            email: "business@infopath.local",
            address: "Market Road",
            kycVerified: true
        }
    });
    const westCustomer = await prisma.customer.upsert({
        where: { customerCode: "SOC-WEST-C00001" },
        update: {
            firstName: "Western",
            lastName: "Client",
            phone: "6666666666",
            email: "west@infosociety.local",
            address: "Western Avenue",
            kycVerified: true,
            societyId: westSociety.id
        },
        create: {
            customerCode: "SOC-WEST-C00001",
            societyId: westSociety.id,
            firstName: "Western",
            lastName: "Client",
            phone: "6666666666",
            email: "west@infosociety.local",
            address: "Western Avenue",
            kycVerified: true
        }
    });
    const freeClient = await prisma.user.upsert({
        where: { username: "client1" },
        update: {
            passwordHash: password("Client@123"),
            fullName: "Demo Client",
            role: client_1.UserRole.CLIENT,
            societyId: hoSociety.id,
            customerId: demoCustomer.id,
            isActive: true
        },
        create: {
            username: "client1",
            passwordHash: password("Client@123"),
            fullName: "Demo Client",
            role: client_1.UserRole.CLIENT,
            societyId: hoSociety.id,
            customerId: demoCustomer.id
        }
    });
    const premiumClient = await prisma.user.upsert({
        where: { username: "premium1" },
        update: {
            passwordHash: password("Premium@123"),
            fullName: "Premium Client",
            role: client_1.UserRole.CLIENT,
            societyId: hoSociety.id,
            customerId: premiumCustomer.id,
            isActive: true
        },
        create: {
            username: "premium1",
            passwordHash: password("Premium@123"),
            fullName: "Premium Client",
            role: client_1.UserRole.CLIENT,
            societyId: hoSociety.id,
            customerId: premiumCustomer.id
        }
    });
    const westClient = await prisma.user.upsert({
        where: { username: "client2" },
        update: {
            passwordHash: password("Client2@123"),
            fullName: "Western Client",
            role: client_1.UserRole.CLIENT,
            societyId: westSociety.id,
            customerId: westCustomer.id,
            isActive: true
        },
        create: {
            username: "client2",
            passwordHash: password("Client2@123"),
            fullName: "Western Client",
            role: client_1.UserRole.CLIENT,
            societyId: westSociety.id,
            customerId: westCustomer.id
        }
    });
    // 4) Subscription samples for billing workflows.
    await prisma.subscription.upsert({
        where: { userId: superUser.id },
        update: {
            plan: client_1.SubscriptionPlan.FREE,
            status: client_1.SubscriptionStatus.ACTIVE,
            monthlyPrice: 0,
            nextBillingDate: null,
            cancelAtPeriodEnd: false
        },
        create: {
            userId: superUser.id,
            plan: client_1.SubscriptionPlan.FREE,
            status: client_1.SubscriptionStatus.ACTIVE,
            monthlyPrice: 0
        }
    });
    await prisma.subscription.upsert({
        where: { userId: agent.id },
        update: {
            plan: client_1.SubscriptionPlan.PREMIUM,
            status: client_1.SubscriptionStatus.ACTIVE,
            monthlyPrice: 199,
            nextBillingDate: fromToday(30),
            cancelAtPeriodEnd: false
        },
        create: {
            userId: agent.id,
            plan: client_1.SubscriptionPlan.PREMIUM,
            status: client_1.SubscriptionStatus.ACTIVE,
            monthlyPrice: 199,
            nextBillingDate: fromToday(30)
        }
    });
    await prisma.subscription.upsert({
        where: { userId: westAgent.id },
        update: {
            plan: client_1.SubscriptionPlan.FREE,
            status: client_1.SubscriptionStatus.ACTIVE,
            monthlyPrice: 0,
            nextBillingDate: null,
            cancelAtPeriodEnd: false
        },
        create: {
            userId: westAgent.id,
            plan: client_1.SubscriptionPlan.FREE,
            status: client_1.SubscriptionStatus.ACTIVE,
            monthlyPrice: 0
        }
    });
    await prisma.subscription.upsert({
        where: { userId: societyAdmin.id },
        update: {
            plan: client_1.SubscriptionPlan.FREE,
            status: client_1.SubscriptionStatus.ACTIVE,
            monthlyPrice: 0,
            nextBillingDate: null,
            cancelAtPeriodEnd: false
        },
        create: {
            userId: societyAdmin.id,
            plan: client_1.SubscriptionPlan.FREE,
            status: client_1.SubscriptionStatus.ACTIVE,
            monthlyPrice: 0
        }
    });
    await prisma.subscription.upsert({
        where: { userId: freeClient.id },
        update: {
            plan: client_1.SubscriptionPlan.FREE,
            status: client_1.SubscriptionStatus.ACTIVE,
            monthlyPrice: 0,
            nextBillingDate: null,
            cancelAtPeriodEnd: false
        },
        create: {
            userId: freeClient.id,
            plan: client_1.SubscriptionPlan.FREE,
            status: client_1.SubscriptionStatus.ACTIVE,
            monthlyPrice: 0
        }
    });
    await prisma.subscription.upsert({
        where: { userId: premiumClient.id },
        update: {
            plan: client_1.SubscriptionPlan.FREE,
            status: client_1.SubscriptionStatus.ACTIVE,
            monthlyPrice: 0,
            nextBillingDate: null,
            cancelAtPeriodEnd: false
        },
        create: {
            userId: premiumClient.id,
            plan: client_1.SubscriptionPlan.FREE,
            status: client_1.SubscriptionStatus.ACTIVE,
            monthlyPrice: 0
        }
    });
    await prisma.subscription.upsert({
        where: { userId: westClient.id },
        update: {
            plan: client_1.SubscriptionPlan.FREE,
            status: client_1.SubscriptionStatus.ACTIVE,
            monthlyPrice: 0,
            nextBillingDate: null,
            cancelAtPeriodEnd: false
        },
        create: {
            userId: westClient.id,
            plan: client_1.SubscriptionPlan.FREE,
            status: client_1.SubscriptionStatus.ACTIVE,
            monthlyPrice: 0
        }
    });
    await prisma.societySubscription.upsert({
        where: { societyId: hoSociety.id },
        update: {
            plan: client_1.SubscriptionPlan.PREMIUM,
            status: client_1.SubscriptionStatus.ACTIVE,
            monthlyPrice: 499,
            startsAt: fromToday(-12),
            nextBillingDate: fromToday(18),
            cancelAtPeriodEnd: false
        },
        create: {
            societyId: hoSociety.id,
            plan: client_1.SubscriptionPlan.PREMIUM,
            status: client_1.SubscriptionStatus.ACTIVE,
            monthlyPrice: 499,
            startsAt: fromToday(-12),
            nextBillingDate: fromToday(18),
            cancelAtPeriodEnd: false
        }
    });
    await prisma.societySubscription.upsert({
        where: { societyId: westSociety.id },
        update: {
            plan: client_1.SubscriptionPlan.FREE,
            status: client_1.SubscriptionStatus.ACTIVE,
            monthlyPrice: 0,
            startsAt: fromToday(-5),
            nextBillingDate: null,
            cancelAtPeriodEnd: false
        },
        create: {
            societyId: westSociety.id,
            plan: client_1.SubscriptionPlan.FREE,
            status: client_1.SubscriptionStatus.ACTIVE,
            monthlyPrice: 0,
            startsAt: fromToday(-5),
            nextBillingDate: null,
            cancelAtPeriodEnd: false
        }
    });
    await prisma.paymentRequest.upsert({
        where: { id: seedIds.paymentRequestLockerRenewal },
        update: {
            societyId: hoSociety.id,
            customerId: demoCustomer.id,
            title: "Locker Renewal Charge",
            description: "Annual locker renewal service charge",
            purpose: client_1.PaymentPurpose.SERVICE_CHARGE,
            amount: 1500,
            status: client_1.PaymentRequestStatus.OPEN,
            dueDate: fromToday(7),
            createdById: societyAdmin.id,
            paidAt: null
        },
        create: {
            id: seedIds.paymentRequestLockerRenewal,
            societyId: hoSociety.id,
            customerId: demoCustomer.id,
            title: "Locker Renewal Charge",
            description: "Annual locker renewal service charge",
            purpose: client_1.PaymentPurpose.SERVICE_CHARGE,
            amount: 1500,
            status: client_1.PaymentRequestStatus.OPEN,
            dueDate: fromToday(7),
            createdById: societyAdmin.id
        }
    });
    await prisma.paymentRequest.upsert({
        where: { id: seedIds.paymentRequestLoanEmi },
        update: {
            societyId: hoSociety.id,
            customerId: premiumCustomer.id,
            title: "Loan EMI March",
            description: "Monthly EMI collection",
            purpose: client_1.PaymentPurpose.LOAN_REPAYMENT,
            amount: 2500,
            status: client_1.PaymentRequestStatus.PAID,
            dueDate: fromToday(-2),
            createdById: agent.id,
            paidAt: fromToday(-1)
        },
        create: {
            id: seedIds.paymentRequestLoanEmi,
            societyId: hoSociety.id,
            customerId: premiumCustomer.id,
            title: "Loan EMI March",
            description: "Monthly EMI collection",
            purpose: client_1.PaymentPurpose.LOAN_REPAYMENT,
            amount: 2500,
            status: client_1.PaymentRequestStatus.PAID,
            dueDate: fromToday(-2),
            createdById: agent.id,
            paidAt: fromToday(-1)
        }
    });
    await prisma.paymentTransaction.upsert({
        where: { gatewayReference: "SUBSCRIPTION-HO-2026-03" },
        update: {
            societyId: hoSociety.id,
            initiatedById: superUser.id,
            purpose: client_1.PaymentPurpose.SUBSCRIPTION,
            method: client_1.PaymentMethod.UPI,
            status: client_1.PaymentTransactionStatus.SUCCESS,
            amount: 499,
            processedAt: fromToday(-12),
            remark: "Head Office society premium renewal"
        },
        create: {
            id: seedIds.paymentTransactionSubscriptionHo,
            societyId: hoSociety.id,
            initiatedById: superUser.id,
            purpose: client_1.PaymentPurpose.SUBSCRIPTION,
            method: client_1.PaymentMethod.UPI,
            status: client_1.PaymentTransactionStatus.SUCCESS,
            amount: 499,
            gatewayReference: "SUBSCRIPTION-HO-2026-03",
            processedAt: fromToday(-12),
            remark: "Head Office society premium renewal"
        }
    });
    await prisma.paymentTransaction.upsert({
        where: { gatewayReference: "PAYMENT-EMI-HO-2026-03" },
        update: {
            societyId: hoSociety.id,
            paymentRequestId: seedIds.paymentRequestLoanEmi,
            customerId: premiumCustomer.id,
            initiatedById: premiumClient.id,
            purpose: client_1.PaymentPurpose.LOAN_REPAYMENT,
            method: client_1.PaymentMethod.CREDIT_CARD,
            status: client_1.PaymentTransactionStatus.SUCCESS,
            amount: 2500,
            processedAt: fromToday(-1),
            remark: "Loan EMI March paid online"
        },
        create: {
            id: seedIds.paymentTransactionLoanEmi,
            societyId: hoSociety.id,
            paymentRequestId: seedIds.paymentRequestLoanEmi,
            customerId: premiumCustomer.id,
            initiatedById: premiumClient.id,
            purpose: client_1.PaymentPurpose.LOAN_REPAYMENT,
            method: client_1.PaymentMethod.CREDIT_CARD,
            status: client_1.PaymentTransactionStatus.SUCCESS,
            amount: 2500,
            gatewayReference: "PAYMENT-EMI-HO-2026-03",
            processedAt: fromToday(-1),
            remark: "Loan EMI March paid online"
        }
    });
    // 5) Deposit product schemes and linked deposit accounts.
    const fdScheme = await prisma.depositScheme.upsert({
        where: { code: "FD12" },
        update: {
            name: "Fixed Deposit 12M",
            minMonths: 12,
            maxMonths: 12,
            interestRate: 7.25,
            recurring: false
        },
        create: {
            code: "FD12",
            name: "Fixed Deposit 12M",
            minMonths: 12,
            maxMonths: 12,
            interestRate: 7.25,
            recurring: false
        }
    });
    const rdScheme = await prisma.depositScheme.upsert({
        where: { code: "RD24" },
        update: {
            name: "Recurring Deposit 24M",
            minMonths: 24,
            maxMonths: 24,
            interestRate: 6.5,
            recurring: true
        },
        create: {
            code: "RD24",
            name: "Recurring Deposit 24M",
            minMonths: 24,
            maxMonths: 24,
            interestRate: 6.5,
            recurring: true
        }
    });
    const savingsAccount = await prisma.account.upsert({
        where: { accountNumber: "SB0000001" },
        update: {
            customerId: demoCustomer.id,
            societyId: hoSociety.id,
            type: client_1.AccountType.SAVINGS,
            status: client_1.AccountStatus.ACTIVE,
            currentBalance: 14300,
            interestRate: 3.5,
            branchCode: "HO"
        },
        create: {
            accountNumber: "SB0000001",
            customerId: demoCustomer.id,
            societyId: hoSociety.id,
            type: client_1.AccountType.SAVINGS,
            status: client_1.AccountStatus.ACTIVE,
            currentBalance: 14300,
            interestRate: 3.5,
            branchCode: "HO"
        }
    });
    const currentAccount = await prisma.account.upsert({
        where: { accountNumber: "CA0000001" },
        update: {
            customerId: businessCustomer.id,
            societyId: hoSociety.id,
            type: client_1.AccountType.CURRENT,
            status: client_1.AccountStatus.ACTIVE,
            currentBalance: 85000,
            interestRate: 0,
            branchCode: "HO"
        },
        create: {
            accountNumber: "CA0000001",
            customerId: businessCustomer.id,
            societyId: hoSociety.id,
            type: client_1.AccountType.CURRENT,
            status: client_1.AccountStatus.ACTIVE,
            currentBalance: 85000,
            interestRate: 0,
            branchCode: "HO"
        }
    });
    const fdAccount = await prisma.account.upsert({
        where: { accountNumber: "FD0000001" },
        update: {
            customerId: premiumCustomer.id,
            societyId: hoSociety.id,
            type: client_1.AccountType.FIXED_DEPOSIT,
            status: client_1.AccountStatus.ACTIVE,
            currentBalance: 125000,
            interestRate: 7.25,
            branchCode: "HO"
        },
        create: {
            accountNumber: "FD0000001",
            customerId: premiumCustomer.id,
            societyId: hoSociety.id,
            type: client_1.AccountType.FIXED_DEPOSIT,
            status: client_1.AccountStatus.ACTIVE,
            currentBalance: 125000,
            interestRate: 7.25,
            branchCode: "HO"
        }
    });
    const recurringDepositAccount = await prisma.account.upsert({
        where: { accountNumber: "RD0000001" },
        update: {
            customerId: westCustomer.id,
            societyId: westSociety.id,
            type: client_1.AccountType.RECURRING_DEPOSIT,
            status: client_1.AccountStatus.ACTIVE,
            currentBalance: 36000,
            interestRate: 6.5,
            branchCode: "WR"
        },
        create: {
            accountNumber: "RD0000001",
            customerId: westCustomer.id,
            societyId: westSociety.id,
            type: client_1.AccountType.RECURRING_DEPOSIT,
            status: client_1.AccountStatus.ACTIVE,
            currentBalance: 36000,
            interestRate: 6.5,
            branchCode: "WR"
        }
    });
    const loanLinkedAccount = await prisma.account.upsert({
        where: { accountNumber: "LN0000001" },
        update: {
            customerId: businessCustomer.id,
            societyId: hoSociety.id,
            type: client_1.AccountType.LOAN,
            status: client_1.AccountStatus.ACTIVE,
            currentBalance: 420000,
            interestRate: 12.25,
            branchCode: "HO"
        },
        create: {
            accountNumber: "LN0000001",
            customerId: businessCustomer.id,
            societyId: hoSociety.id,
            type: client_1.AccountType.LOAN,
            status: client_1.AccountStatus.ACTIVE,
            currentBalance: 420000,
            interestRate: 12.25,
            branchCode: "HO"
        }
    });
    const northSavingsAccount = await prisma.account.upsert({
        where: { accountNumber: "SB1000001" },
        update: {
            customerId: westCustomer.id,
            societyId: westSociety.id,
            type: client_1.AccountType.SAVINGS,
            status: client_1.AccountStatus.ACTIVE,
            currentBalance: 68000,
            interestRate: 3.25,
            branchCode: "WR"
        },
        create: {
            accountNumber: "SB1000001",
            customerId: westCustomer.id,
            societyId: westSociety.id,
            type: client_1.AccountType.SAVINGS,
            status: client_1.AccountStatus.ACTIVE,
            currentBalance: 68000,
            interestRate: 3.25,
            branchCode: "WR"
        }
    });
    await prisma.depositAccount.upsert({
        where: { accountId: fdAccount.id },
        update: {
            schemeId: fdScheme.id,
            principalAmount: 100000,
            maturityDate: fromToday(180),
            maturityAmount: 107250,
            renewalCount: 1,
            lienMarked: false
        },
        create: {
            accountId: fdAccount.id,
            schemeId: fdScheme.id,
            principalAmount: 100000,
            maturityDate: fromToday(180),
            maturityAmount: 107250,
            renewalCount: 1,
            lienMarked: false
        }
    });
    await prisma.depositAccount.upsert({
        where: { accountId: recurringDepositAccount.id },
        update: {
            schemeId: rdScheme.id,
            principalAmount: 30000,
            maturityDate: fromToday(360),
            maturityAmount: 34000,
            renewalCount: 0,
            lienMarked: true
        },
        create: {
            accountId: recurringDepositAccount.id,
            schemeId: rdScheme.id,
            principalAmount: 30000,
            maturityDate: fromToday(360),
            maturityAmount: 34000,
            renewalCount: 0,
            lienMarked: true
        }
    });
    // 6) Loan module sample covering sanction + disbursement + overdue state.
    await prisma.loanAccount.upsert({
        where: { accountId: loanLinkedAccount.id },
        update: {
            customerId: businessCustomer.id,
            applicationAmount: 500000,
            sanctionedAmount: 450000,
            disbursedAmount: 420000,
            sanctionDate: fromToday(-40),
            expiryDate: fromToday(680),
            interestRate: 12.25,
            overdueAmount: 9500,
            status: client_1.LoanStatus.DISBURSED
        },
        create: {
            accountId: loanLinkedAccount.id,
            customerId: businessCustomer.id,
            applicationAmount: 500000,
            sanctionedAmount: 450000,
            disbursedAmount: 420000,
            sanctionDate: fromToday(-40),
            expiryDate: fromToday(680),
            interestRate: 12.25,
            overdueAmount: 9500,
            status: client_1.LoanStatus.DISBURSED
        }
    });
    // 7) Transaction flow (credit/debit/pending), then ledger snapshots.
    const txnCredit = await prisma.transaction.upsert({
        where: { transactionNumber: "TXN0000001" },
        update: {
            accountId: savingsAccount.id,
            valueDate: fromToday(-7),
            amount: 500,
            type: client_1.TransactionType.CREDIT,
            mode: client_1.TransactionMode.CASH,
            remark: "Cash deposit",
            isPassed: true,
            passedAt: fromToday(-7),
            createdById: agent.id
        },
        create: {
            transactionNumber: "TXN0000001",
            accountId: savingsAccount.id,
            valueDate: fromToday(-7),
            amount: 500,
            type: client_1.TransactionType.CREDIT,
            mode: client_1.TransactionMode.CASH,
            remark: "Cash deposit",
            isPassed: true,
            passedAt: fromToday(-7),
            createdById: agent.id
        }
    });
    const txnDebit = await prisma.transaction.upsert({
        where: { transactionNumber: "TXN0000002" },
        update: {
            accountId: savingsAccount.id,
            valueDate: fromToday(-5),
            amount: 1200,
            type: client_1.TransactionType.DEBIT,
            mode: client_1.TransactionMode.TRANSFER,
            remark: "Utility payment",
            isPassed: true,
            passedAt: fromToday(-5),
            createdById: agent.id
        },
        create: {
            transactionNumber: "TXN0000002",
            accountId: savingsAccount.id,
            valueDate: fromToday(-5),
            amount: 1200,
            type: client_1.TransactionType.DEBIT,
            mode: client_1.TransactionMode.TRANSFER,
            remark: "Utility payment",
            isPassed: true,
            passedAt: fromToday(-5),
            createdById: agent.id
        }
    });
    const txnCurrentCredit = await prisma.transaction.upsert({
        where: { transactionNumber: "TXN0000003" },
        update: {
            accountId: currentAccount.id,
            valueDate: fromToday(-3),
            amount: 25000,
            type: client_1.TransactionType.CREDIT,
            mode: client_1.TransactionMode.CHEQUE,
            remark: "Cheque realization",
            isPassed: true,
            passedAt: fromToday(-2),
            createdById: agent.id
        },
        create: {
            transactionNumber: "TXN0000003",
            accountId: currentAccount.id,
            valueDate: fromToday(-3),
            amount: 25000,
            type: client_1.TransactionType.CREDIT,
            mode: client_1.TransactionMode.CHEQUE,
            remark: "Cheque realization",
            isPassed: true,
            passedAt: fromToday(-2),
            createdById: agent.id
        }
    });
    await prisma.transaction.upsert({
        where: { transactionNumber: "TXN0000004" },
        update: {
            accountId: northSavingsAccount.id,
            valueDate: fromToday(-1),
            amount: 10000,
            type: client_1.TransactionType.CREDIT,
            mode: client_1.TransactionMode.CASH,
            remark: "Pending verification transaction",
            isPassed: false,
            passedAt: null,
            createdById: westAgent.id
        },
        create: {
            transactionNumber: "TXN0000004",
            accountId: northSavingsAccount.id,
            valueDate: fromToday(-1),
            amount: 10000,
            type: client_1.TransactionType.CREDIT,
            mode: client_1.TransactionMode.CASH,
            remark: "Pending verification transaction",
            isPassed: false,
            passedAt: null,
            createdById: westAgent.id
        }
    });
    await prisma.ledgerEntry.upsert({
        where: { id: seedIds.ledgerEntryCredit },
        update: {
            accountId: savingsAccount.id,
            transactionId: txnCredit.id,
            balanceAfter: 15500,
            interestPayable: 21.45,
            interestReceivable: null
        },
        create: {
            id: seedIds.ledgerEntryCredit,
            accountId: savingsAccount.id,
            transactionId: txnCredit.id,
            balanceAfter: 15500,
            interestPayable: 21.45
        }
    });
    await prisma.ledgerEntry.upsert({
        where: { id: seedIds.ledgerEntryDebit },
        update: {
            accountId: savingsAccount.id,
            transactionId: txnDebit.id,
            balanceAfter: 14300,
            interestPayable: 19.8,
            interestReceivable: null
        },
        create: {
            id: seedIds.ledgerEntryDebit,
            accountId: savingsAccount.id,
            transactionId: txnDebit.id,
            balanceAfter: 14300,
            interestPayable: 19.8
        }
    });
    await prisma.ledgerEntry.upsert({
        where: { id: seedIds.ledgerEntryCurrentCredit },
        update: {
            accountId: currentAccount.id,
            transactionId: txnCurrentCredit.id,
            balanceAfter: 85000,
            interestPayable: null,
            interestReceivable: null
        },
        create: {
            id: seedIds.ledgerEntryCurrentCredit,
            accountId: currentAccount.id,
            transactionId: txnCurrentCredit.id,
            balanceAfter: 85000
        }
    });
    await prisma.chequeBookIssue.upsert({
        where: { id: seedIds.chequeBookIssue },
        update: {
            accountId: currentAccount.id,
            startLeaf: 1001,
            endLeaf: 1050,
            issuedById: agent.id
        },
        create: {
            id: seedIds.chequeBookIssue,
            accountId: currentAccount.id,
            startLeaf: 1001,
            endLeaf: 1050,
            issuedById: agent.id
        }
    });
    // 8) Instrument modules: demand draft, cheque clearing, and IBC/OBC.
    await prisma.demandDraft.upsert({
        where: { draftNumber: "DD000001" },
        update: {
            accountId: savingsAccount.id,
            customerId: demoCustomer.id,
            beneficiary: "Metro Utilities Ltd",
            amount: 4500,
            status: client_1.InstrumentStatus.CLEARED,
            issuedAt: fromToday(-15),
            clearedAt: fromToday(-13)
        },
        create: {
            draftNumber: "DD000001",
            accountId: savingsAccount.id,
            customerId: demoCustomer.id,
            beneficiary: "Metro Utilities Ltd",
            amount: 4500,
            status: client_1.InstrumentStatus.CLEARED,
            issuedAt: fromToday(-15),
            clearedAt: fromToday(-13)
        }
    });
    await prisma.demandDraft.upsert({
        where: { draftNumber: "DD000002" },
        update: {
            accountId: currentAccount.id,
            customerId: businessCustomer.id,
            beneficiary: "Vendor Settlement Services",
            amount: 12000,
            status: client_1.InstrumentStatus.ENTERED,
            issuedAt: fromToday(-2),
            clearedAt: null
        },
        create: {
            draftNumber: "DD000002",
            accountId: currentAccount.id,
            customerId: businessCustomer.id,
            beneficiary: "Vendor Settlement Services",
            amount: 12000,
            status: client_1.InstrumentStatus.ENTERED,
            issuedAt: fromToday(-2)
        }
    });
    await prisma.chequeClearing.upsert({
        where: { id: seedIds.chequeClearingEntered },
        update: {
            chequeNumber: "CHQ-10001",
            accountId: currentAccount.id,
            bankName: "National Cooperative Bank",
            branchName: "Main Branch",
            amount: 19000,
            status: client_1.InstrumentStatus.ENTERED,
            entryDate: fromToday(-2),
            clearedDate: null
        },
        create: {
            id: seedIds.chequeClearingEntered,
            chequeNumber: "CHQ-10001",
            accountId: currentAccount.id,
            bankName: "National Cooperative Bank",
            branchName: "Main Branch",
            amount: 19000,
            status: client_1.InstrumentStatus.ENTERED,
            entryDate: fromToday(-2)
        }
    });
    await prisma.chequeClearing.upsert({
        where: { id: seedIds.chequeClearingCleared },
        update: {
            chequeNumber: "CHQ-10002",
            accountId: savingsAccount.id,
            bankName: "Union Local Bank",
            branchName: "City Branch",
            amount: 8600,
            status: client_1.InstrumentStatus.CLEARED,
            entryDate: fromToday(-10),
            clearedDate: fromToday(-8)
        },
        create: {
            id: seedIds.chequeClearingCleared,
            chequeNumber: "CHQ-10002",
            accountId: savingsAccount.id,
            bankName: "Union Local Bank",
            branchName: "City Branch",
            amount: 8600,
            status: client_1.InstrumentStatus.CLEARED,
            entryDate: fromToday(-10),
            clearedDate: fromToday(-8)
        }
    });
    await prisma.ibcObcInstrument.upsert({
        where: { id: seedIds.ibcInstrument },
        update: {
            instrumentNumber: "IBC-0001",
            type: client_1.IbcObcType.IBC,
            accountId: savingsAccount.id,
            customerId: demoCustomer.id,
            amount: 45000,
            status: client_1.InstrumentStatus.CLEARED,
            entryDate: fromToday(-20),
            resolvedDate: fromToday(-17)
        },
        create: {
            id: seedIds.ibcInstrument,
            instrumentNumber: "IBC-0001",
            type: client_1.IbcObcType.IBC,
            accountId: savingsAccount.id,
            customerId: demoCustomer.id,
            amount: 45000,
            status: client_1.InstrumentStatus.CLEARED,
            entryDate: fromToday(-20),
            resolvedDate: fromToday(-17)
        }
    });
    await prisma.ibcObcInstrument.upsert({
        where: { id: seedIds.obcInstrument },
        update: {
            instrumentNumber: "OBC-0001",
            type: client_1.IbcObcType.OBC,
            accountId: currentAccount.id,
            customerId: businessCustomer.id,
            amount: 38000,
            status: client_1.InstrumentStatus.ENTERED,
            entryDate: fromToday(-4),
            resolvedDate: null
        },
        create: {
            id: seedIds.obcInstrument,
            instrumentNumber: "OBC-0001",
            type: client_1.IbcObcType.OBC,
            accountId: currentAccount.id,
            customerId: businessCustomer.id,
            amount: 38000,
            status: client_1.InstrumentStatus.ENTERED,
            entryDate: fromToday(-4)
        }
    });
    // 9) Investments, locker operations, cashbook, and administration working days.
    await prisma.investment.upsert({
        where: { id: seedIds.investmentGovBond },
        update: {
            bankName: "State Bank Treasury",
            investmentType: "Government Bond",
            amount: 500000,
            interestRate: 7.2,
            startDate: fromToday(-180),
            maturityDate: fromToday(185),
            maturityAmount: 542000,
            withdrawnDate: null
        },
        create: {
            id: seedIds.investmentGovBond,
            bankName: "State Bank Treasury",
            investmentType: "Government Bond",
            amount: 500000,
            interestRate: 7.2,
            startDate: fromToday(-180),
            maturityDate: fromToday(185),
            maturityAmount: 542000
        }
    });
    await prisma.investment.upsert({
        where: { id: seedIds.investmentTermDeposit },
        update: {
            bankName: "National Cooperative Bank",
            investmentType: "Term Deposit",
            amount: 300000,
            interestRate: 6.8,
            startDate: fromToday(-90),
            maturityDate: fromToday(275),
            maturityAmount: 335400,
            withdrawnDate: null
        },
        create: {
            id: seedIds.investmentTermDeposit,
            bankName: "National Cooperative Bank",
            investmentType: "Term Deposit",
            amount: 300000,
            interestRate: 6.8,
            startDate: fromToday(-90),
            maturityDate: fromToday(275),
            maturityAmount: 335400
        }
    });
    const activeLocker = await prisma.locker.upsert({
        where: { lockerNumber: "LK-001" },
        update: {
            customerId: demoCustomer.id,
            size: client_1.LockerSize.MEDIUM,
            status: client_1.LockerStatus.ACTIVE,
            openingDate: fromToday(-300),
            closingDate: null,
            annualCharge: 1800
        },
        create: {
            lockerNumber: "LK-001",
            customerId: demoCustomer.id,
            size: client_1.LockerSize.MEDIUM,
            status: client_1.LockerStatus.ACTIVE,
            openingDate: fromToday(-300),
            annualCharge: 1800
        }
    });
    await prisma.locker.upsert({
        where: { lockerNumber: "LK-002" },
        update: {
            customerId: premiumCustomer.id,
            size: client_1.LockerSize.LARGE,
            status: client_1.LockerStatus.EXPIRED,
            openingDate: fromToday(-420),
            closingDate: fromToday(-10),
            annualCharge: 2500
        },
        create: {
            lockerNumber: "LK-002",
            customerId: premiumCustomer.id,
            size: client_1.LockerSize.LARGE,
            status: client_1.LockerStatus.EXPIRED,
            openingDate: fromToday(-420),
            closingDate: fromToday(-10),
            annualCharge: 2500
        }
    });
    await prisma.lockerVisit.upsert({
        where: { id: seedIds.lockerVisitOne },
        update: {
            lockerId: activeLocker.id,
            visitedAt: fromToday(-15),
            remarks: "Routine document retrieval"
        },
        create: {
            id: seedIds.lockerVisitOne,
            lockerId: activeLocker.id,
            visitedAt: fromToday(-15),
            remarks: "Routine document retrieval"
        }
    });
    await prisma.lockerVisit.upsert({
        where: { id: seedIds.lockerVisitTwo },
        update: {
            lockerId: activeLocker.id,
            visitedAt: fromToday(-2),
            remarks: "KYC document update"
        },
        create: {
            id: seedIds.lockerVisitTwo,
            lockerId: activeLocker.id,
            visitedAt: fromToday(-2),
            remarks: "KYC document update"
        }
    });
    await prisma.cashBookEntry.upsert({
        where: { id: seedIds.cashBookReceipt },
        update: {
            headCode: "CB-RCPT-001",
            headName: "Cash Receipt - Savings Deposit",
            amount: 20000,
            type: client_1.TransactionType.CREDIT,
            mode: client_1.TransactionMode.CASH,
            remark: "Day opening receipt",
            entryDate: fromToday(-1),
            isPosted: true,
            postedAt: fromToday(-1),
            createdById: agent.id
        },
        create: {
            id: seedIds.cashBookReceipt,
            headCode: "CB-RCPT-001",
            headName: "Cash Receipt - Savings Deposit",
            amount: 20000,
            type: client_1.TransactionType.CREDIT,
            mode: client_1.TransactionMode.CASH,
            remark: "Day opening receipt",
            entryDate: fromToday(-1),
            isPosted: true,
            postedAt: fromToday(-1),
            createdById: agent.id
        }
    });
    await prisma.cashBookEntry.upsert({
        where: { id: seedIds.cashBookPayment },
        update: {
            headCode: "CB-PAY-001",
            headName: "Cash Payment - Vendor",
            amount: 8500,
            type: client_1.TransactionType.DEBIT,
            mode: client_1.TransactionMode.TRANSFER,
            remark: "Vendor settlement pending pass",
            entryDate: fromToday(0),
            isPosted: false,
            postedAt: null,
            createdById: agent.id
        },
        create: {
            id: seedIds.cashBookPayment,
            headCode: "CB-PAY-001",
            headName: "Cash Payment - Vendor",
            amount: 8500,
            type: client_1.TransactionType.DEBIT,
            mode: client_1.TransactionMode.TRANSFER,
            remark: "Vendor settlement pending pass",
            entryDate: fromToday(0),
            isPosted: false,
            createdById: agent.id
        }
    });
    await prisma.workingDay.upsert({
        where: { societyId_date: { societyId: agent.societyId, date: new Date("2026-03-10T00:00:00.000Z") } },
        update: {
            societyId: agent.societyId,
            isDayEnd: true,
            isMonthEnd: false,
            isYearEnd: false,
            openedById: agent.id,
            closedById: agent.id
        },
        create: {
            societyId: agent.societyId,
            date: new Date("2026-03-10T00:00:00.000Z"),
            isDayEnd: true,
            isMonthEnd: false,
            isYearEnd: false,
            openedById: agent.id,
            closedById: agent.id
        }
    });
    await prisma.workingDay.upsert({
        where: { societyId_date: { societyId: westAgent.societyId, date: new Date("2026-03-11T00:00:00.000Z") } },
        update: {
            societyId: westAgent.societyId,
            isDayEnd: false,
            isMonthEnd: false,
            isYearEnd: false,
            openedById: westAgent.id,
            closedById: null
        },
        create: {
            societyId: westAgent.societyId,
            date: new Date("2026-03-11T00:00:00.000Z"),
            isDayEnd: false,
            isMonthEnd: false,
            isYearEnd: false,
            openedById: westAgent.id
        }
    });
    // 10) Reporting and audit samples for admin/monitoring visibility.
    await prisma.reportJob.upsert({
        where: { id: seedIds.reportDayBook },
        update: {
            category: "dailyTransactions",
            reportName: "Day Book",
            parameters: { societyCode: hoSociety.code, asOnDate: "2026-03-11" },
            status: client_1.ReportStatus.DONE,
            requestedById: superUser.id,
            requestedAt: fromToday(-1),
            completedAt: fromToday(-1)
        },
        create: {
            id: seedIds.reportDayBook,
            category: "dailyTransactions",
            reportName: "Day Book",
            parameters: { societyCode: hoSociety.code, asOnDate: "2026-03-11" },
            status: client_1.ReportStatus.DONE,
            requestedById: superUser.id,
            requestedAt: fromToday(-1),
            completedAt: fromToday(-1)
        }
    });
    await prisma.reportJob.upsert({
        where: { id: seedIds.reportLoanOverdue },
        update: {
            category: "loan",
            reportName: "Overdue Loan Statement",
            parameters: { minOverdueAmount: 5000 },
            status: client_1.ReportStatus.RUNNING,
            requestedById: agent.id,
            requestedAt: fromToday(0),
            completedAt: null
        },
        create: {
            id: seedIds.reportLoanOverdue,
            category: "loan",
            reportName: "Overdue Loan Statement",
            parameters: { minOverdueAmount: 5000 },
            status: client_1.ReportStatus.RUNNING,
            requestedById: agent.id,
            requestedAt: fromToday(0)
        }
    });
    await prisma.auditLog.upsert({
        where: { id: seedIds.auditAccountOpened },
        update: {
            module: "accounts",
            action: "ACCOUNT_OPENED",
            entityId: savingsAccount.id,
            payload: { accountNumber: savingsAccount.accountNumber, customerCode: demoCustomer.customerCode },
            performedById: agent.id,
            performedAt: fromToday(-12)
        },
        create: {
            id: seedIds.auditAccountOpened,
            module: "accounts",
            action: "ACCOUNT_OPENED",
            entityId: savingsAccount.id,
            payload: { accountNumber: savingsAccount.accountNumber, customerCode: demoCustomer.customerCode },
            performedById: agent.id,
            performedAt: fromToday(-12)
        }
    });
    await prisma.auditLog.upsert({
        where: { id: seedIds.auditLoanDisbursed },
        update: {
            module: "loans",
            action: "LOAN_DISBURSED",
            entityId: loanLinkedAccount.id,
            payload: { accountNumber: loanLinkedAccount.accountNumber, disbursedAmount: 420000 },
            performedById: agent.id,
            performedAt: fromToday(-30)
        },
        create: {
            id: seedIds.auditLoanDisbursed,
            module: "loans",
            action: "LOAN_DISBURSED",
            entityId: loanLinkedAccount.id,
            payload: { accountNumber: loanLinkedAccount.accountNumber, disbursedAmount: 420000 },
            performedById: agent.id,
            performedAt: fromToday(-30)
        }
    });
    console.log("Seed completed with sample data across all banking modules.");
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
