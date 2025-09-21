import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserLoginService } from './app/user-login.service';
import { LoginUserDto } from './dto/login-user.dto';
import { ResponseClient } from 'src/shared/dto/responseClient';
import { UserRegisterService } from './app/user-register.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserLogoutService } from './app/user-logout.service';
import { LogoutUserDto } from './dto/logout-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly userLoginService: UserLoginService, 
    private readonly userRegisterService: UserRegisterService,
    private readonly userLogoutService: UserLogoutService
  ) { }

  @Post('login')
  @ApiOperation({ summary: 'Login  user' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 201, description: 'User logged in', type: Boolean })
  @ApiResponse({ status: 404, description: 'User not found' })
  async login(@Body() body: LoginUserDto): Promise<ResponseClient> {
    return this.userLoginService.execute(body);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register user' })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({ status: 201, description: 'User registered', type: Boolean })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async register(@Body() body: RegisterUserDto): Promise<ResponseClient> {
    return this.userRegisterService.execute(body);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiBody({ type: LogoutUserDto })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async logout(@Body() body: LogoutUserDto): Promise<ResponseClient> {
    return this.userLogoutService.execute(body.username);
  }
}


