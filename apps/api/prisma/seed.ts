import {
  PrismaClient,
  AccountStatus,
  AccountType,
  ReportStatus,
  TransactionMode,
  TransactionType,
  UserRole
} from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

function password(raw: string) {
  return hashSync(raw, 10);
}

async function main() {
  const hoSociety = await prisma.society.upsert({
    where: { code: "SOC-HO" },
    update: {},
    create: {
      code: "SOC-HO",
      name: "Head Office Society"
    }
  });

  await prisma.society.upsert({
    where: { code: "SOC-NORTH" },
    update: {},
    create: {
      code: "SOC-NORTH",
      name: "North Region Society"
    }
  });

  const superUser = await prisma.user.upsert({
    where: { username: "superuser" },
    update: {
      fullName: "Super User",
      role: UserRole.SUPER_USER,
      isActive: true,
      societyId: null
    },
    create: {
      username: "superuser",
      passwordHash: password("Super@123"),
      fullName: "Super User",
      role: UserRole.SUPER_USER
    }
  });

  const agent = await prisma.user.upsert({
    where: { username: "agent1" },
    update: {
      fullName: "Society Agent",
      role: UserRole.AGENT,
      societyId: hoSociety.id,
      isActive: true
    },
    create: {
      username: "agent1",
      passwordHash: password("Agent@123"),
      fullName: "Society Agent",
      role: UserRole.AGENT,
      societyId: hoSociety.id
    }
  });

  const customer = await prisma.customer.upsert({
    where: { customerCode: "SOC-HO-C00001" },
    update: {
      firstName: "Demo",
      lastName: "Client",
      phone: "9999999999",
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

  await prisma.user.upsert({
    where: { username: "client1" },
    update: {
      fullName: "Demo Client",
      role: UserRole.CLIENT,
      societyId: hoSociety.id,
      customerId: customer.id,
      isActive: true
    },
    create: {
      username: "client1",
      passwordHash: password("Client@123"),
      fullName: "Demo Client",
      role: UserRole.CLIENT,
      societyId: hoSociety.id,
      customerId: customer.id
    }
  });

  const account = await prisma.account.upsert({
    where: { accountNumber: "SB0000001" },
    update: {
      customerId: customer.id,
      societyId: hoSociety.id,
      type: AccountType.SAVINGS,
      status: AccountStatus.ACTIVE,
      currentBalance: 15000,
      interestRate: 3.5,
      branchCode: "HO"
    },
    create: {
      accountNumber: "SB0000001",
      customerId: customer.id,
      societyId: hoSociety.id,
      type: AccountType.SAVINGS,
      status: AccountStatus.ACTIVE,
      currentBalance: 15000,
      interestRate: 3.5,
      branchCode: "HO"
    }
  });

  await prisma.transaction.upsert({
    where: { transactionNumber: "TXN0000001" },
    update: {
      accountId: account.id,
      amount: 500,
      type: TransactionType.CREDIT,
      mode: TransactionMode.CASH,
      remark: "Opening seed transaction",
      isPassed: true,
      passedAt: new Date(),
      createdById: agent.id
    },
    create: {
      transactionNumber: "TXN0000001",
      accountId: account.id,
      valueDate: new Date(),
      amount: 500,
      type: TransactionType.CREDIT,
      mode: TransactionMode.CASH,
      remark: "Opening seed transaction",
      isPassed: true,
      passedAt: new Date(),
      createdById: agent.id
    }
  });

  await prisma.reportJob.create({
    data: {
      category: "dailyTransactions",
      reportName: "Day Book",
      parameters: { societyCode: hoSociety.code },
      status: ReportStatus.DONE,
      requestedById: superUser.id,
      completedAt: new Date()
    }
  });

  console.log("Seed completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
