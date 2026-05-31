import { IsString, IsNotEmpty, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { DisputeStatus } from '@prisma/client';

export class CreateDisputeDto {
  @IsUUID()
  @IsNotEmpty()
  jobId!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class ResolveDisputeDto {
  @IsEnum(DisputeStatus)
  @IsNotEmpty()
  status!: DisputeStatus;

  @IsOptional()
  @IsString()
  resolution?: string;
}
