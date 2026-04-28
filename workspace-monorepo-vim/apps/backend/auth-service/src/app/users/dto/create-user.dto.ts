import { IsUUID, IsEmail, IsString, IsNotEmpty, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'ID da pessoa (referência ao identity service)' })
  @IsUUID()
  @IsNotEmpty()
  person_id: string;

  @ApiProperty({ description: 'E-mail do usuário', example: 'usuario@email.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Senha (mínimo 6 caracteres)', example: 'senha123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password_hash: string;

  @ApiPropertyOptional({ description: 'Usuário ativo?', default: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Requer MFA?', default: false })
  @IsBoolean()
  @IsOptional()
  requires_mfa?: boolean;
}