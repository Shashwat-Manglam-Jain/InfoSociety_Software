import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const rs = await prisma.$queryRaw(Prisma.sql`SELECT "isSocietyAdmin" AS "isSocietyAdmin" FROM "User" WHERE username='staff1' LIMIT 1`);
  console.log('staff1 raw:', rs);
  console.log('type of isSocietyAdmin:', typeof (rs as any)[0].isSocietyAdmin);
  await prisma.$disconnect();
}
main();
