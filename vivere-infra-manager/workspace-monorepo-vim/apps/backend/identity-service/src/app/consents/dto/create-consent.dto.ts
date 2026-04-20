import { IsUUID, IsString, IsNotEmpty, IsBoolean, IsOptional, IsIP, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConsentDto {
  @ApiProperty({ description: 'ID da pessoa' })
  @IsUUID()
  @IsNotEmpty()
  person_id: string;

  @ApiProperty({ description: 'Finalidade do consentimento', example: 'MARKETING' })
  @IsString()
  @IsNotEmpty()
  purpose: string;

  @ApiProperty({ description: 'Consentimento concedido?', default: false })
  @IsBoolean()
  @IsOptional()
  is_granted?: boolean;

  @ApiPropertyOptional({ description: 'Endereço IP de origem' })
  @IsIP()
  @IsOptional()
  ip_address?: string;

  @ApiPropertyOptional({ description: 'User agent do navegador' })
  @IsString()
  @IsOptional()
  user_agent?: string;

  @ApiPropertyOptional({ description: 'Data de validade do consentimento' })
  @IsDateString()
  @IsOptional()
  valid_until?: string;
}