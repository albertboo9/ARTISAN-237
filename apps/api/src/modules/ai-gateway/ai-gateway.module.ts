import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiGatewayService } from './ai-gateway.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [AiGatewayService],
  exports: [AiGatewayService],
})
export class AiGatewayModule {}
