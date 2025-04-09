import { Task, User, AuthResponse, UserResponse, UsersResponse, AIResponse } from './types';

const API_URL = 'http://localhost:5000';

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

export async function getSuggestions(prompt: string, token: string): Promise<AIResponse> {
  const response = await fetch(`${API_URL}/api/tasks/suggest`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('Failed to get suggestions');
  }

  return response.json();
}

export async function getBreakdown(prompt: string, token: string): Promise<AIResponse> {
  const response = await fetch(`${API_URL}/api/tasks/breakdown`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('Failed to get breakdown');
  }

  return response.json();
}

export async function prioritizeTasks(tasks: Task[], token: string): Promise<AIResponse> {
  const response = await fetch(`${API_URL}/api/tasks/priotize`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ Tasks: tasks }),
  });

  if (!response.ok) {
    throw new Error('Failed to prioritize tasks');
  }

  return response.json();
}