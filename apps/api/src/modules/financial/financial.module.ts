import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { EscrowService } from './escrow.service';
import { InvoicesService } from './invoices.service';
import { FinancialController } from './financial.controller';

@Module({
  imports: [PrismaModule],
  controllers: [FinancialController],
  providers: [EscrowService, InvoicesService],
  exports: [EscrowService, InvoicesService],
})
export class FinancialModule {}
