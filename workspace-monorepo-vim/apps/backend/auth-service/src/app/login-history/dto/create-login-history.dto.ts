import { IsUUID, IsString, IsNotEmpty, IsOptional, IsEnum, IsIP } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum LoginStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  MFA_CHALLENGE = 'MFA_CHALLENGE',
}

export class CreateLoginHistoryDto {
  @ApiProperty({ description: 'ID do usuário' })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @ApiPropertyOptional({ description: 'Endereço IP' })
  @IsIP()
  @IsOptional()
  ip_address?: string;

  @ApiProperty({ description: 'Status da tentativa', enum: LoginStatus })
  @IsEnum(LoginStatus)
  @IsNotEmpty()
  status: LoginStatus;

  @ApiPropertyOptional({ description: 'Motivo da falha' })
  @IsString()
  @IsOptional()
  failure_reason?: string;
}