/**
 * ComplaintsContext — API-backed version
 *
 * Drop this file into:  src/app/contexts/ComplaintsContext.tsx
 *
 * This replaces the localStorage version with real HTTP calls.
 * The exported interface is 100% identical to the original so
 * NO changes are needed in any dashboard or component.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import * as api from '../services/api';

// ─── Re-export types so existing imports keep working ─────────────────────────
export type { Complaint, Notification } from '../services/api';

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

interface User {
  id?: number;
  email: string;
  name: string;
  role: 'student' | 'supervisor' | 'technician';
  hostel?: string;
  roomNumber?: string;
}

interface ComplaintsContextType {
  complaints: Complaint[];
  notifications: Notification[];
  currentUser: User | null;
  loading: boolean;
  setCurrentUser: (user: User | null) => void;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'date' | 'status'>) => Promise<void>;
  updateComplaint: (id: string, updates: Partial<Complaint>) => Promise<void>;
  deleteComplaint: (id: string) => Promise<void>;
  getUserComplaints: () => Complaint[];
  getSupervisorComplaints: () => Complaint[];
  getTechnicianTasks: () => Complaint[];
  getUserNotifications: () => Notification[];
  markNotificationAsRead: (id: string) => void;
  refreshComplaints: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const ComplaintsContext = createContext<ComplaintsContextType | undefined>(undefined);

export function ComplaintsProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // ── Fetch data when user logs in ─────────────────────────────────────────
  const refreshComplaints = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await api.getComplaints();
      setComplaints(data as unknown as Complaint[]);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    }
  }, [currentUser]);

  const refreshNotifications = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await api.getNotifications();
      setNotifications(
        data.map((n) => ({
          ...n,
          read: n.read,
        })) as unknown as Notification[]
      );
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      refreshComplaints();
      refreshNotifications();
    } else {
      setComplaints([]);
      setNotifications([]);
    }
  }, [currentUser, refreshComplaints, refreshNotifications]);

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const addComplaint = async (complaint: Omit<Complaint, 'id' | 'date' | 'status'>) => {
    setLoading(true);
    try {
      await api.createComplaint({
        category: complaint.category,
        urgency: complaint.urgency,
        description: complaint.description,
        roomNumber: complaint.roomNumber,
        hostel: complaint.hostel,
        photo: complaint.photo,
      });
      await refreshComplaints();
    } finally {
      setLoading(false);
    }
  };

  const updateComplaint = async (id: string, updates: Partial<Complaint>) => {
    setLoading(true);
    try {
      await api.updateComplaint(id, updates as any);
      await refreshComplaints();
      await refreshNotifications();
    } finally {
      setLoading(false);
    }
  };

  const deleteComplaint = async (id: string) => {
    setLoading(true);
    try {
      await api.deleteComplaint(id);
      setComplaints((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setLoading(false);
    }
  };

  // ── Selectors (same API as before) ───────────────────────────────────────
  const getUserComplaints = () => {
    if (!currentUser) return [];
    if (currentUser.role === 'student') {
      return complaints.filter((c) => c.studentEmail === currentUser.email);
    }
    return complaints;
  };

  const getSupervisorComplaints = () => {
    if (!currentUser || currentUser.role !== 'supervisor') return [];
    return complaints.filter((c) => c.hostel === currentUser.hostel);
  };

  const getTechnicianTasks = () => {
    if (!currentUser || currentUser.role !== 'technician') return [];
    return complaints.filter(
      (c) =>
        c.technician === currentUser.name &&
        c.status !== 'Pending' &&
        c.status !== 'Rejected'
    );
  };

  const getUserNotifications = () => {
    if (!currentUser) return [];
    return notifications.filter((n) => n.userEmail === currentUser.email);
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await api.markNotificationRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  return (
    <ComplaintsContext.Provider
      value={{
        complaints,
        notifications,
        currentUser,
        loading,
        setCurrentUser,
        addComplaint,
        updateComplaint,
        deleteComplaint,
        getUserComplaints,
        getSupervisorComplaints,
        getTechnicianTasks,
        getUserNotifications,
        markNotificationAsRead,
        refreshComplaints,
        refreshNotifications,
      }}
    >
      {children}
    </ComplaintsContext.Provider>
  );
}

export function useComplaints() {
  const context = useContext(ComplaintsContext);
  if (context === undefined) {
    throw new Error('useComplaints must be used within a ComplaintsProvider');
  }
  return context;
}
