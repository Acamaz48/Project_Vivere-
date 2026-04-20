import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, IsNumber, Min, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Unit } from '@warehouse/prisma';
import { Type } from 'class-transformer';

export class CreateItemDto {
  @ApiProperty({ description: 'SKU único do item', example: 'TRELI-5M' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ description: 'Nome do item', example: 'Treliça 5m' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Unidade de medida', enum: Unit })
  @IsEnum(Unit)
  unit: Unit;

  @ApiPropertyOptional({ description: 'Largura em mm', example: 100 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  width_mm?: number;

  @ApiPropertyOptional({ description: 'Altura em mm', example: 100 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  height_mm?: number;

  @ApiPropertyOptional({ description: 'Comprimento em mm', example: 5000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  length_mm?: number;

  @ApiPropertyOptional({ description: 'Peso em kg', example: 15.5 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  weight_kg?: number;

  @ApiPropertyOptional({ description: 'ID da categoria' })
  @IsUUID()
  @IsOptional()
  category_id?: string;

  @ApiPropertyOptional({ description: 'Item ativo?', default: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}