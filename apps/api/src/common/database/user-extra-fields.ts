import { Prisma } from "@prisma/client";
import { PrismaService } from "./prisma.service";

export type UserExtraFieldAvailability = {
  aadhaarNumber: boolean;
  isSocietyAdmin: boolean;
};

export async function loadUserExtraFieldAvailability(
  db: Prisma.TransactionClient | PrismaService
): Promise<UserExtraFieldAvailability> {
  try {
    const rows = await db.$queryRaw<Array<{ columnName: string }>>(Prisma.sql`
      SELECT LOWER("column_name") AS "columnName"
      FROM "information_schema"."columns"
      WHERE LOWER("table_schema") = 'public'
        AND LOWER("table_name") = 'user'
        AND LOWER("column_name") IN ('aadhaarnumber', 'issocietyadmin')
    `);

    const availableColumns = new Set(rows.map((row) => row.columnName));

    return {
      aadhaarNumber: availableColumns.has("aadhaarnumber"),
      isSocietyAdmin: availableColumns.has("issocietyadmin")
    };
  } catch {
    return {
      aadhaarNumber: false,
      isSocietyAdmin: false
    };
  }
}
