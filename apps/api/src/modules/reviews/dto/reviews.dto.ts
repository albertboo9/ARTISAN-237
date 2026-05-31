import { IsString, IsNotEmpty, IsNumber, Min, Max, IsUUID, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  @IsNotEmpty()
  jobId!: string;

  @IsUUID()
  @IsNotEmpty()
  targetId!: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
