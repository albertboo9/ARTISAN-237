import { IsString, IsNotEmpty, IsNumber, Min, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ArtisanSkillDto {
  @IsString()
  @IsNotEmpty()
  serviceId!: string;
}

export class UpdateArtisanProfileDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  experienceYears?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArtisanSkillDto)
  skills?: ArtisanSkillDto[];
}
