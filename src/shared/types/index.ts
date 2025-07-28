export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum TourStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateTourDto {
  title: string;
  description?: string;
  price: number;
  duration: number;
  maxCapacity: number;
  imageUrl?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateTourDto {
  title?: string;
  description?: string;
  price?: number;
  duration?: number;
  maxCapacity?: number;
  status?: TourStatus;
  imageUrl?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateMessageDto {
  content: string;
  receiverId?: string;
  tourId?: string;
} 

export interface TokenData {
  userId: string;
  email: string;
  role: UserRole;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface RefreshTokenDto {
  refresh_token: string;
}

export interface RefreshTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  type: 'refresh';
}