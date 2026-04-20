import { IsUUID, IsString, IsNotEmpty, IsOptional, IsBoolean, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiPropertyOptional({ description: 'ID da organização (se endereço de organização)' })
  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @ApiPropertyOptional({ description: 'ID da pessoa (se endereço de pessoa)' })
  @IsUUID()
  @IsOptional()
  person_id?: string;

  @ApiProperty({ description: 'Logradouro', example: 'Av. Paulista' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiPropertyOptional({ description: 'Número', example: '1000' })
  @IsString()
  @IsOptional()
  number?: string;

  @ApiPropertyOptional({ description: 'Complemento', example: 'Sala 101' })
  @IsString()
  @IsOptional()
  complement?: string;

  @ApiPropertyOptional({ description: 'Bairro', example: 'Bela Vista' })
  @IsString()
  @IsOptional()
  neighborhood?: string;

  @ApiProperty({ description: 'CEP', example: '01310-100' })
  @IsString()
  @IsNotEmpty()
  zip_code: string;

  @ApiProperty({ description: 'Cidade', example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Estado', example: 'SP' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiPropertyOptional({ description: 'País', example: 'Brasil', default: 'Brasil' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Indica se é o endereço principal', default: false })
  @IsBoolean()
  @IsOptional()
  is_primary?: boolean;

  @ValidateIf(o => !o.organization_id && !o.person_id)
  @IsNotEmpty({ message: 'É necessário informar organization_id ou person_id' })
  private readonly atLeastOne?: never;
}