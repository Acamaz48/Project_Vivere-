import { IsString, IsNotEmpty, IsOptional, IsJSON } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: 'Código único do perfil', example: 'ADMIN' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ description: 'Descrição do perfil' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Permissões em formato JSON',
    example: ['order:read', 'inventory:write'],
  })
  @IsJSON()
  @IsOptional()
  permissions?: any; // Aceita JSON string; na prática será convertido pelo Prisma
}