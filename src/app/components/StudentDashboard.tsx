import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
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
  Plus,
  Eye,
  AlertCircle,
  LogOut,
  Home,
  Bell,
  User as UserIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Upload,
  X,
  Edit,
  Trash2,
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

interface StudentDashboardProps {
  onSignOut: () => void;
}

export function StudentDashboard({ onSignOut }: StudentDashboardProps) {
  const { getUserComplaints, addComplaint, updateComplaint, deleteComplaint, currentUser } = useComplaints();
  const userComplaints = getUserComplaints();

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showEditConfirmDialog, setShowEditConfirmDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [deletingComplaint, setDeletingComplaint] = useState<Complaint | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showViewAll, setShowViewAll] = useState(false);
  const [returnToViewAll, setReturnToViewAll] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    urgency: '',
    roomNumber: currentUser?.roomNumber || '203-A',
    hostelNumber: currentUser?.hostel || 'Hostel 1',
    description: '',
    photo: null as File | null,
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const stats = {
    total: userComplaints.length,
    pending: userComplaints.filter((c) => c.status === 'Pending').length,
    inProgress: userComplaints.filter((c) => c.status === 'In Progress').length,
    resolved: userComplaints.filter((c) => c.status === 'Resolved').length,
  };

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

  const handleSubmit = () => {
    if (!currentUser) return;

    addComplaint({
      category: formData.category,
      urgency: formData.urgency as 'High' | 'Medium' | 'Low',
      description: formData.description,
      roomNumber: formData.roomNumber,
      hostel: formData.hostelNumber,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
    });

    setShowSubmitDialog(false);
    toast.success('Complaint Submitted!', {
      description: 'Your complaint has been submitted successfully and is pending review.',
    });
    setFormData({
      category: '',
      urgency: '',
      roomNumber: currentUser?.roomNumber || '203-A',
      hostelNumber: currentUser?.hostel || 'Hostel 1',
      description: '',
      photo: null,
    });
    setPhotoPreview(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData({ ...formData, photo: null });
    setPhotoPreview(null);
  };

  const handleEditClick = (complaint: Complaint) => {
    setEditingComplaint(complaint);
    setFormData({
      category: complaint.category,
      urgency: complaint.urgency,
      roomNumber: complaint.roomNumber,
      hostelNumber: complaint.hostel,
      description: complaint.description,
      photo: null,
    });
    setPhotoPreview(null);
    setShowEditDialog(true);
  };

  const handleEditSubmit = () => {
    if (!editingComplaint || !currentUser) return;
    // Show confirmation dialog
    setShowEditConfirmDialog(true);
  };

  const handleConfirmEdit = () => {
    if (!editingComplaint || !currentUser) return;

    updateComplaint(editingComplaint.id, {
      category: formData.category,
      urgency: formData.urgency as 'High' | 'Medium' | 'Low',
      description: formData.description,
      roomNumber: formData.roomNumber,
      hostel: formData.hostelNumber,
    });

    setShowEditConfirmDialog(false);
    setShowEditDialog(false);
    setEditingComplaint(null);
    toast.success('Complaint Updated!', {
      description: 'Your complaint has been updated successfully.',
    });
    setFormData({
      category: '',
      urgency: '',
      roomNumber: currentUser?.roomNumber || '203-A',
      hostelNumber: currentUser?.hostel || 'Hostel 1',
      description: '',
      photo: null,
    });
    setPhotoPreview(null);
  };

  const handleDeleteClick = (complaint: Complaint) => {
    setDeletingComplaint(complaint);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (!deletingComplaint) return;

    deleteComplaint(deletingComplaint.id);
    setShowDeleteDialog(false);
    setDeletingComplaint(null);
    toast.success('Complaint Deleted!', {
      description: 'Your complaint has been deleted successfully.',
    });
  };

  const displayComplaints = userComplaints;

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

  if (showFAQ) {
    return (
      <FAQView
        userRole="student"
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
        userRole="student"
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
        complaints={userComplaints}
        onBack={() => setShowViewAll(false)}
        onViewDetails={handleViewDetailsFromViewAll}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
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
                <p className="text-xs text-gray-600 dark:text-gray-400">Student Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-3">
              <NotificationDropdown userRole="student" onViewAll={() => setShowNotifications(true)} />
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">My Complaints</h2>
            {currentUser?.hostel && (
              <Badge className="bg-blue-600 text-white border-transparent font-semibold px-3 py-1">
                {currentUser.hostel}
              </Badge>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="glass-stat border-blue-300 dark:border-blue-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Total Complaints
              </CardTitle>
              <div className="w-10 h-10 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="glass-stat border-yellow-300 dark:border-yellow-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Pending
              </CardTitle>
              <div className="w-10 h-10 bg-yellow-600 dark:bg-yellow-700 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-500">{stats.pending}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Awaiting review</p>
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
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Being worked on</p>
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

        {/* My Complaints */}
        <Card className="glass-card">
          <CardHeader className="glass-table-header py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-gray-100">
                My Complaints
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowViewAll(true)}
                  className="glass-button"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
                <Button onClick={() => setShowSubmitDialog(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white shadow-sm">
                  <Plus className="h-4 w-4" />
                  Submit New Complaint
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {userComplaints.length === 0 ? (
              <div className="text-center py-16">
                <div className="glass-empty w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
                  <ClipboardList className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Complaints Yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't submitted any maintenance complaints.</p>
                <Button onClick={() => setShowSubmitDialog(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                  <Plus className="h-4 w-4" />
                  Submit Your First Complaint
                </Button>
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
                        <TableCell className="font-medium">{complaint.category}</TableCell>
                        <TableCell>{complaint.roomNumber}</TableCell>
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
                            {complaint.status === 'Pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditClick(complaint)}
                                  className="glass-button"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteClick(complaint)}
                                  className="dark:bg-red-700 dark:hover:bg-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleViewDetails(complaint)}
                              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
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
                          <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{complaint.category}</p>
                        </div>
                        <Badge className={getStatusBadge(complaint.status)}>
                          {complaint.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{complaint.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
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
                        {complaint.status === 'Pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(complaint)}
                              className="glass-button flex-1"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(complaint)}
                              className="dark:bg-red-700 dark:hover:bg-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleViewDetails(complaint)}
                          className={`bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white shadow-sm ${complaint.status === 'Pending' ? '' : 'w-full'}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              </>
            )}
        </CardContent>
      </Card>

      {/* Submit Complaint Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="glass-dialog max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Submit New Complaint</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Describe your maintenance issue and we'll assign it to a technician
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Room Number</label>
                <Input
                  value={formData.roomNumber}
                  disabled
                  className="glass-input mt-2 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Hostel</label>
                <Input
                  value={formData.hostelNumber}
                  disabled
                  className="glass-input mt-2 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Category</label>
                <CustomSelect
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  options={[
                    { value: 'Plumbing', label: 'Plumbing' },
                    { value: 'Electrical', label: 'Electrical' },
                    { value: 'Internet', label: 'Internet' },
                    { value: 'AC/Fan', label: 'AC/Fan' },
                    { value: 'Furniture', label: 'Furniture' },
                    { value: 'Other', label: 'Other' },
                  ]}
                  placeholder="Select category"
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Urgency</label>
                <CustomSelect
                  value={formData.urgency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, urgency: value })
                  }
                  options={[
                    { value: 'High', label: 'High Priority' },
                    { value: 'Medium', label: 'Medium Priority' },
                    { value: 'Low', label: 'Low Priority' },
                  ]}
                  placeholder="Select urgency"
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="glass-input mt-2"
                placeholder="Describe the issue in detail..."
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Photo (Optional)</label>
              <div className="mt-2">
                {!photoPreview ? (
                  <label className="glass-button cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Click to upload photo</span>
                    <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">PNG, JPG up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative glass-card p-2">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={handleRemovePhoto}
                      className="absolute top-4 right-4 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)} className="glass-button">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.category || !formData.urgency || !formData.description
              }
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
            >
              Submit Complaint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Complaint Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        setShowEditDialog(open);
        if (!open) setEditingComplaint(null);
      }}>
        <DialogContent className="glass-dialog max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Edit Complaint</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Update your complaint details below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-gray-100">Category</Label>
                <CustomSelect
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  options={[
                    { value: 'Internet', label: 'Internet' },
                    { value: 'Plumbing', label: 'Plumbing' },
                    { value: 'Electrical', label: 'Electrical' },
                    { value: 'AC/Fan', label: 'AC/Fan' },
                    { value: 'Furniture', label: 'Furniture' },
                    { value: 'Other', label: 'Other' },
                  ]}
                  placeholder="Select category"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-gray-100">Urgency</Label>
                <CustomSelect
                  value={formData.urgency}
                  onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                  options={[
                    { value: 'High', label: 'High' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'Low', label: 'Low' },
                  ]}
                  placeholder="Select urgency"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-gray-100">Room Number</Label>
                <Input
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="glass-input"
                  placeholder="e.g., 203-A"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-gray-100">Hostel</Label>
                <Input
                  value={formData.hostelNumber}
                  onChange={(e) => setFormData({ ...formData, hostelNumber: e.target.value })}
                  className="glass-input"
                  placeholder="e.g., Hostel 1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="glass-input min-h-[120px]"
                placeholder="Describe the issue in detail..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setEditingComplaint(null);
              setFormData({
                category: '',
                urgency: '',
                roomNumber: currentUser?.roomNumber || '203-A',
                hostelNumber: currentUser?.hostel || 'Hostel 1',
                description: '',
                photo: null,
              });
            }} className="glass-button">
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={
                !formData.category || !formData.urgency || !formData.description
              }
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Confirmation Dialog */}
      <Dialog open={showEditConfirmDialog} onOpenChange={setShowEditConfirmDialog}>
        <DialogContent className="glass-dialog">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Confirm Changes</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to save these changes to your complaint?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {editingComplaint && (
              <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Complaint ID</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                    {editingComplaint.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">New Details</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-0.5">
                    <span className="font-semibold">{formData.category}</span> - {formData.urgency} Priority
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {formData.description}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditConfirmDialog(false)} className="glass-button">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmEdit}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
            >
              Confirm Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Complaint Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={(open) => {
        setShowDeleteDialog(open);
        if (!open) setDeletingComplaint(null);
      }}>
        <DialogContent className="glass-dialog">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Delete Complaint</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this complaint? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {deletingComplaint && (
              <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {deletingComplaint.id} - {deletingComplaint.category}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {deletingComplaint.description}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDeleteDialog(false);
              setDeletingComplaint(null);
            }} className="glass-button">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="dark:bg-red-700 dark:hover:bg-red-800"
            >
              Delete Complaint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={selectedComplaint !== null}
        onOpenChange={(open) => !open && setSelectedComplaint(null)}
      >
        <DialogContent className="glass-dialog">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Complaint Details - {selectedComplaint?.id}</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              View the details of your complaint
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Category</label>
                  <p className="text-gray-900 dark:text-gray-100 mt-1">{selectedComplaint.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Room</label>
                  <p className="text-gray-900 dark:text-gray-100 mt-1">{selectedComplaint.roomNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgency</label>
                  <div className="mt-1">
                    <Badge
                      className={getUrgencyBadge(selectedComplaint.urgency)}
                    >
                      {selectedComplaint.urgency}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                  <div className="mt-1">
                    <Badge
                      className={getStatusBadge(selectedComplaint.status)}
                    >
                      {selectedComplaint.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</label>
                <p className="text-gray-900 dark:text-gray-100 mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {selectedComplaint.description}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Date Submitted</label>
                <p className="text-gray-900 dark:text-gray-100 mt-1">{selectedComplaint.date}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedComplaint(null)} className="glass-button">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
