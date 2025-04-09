import { Task, User, AuthResponse, UserResponse, UsersResponse, AIResponse } from './types';
import dotenv from 'dotenv';
dotenv.config();
const API_URL = process.env.NEXT_PUBLIC_LIVE_SERVER_API

console.log(API_URL)

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

export async function register(username: string, email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
    },
    credentials: 'include',
    body: JSON.stringify({email, password }),
  });
  
  if (!response.ok) {
    throw new Error('Registration failed');
  }
  
  return response.json();
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
}

export async function getCurrentUser(token: string): Promise<UserResponse> {
  const response = await fetch(`${API_URL}/api/users/user`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to get current user');
  }

  return response.json();
}

export async function getUsers(token: string): Promise<UsersResponse> {
  const response = await fetch(`${API_URL}/api/users/all`, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to get users');
  }

  return response.json();
}
