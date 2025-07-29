import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';
import { AuthService } from '../../shared/auth/auth.service';
import { CreateUserDto, LoginDto, UserRole } from '../../shared/types';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: DatabaseService,
    private authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      this.logger.error('User with this email already exists');
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.authService.hashPassword(createUserDto.password);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
        role: createUserDto.role || UserRole.USER,
      },
    });

    const { password, ...userWithoutPassword } = user;
    this.logger.log(`User created successfully: ${userWithoutPassword.email}`);
    return userWithoutPassword;
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await this.authService.comparePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.error('Invalid credentials');
      throw new NotFoundException('Invalid credentials');
    }

    const tokens = await this.authService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role as any,
    });

    const { password, ...userWithoutPassword } = user;
    this.logger.log(`User logged in successfully: ${userWithoutPassword.email}`);
    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    this.logger.log(`Found ${users.length} users`);
    return users;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      this.logger.error(`User not found: ${id}`);
      throw new NotFoundException('User not found');
    }

    this.logger.log(`User found: ${user.email}`);
    return user;
  }

  async update(id: string, updateUserDto: Partial<CreateUserDto>) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      this.logger.error(`User not found: ${id}`);
      throw new NotFoundException('User not found');
    }

    const updateData: any = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await this.authService.hashPassword(updateUserDto.password);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`User updated successfully: ${user.email}`);
    return user;
  }

  async remove(id: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      this.logger.error(`User not found: ${id}`);
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    this.logger.log(`User deleted successfully: ${id}`);
    return { message: 'User deleted successfully' };
  }
} 