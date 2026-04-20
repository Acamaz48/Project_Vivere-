import { IsUUID, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserRoleDto {
  @ApiProperty({ description: 'ID do usuário' })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({ description: 'Código do perfil' })
  @IsString()
  @IsNotEmpty()
  role_code: string;

  @ApiPropertyOptional({ description: 'UUID de quem atribuiu o perfil' })
  @IsUUID()
  @IsOptional()
  assigned_by?: string;
}