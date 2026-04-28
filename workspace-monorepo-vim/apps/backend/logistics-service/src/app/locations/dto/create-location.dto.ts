import { IsString, IsNotEmpty, IsOptional, IsUUID, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LocationType } from '@logistics/prisma'; // ou redefinir enum

export class CreateLocationDto {
  @ApiProperty({ description: 'Nome do local', example: 'Armazém Central' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Tipo de local', enum: LocationType })
  @IsEnum(LocationType)
  @IsNotEmpty()
  type: LocationType;

  @ApiPropertyOptional({ description: 'ID do endereço (opcional)' })
  @IsUUID()
  @IsOptional()
  address_id?: string;

  @ApiPropertyOptional({ description: 'ID da ordem de serviço (obrigatório se type = EVENT)' })
  @IsUUID()
  @IsOptional()
  order_id?: string;

  @ApiPropertyOptional({ description: 'Local ativo?', default: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}