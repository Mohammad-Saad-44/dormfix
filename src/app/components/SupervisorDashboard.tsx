import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { CustomSelect } from './CustomSelect';
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
  Clock,
  CheckCircle2,
  PlayCircle,
  Search,
  Eye,
  AlertCircle,
  LogOut,
  Home,
  Bell,
  User as UserIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  HelpCircle,
  UserCog,
} from 'lucide-react';
import { ComplaintDetailView } from './ComplaintDetailView';
import { FAQView } from './FAQView';
import { ViewAllSupervisorComplaints } from './ViewAllSupervisorComplaints';
import { NotificationDropdown } from './NotificationDropdown';
import { NotificationsView } from './NotificationsView';
import { ProfileDropdown } from './ProfileDropdown';
import { SettingsDropdown } from './SettingsDropdown';
import { toast } from 'sonner';
import { useComplaints, Complaint } from '../contexts/ComplaintsContext';

interface SupervisorDashboardProps {
  onSignOut: () => void;
}

export function SupervisorDashboard({ onSignOut }: SupervisorDashboardProps) {
  const { getSupervisorComplaints, updateComplaint, currentUser } = useComplaints();
  const supervisorComplaints = getSupervisorComplaints();

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showViewAll, setShowViewAll] = useState(false);
  const [returnToViewAll, setReturnToViewAll] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState('');

  const stats = {
    total: supervisorComplaints.length,
    pending: supervisorComplaints.filter((c) => c.status === 'Pending').length,
    assigned: supervisorComplaints.filter((c) => c.status === 'Assigned').length,
    inProgress: supervisorComplaints.filter((c) => c.status === 'In Progress').length,
    resolved: supervisorComplaints.filter((c) => c.status === 'Resolved').length,
  };

  const displayComplaints = supervisorComplaints;

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

  const demoTechnicians = [
    { id: 'kashif.ali@giki.edu.pk', name: 'Kashif Ali' },
    { id: 'bilal.ahmad@giki.edu.pk', name: 'Bilal Ahmad' },
    { id: 'usman.khan@giki.edu.pk', name: 'Usman Khan' },
  ];

  const [availableTechnicians, setAvailableTechnicians] = useState(demoTechnicians);

  useEffect(() => {
    fetch('http://localhost:3001/api/users/technicians')
      .then((res) => res.json())
      .then((data) => {
        const fromDb = data.map((u: any) => ({ id: u.email, name: u.name }));
        const merged = [...demoTechnicians, ...fromDb].filter(
          (u, index, self) => index === self.findIndex((t) => t.id === u.id)
        );
        setAvailableTechnicians(merged);
      })
      .catch(() => {
        // If backend call fails, demo technicians remain available
      });
  }, []);

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
      case 'Pending':
        return 'bg-amber-500 text-white border-transparent font-semibold';
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

  const handleViewDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailView(true);
    setReturnToViewAll(false);
  };

  const handleViewDetailsFromViewAll = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailView(true);
    setReturnToViewAll(true);
  };

  const handleAssignClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowAssignDialog(true);
  };

  const handleAssignTechnician = () => {
    if (!selectedTechnician || !selectedComplaint) {
      toast.error('Please select a technician');
      return;
    }
    const workId = `WK${Math.floor(2000 + Math.random() * 1000)}`;
    updateComplaint(selectedComplaint.id, {
      status: 'Assigned',
      technician: selectedTechnician,
      workId,
      assignedOn: new Date().toISOString().split('T')[0],
      assignedBy: currentUser?.name || 'Supervisor',
    });
    toast.success(`Complaint ${selectedComplaint.id} assigned to ${selectedTechnician}`);
    setShowAssignDialog(false);
    setSelectedTechnician('');
    setSelectedComplaint(null);
  };

  if (showFAQ) {
    return (
      <FAQView
        userRole="supervisor"
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
        userRole="supervisor"
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
      <ViewAllSupervisorComplaints
        complaints={supervisorComplaints}
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
                <p className="text-xs text-gray-600 dark:text-gray-400">Supervisor Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-3">
              <NotificationDropdown userRole="supervisor" onViewAll={() => setShowNotifications(true)} />
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
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Complaint Management</h2>
            <Badge className="bg-blue-600 text-white border-transparent font-semibold px-3 py-1">
              {currentUser?.hostel || 'Loading...'}
            </Badge>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card className="glass-stat border-blue-300 dark:border-blue-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Total
              </CardTitle>
              <div className="w-10 h-10 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">All complaints</p>
            </CardContent>
          </Card>

          <Card className="glass-stat border-yellow-300 dark:border-yellow-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Pending
              </CardTitle>
              <div className="w-10 h-10 bg-yellow-600 dark:bg-yellow-700 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-500">{stats.pending}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Needs assignment</p>
            </CardContent>
          </Card>

          <Card className="glass-stat border-blue-300 dark:border-blue-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Assigned
              </CardTitle>
              <div className="w-10 h-10 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-500">{stats.assigned}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">To technicians</p>
            </CardContent>
          </Card>

          <Card className="glass-stat border-purple-300 dark:border-purple-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                In Progress
              </CardTitle>
              <div className="w-10 h-10 bg-purple-600 dark:bg-purple-700 rounded-lg flex items-center justify-center">
                <PlayCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-500">{stats.inProgress}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Being resolved</p>
            </CardContent>
          </Card>

          <Card className="glass-stat border-green-300 dark:border-green-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Resolved
              </CardTitle>
              <div className="w-10 h-10 bg-green-600 dark:bg-green-700 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-3xl font-bold text-green-700 dark:text-green-500">{stats.resolved}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Complaints Table */}
        <Card className="glass-card">
          <CardHeader className="glass-table-header py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-gray-100">All Complaints</CardTitle>
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
            {displayComplaints.length === 0 ? (
              <div className="text-center py-16">
                <div className="glass-empty w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
                  <ClipboardList className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Complaints Found</h3>
                <p className="text-gray-600 dark:text-gray-400">No complaints have been submitted yet.</p>
              </div>
            ) : (
              <>
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayComplaints.map((complaint) => (
                      <TableRow key={complaint.id}>
                        <TableCell className="font-mono font-semibold text-blue-700 dark:text-blue-400">{complaint.id}</TableCell>
                        <TableCell className="font-medium">{complaint.studentName}</TableCell>
                        <TableCell>{complaint.roomNumber}</TableCell>
                        <TableCell>{complaint.category}</TableCell>
                        <TableCell>
                          <Badge className={getUrgencyBadge(complaint.urgency)}>
                            {complaint.urgency}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(complaint.status)}>
                            {complaint.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(complaint.date)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleViewDetails(complaint)}
                              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {complaint.status === 'Pending' && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleAssignClick(complaint)}
                                className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
                              >
                                <UserCog className="h-4 w-4 mr-1" />
                                Assign
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
                {displayComplaints.map((complaint) => (
                  <Card
                    key={complaint.id}
                    className="glass-card backdrop-blur border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-mono text-sm font-semibold text-blue-700 dark:text-blue-400">{complaint.id}</p>
                          <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{complaint.studentName}</p>
                        </div>
                        <Badge className={getStatusBadge(complaint.status)}>
                          {complaint.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Room</p>
                          <p className="text-gray-900 dark:text-gray-100">{complaint.roomNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                          <p className="text-gray-900 dark:text-gray-100">{complaint.category}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Urgency</p>
                          <Badge className={getUrgencyBadge(complaint.urgency)}>
                            {complaint.urgency}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                          <p className="text-gray-700 dark:text-gray-300">{formatDate(complaint.date)}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleViewDetails(complaint)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white shadow-sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {complaint.status === 'Pending' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAssignClick(complaint)}
                            className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white shadow-sm"
                          >
                            <UserCog className="h-4 w-4 mr-1" />
                            Assign
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

      {/* Assign Technician Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="glass-dialog">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Assign Technician</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Assign complaint {selectedComplaint?.id} to a technician
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100">Select Technician</Label>
              <CustomSelect
                value={selectedTechnician}
                onValueChange={setSelectedTechnician}
                options={availableTechnicians.map((tech) => ({
                  value: tech.name,
                  label: tech.name,
                }))}
                placeholder="Choose a technician"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAssignDialog(false);
                setSelectedTechnician('');
                setSelectedComplaint(null);
              }}
              className="glass-button"
            >
              Cancel
            </Button>
            <Button onClick={handleAssignTechnician} className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white">
              <UserCog className="h-4 w-4 mr-2" />
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
