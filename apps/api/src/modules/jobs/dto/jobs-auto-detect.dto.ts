import { IsString, IsNotEmpty } from 'class-validator';

export class AutoDetectServiceDto {
  @IsString()
  @IsNotEmpty()
  description!: string;
}