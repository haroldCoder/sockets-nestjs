import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: 'alice', description: 'Username' })
  username: string;

  @ApiProperty({ example: 'secret', description: 'Password' })
  password: string;
}


