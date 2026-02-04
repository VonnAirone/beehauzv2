// Authentication types
export interface User {
  id: string;
  name: string;
  email: string;
  userType: 'owner' | 'tenant' | 'admin';
  profileImage?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  userType: 'owner' | 'tenant' | 'admin';
}

export interface AuthResponse {
  user: User;
  token: string;
}