import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, LoginDto, UserRole } from '../../shared/types';
import { JwtAuthGuard } from '../../shared/auth/jwt-auth.guard';
import { Roles } from '../../shared/auth/roles.decorator';
import { RolesGuard } from '../../shared/auth/roles.guard';
import { AdminGuard } from '../../shared/auth/admin.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: Partial<CreateUserDto>) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // Demo: Endpoint chỉ cho ADMIN truy cập (sử dụng AdminGuard)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/dashboard')
  adminDashboard() {
    return {
      message: 'Admin dashboard - Only ADMIN can access this',
      data: {
        totalUsers: 100,
        activeUsers: 85,
        revenue: 50000
      }
    };
  }

  // Demo: Endpoint cho ADMIN hoặc USER (sử dụng RolesGuard)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Get('profile/advanced')
  advancedProfile(@Request() req) {
    return {
      message: 'Advanced profile - ADMIN or USER can access this',
      user: req.user,
      advancedData: {
        lastLogin: new Date(),
        preferences: {
          theme: 'dark',
          notifications: true
        }
      }
    };
  }

  // Demo: Endpoint chỉ cho ADMIN (sử dụng RolesGuard)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/users')
  getAllUsersForAdmin() {
    return {
      message: 'All users list - Only ADMIN can access this',
      users: [
        { id: '1', email: 'admin@example.com', role: 'ADMIN' },
        { id: '2', email: 'user@example.com', role: 'USER' }
      ]
    };
  }

  // Demo: Endpoint cho USER thường (sử dụng RolesGuard)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @Get('user/settings')
  userSettings(@Request() req) {
    return {
      message: 'User settings - Only USER can access this',
      user: req.user,
      settings: {
        emailNotifications: true,
        smsNotifications: false,
        privacyLevel: 'public'
      }
    };
  }
} 