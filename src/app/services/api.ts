/**
 * DormFix API Client
 * Replaces all localStorage-based data access with real HTTP calls to the backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ─── Token helpers ────────────────────────────────────────────────────────────
export function getToken(): string | null {
  return localStorage.getItem('dormfixToken');
}

export function setToken(token: string) {
  localStorage.setItem('dormfixToken', token);
}

export function removeToken() {
  localStorage.removeItem('dormfixToken');
}

// ─── Fetch wrapper ────────────────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || `Request failed: ${response.status}`);
  }

  return response.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'student' | 'supervisor' | 'technician';
  hostel?: string;
  roomNumber?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  message?: string;
}

export async function signUp(data: {
  email: string;
  password: string;
  name: string;
  role: string;
  hostel?: string;
  roomNumber?: string;
  registrationNumber?: string;
  department?: string;
}): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  setToken(res.token);
  return res;
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(res.token);
  return res;
}

export async function getMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/me');
}

export async function checkEmailAvailable(email: string): Promise<boolean> {
  const res = await apiFetch<{ available: boolean }>('/auth/check-email', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return res.available;
}

// ─── Complaints ───────────────────────────────────────────────────────────────
export interface Complaint {
  id: string;
  category: string;
  urgency: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected';
  date: string;
  description: string;
  roomNumber: string;
  hostel: string;
  studentName: string;
  studentEmail: string;
  photo?: string;
  technician?: string;
  workId?: string;
  assignedOn?: string;
  assignedBy?: string;
  resolvedOn?: string;
  rating?: number;
  feedback?: string;
}

export async function getComplaints(): Promise<Complaint[]> {
  return apiFetch<Complaint[]>('/complaints');
}

export async function getComplaint(id: string): Promise<Complaint> {
  return apiFetch<Complaint>(`/complaints/${id}`);
}

export async function createComplaint(data: {
  category: string;
  urgency: string;
  description: string;
  roomNumber: string;
  hostel: string;
  photo?: string;
}): Promise<Complaint> {
  return apiFetch<Complaint>('/complaints', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateComplaint(
  id: string,
  updates: Partial<Complaint>
): Promise<Complaint> {
  return apiFetch<Complaint>(`/complaints/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function deleteComplaint(id: string): Promise<void> {
  return apiFetch<void>(`/complaints/${id}`, { method: 'DELETE' });
}

// ─── Notifications ────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  type: 'assigned' | 'started' | 'resolved' | 'review' | 'new';
  message: string;
  time: string;
  date: string;
  read: boolean;
  userEmail: string;
  complaintId?: string;
}

export async function getNotifications(): Promise<Notification[]> {
  return apiFetch<Notification[]>('/notifications');
}

export async function markNotificationRead(id: string): Promise<void> {
  return apiFetch<void>(`/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsRead(): Promise<void> {
  return apiFetch<void>('/notifications/read-all', { method: 'PATCH' });
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function getTechnicians(): Promise<{ id: number; email: string; name: string }[]> {
  return apiFetch('/users/technicians');
}
