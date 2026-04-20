import { IsUUID, IsNumber, Min, IsBoolean, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBomDto {
  @ApiProperty({ description: 'ID do item pai (produto composto)' })
  @IsUUID()
  parent_item_id: string;

  @ApiProperty({ description: 'ID do item filho (componente)' })
  @IsUUID()
  child_item_id: string;

  @ApiProperty({ description: 'Quantidade necessária', example: 4 })
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @ApiPropertyOptional({ description: 'Componente opcional?', default: false })
  @IsBoolean()
  @IsOptional()
  is_optional?: boolean;

  @ApiPropertyOptional({ description: 'Versão da BOM', default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  version_id?: number;
}