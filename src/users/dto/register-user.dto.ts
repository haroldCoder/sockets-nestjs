import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ example: 'alice', description: 'Username' })
  username: string;

  @ApiProperty({ example: 'secret', description: 'Password' })
  password: string;

  @ApiProperty({ example: '123', description: 'External id' })
  id: string;

  @ApiProperty({ example: '127.0.0.1', description: 'Client IP' })
  ip: string;
}