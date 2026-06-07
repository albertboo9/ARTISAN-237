import { IsString, IsNotEmpty, IsNumber, IsUUID, IsEnum, Min, IsOptional } from 'class-validator';
import { QuoteStatus } from '@prisma/client';

export class CreateQuoteDto {
  @IsUUID()
  @IsNotEmpty()
  jobId!: string;

  @IsNumber()
  @Min(0)
  estimatedPrice!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  materialsPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  laborPrice?: number;

  @IsString()
  @IsNotEmpty()
  description!: string;
}

export class UpdateQuoteStatusDto {
  @IsEnum(QuoteStatus)
  @IsNotEmpty()
  status!: QuoteStatus;
}
