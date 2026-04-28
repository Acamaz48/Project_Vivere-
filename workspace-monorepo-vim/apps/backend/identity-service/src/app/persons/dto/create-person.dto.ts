import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePersonDto {
  @ApiProperty({ description: 'Nome completo', example: 'João da Silva' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiPropertyOptional({ description: 'CPF (apenas números)', example: '12345678901' })
  @IsString()
  @IsOptional()
  tax_id?: string;

  @ApiPropertyOptional({ description: 'Data de nascimento', example: '1990-01-01' })
  @IsDateString()
  @IsOptional()
  birth_date?: string;
}