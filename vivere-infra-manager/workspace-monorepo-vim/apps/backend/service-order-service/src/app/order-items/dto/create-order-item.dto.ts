import { 
  IsUUID, 
  IsNumber, 
  Min, 
  IsDateString, 
  IsString, 
  IsOptional, 
  ValidateIf, 
  IsDecimal, 
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'ID da ordem de serviço' })
  @IsUUID()
  order_id: string;

  @ApiPropertyOptional({ description: 'ID do item próprio (warehouse)' })
  @IsUUID()
  @IsOptional()
  item_id?: string;

  @ApiPropertyOptional({ description: 'ID do fornecedor (se item de terceiro)' })
  @IsUUID()
  @IsOptional()
  supplier_id?: string;

  @ApiPropertyOptional({ description: 'Descrição do item de terceiro' })
  @IsString()
  @IsOptional()
  supplier_item_description?: string;

  @ApiPropertyOptional({ description: 'Referência do pedido ao fornecedor' })
  @IsString()
  @IsOptional()
  supplier_order_ref?: string;

  @ApiPropertyOptional({ description: 'Preço de custo (para cálculo de margem)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  cost_price?: number;

  @ApiProperty({ description: 'Quantidade', example: 2 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ description: 'Preço unitário por dia', example: 150.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  daily_unit_price: number;

  @ApiProperty({ description: 'Número de dias de locação', example: 3 })
  @IsNumber()
  @Min(1)
  number_of_days: number;

  @ApiPropertyOptional({ description: 'Desconto', example: 0, default: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  discount?: number;

  @ApiProperty({ description: 'Início do período (ISO)', example: '2025-06-01T08:00:00Z' })
  @IsDateString()
  period_start: string;

  @ApiProperty({ description: 'Fim do período (ISO)', example: '2025-06-05T18:00:00Z' })
  @IsDateString()
  period_end: string;

  @ApiPropertyOptional({ description: 'Observações do item' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'UUID do criador (opcional)' })
  @IsUUID()
  @IsOptional()
  created_by?: string;

  // Validação: deve ter item_id OU supplier_id, mas não ambos
  @ValidateIf(o => !o.item_id && !o.supplier_id)
  @IsNotEmpty({ message: 'É necessário informar item_id (próprio) ou supplier_id (terceiro)' })
  readonly atLeastOne?: never;

  @ValidateIf(o => o.item_id && o.supplier_id)
  @IsNotEmpty({ message: 'Não é permitido informar ambos item_id e supplier_id' })
  readonly notBoth?: never;
}