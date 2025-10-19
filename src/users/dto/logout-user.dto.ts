import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LogoutUserDto {
  @ApiProperty({ description: 'Username of the user to logout' })
  @IsString()
  @IsNotEmpty()
  username: string;
}
