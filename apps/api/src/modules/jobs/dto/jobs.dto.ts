import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { JobStatus, MediaType } from '@prisma/client';

export class JobMediaDto {
  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsEnum(MediaType)
  type!: MediaType;
}

export class CreateJobDto {
  @IsUUID()
  @IsNotEmpty()
  serviceId!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @IsNotEmpty()
  lat!: number;

  @IsNumber()
  @IsNotEmpty()
  lng!: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  scheduledFor?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobMediaDto)
  media?: JobMediaDto[];
}

export class UpdateJobStatusDto {
  @IsEnum(JobStatus)
  @IsNotEmpty()
  status!: JobStatus;
}
