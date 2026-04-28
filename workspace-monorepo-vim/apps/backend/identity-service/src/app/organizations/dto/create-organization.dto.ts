import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({ description: 'Razão social da organização', example: 'Empresa XYZ Ltda' })
  @IsString()
  @IsNotEmpty()
  legal_name: string;

  @ApiPropertyOptional({ description: 'Nome fantasia', example: 'XYZ' })
  @IsString()
  @IsOptional()
  trade_name?: string;

  @ApiProperty({ description: 'CNPJ (apenas números)', example: '12345678000199' })
  @IsString()
  @IsNotEmpty()
  tax_id: string;
}