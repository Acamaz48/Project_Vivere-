import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, IsLatitude, IsLongitude } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
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

  @ApiPropertyOptional({ description: 'Latitude', example: -23.5505 })
  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude', example: -46.6333 })
  @IsLongitude()
  @IsOptional()
  longitude?: number;
}