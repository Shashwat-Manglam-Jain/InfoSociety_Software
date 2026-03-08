import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../common/database/prisma.module";
import { AuthModule } from "../modules/auth/auth.module";
import { BillingModule } from "../modules/billing/billing.module";
import { AccountsModule } from "../modules/banking/accounts/accounts.module";
import { AdministrationModule } from "../modules/banking/administration/administration.module";
import { CashbookModule } from "../modules/banking/cashbook/cashbook.module";
import { ChequeClearingModule } from "../modules/banking/cheque-clearing/cheque-clearing.module";
import { CustomersModule } from "../modules/banking/customers/customers.module";
import { DemandDraftsModule } from "../modules/banking/demand-drafts/demand-drafts.module";
import { DepositsModule } from "../modules/banking/deposits/deposits.module";
import { HealthModule } from "../modules/banking/health/health.module";
import { IbcObcModule } from "../modules/banking/ibc-obc/ibc-obc.module";
import { InvestmentsModule } from "../modules/banking/investments/investments.module";
import { LoansModule } from "../modules/banking/loans/loans.module";
import { LockerModule } from "../modules/banking/locker/locker.module";
import { MonitoringModule } from "../modules/banking/monitoring/monitoring.module";
import { ReportsModule } from "../modules/banking/reports/reports.module";
import { TransactionsModule } from "../modules/banking/transactions/transactions.module";
import { UsersModule } from "../modules/banking/users/users.module";
import { AppController } from "./app.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PrismaModule,
    AuthModule,
    BillingModule,
    HealthModule,
    CustomersModule,
    AccountsModule,
    DepositsModule,
    LoansModule,
    TransactionsModule,
    ChequeClearingModule,
    DemandDraftsModule,
    IbcObcModule,
    InvestmentsModule,
    LockerModule,
    CashbookModule,
    AdministrationModule,
    ReportsModule,
    UsersModule,
    MonitoringModule
  ],
  controllers: [AppController]
})
export class AppModule {}
