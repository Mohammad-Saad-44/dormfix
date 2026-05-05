import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  ClipboardList,
  CheckCircle2,
  PlayCircle,
  Eye,
  Clock,
  LogOut,
  Home,
  Bell,
  User as UserIcon,
  Settings,
  Search,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { ComplaintDetailView } from './ComplaintDetailView';
import { FAQView } from './FAQView';
import { ViewAllComplaints } from './ViewAllComplaints';
import { NotificationDropdown } from './NotificationDropdown';
import { NotificationsView } from './NotificationsView';
import { ProfileDropdown } from './ProfileDropdown';
import { SettingsDropdown } from './SettingsDropdown';
import { toast } from 'sonner';
import { useComplaints, Complaint } from '../contexts/ComplaintsContext';

interface TechnicianDashboardProps {
  onSignOut: () => void;
}

export function TechnicianDashboard({ onSignOut }: TechnicianDashboardProps) {
  const { getTechnicianTasks, updateComplaint, currentUser } = useComplaints();
  const technicianTasks = getTechnicianTasks();

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showViewAll, setShowViewAll] = useState(false);
  const [returnToViewAll, setReturnToViewAll] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);

  const stats = {
    total: technicianTasks.length,
    assigned: technicianTasks.filter((t) => t.status === 'Assigned').length,
    inProgress: technicianTasks.filter((t) => t.status === 'In Progress').length,
    completed: technicianTasks.filter((t) => t.status === 'Resolved').length,
  };

  const displayTasks = technicianTasks;

  // Format date to readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'High':
        return 'bg-red-600 text-white border-transparent font-bold px-3 py-1.5';
      case 'Medium':
        return 'bg-orange-500 text-white border-transparent font-semibold px-2.5 py-1';
      case 'Low':
        return 'bg-green-600 text-white border-transparent px-2 py-0.5';
      default:
        return 'bg-slate-500 text-white border-transparent';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Assigned':
        return 'bg-blue-500 text-white border-transparent font-semibold';
      case 'In Progress':
        return 'bg-blue-500 text-white border-transparent font-semibold shadow-sm';
      case 'Resolved':
        return 'bg-emerald-500 text-white border-transparent font-semibold shadow-sm';
      default:
        return 'bg-slate-500 text-white border-transparent';
    }
  };

  const handleViewDetails = (task: Complaint) => {
    setSelectedComplaint(task);
    setShowDetailView(true);
    setReturnToViewAll(false);
  };

  const handleViewDetailsFromViewAll = (task: Complaint) => {
    setSelectedComplaint(task);
    setShowDetailView(true);
    setReturnToViewAll(true);
  };

  const handleResolveClick = (task: Complaint) => {
    setSelectedComplaint(task);
    setShowResolveDialog(true);
  };

  const handleResolveComplaint = () => {
    if (!selectedComplaint) return;
    updateComplaint(selectedComplaint.id, {
      status: 'Resolved',
      resolvedOn: new Date().toISOString().split('T')[0],
    });
    toast.success(`Complaint ${selectedComplaint.id} marked as resolved`);
    setShowResolveDialog(false);
    setSelectedComplaint(null);
  };

  if (showFAQ) {
    return (
      <FAQView
        userRole="technician"
        onBack={() => setShowFAQ(false)}
      />
    );
  }

  if (showNotifications) {
    return (
      <NotificationsView
        onBack={() => setShowNotifications(false)}
      />
    );
  }

  if (showDetailView && selectedComplaint) {
    return (
      <ComplaintDetailView
        complaintId={selectedComplaint.id}
        userRole="technician"
        onBack={() => {
          setShowDetailView(false);
          setSelectedComplaint(null);
          if (returnToViewAll) {
            setShowViewAll(true);
            setReturnToViewAll(false);
          }
        }}
      />
    );
  }

  if (showViewAll) {
    return (
      <ViewAllComplaints
        complaints={technicianTasks}
        onBack={() => setShowViewAll(false)}
        onViewDetails={handleViewDetailsFromViewAll}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="glass-header sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">DormFix</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Technician Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-3">
              <NotificationDropdown userRole="technician" onViewAll={() => setShowNotifications(true)} />
              <Button variant="ghost" size="icon" onClick={() => setShowFAQ(true)} title="FAQ">
                <HelpCircle className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Button>
              <SettingsDropdown />
              <ProfileDropdown
                onSignOut={onSignOut}
                userName={currentUser?.name}
                userEmail={currentUser?.email}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Page Title */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">My Complaints</h2>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="glass-stat border-blue-300 dark:border-blue-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Total Complaints
                </CardTitle>
                <div className="w-10 h-10 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="glass-stat border-blue-300 dark:border-blue-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Assigned
                </CardTitle>
                <div className="w-10 h-10 bg-blue-700 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{stats.assigned}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">To start</p>
            </CardContent>
          </Card>

          <Card className="glass-stat border-purple-300 dark:border-purple-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                In Progress
                </CardTitle>
                <div className="w-10 h-10 bg-purple-600 dark:bg-purple-700 rounded-lg flex items-center justify-center">
                  <PlayCircle className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">{stats.inProgress}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Working on</p>
            </CardContent>
          </Card>

          <Card className="glass-stat border-green-300 dark:border-green-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Resolved
                </CardTitle>
                <div className="w-10 h-10 bg-green-600 dark:bg-green-700 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-3xl font-bold text-green-700 dark:text-green-400">{stats.completed}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Finished</p>
            </CardContent>
          </Card>
        </div>

        {/* Complaints Table */}
        <Card className="glass-card shadow-md">
          <CardHeader className="glass-table-header py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">My Complaints</CardTitle>
              <Button
                variant="outline"
                onClick={() => setShowViewAll(true)}
                className="glass-button"
              >
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {displayTasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="glass-empty w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <ClipboardList className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Complaints Found</h3>
                <p className="text-gray-600 dark:text-gray-400">No tasks have been assigned yet.</p>
              </div>
            ) : (
              <>
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-mono font-semibold text-blue-700 dark:text-blue-400">{task.id}</TableCell>
                        <TableCell className="font-medium">{task.category}</TableCell>
                        <TableCell>{task.roomNumber}</TableCell>
                        <TableCell>{task.studentName}</TableCell>
                        <TableCell>
                          <Badge className={getUrgencyBadge(task.urgency)}>
                            {task.urgency}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(task.status)}>
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(task.date)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleViewDetails(task)}
                              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {task.status === 'In Progress' && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleResolveClick(task)}
                                className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Resolve
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="lg:hidden p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="glass-card backdrop-blur border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-mono text-sm font-semibold text-blue-700 dark:text-blue-400">{task.id}</p>
                          <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{task.category}</p>
                        </div>
                        <Badge className={getStatusBadge(task.status)}>
                          {task.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{task.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Room</p>
                          <p className="text-gray-900 dark:text-gray-100">{task.roomNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Student</p>
                          <p className="text-gray-900 dark:text-gray-100">{task.studentName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Urgency</p>
                          <Badge className={getUrgencyBadge(task.urgency)}>
                            {task.urgency}
                          </Badge>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleViewDetails(task)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white shadow-sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {task.status === 'In Progress' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleResolveClick(task)}
                            className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white shadow-sm"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resolve Complaint Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent className="glass-dialog">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Mark as Resolved</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Confirm that task {selectedComplaint?.id} has been successfully resolved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowResolveDialog(false);
                setSelectedComplaint(null);
              }}
              className="glass-button"
            >
              Cancel
            </Button>
            <Button onClick={handleResolveComplaint} className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
