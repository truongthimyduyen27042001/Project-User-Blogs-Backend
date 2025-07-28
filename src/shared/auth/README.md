# Authentication & Authorization System

## Overview

Hệ thống authentication và authorization với JWT tokens và role-based access control.

## Components

### 1. JwtAuthGuard
- **Mục đích**: Kiểm tra JWT token hợp lệ
- **Sử dụng**: `@UseGuards(JwtAuthGuard)`
- **Kết quả**: Nếu token hợp lệ → `req.user` chứa thông tin user

### 2. AdminGuard
- **Mục đích**: Chỉ cho phép ADMIN truy cập
- **Sử dụng**: `@UseGuards(JwtAuthGuard, AdminGuard)`
- **Kết quả**: Chỉ ADMIN mới truy cập được

### 3. RolesGuard + @Roles decorator
- **Mục đích**: Kiểm tra role linh hoạt
- **Sử dụng**: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(UserRole.ADMIN, UserRole.USER)`
- **Kết quả**: Cho phép nhiều role truy cập

## Cách sử dụng

### 1. Chỉ cần authentication (không cần role cụ thể)
```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Request() req) {
  return req.user;
}
```

### 2. Chỉ cho ADMIN truy cập (cách 1 - AdminGuard)
```typescript
@UseGuards(JwtAuthGuard, AdminGuard)
@Get('admin/dashboard')
adminDashboard() {
  return { message: 'Admin only' };
}
```

### 3. Chỉ cho ADMIN truy cập (cách 2 - RolesGuard)
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Get('admin/users')
getAllUsers() {
  return { message: 'Admin only' };
}
```

### 4. Cho nhiều role truy cập
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.USER)
@Get('profile/advanced')
advancedProfile(@Request() req) {
  return { message: 'ADMIN or USER can access' };
}
```

### 5. Cho USER thường truy cập
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER)
@Get('user/settings')
userSettings(@Request() req) {
  return { message: 'USER only' };
}
```

## Error Messages

### Khi không có token hoặc token không hợp lệ:
```
401 Unauthorized
```

### Khi không có quyền truy cập:
```
403 Forbidden - Access denied. Admin role required.
403 Forbidden - Access denied. Required roles: ADMIN. Your role: USER
```

## Demo Endpoints

### Public (không cần auth):
- `POST /users/register` - Đăng ký
- `POST /users/login` - Đăng nhập

### Protected (cần auth):
- `GET /users` - Lấy danh sách users
- `GET /users/profile` - Thông tin user hiện tại
- `GET /users/:id` - Thông tin user theo ID
- `PATCH /users/:id` - Cập nhật user
- `DELETE /users/:id` - Xóa user

### Role-based endpoints:
- `GET /users/admin/dashboard` - Chỉ ADMIN (AdminGuard)
- `GET /users/profile/advanced` - ADMIN hoặc USER (RolesGuard)
- `GET /users/admin/users` - Chỉ ADMIN (RolesGuard)
- `GET /users/user/settings` - Chỉ USER (RolesGuard)

## Test Cases

### 1. Register ADMIN user:
```bash
POST /users/register
{
  "email": "admin@example.com",
  "password": "password123",
  "firstName": "Admin",
  "lastName": "User",
  "role": "ADMIN"
}
```

### 2. Register USER:
```bash
POST /users/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Normal",
  "lastName": "User",
  "role": "USER"
}
```

### 3. Login và test các endpoint:
```bash
# Login
POST /users/login
{
  "email": "admin@example.com",
  "password": "password123"
}

# Test admin endpoint
GET /users/admin/dashboard
Authorization: Bearer <access_token>
``` 