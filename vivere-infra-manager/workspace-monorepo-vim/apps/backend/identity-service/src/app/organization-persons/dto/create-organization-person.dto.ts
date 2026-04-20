import { IsUUID, IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationPersonDto {
  @ApiProperty({ description: 'ID da organização' })
  @IsUUID()
  @IsNotEmpty()
  organization_id: string;

  @ApiProperty({ description: 'ID da pessoa' })
  @IsUUID()
  @IsNotEmpty()
  person_id: string;

  @ApiProperty({ description: 'Papel (ex: FUNCIONARIO, REPRESENTANTE)' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiPropertyOptional({ description: 'Data de início' })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({ description: 'Data de término' })
  @IsDateString()
  @IsOptional()
  end_date?: string;

  @ApiPropertyOptional({ description: 'UUID de quem criou o vínculo' })
  @IsUUID()
  @IsOptional()
  created_by?: string;
}