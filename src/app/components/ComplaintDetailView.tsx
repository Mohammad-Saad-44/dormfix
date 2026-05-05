import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CustomSelect } from './CustomSelect';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ArrowLeft, CheckCircle2, User, Wrench, Calendar, FileText, UserCog, XCircle, PlayCircle, Clock, Star, RefreshCw, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useComplaints } from '../contexts/ComplaintsContext';

interface ComplaintDetailViewProps {
  complaintId: string;
  userRole?: 'student' | 'supervisor' | 'technician';
  onBack: () => void;
}

export function ComplaintDetailView({ complaintId, userRole = 'student', onBack }: ComplaintDetailViewProps) {
  const { complaints, updateComplaint, deleteComplaint, currentUser } = useComplaints();

  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const complaint = complaints.find((c) => c.id === complaintId);

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Complaint not found</p>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

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

  const handleAssignTechnician = () => {
    if (!selectedTechnician) {
      toast.error('Please select a technician');
      return;
    }
    const workId = `WK${Math.floor(2000 + Math.random() * 1000)}`;
    updateComplaint(complaintId, {
      status: 'Assigned',
      technician: selectedTechnician,
      workId,
      assignedOn: new Date().toISOString().split('T')[0],
      assignedBy: currentUser?.name || 'Supervisor',
    });
    toast.success(`Complaint assigned to ${selectedTechnician}`);
    setShowAssignDialog(false);
    // Slight delay to ensure state propagates before navigating back
    setTimeout(() => {
      onBack();
    }, 100);
  };

  const handleRejectComplaint = () => {
    updateComplaint(complaintId, {
      status: 'Rejected',
    });
    toast.error('Complaint has been rejected');
    setShowRejectDialog(false);
    setTimeout(() => {
      onBack();
    }, 100);
  };

  const handleStartTask = () => {
    updateComplaint(complaintId, {
      status: 'In Progress',
    });
    toast.success('Task started successfully');
    setShowStartDialog(false);
    setTimeout(() => {
      onBack();
    }, 100);
  };

  const handleResolveTask = () => {
    updateComplaint(complaintId, {
      status: 'Resolved',
      resolvedOn: new Date().toISOString().split('T')[0],
    });
    toast.success('Task marked as resolved');
    setShowResolveDialog(false);
    setTimeout(() => {
      onBack();
    }, 100);
  };

  const handleReassignTechnician = () => {
    if (!selectedTechnician) {
      toast.error('Please select a technician');
      return;
    }
    const workId = `WK${Math.floor(2000 + Math.random() * 1000)}`;
    updateComplaint(complaintId, {
      technician: selectedTechnician,
      workId,
      assignedOn: new Date().toISOString().split('T')[0],
      assignedBy: currentUser?.name || 'Supervisor',
    });
    toast.success(`Complaint reassigned to ${selectedTechnician}`);
    setShowReassignDialog(false);
    setTimeout(() => {
      onBack();
    }, 100);
  };

  const handleRatingSubmit = () => {
    if (rating === 0) {
      toast.error('Please provide a rating');
      return;
    }
    updateComplaint(complaintId, {
      rating,
      feedback,
    });
    toast.success('Thank you for your feedback!');
    setShowRatingDialog(false);
    setRating(0);
    setFeedback('');
    setTimeout(() => {
      onBack();
    }, 100);
  };

  const handleDeleteComplaint = () => {
    deleteComplaint(complaintId);
    toast.success('Complaint Deleted!', {
      description: 'Your complaint has been deleted successfully.',
    });
    setShowDeleteDialog(false);
    setTimeout(() => {
      onBack();
    }, 100);
  };

  // Format date to readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Pending';
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

  // Generate dynamic timeline based on complaint status
  const getTimeline = () => {
    const baseTimeline = [
      {
        label: 'Complaint Submitted',
        date: formatDate(complaint.date),
        completed: true, // Always completed
      },
      {
        label: 'Reviewed by Supervisor',
        date: formatDate(complaint.assignedOn),
        completed: complaint.status !== 'Pending',
      },
      {
        label: 'Assigned to Technician',
        date: formatDate(complaint.assignedOn),
        completed: complaint.status === 'Assigned' || complaint.status === 'In Progress' || complaint.status === 'Resolved',
      },
      {
        label: 'Work Started',
        date: complaint.status === 'In Progress' || complaint.status === 'Resolved' ? formatDate(complaint.assignedOn) : 'Pending',
        completed: complaint.status === 'In Progress' || complaint.status === 'Resolved',
      },
      {
        label: 'Issue Resolved',
        date: formatDate(complaint.resolvedOn),
        completed: complaint.status === 'Resolved',
      },
    ];

    return baseTimeline;
  };

  const timeline = getTimeline();

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'high':
        return 'bg-red-600 text-white border-transparent';
      case 'medium':
        return 'bg-orange-500 text-white border-transparent';
      case 'low':
        return 'bg-green-600 text-white border-transparent';
      default:
        return 'bg-slate-500 text-white border-transparent';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'bg-emerald-500 text-white border-transparent';
      case 'in progress':
        return 'bg-blue-500 text-white border-transparent';
      case 'assigned':
        return 'bg-blue-500 text-white border-transparent';
      default:
        return 'bg-amber-500 text-white border-transparent';
    }
  };

  const getAssignmentCardInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          title: 'Awaiting Review',
          icon: Clock,
          iconColor: 'text-yellow-600 dark:text-yellow-400',
        };
      case 'assigned':
        return {
          title: 'Assignment Info',
          icon: UserCog,
          iconColor: 'text-blue-600 dark:text-blue-400',
        };
      case 'in progress':
        return {
          title: 'Work In Progress',
          icon: PlayCircle,
          iconColor: 'text-purple-600 dark:text-purple-400',
        };
      case 'resolved':
        return {
          title: 'Issue Resolved',
          icon: CheckCircle2,
          iconColor: 'text-green-600 dark:text-green-400',
        };
      default:
        return {
          title: 'Assignment Info',
          icon: Wrench,
          iconColor: 'text-blue-600 dark:text-blue-400',
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="glass-header sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="glass-button mb-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Complaint Tracker — {complaint.id}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Timeline */}
        <Card className="glass-card shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {timeline.map((step, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          step.completed
                            ? 'bg-blue-600 dark:bg-blue-700 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="mt-3 text-center">
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                          {step.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{step.date}</p>
                      </div>
                    </div>
                    {index < timeline.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 ${
                          step.completed ? 'bg-blue-600 dark:bg-blue-700' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      ></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Complaint Details */}
          <Card className="glass-card shadow-md">
            <CardHeader className="glass-table-header pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-gray-100">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Complaint Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Category
                </label>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                  {complaint.category}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Room
                </label>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                  {complaint.roomNumber}, {complaint.hostel}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Urgency
                </label>
                <div className="mt-1">
                  <Badge className={getUrgencyColor(complaint.urgency)}>
                    {complaint.urgency.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Description
                </label>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded leading-relaxed">
                  {complaint.description}
                </p>
              </div>
              {complaint.photo && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Attached Photo
                  </label>
                  <button
                    onClick={() => setShowPhotoDialog(true)}
                    className="mt-2 w-full glass-card p-4 flex items-center gap-3 hover:bg-white/60 dark:hover:bg-gray-900/70 hover:border-blue-500/80 dark:hover:border-blue-400/50 transition-all duration-200 hover:shadow-md group"
                  >
                    <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
                    <span className="flex-1 text-left text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                      wifi_issue_photo.jpg
                    </span>
                    <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignment Info */}
          <Card className="glass-card shadow-md">
            <CardHeader className="glass-table-header pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-gray-100">
                {(() => {
                  const cardInfo = getAssignmentCardInfo(complaint.status);
                  const IconComponent = cardInfo.icon;
                  return (
                    <>
                      <IconComponent className={`w-5 h-5 ${cardInfo.iconColor}`} />
                      {cardInfo.title}
                    </>
                  );
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {complaint.status === 'Pending' ? (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      Status
                    </label>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                      Waiting for supervisor review
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      Submitted By
                    </label>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                      {complaint.studentName}
                    </p>
                  </div>
                </>
              ) : complaint.status === 'In Progress' ? (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      Technician
                    </label>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                      {complaint.technician}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      Work ID
                    </label>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                      {complaint.workId}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      Work Started On
                    </label>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                      16 Mar 2026, 10:00 AM
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      Current Status
                    </label>
                    <p className="mt-1 text-sm font-medium text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                      Technician is currently working on this issue
                    </p>
                  </div>
                </>
              ) : complaint.status === 'Resolved' ? (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      Resolved By
                    </label>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                      {complaint.technician}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      Work ID
                    </label>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                      {complaint.workId}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      Resolved On
                    </label>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                      16 Mar 2026, 3:45 PM
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      Resolution
                    </label>
                    <p className="mt-1 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded">
                      Issue has been successfully resolved
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      Technician
                    </label>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                      {complaint.technician}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      Work ID
                    </label>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                      {complaint.workId}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      Assigned On
                    </label>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                      {complaint.assignedOn}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      Assigned By
                    </label>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                      {complaint.assignedBy}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons - Role Based */}
        {userRole === 'supervisor' && complaint.status === 'Pending' && (
          <div className="flex justify-end gap-3">
            <Button
              variant="destructive"
              size="lg"
              onClick={() => setShowRejectDialog(true)}
              className="dark:bg-red-700 dark:hover:bg-red-800 gap-2"
            >
              <XCircle className="w-5 h-5" />
              Reject Complaint
            </Button>
            <Button
              size="lg"
              onClick={() => setShowAssignDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white gap-2"
            >
              <UserCog className="w-5 h-5" />
              Assign Technician
            </Button>
          </div>
        )}

        {userRole === 'supervisor' && (complaint.status === 'Assigned' || complaint.status === 'In Progress') && (
          <div className="flex justify-end gap-3">
            <Button
              size="lg"
              onClick={() => setShowReassignDialog(true)}
              className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800 gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Reassign Technician
            </Button>
          </div>
        )}

        {userRole === 'student' && complaint.status === 'Pending' && (
          <div className="flex justify-end gap-3">
            <Button
              variant="destructive"
              size="lg"
              onClick={() => setShowDeleteDialog(true)}
              className="dark:bg-red-700 dark:hover:bg-red-800 gap-2"
            >
              <XCircle className="w-5 h-5" />
              Delete Complaint
            </Button>
          </div>
        )}

        {userRole === 'student' && complaint.status === 'Resolved' && (
          <div className="flex justify-end gap-3">
            <Button
              size="lg"
              onClick={() => setShowRatingDialog(true)}
              className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800 gap-2"
            >
              <Star className="w-5 h-5" />
              Rate Technician
            </Button>
          </div>
        )}

        {userRole === 'technician' && complaint.status === 'Assigned' && (
          <div className="flex justify-end gap-3">
            <Button
              size="lg"
              onClick={() => setShowStartDialog(true)}
              className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              Start Task
            </Button>
          </div>
        )}

        {userRole === 'technician' && complaint.status === 'In Progress' && (
          <div className="flex justify-end gap-3">
            <Button
              size="lg"
              onClick={() => setShowResolveDialog(true)}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Mark as Resolved
            </Button>
          </div>
        )}
      </div>

      {/* Assign Technician Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="glass-dialog">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Assign Technician</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Select a technician to assign this complaint to
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
            <Button variant="outline" onClick={() => setShowAssignDialog(false)} className="glass-button">
              Cancel
            </Button>
            <Button onClick={handleAssignTechnician} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white">
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Complaint Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="glass-dialog">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Reject Complaint</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to reject this complaint? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} className="glass-button">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectComplaint} className="dark:bg-red-700 dark:hover:bg-red-800">
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Start Task Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="glass-dialog">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Start Task</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Are you ready to start working on this complaint?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartDialog(false)} className="glass-button">
              Cancel
            </Button>
            <Button onClick={handleStartTask} className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800">
              Start Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Task Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent className="glass-dialog">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Mark as Resolved</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Confirm that this complaint has been successfully resolved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)} className="glass-button">
              Cancel
            </Button>
            <Button onClick={handleResolveTask} className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800">
              Mark Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassign Technician Dialog */}
      <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
        <DialogContent className="glass-dialog">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Reassign Technician</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Select a different technician to reassign this complaint to
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100">Current Technician</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                {complaint.technician}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100">Select New Technician</Label>
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
            <Button variant="outline" onClick={() => setShowReassignDialog(false)} className="glass-button">
              Cancel
            </Button>
            <Button onClick={handleReassignTechnician} className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800">
              Reassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rate Technician Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="glass-dialog">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Rate Technician</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              How would you rate the service provided by {complaint.technician}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100">Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100">Feedback (Optional)</Label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience..."
                className="glass-input min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatingDialog(false)} className="glass-button">
              Cancel
            </Button>
            <Button onClick={handleRatingSubmit} className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800">
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Photo Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="glass-dialog max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Attached Photo</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              wifi_issue_photo.jpg
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <img
              src={complaint.photo}
              alt="Complaint issue"
              className="w-full h-auto rounded-lg object-contain max-h-[70vh]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPhotoDialog(false)} className="glass-button">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Complaint Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="glass-dialog">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Delete Complaint</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this complaint? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {complaint.id} - {complaint.category}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {complaint.description}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="glass-button">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteComplaint}
              className="dark:bg-red-700 dark:hover:bg-red-800"
            >
              Delete Complaint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
