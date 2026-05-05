import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  setCurrentUser: (user: User | null) => void;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'date' | 'status'>) => void;
  updateComplaint: (id: string, updates: Partial<Complaint>) => void;
  deleteComplaint: (id: string) => void;
  getUserComplaints: () => Complaint[];
  getSupervisorComplaints: () => Complaint[];
  getTechnicianTasks: () => Complaint[];
  getUserNotifications: () => Notification[];
  markNotificationAsRead: (id: string) => void;
}

const ComplaintsContext = createContext<ComplaintsContextType | undefined>(undefined);

// Initial mock data with demo user
const initialComplaints: Complaint[] = [
  {
    id: 'CN#147',
    category: 'Internet',
    urgency: 'High',
    status: 'Pending',
    date: '2026-05-01',
    description: 'No internet connection in room for 2 days. Unable to attend online classes and submit assignments.',
    roomNumber: '203-A',
    hostel: 'Hostel 1',
    studentName: 'Ahmed Raza',
    studentEmail: 'ahmed.raza@giki.edu.pk',
  },
  {
    id: 'CN#145',
    category: 'Plumbing',
    urgency: 'Medium',
    status: 'In Progress',
    date: '2026-04-29',
    description: 'Leaking faucet in bathroom causing water wastage',
    roomNumber: '203-A',
    hostel: 'Hostel 1',
    studentName: 'Ahmed Raza',
    studentEmail: 'ahmed.raza@giki.edu.pk',
    technician: 'Kashif Ali',
    workId: 'WK2187',
    assignedOn: '2026-04-30',
    assignedBy: 'Supervisor Irfan',
  },
  {
    id: 'CN#143',
    category: 'Electrical',
    urgency: 'Medium',
    status: 'In Progress',
    date: '2026-04-27',
    description: 'Light flickering in study area making it difficult to study at night',
    roomNumber: '203-A',
    hostel: 'Hostel 1',
    studentName: 'Ahmed Raza',
    studentEmail: 'ahmed.raza@giki.edu.pk',
    technician: 'Bilal Ahmad',
    workId: 'WK2185',
    assignedOn: '2026-04-28',
    assignedBy: 'Supervisor Irfan',
  },
  {
    id: 'CN#140',
    category: 'AC/Fan',
    urgency: 'Low',
    status: 'Resolved',
    date: '2026-04-25',
    description: 'Ceiling fan making unusual noise and vibrating',
    roomNumber: '203-A',
    hostel: 'Hostel 1',
    studentName: 'Ahmed Raza',
    studentEmail: 'ahmed.raza@giki.edu.pk',
    technician: 'Usman Khan',
    workId: 'WK2180',
    assignedOn: '2026-04-26',
    assignedBy: 'Supervisor Irfan',
    resolvedOn: '2026-04-27',
    rating: 5,
  },
];

// Load complaints from localStorage or use initial data
const loadComplaints = (): Complaint[] => {
  try {
    const stored = localStorage.getItem('dormfixComplaints');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading complaints from localStorage:', error);
  }
  return initialComplaints;
};

// Load notifications from localStorage
const loadNotifications = (): Notification[] => {
  try {
    const stored = localStorage.getItem('dormfixNotifications');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading notifications from localStorage:', error);
  }
  return [];
};

export function ComplaintsProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(loadComplaints);
  const [notifications, setNotifications] = useState<Notification[]>(loadNotifications);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Save complaints to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('dormfixComplaints', JSON.stringify(complaints));
    } catch (error) {
      console.error('Error saving complaints to localStorage:', error);
    }
  }, [complaints]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('dormfixNotifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error);
    }
  }, [notifications]);

  // Helper function to create notifications
  const createNotification = (type: Notification['type'], message: string, userEmail: string, complaintId?: string) => {
    const newNotification: Notification = {
      id: `NOT#${Date.now()}${Math.floor(Math.random() * 1000)}`,
      type,
      message,
      time: 'Just now',
      date: new Date().toISOString(),
      read: false,
      userEmail,
      complaintId,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  // Clean up non-demo users from localStorage on mount
  useEffect(() => {
    const demoEmails = [
      'ahmed.raza@giki.edu.pk',
      'supervisor.irfan@giki.edu.pk',
      'supervisor.khalid@giki.edu.pk',
      'supervisor.rizwan@giki.edu.pk',
      'kashif.ali@giki.edu.pk',
      'bilal.ahmad@giki.edu.pk',
      'usman.khan@giki.edu.pk',
    ];

    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const cleanedUsers = registeredUsers.filter((user: any) => !demoEmails.includes(user.email));
      localStorage.setItem('registeredUsers', JSON.stringify(cleanedUsers));
    } catch (error) {
      console.error('Error cleaning up registered users:', error);
    }
  }, []);

  const addComplaint = (complaint: Omit<Complaint, 'id' | 'date' | 'status'>) => {
    const newComplaint: Complaint = {
      ...complaint,
      id: `CN#${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };
    setComplaints((prev) => [newComplaint, ...prev]);

    // Notify supervisor of new complaint
    if (complaint.hostel) {
      // Find supervisor email for this hostel
      const supervisorEmailMap: Record<string, string> = {
        'Hostel 1': 'supervisor.irfan@giki.edu.pk',
        'Hostel 2': 'supervisor.khalid@giki.edu.pk',
        'Hostel 3': 'supervisor.rizwan@giki.edu.pk',
        'Hostel 4': 'supervisor.hostel4@giki.edu.pk',
        'Hostel 5': 'supervisor.hostel5@giki.edu.pk',
      };

      const supervisorEmail = supervisorEmailMap[complaint.hostel];
      if (supervisorEmail) {
        createNotification(
          'review',
          `New complaint ${newComplaint.id} from ${complaint.studentName} in ${complaint.roomNumber}`,
          supervisorEmail,
          newComplaint.id
        );
      }
    }
  };

  const updateComplaint = (id: string, updates: Partial<Complaint>) => {
    const complaint = complaints.find((c) => c.id === id);
    if (!complaint) return;

    const updatedComplaint = { ...complaint, ...updates };

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id ? updatedComplaint : c
      )
    );

    // Create notifications based on status change
    if (updates.status) {
      // Notify student when complaint is assigned
      if (updates.status === 'Assigned' && updates.technician) {
        createNotification(
          'assigned',
          `Your complaint ${id} has been assigned to ${updates.technician}`,
          complaint.studentEmail,
          id
        );

        // Notify technician of new assignment
        const technicianEmailMap: Record<string, string> = {
          'Kashif Ali': 'kashif.ali@giki.edu.pk',
          'Bilal Ahmad': 'bilal.ahmad@giki.edu.pk',
          'Usman Khan': 'usman.khan@giki.edu.pk',
        };

        const technicianEmail = technicianEmailMap[updates.technician];
        if (technicianEmail) {
          createNotification(
            'assigned',
            `New task ${id} assigned to you - ${complaint.category} issue in ${complaint.roomNumber}`,
            technicianEmail,
            id
          );
        }
      }

      // Notify student when work is in progress
      if (updates.status === 'In Progress') {
        createNotification(
          'started',
          `Work has started on your complaint ${id}`,
          complaint.studentEmail,
          id
        );
      }

      // Notify student when complaint is resolved
      if (updates.status === 'Resolved') {
        createNotification(
          'resolved',
          `Your complaint ${id} has been resolved. Please rate the service.`,
          complaint.studentEmail,
          id
        );
      }
    }
  };

  const deleteComplaint = (id: string) => {
    setComplaints((prev) => prev.filter((complaint) => complaint.id !== id));
  };

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
      (c) => c.technician === currentUser.name && c.status !== 'Pending' && c.status !== 'Rejected'
    );
  };

  const getUserNotifications = () => {
    if (!currentUser) return [];
    return notifications.filter((n) => n.userEmail === currentUser.email);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <ComplaintsContext.Provider
      value={{
        complaints,
        notifications,
        currentUser,
        setCurrentUser,
        addComplaint,
        updateComplaint,
        deleteComplaint,
        getUserComplaints,
        getSupervisorComplaints,
        getTechnicianTasks,
        getUserNotifications,
        markNotificationAsRead,
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
