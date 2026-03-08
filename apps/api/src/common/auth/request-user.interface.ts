import { UserRole } from "@prisma/client";

export type RequestUser = {
  sub: string;
  username: string;
  role: UserRole;
  societyId: string | null;
  customerId: string | null;
};
