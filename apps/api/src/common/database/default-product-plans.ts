import type { Prisma, PrismaClient } from "@prisma/client";

type PrismaLike = Prisma.TransactionClient | PrismaClient;

const DEFAULT_DEPOSIT_SCHEMES = [
  {
    code: "FD12",
    name: "Basic Fixed Deposit 12M",
    minMonths: 12,
    maxMonths: 12,
    interestRate: 7.25,
    recurring: false
  },
  {
    code: "RD24",
    name: "Basic Recurring Deposit 24M",
    minMonths: 24,
    maxMonths: 24,
    interestRate: 6.5,
    recurring: true
  }
] as const;

export async function ensureDefaultDepositSchemes(tx: PrismaLike) {
  await Promise.all(
    DEFAULT_DEPOSIT_SCHEMES.map((scheme) =>
      tx.depositScheme.upsert({
        where: {
          code: scheme.code
        },
        update: {
          name: scheme.name,
          minMonths: scheme.minMonths,
          maxMonths: scheme.maxMonths,
          interestRate: scheme.interestRate,
          recurring: scheme.recurring
        },
        create: {
          code: scheme.code,
          name: scheme.name,
          minMonths: scheme.minMonths,
          maxMonths: scheme.maxMonths,
          interestRate: scheme.interestRate,
          recurring: scheme.recurring
        }
      })
    )
  );
}
